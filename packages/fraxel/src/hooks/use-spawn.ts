import { renderToNodes } from '../jsx/index.js'
import type { Fraxel } from '../jsx/types.js'
import type { PrimaryNode } from '../nodes/lib/enum.js'
import { currentContext, pushEffect } from './context.js'
import type { NodeReference } from './use-node.js'

/**
 * The **`useSpawn`** hook returns a function that can spawn nodes as children of the specified node.
 *
 * @param node A `NodeReference` to the node that will be the parent of spawned nodes
 * @returns A function that accepts JSX nodes and adds them as children
 *
 * @example
 * ```tsx
 * import { useNode, useSpawn } from 'fraxel/hooks'
 * import { PrimaryNode } from 'fraxel'
 *
 * const container = useNode(PrimaryNode.Transform)
 * const spawn = useSpawn(container)
 *
 * const handleClick = () => {
 *   spawn(<sprite />)
 * }
 *
 * return (
 *   <transform ref={container}>
 *     <clickable onClick={handleClick} />
 *   </transform>
 * )
 * ```
 */
export function useSpawn<T extends PrimaryNode>(node: NodeReference<T>) {
  const oldCtx = currentContext.slice()

  const spawn = (jsx: Fraxel.Node) => {
    const currentCtx = currentContext.slice()

    currentContext.length = 0
    currentContext.push(...oldCtx)

    const nodes = renderToNodes(jsx)
    node.node.addChild(...nodes)

    currentContext.length = 0
    currentContext.push(...currentCtx)
  }

  pushEffect('useSpawn', () => {})

  return spawn
}
