import { Signal } from '../reactivity/signal.js'
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

  const getter: SignalGetter<T> = () => {
    signalReg.register(signal)
    return signal.value
  }
  const setter: SignalSetter<T> = (value) => {
    signal.value = value
  }

  return [getter, setter, signal]
}
export const signalReg = {
  signals: [] as Set<Signal<any>>[],
  watch<T>(fn: () => T, deps: (signals: Signal<any>[]) => void) {
    this.signals.push(new Set())
    const val = fn()
    deps(Array.from(this.signals.at(-1) ?? []))
    this.signals.pop()
    return val
  },
  register(signal: Signal<any>) {
    const s = this.signals.at(-1)
    if (s == null) return
    s.add(signal)
  },
}

export interface SignalGetter<T> {
  (): T
}
export interface SignalSetter<T> {
  (value: T): void
}
