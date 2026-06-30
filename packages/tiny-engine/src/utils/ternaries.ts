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
  if (typeof prop === 'function') {
    const [value, onDestroy] = SignalRegister.watchOne(
      prop as SignalGetter<T>,
      (v) => (node[key] = v),
    )
    node.destroyed.on(onDestroy)
    return value
  }
  return prop
}

export function applySignal<T, K>(
  prop: T | SignalGetter<T>,
  changer: (value: T) => K,
): K | SignalGetter<K> {
  if (typeof prop === 'function') {
    const getsignal = prop as SignalGetter<T>
    let currentSignals: Signal<any>[] = []

    const refresh = () => {
      computedSignal.value = watch()
    }

    const watch = () => {
      return SignalRegister.watch(
        () => changer(getsignal()),
        (signals) => {
          currentSignals.forEach((s) => s.unsub(refresh))
          currentSignals = signals
          currentSignals.forEach((s) => s.sub(refresh))
        },
      )
    }

    const computedSignal = new Signal(changer(getsignal()))

    const getter: SignalGetter<K> = () => {
      return computedSignal.value
    }

    return getter
  }

  return changer(prop)
}
