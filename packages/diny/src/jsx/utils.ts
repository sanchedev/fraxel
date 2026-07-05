import type { Diny } from './types.js'

export function getDinyElementFromNode(jsx: Diny.Node): Diny.Element | undefined {
  if (jsx == null || typeof jsx === 'string' || typeof jsx === 'number' || !('type' in jsx)) {
    return
  }
  return jsx
}

export function getDinyNodesFromNode(jsx: Diny.Node): Diny.Node[] {
  if (jsx == null || typeof jsx === 'string' || typeof jsx === 'number' || 'type' in jsx) {
    return [jsx]
  }
  if (Symbol.iterator in jsx) return Array.from(jsx)
  return getDinyNodesFromNode(jsx)
}
