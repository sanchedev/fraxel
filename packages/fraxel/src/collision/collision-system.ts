import { clamp } from '../math/utils.js'
import type { Collider } from '../nodes/node2d/collider.js'
import type { Detector } from '../nodes/node2d/detector.js'
import type { RayCast } from '../nodes/node2d/ray-cast.js'
import type { RigidBody } from '../nodes/node2d/rigid-body.js'
import { PrimaryNode } from '../nodes/lib/enum.js'
import { Narrowphase } from './narrowphase/detector.js'
import { getCapsuleBone } from './utils.js'

export type CollisionOwner = RigidBody | Detector

interface RaycastHitCandidate {
  owner: CollisionOwner
  collider: Collider
}

/** Manages owner-based collision detection for bodies, detectors, and raycasts. */
export class CollisionSystem {
  static #instance: CollisionSystem

  #owners = new Set<CollisionOwner>()
  #raycasts = new Set<RayCast>()
  #dirty = true

  static getInstance(): CollisionSystem {
    if (!CollisionSystem.#instance) {
      CollisionSystem.#instance = new CollisionSystem()
    }
    return CollisionSystem.#instance
  }

  static registerOwner(owner: CollisionOwner) {
    const instance = CollisionSystem.getInstance()
    instance.#owners.add(owner)
    instance.#dirty = true
  }

  static unregisterOwner(owner: CollisionOwner) {
    const instance = CollisionSystem.getInstance()
    instance.#owners.delete(owner)
    instance.#dirty = true
  }

  static registerRaycast(raycast: RayCast) {
    CollisionSystem.getInstance().#raycasts.add(raycast)
  }

  static unregisterRaycast(raycast: RayCast) {
    CollisionSystem.getInstance().#raycasts.delete(raycast)
  }

  static setDirty() {
    CollisionSystem.getInstance().#dirty = true
  }

  static owners(): Set<CollisionOwner> {
    return new Set(CollisionSystem.getInstance().#owners)
  }

  static ownersMatch(a: CollisionOwner, b: CollisionOwner): boolean {
    return (a.mask & b.layer) !== 0 && (b.mask & a.layer) !== 0
  }

  static update(_delta: number) {
    CollisionSystem.getInstance().#updateInternal()
  }

  #updateInternal() {
    this.#detectOwnerOverlaps()
    this.#detectRaycasts()
    this.#dirty = false
  }

  #detectOwnerOverlaps() {
    const owners = Array.from(this.#owners).filter((owner) => owner.shouldUpdate())
    const detections = new Map<CollisionOwner, Set<CollisionOwner>>()

    for (const owner of owners) {
      detections.set(owner, new Set())
    }

    for (let i = 0; i < owners.length; i++) {
      const a = owners[i]!
      if (a.colliders.size === 0) continue

      for (let j = i + 1; j < owners.length; j++) {
        const b = owners[j]!
        if (b.colliders.size === 0) continue
        if (!CollisionSystem.ownersMatch(a, b)) continue
        if (!this.#ownersOverlap(a, b)) continue

        detections.get(a)?.add(b)
        detections.get(b)?.add(a)
      }
    }

    for (const owner of owners) {
      this.#emitOwnerEvents(owner, detections.get(owner) ?? new Set())
    }
  }

  #ownersOverlap(a: CollisionOwner, b: CollisionOwner): boolean {
    for (const aCollider of a.colliders) {
      for (const bCollider of b.colliders) {
        if (Narrowphase.detect(aCollider, bCollider)) return true
      }
    }
    return false
  }

  #emitOwnerEvents(owner: CollisionOwner, detected: Set<CollisionOwner>) {
    const previous = new Set<CollisionOwner>([...owner._activeBodies, ...owner._activeDetectors])

    for (const target of detected) {
      if (target.type === PrimaryNode.RigidBody) {
        if (!owner._activeBodies.has(target)) this.#emitBodyEnter(owner, target)
        this.#emitBodyInside(owner, target)
      } else {
        if (!owner._activeDetectors.has(target)) this.#emitDetectorEnter(owner, target)
        this.#emitDetectorInside(owner, target)
      }
    }

    for (const target of previous) {
      if (detected.has(target)) continue
      if (target.type === PrimaryNode.RigidBody) {
        this.#emitBodyExit(owner, target)
      } else {
        this.#emitDetectorExit(owner, target)
      }
    }

    owner._activeBodies = new Set(
      Array.from(detected).filter(
        (target): target is RigidBody => target.type === PrimaryNode.RigidBody,
      ),
    )
    owner._activeDetectors = new Set(
      Array.from(detected).filter(
        (target): target is Detector => target.type === PrimaryNode.Detector,
      ),
    )
  }

  #emitBodyEnter(owner: CollisionOwner, body: RigidBody) {
    owner.onBodyEnter.emit(body)
  }

  #emitBodyInside(owner: CollisionOwner, body: RigidBody) {
    if (owner.type === PrimaryNode.RigidBody) owner.onBodyCollide.emit(body)
    else owner.onBodyInside.emit(body)
  }

  #emitBodyExit(owner: CollisionOwner, body: RigidBody) {
    owner.onBodyExit.emit(body)
  }

  #emitDetectorEnter(owner: CollisionOwner, detector: Detector) {
    owner.onDetectorEnter.emit(detector)
  }

  #emitDetectorInside(owner: CollisionOwner, detector: Detector) {
    if (owner.type === PrimaryNode.RigidBody) owner.onDetectorCollide.emit(detector)
    else owner.onDetectorInside.emit(detector)
  }

  #emitDetectorExit(owner: CollisionOwner, detector: Detector) {
    owner.onDetectorExit.emit(detector)
  }

  #detectRaycasts() {
    for (const raycast of this.#raycasts) {
      const raycastParent = raycast.parent
      if (raycastParent != null && !raycastParent.shouldUpdate()) continue

      const candidates = this.#queryRaycastCandidates(raycast)
      this.#processRaycast(raycast, candidates)
    }
  }

  #queryRaycastCandidates(raycast: RayCast): RaycastHitCandidate[] {
    const candidates: RaycastHitCandidate[] = []
    for (const owner of this.#owners) {
      if (!owner.shouldUpdate()) continue
      if ((raycast.mask & owner.layer) === 0) continue

      for (const collider of owner.colliders) {
        candidates.push({ owner, collider })
      }
    }
    return candidates
  }

  #processRaycast(raycast: RayCast, candidates: RaycastHitCandidate[]) {
    let nearest: { owner: CollisionOwner; distance: number } | undefined

    for (const candidate of candidates) {
      const distance = this.#getRaycastDistance(raycast, candidate.collider)
      if (distance === -1) continue

      if (!nearest || distance < nearest.distance) {
        nearest = { owner: candidate.owner, distance }
      }
    }

    this.#emitRaycastEvents(raycast, nearest?.owner ?? null)
  }

  #emitRaycastEvents(raycast: RayCast, detected: CollisionOwner | null) {
    const previous = raycast._target

    if (previous !== detected) {
      if (previous) raycast.onTargetExit.emit(previous)
      if (detected) raycast.onTargetEnter.emit(detected)
    }

    raycast._target = detected
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
    const toRay = fromRay.toAdded(raycast.direction.toRotated(raycast.globalRotation))
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
    const rayDir = raycast.direction.toRotated(raycast.globalRotation)
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

    const bone = getCapsuleBone(collider.shape, collider.globalPosition, collider.globalRotation)

    const rayFrom = raycast.globalPosition
    const rayDir = raycast.direction.toRotated(raycast.globalRotation)
    const dirLenSq = rayDir.x * rayDir.x + rayDir.y * rayDir.y
    if (dirLenSq === 0) return -1

    const dx = bone.b.x - bone.a.x
    const dy = bone.b.y - bone.a.y
    const boneLenSq = dx * dx + dy * dy

    if (boneLenSq === 0) {
      const cDx = bone.a.x - rayFrom.x
      const cDy = bone.a.y - rayFrom.y
      let t = (cDx * rayDir.x + cDy * rayDir.y) / dirLenSq
      t = clamp(0, t, 1)
      const cx = rayFrom.x + t * rayDir.x
      const cy = rayFrom.y + t * rayDir.y
      const ddx = bone.a.x - cx
      const ddy = bone.a.y - cy
      if (ddx * ddx + ddy * ddy > collider.shape.radius * collider.shape.radius) return -1
      return t * Math.sqrt(dirLenSq)
    }

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
    t = (b * s + c) / a
    t = clamp(0, t, 1)

    const rCx = rayFrom.x + t * rayDir.x
    const rCy = rayFrom.y + t * rayDir.y
    const bCx = bone.a.x + s * dx
    const bCy = bone.a.y + s * dy

    const ddx = rCx - bCx
    const ddy = rCy - bCy
    if (ddx * ddx + ddy * ddy > collider.shape.radius * collider.shape.radius) return -1

    return t * Math.sqrt(dirLenSq)
  }
}
