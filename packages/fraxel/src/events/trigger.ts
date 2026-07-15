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
export class Trigger<T extends any[] = any[]> {
  #listeners = new Set<Fun<T>>()
  #linked: Trigger<T> | null = null
  #linkedListeners = new Map<Fun<T>, Fun<T>>()

  connect = (cb: Fun<T>) => {
    this.#listeners.add(cb)
    this.#connectLinked(cb)
  }
  disconnect = (cb: Fun<T>) => {
    this.#listeners.delete(cb)
    this.#disconnectLinked(cb)
  }

  clear = () => {
    for (const cb of this.#listeners) {
      this.#disconnectLinked(cb)
    }
    this.#listeners.clear()
  }

  link = (trigger: Trigger<T>) => {
    if (trigger === this || this.#linked === trigger) return
    this.unlink()
    this.#linked = trigger
    for (const cb of this.#listeners) {
      this.#connectLinked(cb)
    }
  }

  unlink = () => {
    if (this.#linked == null) return
    for (const cb of this.#listeners) {
      this.#disconnectLinked(cb)
    }
    this.#linked = null
  }

  #connectLinked(cb: Fun<T>) {
    if (this.#linked == null || this.#linkedListeners.has(cb)) return
    const linkedCb: Fun<T> = (...args) => cb(...args)
    this.#linkedListeners.set(cb, linkedCb)
    this.#linked.connect(linkedCb)
  }

  #disconnectLinked(cb: Fun<T>) {
    if (this.#linked == null) return
    const linkedCb = this.#linkedListeners.get(cb)
    if (linkedCb == null) return
    this.#linked.disconnect(linkedCb)
    this.#linkedListeners.delete(cb)
  }

  emit = (...args: T) => {
    for (const cb of Array.from(this.#listeners)) {
      cb(...args)
    }
  }
}
