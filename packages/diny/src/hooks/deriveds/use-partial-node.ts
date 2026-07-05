import type { PrimaryNode } from '../../nodes/index.js'
import { NodeReference, useNode } from '../use-node.js'

/**
 * The **`usePartialNode`** helper accepts an optional `NodeReference`. If provided, returns it;
 * otherwise creates a new one via `useNode`. Useful for derived hooks that can optionally
 * accept an existing node reference.
 *
 * @param type The type of node to reference
 * @param node An optional existing `NodeReference` to reuse
 * @returns The provided `NodeReference` or a new one
 *
 * @example
 * ```tsx
 * // With existing ref
 * const ref = usePartialNode(PrimaryNode.Clickable, existingRef)
 *
 * // Without existing ref (creates new)
 * const ref = usePartialNode(PrimaryNode.Clickable)
 * ```
 */
export function usePartialNode<T extends PrimaryNode>(
  type: T,
  node?: NodeReference<T>,
): NodeReference<T> {
  if (node instanceof NodeReference) return node
  return useNode(type)
}
