import { Signal, SignalRegister, type SignalGetter } from '../reactivity'
import { pushEffect } from './context'

/**
 * The **`useComputed`** hook creates a derived signal that automatically updates
 * when any of the dependent signals change. The callback function is re-evaluated
 * whenever a dependency signal's value changes.
 *
 * @param fn The computation function that derives a value from the signal values
 * @param refreshOnNodeStart Whether to refresh the computed value when the node starts
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
export function useComputed<T>(
  fn: () => T,
  refreshOnNodeStart = false,
): SignalGetter<T> {
  let currentSignals: Signal<any>[] = []

  const computedSignal = new Signal<T>(undefined as T)

  const refresh = () => {
    currentSignals.forEach((s) => s.unsub(refresh))
    evaluateAndTrack()
    currentSignals.forEach((s) => s.sub(refresh))
  }

  const evaluateAndTrack = () => {
    computedSignal.value = SignalRegister.watch(fn, (signals) => {
      currentSignals = signals
    })
  }

  pushEffect('useComputed', (nodes) => {
    if (!refreshOnNodeStart) return
    const node = nodes[0]
    if (node == null) {
      console.warn(
        'useComputed: No node found in the current context. The computed value will not refresh on node start.',
      )
      return
    }
    node.started.on(refresh)
  })
  refresh()

  const getter: SignalGetter<T> = () => {
    return computedSignal.value
  }

  return getter
}
