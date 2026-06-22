import { renderToNodes } from '../jsx/index.js'
import type { Tiny } from '../jsx/types.js'
import type { PrimaryNode } from '../nodes/enum.js'
import { currentContext, pushEffect } from './context.js'
import type { NodeReference } from './use-ref-node.js'

/**
 * The **`useSpawn`** hook returns a function that can spawn nodes as children of the specified node.
 *
 * @param node A `NodeReference` to the node that will be the parent of spawned nodes
 * @returns A function that accepts JSX nodes and adds them as children
 *
 * @example
 * ```tsx
 * const container = useRefNode(PrimaryNode.Transform)
 * const spawn = useSpawn(container)
 *
 * const handleClick = () => {
 *   spawn(<sprite />)
 * }
 *
 * return (
 *   <transform ref={container}>
 *     <button onClick={handleClick} />
 *   </transform>
 * )
 * ```
 */
export function useSpawn<T extends PrimaryNode>(node: NodeReference<T>) {
  const ctx = currentContext.slice()

  const spawn = (jsx: Tiny.Node) => {
    currentContext.push(...ctx)
    const nodes = renderToNodes(jsx)
    for (let i = 0; i < ctx.length; i++) {
      currentContext.pop()
    }

    node.node.addChild(...nodes)
  }

  pushEffect('useSpawn', () => {})

  return spawn
}
