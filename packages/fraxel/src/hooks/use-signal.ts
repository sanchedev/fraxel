import { Signal } from '../reactivity/signal.js'
import type { SignalGetter, SignalSetter } from '../reactivity/types.js'
import { pushEffect } from './context.js'

/**
 * The **`useSignal`** hook creates a reactive signal with an initial value.
 * The signal notifies subscribers when its value changes.
 *
 * @param initialValue The initial value of the signal
 * @returns A tuple of [`SignalGetter<T>`, `SignalSetter<T>`] to get and set the value
 *
 * @example
 * ```tsx
 * import { useSignal, useEffect } from 'fraxel/hooks'
 *
 * const [count, setCount] = useSignal(0)
 *
 * useEffect(() => {
 *   console.log('Count:', count())
 * })
 *
 * return <clickable onClick={() => setCount(count() + 1)} />
 * ```
 */
export function useSignal<T>(initialValue: T): [getter: SignalGetter<T>, setter: SignalSetter<T>] {
  pushEffect('useSignal', ([node]) => {
    if (node == null) return
    node.destroyed.on(() => signal.clearSubs())
  })

  const signal = new Signal(initialValue)

  return [signal.getter, signal.setter]
}

/**
 * The **`createSignal`** function creates a reactive signal outside of a component.
 * Unlike `useSignal`, it does not auto-cleanup on node destroy — use `clearSignal`
 * to manually unsubscribe when needed.
 *
 * @param defaultValue The initial value of the signal
 * @returns A tuple of [`SignalGetter<T>`, `SignalSetter<T>`]
 *
 * @example
 * ```ts
 * import { createSignal, clearSignal } from 'fraxel/hooks'
 *
 * const [health, setHealth] = createSignal(100)
 *
 * health() // 100
 * setHealth(50)
 *
 * // Clean up when no longer needed
 * clearSignal(health)
 * ```
 */
export function createSignal<T>(
  defaultValue: T,
): [getter: SignalGetter<T>, setter: SignalSetter<T>] {
  const signal = new Signal(defaultValue)
  return [signal.getter, signal.setter]
}

/**
 * The **`clearSignal`** function removes all subscribers from a signal created
 * with `useSignal` or `createSignal`. Useful for manual cleanup.
 *
 * @param signal The signal getter to clear
 *
 * @example
 * ```ts
 * import { createSignal, clearSignal } from 'fraxel/hooks'
 *
 * const [count, setCount] = createSignal(0)
 *
 * // Later, clean up all subscribers
 * clearSignal(count)
 * ```
 */
export function clearSignal(signal: SignalGetter<any>) {
  signal.signal.clearSubs()
}
