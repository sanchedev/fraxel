export class Signal<T> {
  #value: T
  #listeners = new Set<(value: T) => void>()

  constructor(initialValue: T) {
    this.#value = initialValue
  }

  set value(val) {
    this.#value = val
    this.#listeners.forEach((fn) => fn(val))
  }
  get value(): T {
    return this.#value
  }

  sub(fn: (value: T) => void) {
    this.#listeners.add(fn)
  }
  unsub(fn: (value: T) => void) {
    this.#listeners.delete(fn)
  }
}
