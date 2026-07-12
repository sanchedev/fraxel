import type { Node } from '../nodes/_node.js'
import { PrimaryNode } from '../nodes/lib/enum.js'
import type { Collider } from '../nodes/node2d/collider.js'

/**
 * The **`warnNestedColliders`** function logs a console warning if a `RigidBody` node
 * has `Collider` descendants that are not direct children. Colliders must be direct
 * children of a `RigidBody` to participate in physics simulation. Nested colliders
 * will not be detected by the physics system.
 *
 * @param node The root node to inspect for nested colliders.
 *
 * @example
 * ```tsx
 * import { warnNestedColliders } from 'fraxel'
 *
 * // This triggers a warning:
 * <body>
 *   <transform>
 *     <collider shape={shapes.rectangle(32, 32)} /> // nested — won't work
 *   </transform>
 * </body>
 *
 * // This does NOT trigger a warning:
 * <body>
 *   <collider shape={shapes.rectangle(32, 32)} /> // direct child — works
 * </body>
 * ```
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
