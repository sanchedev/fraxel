import { vector2, type Vector2, type VectorLike } from '../math/index.js'
import type { Node } from '../nodes/_node.js'
import { reactive, subReactive, type Reactive, type SignalGetterLike } from '../reactivity'

export function ns<T, K>(value: T | null | undefined, operation: (value: T) => K, defaultValue: K) {
  return value == null ? defaultValue : operation(value)
}

export function propSignal<N extends Node, K extends keyof N, T extends N[K]>(
  node: N,
  key: K,
  prop: Reactive<T> | undefined,
) {
  if (prop == null) {
    return node[key]
  }

  const signal = subReactive(
    prop,
    (val) => (node[key] = val),
    (unsub) => node.destroyed.on(unsub),
  )

  return signal
}

export function applySignal<T, K>(prop: Reactive<T>, changer: (value: T) => K): Reactive<K> {
  if (typeof prop !== 'function') return changer(prop)

  return reactive(() => changer((prop as SignalGetterLike<T>)()))
}

export function signalVector(vector: Reactive<VectorLike>): Reactive<Vector2> {
  return applySignal(vector, (v) => vector2(v))
}
