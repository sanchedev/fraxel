import { Vector2, type VectorLike } from '../../../math/index.js'
import type { Node2D, NodeInstances, PrimaryNode } from '../../../nodes/index.js'
import { type SignalGetter, type SignalSetter, Signal } from '../../../reactivity/index.js'
import { NodeReference } from '../reference.js'

type PrimaryNode2D = keyof {
  [P in PrimaryNode as NodeInstances[P] extends Node2D ? P : never]: P
}

/**
 * The **`Node2DReference`** class extends `NodeReference` for all 2D nodes with spatial positioning.
 * It adds reactive `position` tracking and a `setPosition` setter.
 *
 * Created by Node2D hooks (`useSprite`, `useCollider`, etc.) — not instantiated directly.
 *
 * @typeParam T The `PrimaryNode` type this reference targets (must extend `Node2D`)
 *
 * @example
 * ```tsx
 * import { useSprite } from 'fraxel/hooks'
 * import { useEffect } from 'fraxel/hooks'
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   useEffect(() => {
 *     // position is reactive — updates every frame
 *     console.log('Pos:', sprite.position())
 *     sprite.setPosition([100, 200])
 *   })
 *
 *   return <sprite ref={sprite} textureId={PLAYER} />
 * }
 * ```
 */
export class Node2DReference<T extends PrimaryNode2D = PrimaryNode2D> extends NodeReference<T> {
  /** Reactive position getter. Updates every frame. */
  position: SignalGetter<Vector2>
  /** Sets the node's position. Accepts any `VectorLike` value. */
  setPosition: SignalSetter<VectorLike>

  constructor(type: T, onStart?: (node: NodeInstances[T]) => void, onEnd?: () => void) {
    super(type)

    this.position = new Signal(Vector2.ZERO).getter
    this.setPosition = (vectorLike) => (this.node.position = new Vector2(vectorLike))

    this.signal.signal.sub((node) => {
      if (node == null) {
        onEnd?.()
        this.position.signal.clearSubs()
      } else {
        this.position.signal.setter(node.position)
        onStart?.(node)
        node.updated.on(() => {
          this.position.signal.setter(node.position)
        })
      }
    })
  }
}
