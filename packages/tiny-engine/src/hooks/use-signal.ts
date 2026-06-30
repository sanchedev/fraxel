import { Signal } from '../reactivity/signal.js'
import type { SignalGetter, SignalSetter } from '../reactivity/types.js'
import { pushEffect } from './context.js'

/**
 * The **`useSignal`** hook creates a reactive signal with an initial value.
 * The signal will notify subscribers when its value changes.
 *
 * @param initialValue The initial value of the signal
 * @returns A tuple to [get, set, signal] the value.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useSignal(0)
 *
 * const handleClick = () => {
 *   setCount(count() + 1)
 * }
 *
 * useEffect(() => {
 *   console.log('Count:', count())
 * })
 *
 * return <clickable onClick={handleClick} />
 * ```
 */
export function useSignal<T>(
  initialValue: T,
): [SignalGetter<T>, SignalSetter<T>, Signal<T>] {
  pushEffect('useSignal', () => {})
  const signal = new Signal(initialValue)

  const getter: SignalGetter<T> = () => signal.value
  const setter: SignalSetter<T> = (value) => {
    signal.value = value
  }

  return [getter, setter, signal]
}
