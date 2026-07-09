import type { Signal } from './signal.js'

/**
 * The **`SignalGetter`** interface represents a getter function that returns the
 * current value of a signal. Calling it as a function (`getter()`) registers the
 * signal as a dependency of the current `SignalRegister.watch` context (used by
 * `useComputed`, `useEffect`). Calling `.value()` bypasses dependency tracking.
 *
 * @typeParam T The type of the value returned by the getter.
 */
export interface SignalGetter<T> {
  (): T
  /** Returns the current value without registering a dependency. */
  value(): T
  /** The underlying `Signal` instance this getter is bound to. */
  signal: Signal<T>
}

/**
 * The **`SignalSetter`** interface represents a setter function that updates the
 * signal value and notifies subscribers. Equivalent to setting `signal.value = val`.
 *
 * @typeParam T The type of the value the setter accepts.
 */
export interface SignalSetter<T> {
  (value: T): void
}

/**
 * The **`SignalGetterLike`** interface represents a plain getter function that
 * returns a value. Unlike `SignalGetter`, does not register dependencies with
 * `SignalRegister`. Used for lazy/deferred computation and as a parameter type
 * that accepts both real signals and plain getter functions.
 *
 * @typeParam T The type of the value returned by the getter.
 */
export interface SignalGetterLike<T> {
  (): T
}

/**
 * The **`Reactive`** type represents a value that can be either a static value
 * or a function that returns a value. Used by props that accept both static and
 * reactive values (e.g., `currentAnim`, `animations`, `brightness`).
 *
 * @typeParam T The type of the value.
 *
 * @example
 * ```ts
 * import type { Reactive } from 'fraxel'
 *
 * // Static value
 * const opacity: Reactive<number> = 0.5
 *
 * // Reactive getter
 * const opacity2: Reactive<number> = () => health.getter() / 100
 * ```
 */
export type Reactive<T> = T | SignalGetterLike<T>
