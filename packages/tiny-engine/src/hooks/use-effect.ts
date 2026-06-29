import type { Signal } from '../reactivity/signal.js'
import { pushEffect } from './context.js'
import { signalReg } from './use-signal.js'

/**
 * The **`useEffect`** hook runs an effect function when the node starts and whenever any of the specified signals change.
 * It also runs cleanup when the node is destroyed.
 *
 * @param fn The effect function. Can return a cleanup function.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useSignal(0)
 *
 * useEffect(() => {
 *   console.log('Count changed:', count())
 *   return () => {
 *     console.log('Cleanup')
 *   }
 * })
 *
 * return <transform />
 * ```
 */
export function useEffect(fn: () => void | (() => void)): void {
  pushEffect('useEffect', (nodes) => {
    if (nodes.length < 0) return
    const node = nodes[0]!

    node.started.on(() => {
      let unmountCurrentEffect = () => {}

      const refresh = () => {
        unmountCurrentEffect()

        let currentSignals: Signal<any>[] = []

        const unmountWatch = signalReg.watch(fn, (signals) => {
          currentSignals = signals
          currentSignals.forEach((signal) => signal.sub(refresh))
        })

        unmountCurrentEffect = () => {
          unmountWatch?.()
          currentSignals.forEach((signal) => signal.unsub(refresh))
        }
      }

      node.destroyed.on(() => {
        unmountCurrentEffect()
      })

      refresh()
    })
  })
}
