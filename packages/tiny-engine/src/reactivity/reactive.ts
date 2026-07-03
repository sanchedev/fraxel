import { SignalRegister } from './register.js'
import type { Signal } from './signal.js'
import type { Reactive, SignalGetter } from './types.js'

export function subReactive<T>(
  value: Reactive<T>,
  onUse: (value: T) => void,
  onSet?: (unsub: () => void) => void,
): T {
  if (typeof value !== 'function') return value
  const signal = value as SignalGetter<T>

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

export function reactive<T>(value: Reactive<T>): SignalGetter<T> {
  if (typeof value !== 'function') return () => value
  const signal = value as SignalGetter<T>

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

  const getter: SignalGetter<T> = () => {
    currentSignals.forEach((signal) => SignalRegister.register(signal))
    return currentValue
  }

  return getter
}
