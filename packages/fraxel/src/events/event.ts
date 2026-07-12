import { Trigger } from './trigger.js'
import type { EventName, Fun } from './types.js'

/**
 * The **`Event`** class is a type-safe event emitter that supports subscribing,
 * unsubscribing, and emitting events. Used throughout the engine for node lifecycle
 * events (started, destroyed), collision events, input events, and more.
 *
 * @typeParam T The parameter types of the event callback.
 * @typeParam K The string literal type of the event base name.
 *
 * @example
 * ```ts
 * import { Event } from 'fraxel'
 *
 * const onDamage = new Event<[number], 'damage'>('damage', (amount) => {})
 *
 * onDamage.on((amount) => {
 *   console.log('Damage taken:', amount)
 * })
 *
 * onDamage.emit(25) // logs: "Damage taken: 25"
 * ```
 */
export class Event<T extends any[], const K extends string> {
  /**
   * The **`on`** method subscribes a callback to this event. Returns an unsubscribe
   * function for convenience.
   *
   * @param cb The callback function to invoke when the event is emitted.
   * @returns A function that removes the callback when called.
   *
   * @example
   * ```ts
   * const unsub = sprite.started.on(() => {
   *   console.log('Sprite started!')
   * })
   *
   * unsub() // removes the listener
   * ```
   */
  on(cb: Fun<T>) {
    this.#list.push(cb)
    return () => this.off(cb)
  }

  /**
   * The **`onFirst`** method subscribes a callback to this event with highest priority.
   * The callback will be invoked before any previously registered callbacks.
   *
   * @param cb The callback function to invoke first when the event is emitted.
   *
   * @example
   * ```ts
   * collider.collided.onFirst((other) => {
   *   console.log('Priority handler:', other)
   * })
   * ```
   */
  onFirst(cb: Fun<T>) {
    this.#list.unshift(cb)
  }

  /**
   * The **`off`** method unsubscribes a callback from this event.
   *
   * @param cb The callback function to remove.
   *
   * @example
   * ```ts
   * const handler = (delta: number) => { /* ... *\/ }
   * node.updated.on(handler)
   * node.updated.off(handler)
   * ```
   */
  off(cb: Fun<T>) {
    const index = this.#list.indexOf(cb)
    if (index < 0) return

    this.#list.splice(index, 1)
  }

  /**
   * The **`emit`** method invokes all subscribed callbacks with the given parameters.
   * Callbacks are invoked in the order they were registered.
   *
   * @param params The parameters to pass to each callback.
   *
   * @example
   * ```ts
   * collider.colliderEntered.emit(otherCollider)
   * ```
   */
  emit(...params: T) {
    const listeners = [...this.#list]
    listeners.forEach((cb) => cb(...params))
    const triggers = [...this.#triggers]
    triggers.forEach((t) => t.emit(...params))
  }

  /**
   * The **`clean`** method removes all subscribed callbacks from this event.
   * Typically called during node destruction to prevent memory leaks.
   *
   * @example
   * ```ts
   * // Remove all listeners before destroying a node
   * node.updated.clean()
   * ```
   */
  clean() {
    this.#list.length = 0
    for (const trigger of this.#triggers) {
      trigger.clear()
    }
    this.#triggers.clear()
  }

  #triggers = new Set<Trigger<T>>()
  connect(trigger: Trigger<T>) {
    this.#triggers.add(trigger)
  }
  disconnect(trigger: Trigger<T>) {
    this.#triggers.delete(trigger)
  }

  #list: Fun<T>[] = []

  /**
   * Creates a new `Event` instance.
   *
   * @param baseName The base name of the event (e.g., `'damage'`, `'colliderEnter'`).
   * @param exampleFun An example function signature for type inference.
   */
  constructor(
    /** The base name used to derive the event handler name (e.g., `'damage'` → `'onDamage'`). */
    public baseName: K,
    /** An example function used for type inference in event subscriptions. */
    public exampleFun: Fun<T>,
  ) {}
}

/**
 * The **`getEventName`** function converts a base event name to its handler name.
 * For example, `'damage'` becomes `'onDamage'`.
 *
 * @param baseName The base name of the event.
 * @returns The event handler name with `on` prefix and capitalized first letter.
 *
 * @example
 * ```ts
 * import { getEventName } from 'fraxel'
 *
 * getEventName('damage')        // 'onDamage'
 * getEventName('colliderEnter') // 'onColliderEnter'
 * ```
 */
export function getEventName<const K extends string>(baseName: K): EventName<K> {
  const first = baseName[0]?.toUpperCase() ?? ''
  const rest = baseName.slice(1)
  const eventName = `on${first}${rest}`
  return eventName as EventName<K>
}
