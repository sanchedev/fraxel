import type { PrimaryNode } from '../nodes'
import type { TinyScript } from '../scripts'
import { pushEffect } from './context'
import type { NodeReference } from './use-node'
import { useEffect } from './use-effect'
import { Signal } from '../reactivity'

/**
 * The **`useScript`** hook retrieves the script attached to a node reference.
 *
 * @param node A `NodeReference` to the node that has the script
 * @returns A `SignalGetter` containing the script instance
 *
 * @example
 * ```tsx
 * function Player() {
 *   const sprite = useNode(PrimaryNode.Sprite)
 *   const script = useScript<PlayerScript>(sprite)
 *
 *   const handleStart = () => {
 *     console.log(script()) // The script instance
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
export function useScript<T extends TinyScript<PrimaryNode>>(node: NodeReference<PrimaryNode>) {
  pushEffect('useScript', () => {})

  const script = new Signal<T | undefined>(undefined)

  useEffect(() => {
    script.value = node.signal()?.script as T
  })

  return script.getter
}
