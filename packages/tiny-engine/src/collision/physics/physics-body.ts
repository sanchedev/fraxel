import { Vector2 } from '../../math/vector2.js'

/**
 * A physics body holds kinematic state for a node.
 * It is managed by the `PhysicsSystem` and updated each frame.
 */
export class PhysicsBody {
  /** Current velocity in pixels per second. */
  velocity = new Vector2(0, 0)
  /** Accumulated force to apply this frame (reset after integration). */
  #acceleration = new Vector2(0, 0)
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

  /** Whether this body is currently on the ground (set by resolver). */
  isGrounded = false

  constructor(
    options: {
      mass?: number
      friction?: number
      bounce?: number
      isStatic?: boolean
      useGravity?: boolean
    } = {},
  ) {
    this.mass = options.mass ?? 1
    this.friction = options.friction ?? 0.1
    this.bounce = options.bounce ?? 0
    this.isStatic = options.isStatic ?? false
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
}
