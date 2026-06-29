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

interface SignalGetter<T> {
  (): T
}
interface SignalSetter<T> {
  (value: T): void
}

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

  const deps = (signals: Signal<any>[]) => {
    signals.forEach((s) =>
      s.sub(() => {
        signal.value = fn()
      }),
    )
  }
  const signal = new Signal(signalReg.watch(fn, deps))

  const getter: SignalGetter<T> = () => {
    signalReg.register(signal)
    return signal.value
  }

  return getter
}
