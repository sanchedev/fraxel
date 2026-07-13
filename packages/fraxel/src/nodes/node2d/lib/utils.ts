import { Vector2 } from '../../../math/vector2.js'
import type { Node } from '../../_node.js'
import { Node2D } from '../_node2d.js'

/**
 * The **`getGlobalPosition`** function computes the world-space position of a node
 * by accumulating positions and rotations up the parent chain.
 * @param node - The node to compute the global position for.
 * @returns The computed global position as a `Vector2`.
 */
export function getGlobalPosition(node: Node | undefined): Vector2 {
  if (!(node instanceof Node2D)) return Vector2.ZERO

  const pos = node.position.clone()
  let parent = node.parent

  while (parent != null) {
    if (parent instanceof Node2D) {
      pos.rotate(parent.rotation)
      pos.add(parent.position)
    }
    parent = parent.parent
  }

  return pos
}

/**
 * The **`getLocalPosition`** function converts a world-space position to a node's local position
 * by reversing the transform chain from root to the given node.
 * @param node - The target node to compute the local position for.
 * @param worldPos - The world-space position to convert.
 * @returns The computed local position as a `Vector2`.
 */
export function getLocalPosition(node: Node2D, worldPos: Vector2): Vector2 {
  const ancestors: Node2D[] = []
  let p = node.parent
  while (p != null) {
    if (p instanceof Node2D) ancestors.unshift(p)
    p = p.parent
  }

  const pos = worldPos.clone()
  for (const ancestor of ancestors) {
    pos.subtract(ancestor.position)
    pos.rotate(-ancestor.rotation)
  }

  return pos
}

/**
 * The **`getGlobalRotation`** function computes the world-space rotation of a node
 * by summing rotations up the parent chain.
 * @param node - The node to compute the global rotation for.
 * @returns The computed global rotation as a `number`.
 */
export function getGlobalRotation(node: Node | undefined): number {
  let rot = node instanceof Node2D ? node.rotation : 0
  let parent = node?.parent
  while (parent != null) {
    if (!(parent instanceof Node2D)) continue
    rot += parent.rotation
    parent = parent.parent
  }
  return rot
}
