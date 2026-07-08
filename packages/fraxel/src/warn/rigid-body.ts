import type { Node } from '../nodes/_node.js'
import { PrimaryNode } from '../nodes/lib/enum.js'
import type { Collider } from '../nodes/node2d/collider.js'

/**
 * Warns if a RigidBody has collider descendants that are not direct children.
 * Colliders must be direct children of RigidBody to participate in physics.
 */
export function warnNestedColliders(node: Node): void {
  const directChildren = new Set(node.children)

  const findNestedColliders = (n: Node): Collider[] => {
    const result: Collider[] = []
    for (const child of n._children) {
      if (child.type === PrimaryNode.Collider && !directChildren.has(child)) {
        result.push(child as Collider)
      }
      result.push(...findNestedColliders(child))
    }
    return result
  }

  const nested = findNestedColliders(node)
  if (nested.length > 0) {
    console.warn(
      `[fraxel] RigidBody has ${nested.length} collider(s) that are not direct children. ` +
        `Colliders must be direct children of RigidBody to participate in physics. ` +
        `Move them as direct children or wrap them in the same RigidBody.`,
    )
  }
}
