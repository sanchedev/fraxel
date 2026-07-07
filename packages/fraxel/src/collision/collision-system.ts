import { vector2, Vector2 } from '../math/vector2.js'
import { clamp } from '../math/utils.js'
import type { Collider } from '../nodes/node2d/collider.js'
import type { RayCast } from '../nodes/node2d/ray-cast.js'
import { SpatialHash } from './broadphase/spatial-hash.js'
import { Narrowphase } from './narrowphase/detector.js'
import { CollisionEmitter } from './events/collision-emitter.js'
import type { CollisionBounds } from './types.js'

/**
 * The **`CollisionSystem`** is a singleton that manages all collision detection in the game.
 * It uses a spatial hash for broadphase and a narrowphase for precise shape intersection.
 *
 * The system is updated automatically each frame via `Game.loop()`.
 */
export class CollisionSystem {
  static #instance: CollisionSystem

  #spatialHash = new SpatialHash(64)
  #colliders = new Set<Collider>()
  #colliderGroups = new Map<string, Set<Collider>>()
  #raycasts = new Set<RayCast>()
  #dirty = true

  /**
   * Returns the singleton instance of the `CollisionSystem`.
   * @returns The `CollisionSystem` instance.
   */
  static getInstance(): CollisionSystem {
    if (!CollisionSystem.#instance) {
      CollisionSystem.#instance = new CollisionSystem()
    }
    return CollisionSystem.#instance
  }

  /**
   * The **`register`** method adds a collider to the collision system.
   * Called automatically when a `Collider` node starts.
   * @param collider The collider to register.
   */
  static register(collider: Collider) {
    const instance = CollisionSystem.getInstance()
    instance.#colliders.add(collider)

    for (const group of collider.group) {
      const groupColliders = instance.#colliderGroups.get(group) ?? new Set()
      groupColliders.add(collider)
      instance.#colliderGroups.set(group, groupColliders)
    }

    instance.#dirty = true
  }

  /**
   * The **`unregister`** method removes a collider from the collision system.
   * Called automatically when a `Collider` node is destroyed.
   * @param collider The collider to unregister.
   */
  static unregister(collider: Collider) {
    const instance = CollisionSystem.getInstance()
    instance.#colliders.delete(collider)

    for (const group of collider.group) {
      const groupColliders = instance.#colliderGroups.get(group)
      groupColliders?.delete(collider)
    }

    instance.#dirty = true
  }

  /**
   * The **`registerRaycast`** method adds a raycast to the collision system.
   * Called automatically when a `RayCast` node starts.
   * @param raycast The raycast to register.
   */
  static registerRaycast(raycast: RayCast) {
    const instance = CollisionSystem.getInstance()
    instance.#raycasts.add(raycast)
  }

  /**
   * The **`unregisterRaycast`** method removes a raycast from the collision system.
   * Called automatically when a `RayCast` node is destroyed.
   * @param raycast The raycast to unregister.
   */
  static unregisterRaycast(raycast: RayCast) {
    const instance = CollisionSystem.getInstance()
    instance.#raycasts.delete(raycast)
  }

  /**
   * The **`setDirty`** method marks the spatial hash as needing a rebuild.
   * Called automatically when a collider's position changes.
   */
  static setDirty() {
    const instance = CollisionSystem.getInstance()
    instance.#dirty = true
  }

  /**
   * The **`queryCandidates`** method returns all colliders that may overlap with the given collider.
   * Used internally by the physics system for broadphase filtering.
   * @param collider The collider to query candidates for.
   * @returns A set of candidate colliders.
   */
  static queryCandidates(collider: Collider): Set<Collider> {
    const instance = CollisionSystem.getInstance()
    if (instance.#dirty) {
      instance.#broadphase()
    }
    return instance.#queryCandidates(collider)
  }

  /**
   * The **`update`** method runs the full collision detection pipeline.
   * Called automatically each frame by `Game.loop()`.
   * @param delta The time elapsed since the last frame.
   */
  static update(delta: number) {
    const instance = CollisionSystem.getInstance()
    instance.#updateInternal(delta)
  }

  #updateInternal(_delta: number) {
    this.#broadphase()
    this.#narrowphase()
    this.#emitEvents()
  }

  #broadphase() {
    if (!this.#dirty) return

    this.#spatialHash.clear()

    for (const collider of this.#colliders) {
      this.#spatialHash.insert(collider)
    }

    this.#dirty = false
  }

  #narrowphase() {
    for (const collider of this.#colliders) {
      if (collider.collidesWith.size === 0) continue

      const candidates = this.#queryCandidates(collider)
      this.#processColliderCollisions(collider, candidates)
    }

    for (const raycast of this.#raycasts) {
      const candidates = this.#queryRaycastCandidates(raycast)
      this.#processRaycastCollisions(raycast, candidates)
    }
  }

  #emitEvents() {
    // Events are emitted directly during narrowphase
  }

  #queryCandidates(collider: Collider): Set<Collider> {
    const bounds = this.#getBounds(collider)
    const candidates = this.#spatialHash.query(bounds)
    candidates.delete(collider)
    return candidates
  }

  #processColliderCollisions(collider: Collider, candidates: Set<Collider>) {
    const detected = new Set<Collider>()

    for (const candidate of candidates) {
      if (!this.#groupsMatch(collider, candidate)) continue
      if (!Narrowphase.detect(collider, candidate)) continue

      detected.add(candidate)
    }

    this.#emitColliderEvents(collider, detected)
  }

  #emitColliderEvents(collider: Collider, detected: Set<Collider>) {
    const previous = collider._activeCollisions

    for (const node of detected) {
      if (!previous.has(node)) {
        CollisionEmitter.emitEnter(collider, node)
      }
      CollisionEmitter.emitCollide(collider, node)
    }

    for (const node of previous) {
      if (!detected.has(node)) {
        CollisionEmitter.emitExit(collider, node)
      }
    }

    collider._activeCollisions = detected
  }

  #queryRaycastCandidates(raycast: RayCast): Collider[] {
    const candidates: Collider[] = []
    for (const group of raycast.collidesWith) {
      const groupColliders = this.#colliderGroups.get(group)
      if (groupColliders) {
        for (const collider of groupColliders) {
          candidates.push(collider)
        }
      }
    }
    return candidates
  }

  #processRaycastCollisions(raycast: RayCast, candidates: Collider[]) {
    let nearest: { collider: Collider; distance: number } | undefined

    for (const candidate of candidates) {
      if (!this.#raycastGroupsMatch(raycast, candidate)) continue

      const distance = this.#getRaycastDistance(raycast, candidate)
      if (distance === -1) continue

      if (!nearest || distance < nearest.distance) {
        nearest = { collider: candidate, distance }
      }
    }

    this.#emitRaycastEvents(raycast, nearest?.collider ?? null)
  }

  #emitRaycastEvents(raycast: RayCast, detected: Collider | null) {
    const previous = raycast._detectedCollider

    if (previous !== detected) {
      if (previous) {
        CollisionEmitter.emitRaycastExit(previous, raycast as unknown as Collider)
        raycast.colliderExited.emit(previous)
      }
      if (detected) {
        CollisionEmitter.emitRaycastEnter(detected, raycast as unknown as Collider)
        raycast.colliderEntered.emit(detected)
      }
    }

    raycast._detectedCollider = detected
  }

  #groupsMatch(a: Collider, b: Collider): boolean {
    const result = Array.from(a.collidesWith).some((group) => b.group.has(group))
    return result
  }

  #raycastGroupsMatch(raycast: RayCast, collider: Collider): boolean {
    for (const group of raycast.collidesWith) {
      if (collider.group.has(group)) return true
    }
    return false
  }

  #getRaycastDistance(raycast: RayCast, collider: Collider): number {
    switch (collider.shape.type) {
      case 'rectangle':
        return this.#raycastRectangle(raycast, collider)
      case 'circle':
        return this.#raycastCircle(raycast, collider)
      case 'capsule':
        return this.#raycastCapsule(raycast, collider)
      default:
        return -1
    }
  }

  #raycastRectangle(raycast: RayCast, collider: Collider): number {
    if (collider.shape.type !== 'rectangle') return -1
    const fromRay = raycast.globalPosition
    const toRay = fromRay.toAdded(raycast.direction)
    const fromCollider = collider.globalPosition
    const toCollider = fromCollider.toAdded(collider.shape.size)

    const minRayX = Math.min(fromRay.x, toRay.x)
    const maxRayX = Math.max(fromRay.x, toRay.x)
    const minRayY = Math.min(fromRay.y, toRay.y)
    const maxRayY = Math.max(fromRay.y, toRay.y)

    const intersects =
      minRayX < toCollider.x &&
      maxRayX > fromCollider.x &&
      minRayY < toCollider.y &&
      maxRayY > fromCollider.y

    if (!intersects) return -1

    return Math.max(0, fromCollider.x - fromRay.x)
  }

  #raycastCircle(raycast: RayCast, collider: Collider): number {
    if (collider.shape.type !== 'circle') return -1
    const rayFrom = raycast.globalPosition
    const rayDir = raycast.direction
    const circleCenter = collider.globalPosition
    const radius = collider.shape.radius

    const dx = circleCenter.x - rayFrom.x
    const dy = circleCenter.y - rayFrom.y

    const dirLenSq = rayDir.x * rayDir.x + rayDir.y * rayDir.y
    if (dirLenSq === 0) return -1

    let t = (dx * rayDir.x + dy * rayDir.y) / dirLenSq
    t = clamp(0, t, 1)

    const closestX = rayFrom.x + t * rayDir.x
    const closestY = rayFrom.y + t * rayDir.y

    const distX = circleCenter.x - closestX
    const distY = circleCenter.y - closestY
    const distSq = distX * distX + distY * distY

    if (distSq > radius * radius) return -1

    return t * Math.sqrt(dirLenSq)
  }

  #raycastCapsule(raycast: RayCast, collider: Collider): number {
    if (collider.shape.type !== 'capsule') return -1

    const pos = collider.globalPosition
    const { length, radius, direction } = collider.shape
    const bone =
      direction === 'vertical'
        ? {
            a: { x: pos.x + radius, y: pos.y + radius },
            b: { x: pos.x + radius, y: pos.y + length - radius },
          }
        : {
            a: { x: pos.x + radius, y: pos.y + radius },
            b: { x: pos.x + length - radius, y: pos.y + radius },
          }

    const rayFrom = raycast.globalPosition
    const rayDir = raycast.direction
    const dirLenSq = rayDir.x * rayDir.x + rayDir.y * rayDir.y
    if (dirLenSq === 0) return -1

    // Find closest point on ray to each capsule bone endpoint, then to the bone segment
    const dx = bone.b.x - bone.a.x
    const dy = bone.b.y - bone.a.y
    const boneLenSq = dx * dx + dy * dy

    if (boneLenSq === 0) {
      // Degenerate capsule (circle) — use circle raycast logic
      const cDx = bone.a.x - rayFrom.x
      const cDy = bone.a.y - rayFrom.y
      let t = (cDx * rayDir.x + cDy * rayDir.y) / dirLenSq
      t = clamp(0, t, 1)
      const cx = rayFrom.x + t * rayDir.x
      const cy = rayFrom.y + t * rayDir.y
      const ddx = bone.a.x - cx
      const ddy = bone.a.y - cy
      if (ddx * ddx + ddy * ddy > radius * radius) return -1
      return t * Math.sqrt(dirLenSq)
    }

    // Parametric ray: R(t) = rayFrom + t * rayDir, t in [0, 1]
    // Parametric bone: B(s) = bone.a + s * (bone.b - bone.a), s in [0, 1]
    // Minimize |R(t) - B(s)|^2
    const rx = rayFrom.x - bone.a.x
    const ry = rayFrom.y - bone.a.y
    const a = dirLenSq
    const b = rayDir.x * dx + rayDir.y * dy
    const e = dx * dx + dy * dy
    const c = rayDir.x * rx + rayDir.y * ry
    const f = dx * rx + dy * ry

    const denom = a * e - b * b
    let s: number
    let t: number

    if (denom !== 0) {
      s = (b * f - c * e) / denom
      t = (a * f - b * c) / denom
    } else {
      s = 0
      t = c / a
    }

    s = clamp(0, s, 1)
    t = clamp(0, t, 1)

    // Reclamp t given clamped s
    t = (b * s + c) / a
    t = clamp(0, t, 1)

    // Closest point on ray
    const rCx = rayFrom.x + t * rayDir.x
    const rCy = rayFrom.y + t * rayDir.y

    // Closest point on bone
    const bCx = bone.a.x + s * dx
    const bCy = bone.a.y + s * dy

    const ddx = rCx - bCx
    const ddy = rCy - bCy
    if (ddx * ddx + ddy * ddy > radius * radius) return -1

    return t * Math.sqrt(dirLenSq)
  }

  #getBounds(collider: Collider): CollisionBounds {
    const position = collider.globalPosition
    const shape = collider.shape

    switch (shape.type) {
      case 'rectangle':
        return {
          from: position.toJSON(),
          to: position.toAdded(shape.size).toJSON(),
        }
      case 'circle':
        return {
          from: position.toSubtracted(shape.radius).toJSON(),
          to: position.toAdded(shape.radius).toJSON(),
        }
      case 'capsule':
        if (shape.direction === 'vertical') {
          return {
            from: position.toJSON(),
            to: vector2(position.x + shape.radius * 2, position.y + shape.length).toJSON(),
          }
        }
        return {
          from: position.toJSON(),
          to: vector2(position.x + shape.length, position.y + shape.radius * 2).toJSON(),
        }
      default:
        return {
          from: Vector2.ZERO.toJSON(),
          to: Vector2.ZERO.toJSON(),
        }
    }
  }
}
