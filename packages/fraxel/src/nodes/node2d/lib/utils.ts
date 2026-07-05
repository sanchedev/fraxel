import { Vector2 } from '../../../math/vector2.js'
import type { Node } from '../../_node.js'
import { Node2D } from '../_node2d.js'

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
