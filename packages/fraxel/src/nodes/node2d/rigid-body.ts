import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { PhysicsSystem } from '../../collision/physics/physics-system.js'
import { CollisionSystem } from '../../collision/collision-system.js'
import {
  CollisionLayer,
  type CollisionLayerValue,
  type CollisionMaskValue,
} from '../../collision/layers.js'
import type { Collider } from './collider.js'
import { Vector2 } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { warnNestedColliders } from '../../warn/index.js'
import { Trigger } from '../../events/trigger.js'
import type { Detector } from './detector.js'

/**
 * The **`RigidBodyOptions`** interface defines the configuration for a `RigidBody` node.
 */
export interface RigidBodyOptions extends Node2DOptions<PrimaryNode.RigidBody> {
  /**
   * The **`mass`** property defines the body's mass. Higher values are heavier. `0` means infinite mass (static).
   *
   * @default 1
   */
  mass?: number
  /**
   * The **`friction`** property defines the friction coefficient.
   *
   * @default 0.1
   */
  friction?: number
  /**
   * The **`bounce`** property defines the restitution coefficient. `0` = no bounce, `1` = perfect bounce.
   *
   * @default 0
   */
  bounce?: number
  /**
   * The **`isStatic`** property makes the body immovable when `true`.
   *
   * @default false
   */
  isStatic?: Reactive<boolean>
  /**
   * The **`useGravity`** property controls whether gravity is applied.
   *
   * @default true
   */
  useGravity?: boolean
  /** Collision layer this body belongs to. @default CollisionLayer.Default */
  layer?: CollisionLayerValue
  /** Collision mask this body interacts with. @default CollisionLayer.Default */
  mask?: CollisionMaskValue
}

/**
 * The **`RigidBody`** node adds physics simulation to its child colliders.
 * Must contain at least one `Collider` child node to work.
 *
 * Gravity is applied by default (980 px/s² downward). The body integrates
 * velocity into position each frame and resolves collisions with matching bodies.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 *
 * function FallingRock() {
 *   return (
 *     <body position={[100, 0]} mass={2} bounce={0.6} layer={Layers.Rock} mask={Layers.Ground}>
 *       <sprite textureId={ROCK} />
 *       <collider shape={shapes.circle(16)} />
 *     </body>
 *   )
 * }
 * ```
 */
export class RigidBody extends Node2D<PrimaryNode.RigidBody> {
  /** The **`velocity`** property holds the current velocity in pixels per second. */
  velocity = Vector2.ZERO
  /** @internal Accumulated force to apply this frame (reset after integration). */
  #acceleration = Vector2.ZERO
  /** The **`mass`** property defines the body's mass. `0` = infinite mass (static). */
  mass: number
  /** The **`friction`** property defines the friction coefficient (0 to 1). */
  friction: number
  /** The **`bounce`** property defines the restitution coefficient (0 to 1). */
  bounce: number
  /** The **`isStatic`** property makes the body immovable when `true`. */
  isStatic: boolean
  /** The **`useGravity`** property controls whether gravity is applied. */
  useGravity: boolean
  #layer: CollisionLayerValue
  #mask: CollisionMaskValue

  /** The **`colliders`** property holds the set of child colliders. */
  colliders: Set<Collider> = new Set()
  _activeBodies: Set<RigidBody> = new Set()
  _activeDetectors: Set<Detector> = new Set()

  get layer() {
    return this.#layer
  }

  get mask() {
    return this.#mask
  }

  constructor(options: RigidBodyOptions) {
    super(PrimaryNode.RigidBody, options)
    this.mass = options.mass ?? 1
    this.friction = options.friction ?? 0.1
    this.bounce = options.bounce ?? 0
    this.isStatic = propSignal(this, 'isStatic', options.isStatic)
    this.useGravity = options.useGravity ?? true
    this.#layer = options.layer ?? CollisionLayer.Default
    this.#mask = options.mask ?? CollisionLayer.Default
  }

  onBodyEnter = new Trigger<[body: RigidBody]>()
  onBodyCollide = new Trigger<[body: RigidBody]>()
  onBodyExit = new Trigger<[body: RigidBody]>()
  onDetectorEnter = new Trigger<[detector: Detector]>()
  onDetectorCollide = new Trigger<[detector: Detector]>()
  onDetectorExit = new Trigger<[detector: Detector]>()

  setLayer(layer: CollisionLayerValue): void {
    this.#layer = layer
    CollisionSystem.setDirty()
  }

  setMask(mask: CollisionMaskValue): void {
    this.#mask = mask
    CollisionSystem.setDirty()
  }

  /**
   * The **`applyForce`** method applies a continuous force (pixels/second²) to this body.
   * @param force - The force vector to apply.
   */
  applyForce(force: Vector2): void {
    this.#acceleration.add(force)
  }

  /**
   * The **`applyImpulse`** method applies an instantaneous impulse (pixels/second) to this body.
   * @param impulse - The impulse vector to apply.
   */
  applyImpulse(impulse: Vector2): void {
    if (this.isStatic) return
    this.velocity.add(impulse)
  }

  /**
   * The **`setVelocity`** method sets the velocity directly.
   * @param v - The new velocity vector.
   */
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

    CollisionSystem.registerOwner(this)
    PhysicsSystem.register(this)

    super.start()
  }

  /** @internal Unregisters from the physics system. */
  destroy(): void {
    CollisionSystem.unregisterOwner(this)
    PhysicsSystem.unregister(this)
    super.destroy()
  }

  cleanEvents(): void {
    this.onBodyEnter.clear()
    this.onBodyCollide.clear()
    this.onBodyExit.clear()
    this.onDetectorEnter.clear()
    this.onDetectorCollide.clear()
    this.onDetectorExit.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.RigidBody, RigidBody)
