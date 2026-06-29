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

    let unmount: (() => void) | void

    const refresh = () => {
      if (typeof unmount === 'function') unmount()
      unmount = fn()
    }

    node.started.on(() => {
      signalReg.watch(refresh, (signals) => {
        signals.forEach((signal) => signal.sub(refresh))

        node.destroyed.on(() => {
          refresh()
          signals.forEach((signal) => signal.unsub(refresh))
        })
      })
    })
  })
}
