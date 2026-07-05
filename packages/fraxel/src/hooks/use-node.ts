import { NodeNotInitializedError } from '../errors/lifecycle.js'
import { NodeTypeMismatchError } from '../errors/node.js'
import { PrimaryNode } from '../nodes/lib/enum.js'
import { type NodeInstances } from '../nodes/lib/types.js'
import { Signal } from '../reactivity/signal.js'
import type { SignalGetter } from '../reactivity/types.js'
import { pushEffect } from './context.js'

/**
 * The **`useNode`** hook creates a reference to a node of the specified type.
 * The reference can be passed to a node's `ref` prop to get a reference to it.
 *
 * @param type The type of node to reference
 * @returns A `NodeReference` that will be populated when the node is mounted
 *
 * @example
 * ```tsx
 * const sprite = useNode(PrimaryNode.Sprite)
 *
 * return (
 *   <transform>
 *     <sprite ref={sprite} />
 *   </transform>
 * )
 * ```
 *
 * @example
 * ```tsx
 * const transform = useNode(PrimaryNode.Transform)
 * const spawn = useSpawn(transform)
 *
 * return (
 *   <transform ref={transform}>
 *     <clickable onClick={() => spawn(<sprite />)} />
 *   </transform>
 * )
 * ```
 */
export function useNode<T extends PrimaryNode>(type: T): NodeReference<T> {
  pushEffect('useNode', () => {})
  const nodeRef = new NodeReference<T>(type)

  return nodeRef
}

export class NodeReference<T extends PrimaryNode> {
  #type: T
  #node = new Signal<NodeInstances[T] | null>(null)

  set node(node: NodeInstances[T]) {
    if (node.type !== this.#type) {
      throw new NodeTypeMismatchError(this.#type, node.type)
    }
    this.#node.value = node
  }
  get node() {
    if (this.#node.value == null) {
      throw new NodeNotInitializedError(this.#type)
    }
    return this.#node.value
  }
  signal: SignalGetter<NodeInstances[T] | null>

  constructor(type: T) {
    this.#type = type
    this.signal = this.#node.getter
  }
}
