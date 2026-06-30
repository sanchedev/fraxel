import { NodeNotInitializedError } from '../errors/lifecycle.js'
import { NodeTypeMismatchError } from '../errors/node.js'
import { PrimaryNode } from '../nodes/lib/enum.js'
import { type NodeInstances } from '../nodes/lib/types.js'
import { pushEffect } from './context.js'

/**
 * The **`useRefNode`** hook creates a reference to a node of the specified type.
 * The reference can be passed to a node's `ref` prop to get a reference to it.
 *
 * @param type The type of node to reference
 * @returns A `NodeReference` that will be populated when the node is mounted
 *
 * @example
 * ```tsx
 * const sprite = useRefNode(PrimaryNode.Sprite)
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
 * const transform = useRefNode(PrimaryNode.Transform)
 * const spawn = useSpawn(transform)
 *
 * return (
 *   <transform ref={transform}>
 *     <clickable onClick={() => spawn(<sprite />)} />
 *   </transform>
 * )
 * ```
 */
export function useRefNode<T extends PrimaryNode>(type: T): NodeReference<T> {
  pushEffect('useRefNode', () => {})
  const nodeRef = new NodeReference<T>(type)

  return nodeRef
}

export class NodeReference<T extends PrimaryNode> {
  #type: T
  #node: NodeInstances[T] | undefined

  set node(node: NodeInstances[T]) {
    if (node.type !== this.#type) {
      throw new NodeTypeMismatchError(this.#type, node.type)
    }
    this.#node = node
  }
  get node() {
    if (this.#node == null) {
      throw new NodeNotInitializedError('unknown')
    }
    return this.#node
  }

  constructor(type: T) {
    this.#type = type
  }
}
