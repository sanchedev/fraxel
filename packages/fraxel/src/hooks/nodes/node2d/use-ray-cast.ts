import {
  CollisionLayer,
  type CollisionMaskValue,
  type CollisionOwner,
} from '../../../collision/index.js'
import { Trigger } from '../../../events/trigger.js'
import { vector2, Vector2, type VectorLike } from '../../../math/vector2.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useRayCast`** hook creates a reference to a `RayCast` node with reactive
 * ray direction, collision mask, and target detection state.
 *
 * @returns A `RayCastReference` with reactive ray properties and hit detection
 *
 * @example
 * ```tsx
 * import { useRayCast, useEffect } from 'fraxel'
 *
 * function LaserSight() {
 *   const ray = useRayCast()
 *
 *   useEffect(() => {
 *     ray.setDirection([1, 0]) // Ray pointing right
 *     if (ray.detected()) {
 *       console.log('Hit:', ray.target())
 *     }
 *   })
 *
 *   return <raycast ref={ray} mask="solid" />
 * }
 * ```
 */
export function useRayCast() {
  pushEffect('useRayCast', () => {})
  return new RayCastReference()
}

/**
 * The **`RayCastReference`** class provides reactive access to a `RayCast` node's
 * direction, collision mask, and detected target.
 */
export class RayCastReference extends Node2DReference<PrimaryNode.RayCast> {
  /** Reactive ray direction vector. */
  direction = new Signal<Vector2>(Vector2.ZERO).getter
  /** Sets the ray direction. Accepts any `VectorLike` value. */
  setDirection: SignalSetter<VectorLike> = (value) => (this.node.direction = vector2(value))
  /** Reactive collision mask. */
  mask = new Signal<CollisionMaskValue>(CollisionLayer.Default).getter
  /** Sets the collision mask. */
  setMask: SignalSetter<CollisionMaskValue> = (value) => this.node.setMask(value)
  /** Reactive reference to the currently detected owner, or `null`. */
  target = new Signal<CollisionOwner | null>(null).getter
  /** Reactive `true` when a target is detected. */
  detected = new Signal(false).getter

  /** Fires when the ray starts hitting an owner. */
  onTargetEnter = new Trigger<[target: CollisionOwner]>()
  /** Fires when the ray stops hitting an owner. */
  onTargetExit = new Trigger<[target: CollisionOwner]>()

  constructor() {
    super({
      type: PrimaryNode.RayCast,
      linkEvents: ({ link }) => {
        link(this, 'onTargetEnter', 'onTargetExit')
      },
      regSignal: ({ reg }) => {
        reg<RayCastReference>(this, 'direction', 'mask', 'target', 'detected')
      },
      onFrame: (node) => {
        this.direction.signal.setter(node.direction.clone())
        this.mask.signal.setter(node.mask)
        this.target.signal.setter(node.getTarget())
        this.detected.signal.setter(node.getTarget() != null)
      },
    })
  }

  /** Returns the currently detected owner, or `null` if none is detected. */
  getTarget(): CollisionOwner | null {
    return this.node.getTarget()
  }
}
