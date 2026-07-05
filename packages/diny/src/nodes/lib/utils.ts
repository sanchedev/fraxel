import { InvalidNodeInstanceError } from '../../errors/node.js'
import type { PrimaryNode } from './enum.js'
import type { Node } from '../_node.js'
import { Nodes } from './registry.js'
import type { NodeInstances } from './types.js'
import { DinyScript } from '../../scripts/script.js'

const nodeNamesMap = new Map<Node, PrimaryNode>()

/**
 * Resolves a node instance to its `PrimaryNode` string key.
 * Used internally for descriptive error messages when node type mismatches occur.
 *
 * @param node The node instance to resolve
 * @returns The `PrimaryNode` key for this node type
 * @throws {InvalidNodeInstanceError} If the node is not in the registry
 *
 * @example
 * ```ts
 * const name = getNodeName(mySpriteNode) // 'sprite'
 * ```
 */
export function getNodeName<T extends PrimaryNode>(node: NodeInstances[T]): T {
  const nodePrototype = Object.getPrototypeOf(node) as NodeInstances[T]
  const name = nodeNamesMap.get(nodePrototype)
  if (name != null) return name as T

  for (const key in Nodes) {
    if (!Object.hasOwn(Nodes, key)) continue

    const prototype = Nodes[key as keyof typeof Nodes].prototype

    if (nodeNamesMap.has(prototype)) continue

    nodeNamesMap.set(prototype, key as keyof typeof Nodes)
    if (prototype === nodePrototype) return key as T
  }

  throw new InvalidNodeInstanceError(node)
}

/**
 * Retrieves a parent's script if it matches the given class.
 * Walks up `node.parent?.script` and returns it if it's an instance of `scriptClass`.
 *
 * @param node The node whose parent to inspect
 * @param scriptClass The script class to check against
 * @returns The parent's script if it matches, or `undefined`
 *
 * @example
 * ```ts
 * const plantScript = getParentScript(collider, PlantScript)
 * if (plantScript == null) return
 * plantScript.applyDamage(50)
 * ```
 */
export function getParentScript<
  const K extends abstract new (...args: any) => DinyScript<PrimaryNode>,
>(node: Node | undefined | null, scriptClass: K): InstanceType<K> | undefined {
  const script = node?.parent?.script
  if (script == null) return
  if (!(script instanceof scriptClass)) return
  return script as InstanceType<K>
}
