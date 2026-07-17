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

/** Creates a reference to a RayCast node with reactive target state. */
export function useRayCast() {
  pushEffect('useRayCast', () => {})
  return new RayCastReference()
}

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
    super(
      PrimaryNode.RayCast,
      (node) => {
        this.onTargetEnter.link(node.onTargetEnter)
        this.onTargetExit.link(node.onTargetExit)

        const set = () => {
          this.direction.signal.setter(node.direction)
          this.mask.signal.setter(node.mask)
          this.target.signal.setter(node.getTarget())
          this.detected.signal.setter(node.getTarget() != null)
        }
        set()
        node.onUpdate.connect(set)
      },
      () => {
        this.direction.signal.clearSubs()
        this.mask.signal.clearSubs()
        this.target.signal.clearSubs()
        this.detected.signal.clearSubs()
      },
    )
  }

  /** Returns the currently detected owner, or `null` if none is detected. */
  getTarget(): CollisionOwner | null {
    return this.node.getTarget()
  }
}
