import { SignalRegister } from './register.js'
import type { Signal } from './signal.js'
import type { Reactive, SignalGetterLike } from './types.js'

/**
 * The **`subReactive`** function subscribes to a reactive value, calling `onUse`
 * when the value changes. For static values, it returns the value directly without
 * tracking. For getter functions, it tracks signal dependencies and re-evaluates
 * when any dependency changes.
 *
 * @param value A reactive or static value.
 * @param onUse Callback invoked when the value changes (not on initial call).
 * @param onSet Optional callback to receive an unsubscribe function.
 * @returns The current value.
 *
 * @example
 * ```ts
 * import { subReactive } from 'fraxel'
 *
 * const position = { x: 10, y: 20 }
 *
 * // Static value — returns immediately, no tracking
 * subReactive(position, (pos) => console.log('Moved to:', pos))
 *
 * // Getter — tracks dependencies, re-evaluates on change
 * subReactive(
 *   () => health.getter(),
 *   (val) => console.log('Health:', val),
 * )
 * ```
 */
export function subReactive<T>(
  value: Reactive<T>,
  onUse: (value: T) => void,
  onSet?: (unsub: () => void) => void,
): T {
  if (typeof value !== 'function') return value
  const signal = value as SignalGetterLike<T>

  const currentSignals: Signal<any>[] = []
  let currentValue: T | null = null
  let first = true

  const refresh = () => {
    currentSignals.forEach((s) => s.unsub(refresh))
    currentValue = SignalRegister.watch(signal, (signals) => {
      currentSignals.length = 0
      currentSignals.push(...signals)
    })
    if (!first) {
      onUse(currentValue)
    } else {
      first = false
    }
    currentSignals.forEach((s) => s.sub(refresh))
  }

  refresh()
  onSet?.(() => currentSignals.forEach((s) => s.unsub(refresh)))

  return currentValue!
}

/**
 * The **`reactive`** function converts a reactive value into a `SignalGetterLike`
 * that automatically tracks signal dependencies and re-evaluates when dependencies
 * change. For static values, returns a simple getter. For getter functions, wraps
 * them with dependency tracking.
 *
 * @param value A reactive or static value.
 * @returns A getter function that returns the current value.
 *
 * @example
 * ```ts
 * import { reactive } from 'fraxel'
 *
 * // Static — returns () => 10
 * const staticGetter = reactive(10)
 *
 * // Reactive — tracks health.getter() dependencies
 * const healthGetter = reactive(() => health.getter())
 * ```
 */
export function reactive<T>(value: Reactive<T>): SignalGetterLike<T> {
  if (typeof value !== 'function') return () => value
  const signal = value as SignalGetterLike<T>

  let currentSignals: Signal<any>[] = []

  let currentValue: T = null!

  const refresh = () => {
    currentSignals.forEach((s) => s.unsub(refresh))
    evaluateAndTrack()
    currentSignals.forEach((s) => s.sub(refresh))
  }

  const evaluateAndTrack = () => {
    currentValue = SignalRegister.watch(signal, (signals) => {
      currentSignals = signals
    })
  }

  refresh()

  const getter = () => {
    currentSignals.forEach((signal) => SignalRegister.register(signal))
    return currentValue
  }

  return getter
}
