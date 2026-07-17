import { PrimaryNode } from '../nodes/lib/enum.js'
import type { Collider } from '../nodes/node2d/collider.js'

/** Warns when a Collider cannot participate because it has no valid direct owner. */
export function warnInvalidColliderParent(collider: Collider): void {
  const parent = collider.parent
  if (parent?.type === PrimaryNode.RigidBody || parent?.type === PrimaryNode.Detector) return

  console.warn(
    '[fraxel] Collider must be a direct child of RigidBody or Detector to participate in collisions.',
  )
}
