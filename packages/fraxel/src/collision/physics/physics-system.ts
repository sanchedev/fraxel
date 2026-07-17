import { vector2, type Vector2 } from '../../math/vector2.js'
import type { RigidBody } from '../../nodes/index.js'
import { resolveCollision, computeOverlap } from './resolver.js'
import { CollisionSystem } from '../collision-system.js'
import { worldToLocal } from '../utils.js'

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
      if (body.isStatic) continue

      const effectiveDelta = delta * body.globalDeltaIncrease
      const accel = body.consumeAcceleration()

      if (body.useGravity) {
        const localGravity = worldToLocal(body, this.#gravity)
        accel.x += localGravity.x
        accel.y += localGravity.y
      }

      body.velocity.x += accel.x * effectiveDelta
      body.velocity.y += accel.y * effectiveDelta

      body.position.x += body.velocity.x * effectiveDelta
      body.position.y += body.velocity.y * effectiveDelta
    }

    const iterations = 4

    for (let i = 0; i < iterations; i++) {
      const resolvedBodies = new Set<string>()

      for (const entry of this.#bodies) {
        if (!PhysicsSystem.#isBodyActive(entry.body)) continue

        for (const otherEntry of this.#bodies) {
          if (!PhysicsSystem.#isBodyActive(otherEntry.body)) continue
          if (otherEntry.body === entry.body) continue
          if (!CollisionSystem.ownersMatch(entry.body, otherEntry.body)) continue

          const bodyPairKey = this.#bodyPairKey(entry.body, otherEntry.body)
          if (resolvedBodies.has(bodyPairKey)) continue

          const result = this.#computeBodyOverlap(entry.body, otherEntry.body)
          if (result == null) continue

          resolvedBodies.add(bodyPairKey)
          resolveCollision(entry.body, otherEntry.body, result.overlap, result.normal)
        }
      }
    }
  }

  #bodyPairKey(a: RigidBody, b: RigidBody): string {
    const aId = a.id.toString()
    const bId = b.id.toString()
    return aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`
  }

  #computeBodyOverlap(
    a: RigidBody,
    b: RigidBody,
  ): {
    overlap: Vector2
    normal: Vector2
  } | null {
    for (const aCollider of a.colliders) {
      for (const bCollider of b.colliders) {
        const result = computeOverlap(aCollider, bCollider)
        if (result != null) return result
      }
    }

    return null
  }
}
