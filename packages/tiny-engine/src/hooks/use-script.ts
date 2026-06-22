import type { PrimaryNode } from '../nodes'
import type { TinyScript } from '../scripts'
import { pushEffect } from './context'
import { Reference } from './use-ref'
import type { NodeReference } from './use-ref-node'

/**
 * The **`useScript`** hook retrieves the script attached to a node reference.
 *
 * @param node A `NodeReference` to the node that has the script
 * @returns A `Reference` containing the script instance
 *
 * @example
 * ```tsx
 * function Player() {
 *   const sprite = useRefNode(PrimaryNode.Sprite)
 *   const script = useScript<PlayerScript>(sprite)
 *
 *   const handleStart = () => {
 *     console.log(script.current) // The script instance
 *   }
 *
 *   return <sprite ref={sprite} onStart={handleStart} script={new PlayerScript()} />
 * }
 *
 * class PlayerScript extends TinyScript<PrimaryNode.Sprite> {
 *   health = 100
 *
 *   setup() {
 *     // Do something...
 *   }
 * }
 * ```
 */
export function useScript<T extends TinyScript<PrimaryNode>>(
  node: NodeReference<PrimaryNode>,
) {
  const script = new Reference<T | undefined>(undefined)

  pushEffect('useScript', () => {
    script.current = node.node.script as T
  })

  return script
}
