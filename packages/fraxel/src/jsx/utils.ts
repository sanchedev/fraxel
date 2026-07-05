import type { Fraxel } from './types.js'

export function getFraxelElementFromNode(jsx: Fraxel.Node): Fraxel.Element | undefined {
  if (jsx == null || typeof jsx === 'string' || typeof jsx === 'number' || !('type' in jsx)) {
    return
  }
  return jsx
}

export function getFraxelNodesFromNode(jsx: Fraxel.Node): Fraxel.Node[] {
  if (jsx == null || typeof jsx === 'string' || typeof jsx === 'number' || 'type' in jsx) {
    return [jsx]
  }
  if (Symbol.iterator in jsx) return Array.from(jsx)
  return getFraxelNodesFromNode(jsx)
}
