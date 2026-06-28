import type { Signal } from '../reactivity/signal.js'
import { pushEffect } from './context.js'

/**
 * The **`useEffect`** hook runs an effect function when the node starts and whenever any of the specified signals change.
 * It also runs cleanup when the node is destroyed.
 *
 * @param fn The effect function. Can return a cleanup function.
 * @param signals Array of `Signal` instances to watch for changes
 *
 * @example
 * ```tsx
 * const count = useSignal(0)
 *
 * useEffect(() => {
 *   console.log('Count changed:', count.value)
 *   return () => {
 *     console.log('Cleanup')
 *   }
 * }, [count])
 *
 * return <transform />
 * ```
 */
export function useEffect(
  fn: () => void | (() => void),
  signals: Signal<any>[],
): void {
  pushEffect('useEffect', (nodes) => {
    if (nodes.length < 0) return
    const node = nodes[0]!

    let unmount: (() => void) | void

    const refresh = () => {
      if (typeof unmount === 'function') unmount()
      unmount = fn()
    }

    node.started.on(refresh)
    node.destroyed.on(() => {
      refresh()
      signals.forEach((signal) => signal.unsub(refresh))
    })

    signals.forEach((signal) => signal.sub(refresh))
  })
}
