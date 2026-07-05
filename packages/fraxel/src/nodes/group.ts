import { Node, type NodeOptions } from './_node.js'
import { PrimaryNode } from './lib/enum.js'
import { Nodes } from './lib/registry.js'

/**
 * Options for the `Group` node.
 */
export interface GroupOptions extends NodeOptions<PrimaryNode.Group> {}

/**
 * The **`Group`** node is a lightweight container for organizing child nodes
 * without spatial positioning. Unlike `Transform`, it does not manage position,
 * rotation, or scale — it purely serves as a logical grouping mechanism.
 *
 * Use `Group` when you need to:
 * - Batch-destroy a set of nodes by destroying the parent
 * - Organize nodes in the hierarchy without affecting their position
 * - Apply `deltaIncrease` to a subset of nodes
 * - Attach a script to a group of nodes
 *
 * For nodes that need spatial positioning, use `Transform` instead.
 *
 * @example
 * ```tsx
 * import { useNode } from 'fraxel/hooks'
 * import { PrimaryNode } from 'fraxel/nodes/enum'
 *
 * function EnemySpawner() {
 *   const enemies = useNode(PrimaryNode.Group)
 *
 *   useMount(() => {
 *     // All enemies are children of the group
 *     // Destroying the group destroys all enemies
 *   })
 *
 *   return (
 *     <group ref={enemies}>
 *       <Enemy position={[0, 0]} />
 *       <Enemy position={[50, 0]} />
 *     </group>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Slowing down a subset of nodes
 * <group deltaIncrease={0.5}>
 *   <SlowEnemy />
 *   <SlowProjectile />
 * </group>
 * ```
 */
export class Group extends Node<PrimaryNode.Group> {
  constructor(options: GroupOptions) {
    super(PrimaryNode.Group, options)
  }
}

Nodes.group = Group
