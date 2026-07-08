import type { Fun } from '../events/types.js'
import { pushEffect } from './context.js'

/**
 * The **`createTrigger`** function creates a new `Trigger` instance for pub/sub communication
 * between components without node events.
 *
 * @typeParam T The argument types for the trigger callbacks
 * @returns A new `Trigger` instance
 *
 * @example
 * ```ts
 * const planted = createTrigger<[Plant]>()
 * ```
 */
export function createTrigger<T extends any[] = any[]>() {
  return new Trigger<T>()
}

/**
 * The **`useTrigger`** hook subscribes to a `Trigger` with auto-cleanup on node destroy.
 *
 * @param trigger The `Trigger` instance to subscribe to
 * @param fn The callback function to invoke when the trigger emits
 *
 * @example
 * ```tsx
 * const planted = createTrigger<[Plant]>()
 *
 * useTrigger(planted, (plant) => {
 *   console.log('Planted:', plant)
 * })
 * ```
 */
export function useTrigger<T extends Trigger<any[]>>(trigger: T, fn: Parameters<T['connect']>[0]) {
  pushEffect('useTrigger', ([node]) => {
    if (node == null) return

    trigger.connect(fn)
    node.destroyed.on(() => trigger.disconnect(fn))
  })
}

/**
 * The **`Trigger`** class provides a pub/sub pattern for cross-component communication.
 * Use `createTrigger()` to create instances.
 *
 * @typeParam T The argument types for the trigger callbacks
 *
 * @example
 * ```ts
 * const trigger = createTrigger<[number]>()
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
