import type { Shape } from '../../../collision/index.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useCollider`** hook creates a reference to a `Collider` node with reactive
 * access to the collision shape.
 *
 * @returns A `ColliderReference` with reactive shape property
 *
 * @example
 * ```tsx
 * import { shapes, useCollider, useEffect } from 'fraxel'
 *
 * function SolidWall() {
 *   const collider = useCollider()
 *
 *   useEffect(() => {
 *     collider.setShape(shapes.rectangle(64, 64))
 *   })
 *
 *   return <collider ref={collider} shape={shapes.rectangle(32, 32)} />
 * }
 * ```
 */
export function useCollider() {
  pushEffect('useCollider', () => {})
  return new ColliderReference()
}

/**
 * The **`ColliderReference`** class provides reactive access to a `Collider` node's
 * collision shape.
 */
export class ColliderReference extends Node2DReference<PrimaryNode.Collider> {
  /** Reactive collider shape. */
  shape = new Signal<Shape | null>(null).getter
  /** Sets the collider shape. */
  setShape: SignalSetter<Shape> = (value) => this.node.setShape(value)

  constructor() {
    super({
      type: PrimaryNode.Collider,
      regSignal: ({ reg }) => {
        reg<ColliderReference>(this, 'shape')
      },
      onFrame: (node) => {
        this.shape.signal.setter({ ...node.shape })
      },
    })
  }
}
