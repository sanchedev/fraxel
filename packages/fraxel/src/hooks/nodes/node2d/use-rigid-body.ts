import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'
import { Vector2, vector2, type VectorLike } from '../../../math/vector2.js'

/**
 * The **`useRigidBody`** hook creates a reference to a `RigidBody` node with reactive
 * physics state and imperative force/impulse methods.
 *
 * @returns A `RigidBodyReference` with reactive physics properties and control methods
 *
 * @example
 * ```tsx
 * import { useRigidBody, useEffect, useAction } from 'fraxel'
 * import { Input, InputKey } from 'fraxel'
 *
 * const Jump = Input.createAction(InputKey.Space)
 *
 * function Player() {
 *   const { ref, velocity, isGrounded, applyImpulse } = useRigidBody()
 *
 *   useEffect(() => {
 *     if (Input.isActionPressed(Jump) && isGrounded()) {
 *       applyImpulse([0, -400])
 *     }
 *   })
 *
 *   return (
 *     <body ref={ref} mass={1}>
 *       <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['ground']} />
 *     </body>
 *   )
 * }
 * ```
 */
export function useRigidBody() {
  pushEffect('useRigidBody', () => {})
  return new RigidBodyReference()
}

export class RigidBodyReference extends Node2DReference<PrimaryNode.RigidBody> {
  /** Reactive velocity vector, updated every physics frame. */
  velocity = new Signal<Vector2>(Vector2.ZERO).getter
  /** Reactive mass value. */
  mass = new Signal(1).getter
  /** Reactive friction coefficient. */
  friction = new Signal(0.1).getter
  /** Reactive bounce coefficient (0 = no bounce, 1 = perfect bounce). */
  bounce = new Signal(0).getter
  /** Reactive `true` if the body is static (unaffected by forces). */
  isStatic = new Signal(false).getter
  /** Reactive `true` if gravity is applied to this body. */
  useGravity = new Signal(true).getter

  /**
   * Applies a continuous force to the body.
   *
   * @param force The force vector to apply
   */
  applyForce = (force: VectorLike) => this.node.applyForce(vector2(force))
  /**
   * Applies an instantaneous impulse to the body.
   *
   * @param impulse The impulse vector to apply
   */
  applyImpulse = (impulse: VectorLike) => this.node.applyImpulse(vector2(impulse))
  /**
   * Sets the body's velocity directly.
   *
   * @param v The new velocity vector
   */
  setVelocity = (v: VectorLike) => this.node.setVelocity(vector2(v))

  constructor() {
    super(
      PrimaryNode.RigidBody,
      (node) => {
        const sets = [
          () => {
            this.velocity.signal.setter(node.velocity)
            this.mass.signal.setter(node.mass)
            this.friction.signal.setter(node.friction)
            this.bounce.signal.setter(node.bounce)
            this.isStatic.signal.setter(node.isStatic)
            this.useGravity.signal.setter(node.useGravity)
          },
        ]
        sets.forEach((set) => set())
        node.updated.on(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.velocity.signal.clearSubs()
        this.mass.signal.clearSubs()
        this.friction.signal.clearSubs()
        this.bounce.signal.clearSubs()
        this.isStatic.signal.clearSubs()
        this.useGravity.signal.clearSubs()
      },
    )
  }
}
