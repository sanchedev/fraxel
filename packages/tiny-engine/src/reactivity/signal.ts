import { SignalRegister } from './register'

/**
 * The **`Signal`** class is a reactive primitive that holds a value and notifies subscribers when it changes.
 *
 * @typeParam T The type of the value held by the signal.
 *
 * @example
 * ```ts
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
   * @param initialValue The initial value of the signal.
   */
  constructor(initialValue: T) {
    this.#value = initialValue
  }

  /**
   * Sets the signal value and notifies all subscribers.
   * @example
   * ```ts
   * const score = new Signal(0)
   * score.value = 10
   * console.log(score.value) // 10
   * ```
   */
  set value(val) {
    if (val === this.#value) return
    this.#value = val
    const currentListeners = Array.from(this.#listeners)
    currentListeners.forEach((fn) => fn(val))
  }

  /**
   * Gets the current signal value.
   * @example
   * ```ts
   * const speed = new Signal(5)
   * console.log(speed.value) // 5
   * ```
   */
  get value(): T {
    SignalRegister.register(this)
    return this.#value
  }

  /**
   * The **`sub`** method subscribes a listener that is called whenever the signal value changes.
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
   * The **`clearSubs`** method remove all subscribes of this signal.
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
   *
   * damage.clearSubs()
   * ```
   */
  clearSubs() {
    this.#listeners.clear()
  }
}
