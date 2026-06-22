import type { Tiny } from './types.js'

export function getTinyElementFromTinyNode(
  jsx: Tiny.Node,
): Tiny.Element | undefined {
  if (
    jsx == null ||
    typeof jsx === 'string' ||
    typeof jsx === 'number' ||
    !('type' in jsx)
  ) {
    return
  }
  return jsx
}

export function getTinyNodesFromTinyNode(jsx: Tiny.Node): Tiny.Node[] {
  if (
    jsx == null ||
    typeof jsx === 'string' ||
    typeof jsx === 'number' ||
    'type' in jsx
  ) {
    return [jsx]
  }
  if (Symbol.iterator in jsx) return Array.from(jsx)
  return getTinyNodesFromTinyNode(jsx)
}
