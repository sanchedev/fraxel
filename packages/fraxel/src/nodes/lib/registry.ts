import type { PrimaryNode } from './enum.js'
import type { NodeClasses, NodeInstances, NodesOptions } from './types.js'

export const Nodes: NodeClasses = {} as NodeClasses

/**
 * The **`getNode`** function creates an instance of a node based on its type and options.
 * It retrieves the node class from the registry and instantiates it.
 *
 * @param type The `PrimaryNode` type to create
 * @param options The options to pass to the node constructor
 * @returns An instance of the node corresponding to the provided type
 *
 * @example
 * ```ts
 * import { getNode, PrimaryNode } from 'fraxel'
 *
 * const transform = getNode(PrimaryNode.Transform, { position: [100, 200] })
 * const sprite = getNode(PrimaryNode.Sprite, { textureId: myTexture })
 * ```
 */
export function getNode<T extends PrimaryNode>(type: T, options: NodesOptions[T]) {
  const cls = Nodes[type] as new (option: NodesOptions[T]) => NodeInstances[T]
  return new cls(options)
}

/**
 * The **`registerNode`** function registers a node class in the registry under a specific node name.
 * This allows the node to be created later using the `getNode` function by referencing its name.
 *
 * @param nodeName The name under which to register the node class
 * @param nodeClass The class of the node to register
 *
 * @example
 * ```ts
 * import { registerNode } from 'fraxel'
 *
 * // Register a custom node type
 * registerNode('myNode' as PrimaryNode, MyNode)
 * ```
 */
export function registerNode<T extends PrimaryNode>(nodeName: T, nodeClass: NodeClasses[T]) {
  Nodes[nodeName] = nodeClass
}
