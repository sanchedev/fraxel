import { Vector2 } from '../../math/vector2.js'
import { Narrowphase } from '../narrowphase/detector.js'
import type { Collider } from '../../nodes/node2d/collider.js'
import { PhysicsBody } from './physics-body.js'
import { computeAABBOverlap, resolveCollision } from './resolver.js'

interface BodyEntry {
  body: PhysicsBody
  collider: Collider
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
  static register(body: PhysicsBody, collider: Collider) {
    PhysicsSystem.getInstance().#bodies.push({ body, collider })
  }

  /** Unregisters a physics body. */
  static unregister(body: PhysicsBody) {
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
      const { body, collider } = entry
      if (body.isStatic || !body.useGravity) continue

      const accel = body.consumeAcceleration()
      accel.x += this.#gravity.x
      accel.y += this.#gravity.y

      body.velocity.x += accel.x * delta
      body.velocity.y += accel.y * delta

      collider.position.x += body.velocity.x * delta
      collider.position.y += body.velocity.y * delta
    }

    // 2. Resolve collisions between physics bodies
    for (let i = 0; i < this.#bodies.length; i++) {
      for (let j = i + 1; j < this.#bodies.length; j++) {
        const a = this.#bodies[i]!
        const b = this.#bodies[j]!

        if (!a.collider.collidesWith.size || !b.collider.collidesWith.size) continue
        if (!this.#groupsMatch(a.collider, b.collider)) continue
        if (!Narrowphase.detect(a.collider, b.collider)) continue

        const result = this.#computeOverlap(a.collider, b.collider)
        if (result == null) continue

        resolveCollision(a.body, b.body, result.overlap, result.normal)
      }
    }
  }

  #groupsMatch(a: Collider, b: Collider): boolean {
    return Array.from(a.collidesWith).some((group) => b.group.has(group))
  }

  #computeOverlap(a: Collider, b: Collider) {
    const posA = a.globalPosition
    const posB = b.globalPosition
    const sizeA = a.size
    const sizeB = b.size

    return computeAABBOverlap(posA, sizeA, posB, sizeB)
  }
}
