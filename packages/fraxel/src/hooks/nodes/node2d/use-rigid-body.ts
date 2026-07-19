import {
  CollisionLayer,
  type CollisionLayerValue,
  type CollisionMaskValue,
} from '../../../collision/index.js'
import { Trigger } from '../../../events/trigger.js'
import { PrimaryNode, type Detector, type RigidBody } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
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
 * import { Input } from 'fraxel'
 *
 * const Jump = Input.createAction({ key: ' ' })
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
 *       <collider shape={shapes.rectangle(32, 32)} />
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
  /** Sets the body's mass. */
  setMass: SignalSetter<number> = (value) => (this.node.mass = value)
  /** Reactive friction coefficient. */
  friction = new Signal(0.1).getter
  /** Sets the body's friction coefficient. */
  setFriction: SignalSetter<number> = (value) => (this.node.friction = value)
  /** Reactive bounce coefficient (0 = no bounce, 1 = perfect bounce). */
  bounce = new Signal(0).getter
  /** Sets the body's restitution coefficient. */
  setBounce: SignalSetter<number> = (value) => (this.node.bounce = value)
  /** Reactive `true` if the body is static (unaffected by forces). */
  isStatic = new Signal(false).getter
  /** Sets whether the body is static. */
  setIsStatic: SignalSetter<boolean> = (value) => (this.node.isStatic = value)
  /** Reactive `true` if gravity is applied to this body. */
  useGravity = new Signal(true).getter
  /** Sets whether gravity is applied to this body. */
  setUseGravity: SignalSetter<boolean> = (value) => (this.node.useGravity = value)
  /** Reactive collision layer. */
  layer = new Signal<CollisionLayerValue>(CollisionLayer.Default).getter
  /** Sets the collision layer. */
  setLayer: SignalSetter<CollisionLayerValue> = (value) => this.node.setLayer(value)
  /** Reactive collision mask. */
  mask = new Signal<CollisionMaskValue>(CollisionLayer.Default).getter
  /** Sets the collision mask. */
  setMask: SignalSetter<CollisionMaskValue> = (value) => this.node.setMask(value)

  onBodyEnter = new Trigger<[body: RigidBody]>()
  onBodyCollide = new Trigger<[body: RigidBody]>()
  onBodyExit = new Trigger<[body: RigidBody]>()
  onDetectorEnter = new Trigger<[detector: Detector]>()
  onDetectorCollide = new Trigger<[detector: Detector]>()
  onDetectorExit = new Trigger<[detector: Detector]>()

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
    super({
      type: PrimaryNode.RigidBody,
      linkEvents: ({ link }) => {
        link(
          this,
          'onBodyEnter',
          'onBodyCollide',
          'onBodyExit',
          'onDetectorEnter',
          'onDetectorCollide',
          'onDetectorExit',
        )
      },
      regSignal: ({ reg }) => {
        reg<RigidBodyReference>(
          this,
          'velocity',
          'mass',
          'friction',
          'bounce',
          'isStatic',
          'useGravity',
          'layer',
          'mask',
        )
      },
      onFrame: (node) => {
        this.velocity.signal.setter(node.velocity.clone())
        this.mass.signal.setter(node.mass)
        this.friction.signal.setter(node.friction)
        this.bounce.signal.setter(node.bounce)
        this.isStatic.signal.setter(node.isStatic)
        this.useGravity.signal.setter(node.useGravity)
        this.layer.signal.setter(node.layer)
        this.mask.signal.setter(node.mask)
      },
    })
  }
}
