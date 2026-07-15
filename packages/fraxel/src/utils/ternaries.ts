import type { Color } from '../math/color.js'
import { color, vector2, type ColorLike, type Vector2, type VectorLike } from '../math/index.js'
import type { Node } from '../nodes/_node.js'
import { reactive, subReactive, type Reactive, type SignalGetterLike } from '../reactivity'

/**
 * The **`ns`** (null-safe) function applies an operation to a value if it is not `null` or `undefined`, otherwise returns a default value.
 * @param value The value to check
 * @param operation The operation to apply if value is not null/undefined
 * @param defaultValue The default value to return if value is null/undefined
 * @returns The result of `operation(value)` or `defaultValue`
 */
export function ns<T, K>(value: T | null | undefined, operation: (value: T) => K, defaultValue: K) {
  return value == null ? defaultValue : operation(value)
}

/**
 * The **`propSignal`** function subscribes to a reactive property and applies it to a node's property.
 * @param node The target node
 * @param key The property key to set on the node
 * @param prop A reactive value or static value to apply
 * @returns The resolved value (either static or current signal value)
 */
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
    (unsub) => node.onDestroy.connect(unsub),
  )

  return signal
}

/**
 * The **`applySignal`** function transforms a reactive value by applying a mapping function.
 * @param prop A reactive or static value
 * @param changer A function that transforms the value
 * @returns A reactive or static transformed value
 */
export function applySignal<T, K>(prop: Reactive<T>, changer: (value: T) => K): Reactive<K> {
  if (typeof prop !== 'function') return changer(prop)

  return reactive(() => changer((prop as SignalGetterLike<T>)()))
}

/**
 * The **`signalVector`** function converts a reactive `VectorLike` value to a reactive `Vector2`.
 * @param vector A reactive or static `VectorLike` value
 * @returns A reactive or static `Vector2` value
 */
export function signalVector(vector: Reactive<VectorLike>): Reactive<Vector2> {
  return applySignal(vector, (v) => vector2(v))
}

/**
 * The **`signalColor`** function converts a reactive `ColorLike` value to a reactive `Color`.
 * @param colorLike A reactive or static `ColorLike` value
 * @returns A reactive or static `Color` value
 */
export function signalColor(colorLike: Reactive<ColorLike>): Reactive<Color> {
  return applySignal(colorLike, (v) => color(v))
}
