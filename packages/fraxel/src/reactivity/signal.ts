import { SignalRegister } from './register.js'
import type { SignalGetter, SignalSetter } from './types.js'

/**
 * The **`Signal`** class is a reactive primitive that holds a value and notifies
 * subscribers when it changes. It provides bound `getter` and `setter` functions
 * that integrate with the reactivity system for automatic dependency tracking.
 *
 * @typeParam T The type of the value held by the signal.
 *
 * @example
 * ```ts
 * import { Signal } from 'fraxel'
 *
 * const health = new Signal(100)
 *
 * health.sub((value) => {
 *   console.log('Health changed to:', value)
 * })
 *
 * health.value = 50 // logs: "Health changed to: 50"
 * ```
 */
export class Signal<T> {
  #value: T
  #listeners = new Set<(value: T) => void>()

  /**
   * Creates a new `Signal` with an initial value.
   * Automatically creates bound `getter` and `setter` functions that integrate
   * with the reactivity system (`SignalRegister`).
   *
   * @param initialValue The initial value of the signal.
   */
  constructor(initialValue: T) {
    this.#value = initialValue

    // setter & getter
    this.getter = createSignalGetter(this)

    this.setter = ((value) => {
      this.value = value
    }) as SignalSetter<T>
  }

  /**
   * The **`value`** setter updates the signal value and notifies all subscribers.
   * Skips notification if the new value is strictly equal to the current value,
   * or if the value implements an `equals()` method that returns `true`.
   *
   * @example
   * ```ts
   * const score = new Signal(0)
   * score.value = 10
   * console.log(score.value) // 10
   * ```
   */
  set value(val) {
    if (val === this.#value) return
    if (
      typeof val === 'object' &&
      val &&
      'equals' in val &&
      typeof val.equals === 'function' &&
      val.equals(this.#value) === true
    )
      return
    this.#value = val
    const currentListeners = Array.from(this.#listeners)
    currentListeners.forEach((fn) => fn(val))
  }

  /**
   * The **`value`** getter returns the current signal value.
   *
   * @example
   * ```ts
   * const speed = new Signal(5)
   * console.log(speed.value) // 5
   * ```
   */
  get value(): T {
    return this.#value
  }

  /**
   * A bound getter function that returns the current value.
   * Calling it as a function (`getter()`) automatically registers the signal
   * as a dependency of the current `SignalRegister.watch` context (used by
   * `useComputed`, `useEffect`). Calling `.value()` bypasses dependency tracking.
   *
   * @example
   * ```ts
   * const health = new Signal(100)
   *
   * // Call as function — tracks dependency
   * const val = health.getter() // 100
   *
   * // Use .value() — no dependency tracking
   * const val2 = health.getter.value() // 100
   * ```
   */
  getter: SignalGetter<T>

  /**
   * A bound setter function that updates the value and notifies subscribers.
   * Equivalent to setting `signal.value = val`.
   *
   * @example
   * ```ts
   * const health = new Signal(100)
   * health.setter(50) // equivalent to health.value = 50
   * ```
   */
  setter: SignalSetter<T>

  /**
   * The **`sub`** method subscribes a listener that is called whenever the signal
   * value changes. The listener receives the new value as its argument.
   *
   * @param fn The callback function to invoke when the value changes.
   *
   * @example
   * ```ts
   * const damage = new Signal(0)
   *
   * damage.sub((val) => {
   *   console.log('Damage taken:', val)
   * })
   *
   * damage.value = 25 // logs: "Damage taken: 25"
   * ```
   */
  sub(fn: (value: T) => void) {
    this.#listeners.add(fn)
  }

  /**
   * The **`unsub`** method removes a previously subscribed listener.
   *
   * @param fn The callback function to remove.
   *
   * @example
   * ```ts
   * const mana = new Signal(100)
   *
   * const onManaChange = (val: number) => {
   *   console.log('Mana:', val)
   * }
   *
   * mana.sub(onManaChange)
   * mana.unsub(onManaChange)
   * ```
   */
  unsub(fn: (value: T) => void) {
    this.#listeners.delete(fn)
  }

  /**
   * The **`clearSubs`** method removes all subscribers of this signal.
   * Useful for cleanup when the signal's owner is destroyed.
   *
   * @example
   * ```ts
   * const damage = new Signal(0)
   * const log = (val: number) => console.log('Damage:', val)
   *
   * damage.sub(log)
   * damage.value = 25 // logs: "Damage: 25"
   *
   * damage.clearSubs()
   * damage.value = 50 // nothing logged — listener removed
   * ```
   */
  clearSubs() {
    this.#listeners.clear()
  }
}

const SignalSymbol = Symbol('Signal')
function createSignalGetter<T>(signal: Signal<T>): SignalGetter<T> {
  const fn: SignalGetter<T> = (() => {
    SignalRegister.register(signal)
    return signal.value
  }) as SignalGetter<T>
  fn.value = () => signal.value
  fn.signal = signal
  // @ts-expect-error we change the getter with an id to know if a fn is a symbol getter
  fn[SignalSymbol] = SignalSymbol
  return fn
}

/**
 * The **`isSignalGetter`** function checks if a value is a `SignalGetter` created
 * by a `Signal`. Type guard that verifies the internal structure: has `.value()`,
 * `.signal`, and the SignalSymbol marker.
 *
 * @param fn The value to check.
 * @returns `true` if the value is a `SignalGetter`.
 *
 * @example
 * ```ts
 * import { Signal, isSignalGetter } from 'fraxel'
 *
 * const signal = new Signal(0)
 * const getter = signal.getter
 *
 * isSignalGetter(getter)    // true
 * isSignalGetter(() => 0)   // false
 * isSignalGetter(42)        // false
 * ```
 */
export function isSignalGetter<T>(fn: (...args: any[]) => T): fn is SignalGetter<T> {
  if (typeof fn !== 'function') return false
  if (!('value' in fn)) return false
  if (typeof fn.value !== 'function') return false
  if (!('signal' in fn)) return false
  if (!(fn.signal instanceof Signal)) return false
  if (!(SignalSymbol in fn)) return false
  if (fn[SignalSymbol] !== SignalSymbol) return false
  return true
}
