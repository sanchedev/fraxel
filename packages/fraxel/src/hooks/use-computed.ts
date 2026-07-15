import { Signal, subReactive, type SignalGetter } from '../reactivity/index.js'
import { pushEffect } from './context.js'

/**
 * The **`useComputed`** hook creates a derived signal that automatically updates
 * when any of the dependent signals change. The callback function is re-evaluated
 * whenever a dependency signal's value changes.
 *
 * @param fn The computation function that derives a value from the signal values
 * @returns A getter of the current value of the Signal
 *
 * @example
 * ```tsx
 * const [x, setX] = useSignal(10)
 * const [y, setY] = useSignal(20)
 *
 * // Automatically recomputes when x or y changes
 * const sum = useComputed(() => x() + y())
 *
 * useEffect(() => {
 *   console.log('Sum:', sum()) // 30
 * })
 *
 * // Updating a dependency automatically updates the derived signal
 * setX(15)
 * // sum() is now 35
 * ```
 */
export function useComputed<T>(fn: () => T): SignalGetter<T> {
  let unsub: () => void

  pushEffect('useComputed', ([nd]) => {
    if (nd == null) return
    nd.onDestroy.connect(() => {
      signalComputed.clearSubs()
      unsub()
    })
  })

  const signalComputed = new Signal(
    subReactive(
      fn,
      (val) => (signalComputed.value = val),
      (fn) => (unsub = fn),
    ),
  )

  return signalComputed.getter
}
