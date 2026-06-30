import { Signal, SignalRegister, type SignalGetter } from '../reactivity'
import { pushEffect } from './context'

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
  pushEffect('useComputed', () => {})

  let currentSignals: Signal<any>[] = []

  const refresh = () => {
    computedSignal.value = watch()
  }

  const watch = () => {
    return SignalRegister.watch(fn, (signals) => {
      currentSignals.forEach((s) => s.unsub(refresh))
      currentSignals = signals
      currentSignals.forEach((s) => s.sub(refresh))
    })
  }

  const computedSignal = new Signal<T>(watch())

  return () => computedSignal.value
}
