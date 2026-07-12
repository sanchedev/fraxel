import type { Fun } from './types.js'

/**
 * The **`Trigger`** class provides a pub/sub pattern for cross-component communication.
 * Use `createTrigger()` to create instances.
 *
 * @typeParam T The argument types for the trigger callbacks
 *
 * @example
 * ```ts
 * import { Trigger } from 'fraxel'
 *
 * const trigger = new Trigger<[number]>()
 *
 * trigger.connect((value) => console.log(value))
 * trigger.emit(42) // logs: 42
 * ```
 */
export class Trigger<T extends any[]> {
  #listeners = new Set<Fun<T>>()

  connect = (cb: Fun<T>) => {
    this.#listeners.add(cb)
  }
  disconnect = (cb: Fun<T>) => {
    this.#listeners.delete(cb)
  }

  clear = () => {
    this.#listeners.clear()
  }

  emit = (...args: T) => {
    for (const cb of Array.from(this.#listeners)) {
      cb(...args)
    }
  }
}
