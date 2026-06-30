import type { Node } from '../nodes'
import { Signal, SignalRegister, type SignalGetter } from '../reactivity'

export function ns<T, K>(
  value: T | null | undefined,
  operation: (value: T) => K,
  defaultValue: K,
) {
  return value == null ? defaultValue : operation(value)
}

export function propSignal<N extends Node, K extends keyof N, T extends N[K]>(
  node: N,
  key: K,
  prop: T | SignalGetter<T> | undefined,
) {
  if (prop == null) {
    return node[key]
  }
  if (typeof prop !== 'function') return prop

  let currentSignals: Signal<any>[] = []

  const refresh = () => {
    currentSignals.forEach((s) => s.unsub(refresh))
    evaluateAndTrack()
    currentSignals.forEach((s) => s.sub(refresh))
  }

  const evaluateAndTrack = () => {
    node[key] = SignalRegister.watch(prop as SignalGetter<T>, (signals) => {
      currentSignals = signals
    })
  }

  refresh()

  node.destroyed.on(() => currentSignals.forEach((s) => s.unsub(refresh)))

  return node[key]
}

export function applySignal<T, K>(
  prop: T | SignalGetter<T>,
  changer: (value: T) => K,
): K | SignalGetter<K> {
  if (typeof prop !== 'function') return changer(prop)

  let currentSignals: Signal<any>[] = []

  const computedSignal = new Signal<K>(undefined as K)

  const refresh = () => {
    currentSignals.forEach((s) => s.unsub(refresh))
    evaluateAndTrack()
    currentSignals.forEach((s) => s.sub(refresh))
  }

  const evaluateAndTrack = () => {
    computedSignal.value = SignalRegister.watch(
      () => changer((prop as SignalGetter<T>)()),
      (signals) => {
        currentSignals = signals
      },
    )
  }

  refresh()

  const getter: SignalGetter<K> = () => {
    return computedSignal.value
  }

  return getter
}
