import { Vector2 } from '../../../math/index.js'
import { PrimaryNode, type Node2D, type NodeInstances } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/index.js'
import { createSignalSetter } from '../../../reactivity/signal.js'
import { NodeReference, type ReferenceOptions } from '../reference.js'

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
 * import { useSprite } from 'fraxel'
 * import { useEffect } from 'fraxel'
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
  position = new Signal(Vector2.ZERO).getter
  /** Sets the node's position. Accepts any `VectorLike` value. */
  setPosition = createSignalSetter(this.position.signal, {
    value: () => this.node.position,
    onChange: (v) => (this.node.position = v),
  })
  /** Reactive rotation getter. Updates every frame. */
  rotation = new Signal(0).getter
  /** Sets the node's rotation. Accepts any `number` value. */
  setRotation = createSignalSetter(this.rotation.signal, {
    value: () => this.node.rotation,
    onChange: (v) => (this.node.rotation = v),
  })

  constructor(options: ReferenceOptions<T>) {
    super({
      ...options,
      onFrame: (node) => {
        this.position.signal.setter(node.position.clone())
        this.rotation.signal.setter(node.rotation)
        options.onFrame?.(node)
      },
      regSignal: ({ reg }) => {
        reg<Node2DReference<T>>(this, ...(['position', 'rotation'] as never[]))
        options.regSignal?.({ reg })
      },
    })
  }
}
