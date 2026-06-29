import { Signal } from '../reactivity/signal.js'
import { pushEffect } from './context.js'

/**
 * The **`useSignal`** hook creates a reactive signal with an initial value.
 * The signal will notify subscribers when its value changes.
 *
 * @param initialValue The initial value of the signal
 * @returns A `Signal` instance
 *
 * @example
 * ```tsx
 * const count = useSignal(0)
 *
 * const handleClick = () => {
 *   count.value++
 * }
 *
 * useEffect(() => {
 *   console.log('Count:', count.value)
 * }, [count])
 *
 * return <button onClick={handleClick} />
 * ```
 */
export function useSignal<T>(initialValue: T) {
  pushEffect('useSignal', () => {})
  return new Signal(initialValue)
}

/**
 * The **`useComputed`** hook creates a derived signal that automatically updates
 * when any of the dependent signals change. The callback function is re-evaluated
 * whenever a dependency signal's value changes.
 *
 * @param fn The computation function that derives a value from the signal values
 * @param deps An array of signal dependencies
 * @returns A `Signal` instance containing the derived value
 *
 * @example
 * ```tsx
 * const x = useSignal(10)
 * const y = useSignal(20)
 *
 * // Automatically recomputes when x or y changes
 * const sum = useSignalFrom((a, b) => a + b, [x, y])
 *
 * useEffect(() => {
 *   console.log('Sum:', sum.value) // 30
 * }, [sum])
 *
 * // Updating a dependency automatically updates the derived signal
 * x.value = 15
 * // sum.value is now 35
 * ```
 */
export function useSignalFrom<const T extends Signal<any>[], K>(
  fn: (...args: UnwrapSignals<T>) => K,
  deps: T,
): Signal<K> {
  pushEffect('useSignalFrom', () => {})
  const signal = new Signal<K>(
    fn(...(deps.map((d) => d.value) as UnwrapSignals<T>)),
  )
  for (const dep of deps) {
    dep.sub(
      () =>
        (signal.value = fn(...(deps.map((d) => d.value) as UnwrapSignals<T>))),
    )
  }
  return signal
}

type UnwrapSignals<T extends readonly Signal<any>[]> = {
  [K in keyof T]: T[K] extends Signal<infer U> ? U : never
}
