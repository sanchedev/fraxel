import { Vector2 } from '../../../math/vector2.js'
import type { Node } from '../../_node.js'
import { Node2D } from '../_node2d.js'

/**
 * The **`getGlobalPosition`** function computes the world-space position of a node
 * by summing positions up the parent chain.
 * @param node - The node to compute the global position for.
 * @returns The computed global position as a `Vector2`.
 */
export function getGlobalPosition(node: Node | undefined): Vector2 {
  const pos = node instanceof Node2D ? node.position.clone() : Vector2.ZERO
  let parent = node?.parent
  while (parent != null) {
    if (!(parent instanceof Node2D)) continue
    pos.add(parent.position)
    parent = parent.parent
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
