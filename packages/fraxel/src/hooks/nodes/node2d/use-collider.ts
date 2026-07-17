import type { Shape } from '../../../collision/index.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/** Creates a reference to a pure collision shape node. */
export function useCollider() {
  pushEffect('useCollider', () => {})
  return new ColliderReference()
}

export class ColliderReference extends Node2DReference<PrimaryNode.Collider> {
  /** Reactive collider shape. */
  shape = new Signal<Shape | null>(null).getter
  /** Sets the collider shape. */
  setShape: SignalSetter<Shape> = (value) => this.node.setShape(value)

  constructor() {
    super(
      PrimaryNode.Collider,
      (node) => {
        const set = () => this.shape.signal.setter(node.shape)
        set()
        node.onUpdate.connect(set)
      },
      () => {
        this.shape.signal.clearSubs()
      },
    )
  }
}
