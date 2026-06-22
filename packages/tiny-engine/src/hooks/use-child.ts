import { HookRequiresNodeRootError } from '../errors/hook.js'
import type { PrimaryNode } from '../nodes/enum.js'
import { pushEffect } from './context.js'
import { NodeReference } from './use-ref-node.js'

/**
 * The **`useChild`** hook gets a reference to a child node by path and type.
 *
 * @param path The path to the child node (array of strings or symbols)
 * @param type The type of the child node to retrieve
 * @returns A `NodeReference` to the child node
 *
 * @example
 * ```tsx
 * const sprite = useChild(['child1', 'child2'], PrimaryNode.Sprite)
 *
 * return (
 *   <transform>
 *     <transform id='child1'>
 *       <sprite id='child2' />
 *     </transform>
 *   </transform>
 * )
 * ```
 */
export function useChild<T extends PrimaryNode>(
  path: (string | symbol)[],
  type: T,
): NodeReference<T> {
  const nodeRef = new NodeReference<T>(type)

  pushEffect('useChild', (nodes) => {
    if (nodes.length > 1 || nodes.length === 0) {
      throw new HookRequiresNodeRootError('useChild')
    }

    const node = nodes[0]!

    node.started.onFirst(() => {
      nodeRef.node = node.child({ path, type })
    })
  })

  return nodeRef
}
