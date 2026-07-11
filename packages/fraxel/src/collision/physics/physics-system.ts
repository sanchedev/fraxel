import { vector2, type Vector2 } from '../../math/vector2.js'
import type { Collider } from '../../nodes/node2d/collider.js'
import type { RigidBody } from '../../nodes/index.js'
import { resolveCollision, computeOverlap } from './resolver.js'
import { CollisionSystem } from '../collision-system.js'

interface BodyEntry {
  body: RigidBody
}

const GRAVITY = vector2(0, 980)

/**
 * The **`PhysicsSystem`** class manages rigid body simulation, gravity, and collision resolution.
 * It uses a spatial hash for broadphase detection and resolves overlaps with position correction and impulse-based velocity.
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

  static get gravity() {
    return PhysicsSystem.getInstance().#gravity
  }
  static set gravity(value: Vector2) {
    PhysicsSystem.getInstance().#gravity.x = value.x
    PhysicsSystem.getInstance().#gravity.y = value.y
  }

  static register(body: RigidBody) {
    PhysicsSystem.getInstance().#bodies.push({ body })
  }
  static unregister(body: RigidBody) {
    const instance = PhysicsSystem.getInstance()
    instance.#bodies = instance.#bodies.filter((e) => e.body !== body)
  }

  /**
   * Checks if rigid body node should participate in physics simulation
   * based on its effective game mode.
   * @param body The rigid body to check.
   * @returns `true` if the body is active.
   */
  static #isBodyActive(body: RigidBody): boolean {
    return body.shouldUpdate()
  }

  static update(delta: number) {
    PhysicsSystem.getInstance().#updateInternal(delta)
  }

  #updateInternal(delta: number) {
    for (const entry of this.#bodies) {
      if (!PhysicsSystem.#isBodyActive(entry.body)) continue

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

    const iterations = 4

    for (let i = 0; i < iterations; i++) {
      const resolvedColliders = new Set<string>()

      for (const entry of this.#bodies) {
        if (!PhysicsSystem.#isBodyActive(entry.body)) continue

        for (const collider of entry.body.colliders) {
          const candidates = CollisionSystem.queryCandidates(collider)

          for (const candidate of candidates) {
            if (candidate === collider) continue
            if (candidate.parent && collider.parent && candidate.parent === collider.parent)
              continue

            const otherEntry = this.#findBodyEntry(candidate)
            if (!otherEntry) continue

            if (!PhysicsSystem.#isBodyActive(otherEntry.body)) continue

            if (otherEntry.body === entry.body) continue

            const colliderPairKey = this.#colliderPairKey(collider, candidate)
            if (resolvedColliders.has(colliderPairKey)) continue

            if (!this.#groupsMatch(collider, candidate)) continue

            const result = computeOverlap(collider, candidate)
            if (result == null) continue

            resolvedColliders.add(colliderPairKey)
            resolveCollision(entry.body, otherEntry.body, result.overlap, result.normal)
          }
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

  #colliderPairKey(a: Collider, b: Collider): string {
    const aId = a.id.toString()
    const bId = b.id.toString()
    return aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`
  }

  #groupsMatch(a: Collider, b: Collider): boolean {
    return Array.from(a.collidesWith).some((group) => b.group.has(group))
  }
}
