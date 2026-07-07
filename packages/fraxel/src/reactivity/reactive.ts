import { SignalRegister } from './register.js'
import type { Signal } from './signal.js'
import type { Reactive, SignalGetterLike } from './types.js'

/**
 * The **`subReactive`** function subscribes to a reactive value, calling `onUse` when the value changes.
 * For static values, it returns the value directly. For getter functions, it tracks signal dependencies
 * and re-evaluates when any dependency changes.
 * @param value A reactive or static value
 * @param onUse Callback invoked when the value changes (not on initial call)
 * @param onSet Optional callback to receive an unsubscribe function
 * @returns The current value
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
 * The **`reactive`** function converts a reactive value into a `SignalGetterLike` that automatically
 * tracks signal dependencies and re-evaluates when dependencies change.
 * @param value A reactive or static value
 * @returns A getter function that returns the current value
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
