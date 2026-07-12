import { SignalRegister } from '../reactivity/register.js'
import type { Signal } from '../reactivity/signal.js'
import { pushEffect } from './context.js'

/**
 * The **`useEffect`** hook runs an effect function when the node starts and whenever
 * any of the specified signals change. Effect re-executions are batched — if multiple
 * signals change synchronously, the effect only runs once before the next frame.
 * It also runs cleanup when the node is destroyed.
 *
 * @param fn The effect function. Can return a cleanup function.
 *
 * @example
 * ```tsx
 * import { useSignal, useEffect } from 'fraxel'
 *
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
      let scheduled = false
      let cancelled = false

      const refresh = () => {
        scheduled = false
        if (cancelled) return

        unmountCurrentEffect()

        let currentSignals: Signal<any>[] = []

        const unmountWatch = SignalRegister.watch(fn, (signals) => {
          currentSignals = signals
          currentSignals.forEach((signal) => signal.sub(scheduleRefresh))
        })

        unmountCurrentEffect = () => {
          unmountWatch?.()
          currentSignals.forEach((signal) => signal.unsub(scheduleRefresh))
        }
      }

      const scheduleRefresh = () => {
        if (scheduled) return
        scheduled = true
        queueMicrotask(refresh)
      }

      node.destroyed.on(() => {
        cancelled = true
        unmountCurrentEffect()
      })

      refresh()
    })
  })
}
