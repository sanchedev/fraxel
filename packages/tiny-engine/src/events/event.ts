import type { EventName, Fun } from './types.js'

export class Event<T extends any[], const K extends string> {
  /**
   * The **`on`** method subscribes the `cb` to this `Event`.
   * @param cb Callback
   */
  on(cb: Fun<T>) {
    this.#list.push(cb)
  }
  /**
   * The **`onFirst`** method subscribes the `cb` to this `Event` in the first priority.
   * @param cb Callback
   */
  onFirst(cb: Fun<T>) {
    this.#list.unshift(cb)
  }
  /**
   * The **`off`** method unsubscribes the `cb` to this `Event`.
   * @param cb Callback
   */
  off(cb: Fun<T>) {
    const index = this.#list.indexOf(cb)
    if (index < 0) return

    this.#list.splice(index, 1)
  }

  /**
   * The **`emit`** method send the information to the subscribers of this `Event`.
   * @param cb Callback
   */
  emit(...params: T) {
    this.#list.forEach((cb) => cb(...params))
  }
  /**
   * The **`clean`** method unsubscribe all listeners of this `Event`.
   * @param cb Callback
   */
  clean() {
    this.#list.length = 0
  }

  #list: Fun<T>[] = []

  constructor(
    public baseName: K,
    public exampleFun: Fun<T>,
  ) {}
}

export function getEventName<const K extends string>(
  baseName: K,
): EventName<K> {
  const first = baseName[0]?.toUpperCase() ?? ''
  const rest = baseName.slice(1)
  const eventName = `on${first}${rest}`
  return eventName as EventName<K>
}
