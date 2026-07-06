import { Vector2 } from '../../math/vector2.js'
import type { Collider } from '../../nodes/node2d/collider.js'
import type { RigidBody } from '../../nodes/index.js'
import { resolveCollision, computeOverlap } from './resolver.js'
import { CollisionSystem } from '../collision-system.js'

interface BodyEntry {
  body: RigidBody
}

const GRAVITY = new Vector2(0, 980)

/**
 * The **`PhysicsSystem`** is a singleton that updates all physics bodies each frame.
 * It applies gravity, integrates velocity into position, and resolves collisions.
 *
 * Updated automatically after `CollisionSystem.update()` in the game loop.
 */
export class PhysicsSystem {
  static #instance: PhysicsSystem
  #bodies: BodyEntry[] = []
  #gravity = GRAVITY.clone()

  static getInstance(): PhysicsSystem {
    if (!PhysicsSystem.#instance) {
      PhysicsSystem.#instance = new PhysicsSystem()
    }
    return PhysicsSystem.#instance
  }

  /** The gravity vector applied to all non-static bodies. */
  static get gravity() {
    return PhysicsSystem.getInstance().#gravity
  }

  static set gravity(value: Vector2) {
    PhysicsSystem.getInstance().#gravity.x = value.x
    PhysicsSystem.getInstance().#gravity.y = value.y
  }

  /** Registers a physics body with its associated collider. */
  static register(body: RigidBody) {
    PhysicsSystem.getInstance().#bodies.push({ body })
  }

  /** Unregisters a physics body. */
  static unregister(body: RigidBody) {
    const instance = PhysicsSystem.getInstance()
    instance.#bodies = instance.#bodies.filter((e) => e.body !== body)
  }

  /** Runs the physics update. Called by `Game.loop()` after `CollisionSystem.update()`. */
  static update(delta: number) {
    PhysicsSystem.getInstance().#updateInternal(delta)
  }

  #updateInternal(delta: number) {
    // 1. Apply gravity and integrate
    for (const entry of this.#bodies) {
      const { body } = entry
      if (body.isStatic || !body.useGravity) continue

      const effectiveDelta = delta * body.globalDeltaIncrease
      const accel = body.consumeAcceleration()
      accel.x += this.#gravity.x
      accel.y += this.#gravity.y

      body.velocity.x += accel.x * effectiveDelta
      body.velocity.y += accel.y * effectiveDelta

      body.position.x += body.velocity.x * effectiveDelta
      body.position.y += body.velocity.y * effectiveDelta
    }

    // 2. Resolve collisions between physics bodies using spatial hash
    const resolved = new Set<string>()

    for (const entry of this.#bodies) {
      for (const collider of entry.body.colliders) {
        const candidates = CollisionSystem.queryCandidates(collider)

        for (const candidate of candidates) {
          const otherEntry = this.#findBodyEntry(candidate)
          if (otherEntry == null) continue
          if (otherEntry.body === entry.body) continue

          const pairKey = this.#pairKey(entry.body, otherEntry.body)
          if (resolved.has(pairKey)) continue

          if (!this.#groupsMatch(collider, candidate)) continue

          const result = computeOverlap(collider, candidate)
          if (result == null) continue

          resolved.add(pairKey)
          resolveCollision(entry.body, otherEntry.body, result.overlap, result.normal)
        }
      }
    }
  }

  #findBodyEntry(collider: Collider): BodyEntry | undefined {
    for (const entry of this.#bodies) {
      if (entry.body.colliders.has(collider)) return entry
    }
    return undefined
  }

  #pairKey(a: RigidBody, b: RigidBody): string {
    const aId = a.id.toString()
    const bId = b.id.toString()
    return aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`
  }

  #groupsMatch(a: Collider, b: Collider): boolean {
    return Array.from(a.collidesWith).some((group) => b.group.has(group))
  }
}
