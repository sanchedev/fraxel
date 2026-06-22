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
