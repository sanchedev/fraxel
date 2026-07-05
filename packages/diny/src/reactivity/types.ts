/**
 * A getter function that returns the current value.
 * Calling it as a function (`getter()`) registers the signal as a dependency
 * of the current `SignalRegister.watch` context (used by `useComputed`, `useEffect`).
 * Calling `.value()` bypasses dependency tracking.
 */
export interface SignalGetter<T> {
  (): T
  value(): T
}

/**
 * A setter function that updates the signal value and notifies subscribers.
 * Equivalent to setting `signal.value = val`.
 */
export interface SignalSetter<T> {
  (value: T): void
}

/**
 * A function that returns a value. Used for lazy/deferred computation.
 * Unlike `SignalGetter`, does not register dependencies with `SignalRegister`.
 * Accept either a real `SignalGetter` or a plain getter function.
 */
export interface SignalGetterLike<T> {
  (): T
}

/**
 * A value that can be either a static value or a function that returns a value.
 * Used by props that accept both static and reactive values (e.g. `currentAnim`, `animations`).
 */
export type Reactive<T> = T | SignalGetterLike<T>
