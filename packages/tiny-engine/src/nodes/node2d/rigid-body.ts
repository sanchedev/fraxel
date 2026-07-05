import { PrimaryNode } from '../lib/enum.js'
import { Nodes } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { PhysicsBody } from '../../collision/physics/physics-body.js'
import { PhysicsSystem } from '../../collision/physics/physics-system.js'
import type { Collider } from './collider.js'

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
  isStatic?: boolean
  /**
   * If false, gravity is not applied.
   * @default true
   */
  useGravity?: boolean
}

/**
 * The **`RigidBody`** node adds physics simulation to a collider.
 * It must be a sibling of a `Collider` node to work.
 *
 * Gravity is applied by default (980 px/s² downward). The body integrates
 * velocity into position each frame and resolves collisions with other bodies.
 *
 * @example
 * ```tsx
 * import { shapes } from 'tiny-engine'
 *
 * function FallingRock() {
 *   return (
 *     <transform position={[100, 0]}>
 *       <sprite textureId={ROCK} />
 *       <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
 *       <rigid-body mass={2} bounce={0.6} />
 *     </transform>
 *   )
 * }
 * ```
 */
export class RigidBody extends Node2D<PrimaryNode.RigidBody> {
  /** The underlying physics body. */
  readonly physicsBody: PhysicsBody

  constructor(options: RigidBodyOptions) {
    super(PrimaryNode.RigidBody, options)
    this.physicsBody = new PhysicsBody({
      mass: options.mass,
      friction: options.friction,
      bounce: options.bounce,
      isStatic: options.isStatic,
      useGravity: options.useGravity,
    })
  }

  /** @internal Registers with the physics system using the sibling collider. */
  start(): void {
    const collider = this._children.find((c): c is Collider => c.type === PrimaryNode.Collider)

    if (collider != null) {
      PhysicsSystem.register(this.physicsBody, collider)
    }

    super.start()
  }

  /** @internal Unregisters from the physics system. */
  destroy(): void {
    PhysicsSystem.unregister(this.physicsBody)
    super.destroy()
  }
}

Nodes['rigid-body'] = RigidBody
