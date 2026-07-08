import { PrimaryNode } from '../../nodes/index.js'
import { pushEffect } from '../context.js'
import { NodeReference } from './reference.js'

/**
 * The **`useGroup`** hook creates a reference to a `Group` node.
 * Groups are containers for organizing child nodes without adding visual or spatial behavior.
 *
 * @returns A `GroupReference` that will be populated when the node is mounted
 *
 * @example
 * ```tsx
 * import { useGroup } from 'fraxel/hooks'
 *
 * function Container() {
 *   const group = useGroup()
 *
 *   return (
 *     <group ref={group}>
 *       <clickable onClick={() => group.spawn(<Enemy />)} size={[32, 32]} />
 *     </group>
 *   )
 * }
 * ```
 */
export function useGroup() {
  pushEffect('useGroup', () => {})
  return new GroupReference()
}

export class GroupReference extends NodeReference<PrimaryNode.Group> {
  constructor() {
    super(PrimaryNode.Group)
  }
}
