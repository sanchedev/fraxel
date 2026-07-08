import { PrimaryNode } from '../lib/enum.js'
import { Nodes } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { PhysicsSystem } from '../../collision/physics/physics-system.js'
import type { Collider } from './collider.js'
import { Vector2 } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { warnNestedColliders } from '../../warn/index.js'

/**
 * Options for the `RigidBody` node.
 */
export interface RigidBodyOptions extends Node2DOptions<PrimaryNode.RigidBody> {
  /**
   * Mass of the body. Higher values are heavier. `0` means infinite mass (static).
   * @default 1
   */
  mass?: number
  /**
   * Friction coefficient (0 to 1).
   * @default 0.1
   */
  friction?: number
  /**
   * Restitution / bounce coefficient (0 to 1). `0` = no bounce, `1` = perfect bounce.
   * @default 0
   */
  bounce?: number
  /**
   * If true, the body does not move.
   * @default false
   */
  isStatic?: Reactive<boolean>
  /**
   * If false, gravity is not applied.
   * @default true
   */
  useGravity?: boolean
}

/**
 * The **`RigidBody`** node adds physics simulation to a collider.
 * It must be parent of a `Collider` node to work.
 *
 * Gravity is applied by default (980 px/s² downward). The body integrates
 * velocity into position each frame and resolves collisions with other bodies.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 *
 * function FallingRock() {
 *   return (
 *     <rigid-body position={[100, 0]} mass={2} bounce={0.6}>
 *       <sprite textureId={ROCK} />
 *       <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
 *     </rigid-body>
 *   )
 * }
 * ```
 */
export class RigidBody extends Node2D<PrimaryNode.RigidBody> {
  /** Current velocity in pixels per second. */
  velocity = Vector2.ZERO
  /** Accumulated force to apply this frame (reset after integration). */
  #acceleration = Vector2.ZERO
  /** Mass — higher values are heavier. 0 means infinite mass (static). */
  mass: number
  /** Friction coefficient (0 to 1). Applied on collision. */
  friction: number
  /** Restitution / bounce coefficient (0 to 1). 0 = no bounce, 1 = perfect bounce. */
  bounce: number
  /** If true, the body does not move. */
  isStatic: boolean
  /** If false, gravity is not applied. */
  useGravity: boolean

  /** Whether this body is currently resting on a surface below it. Set automatically each frame. */
  isGrounded = false

  colliders: Set<Collider> = new Set()

  constructor(options: RigidBodyOptions) {
    super(PrimaryNode.RigidBody, options)
    this.mass = options.mass ?? 1
    this.friction = options.friction ?? 0.1
    this.bounce = options.bounce ?? 0
    this.isStatic = propSignal(this, 'isStatic', options.isStatic)
    this.useGravity = options.useGravity ?? true
  }

  /** Applies a force (in pixels/second²) to this body. */
  applyForce(force: Vector2): void {
    this.#acceleration.add(force)
  }

  /** Applies an instantaneous impulse (in pixels/second) to this body. */
  applyImpulse(impulse: Vector2): void {
    if (this.isStatic) return
    this.velocity.add(impulse)
  }

  /** Sets the velocity directly. */
  setVelocity(v: Vector2): void {
    this.velocity.x = v.x
    this.velocity.y = v.y
  }

  /** @internal Returns and resets the accumulated acceleration. */
  consumeAcceleration(): Vector2 {
    const a = this.#acceleration.clone()
    this.#acceleration.x = 0
    this.#acceleration.y = 0
    return a
  }

  /** @internal Registers with the physics system. */
  start(): void {
    this.colliders = new Set(
      this._children.filter((c): c is Collider => c.type === PrimaryNode.Collider),
    )

    warnNestedColliders(this)

    PhysicsSystem.register(this)

    super.start()
  }

  /** @internal Unregisters from the physics system. */
  destroy(): void {
    PhysicsSystem.unregister(this)
    super.destroy()
  }
}

Nodes['rigid-body'] = RigidBody
