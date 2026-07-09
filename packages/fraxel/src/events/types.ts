import type { Event } from './event.js'

/**
 * The **`Fun`** type represents a callable function with the given parameter types.
 * Used as the callback type for `Event` subscriptions.
 *
 * @typeParam T The parameter types of the function.
 */
export type Fun<T extends any[]> = (...args: T) => void

/**
 * The **`EventName`** type converts a base event name to its handler name.
 * Adds the `on` prefix and capitalizes the first letter.
 *
 * @typeParam T The base event name string.
 *
 * @example
 * ```ts
 * type Handler = EventName<'damage'> // 'onDamage'
 * type CollideHandler = EventName<'colliderEnter'> // 'onColliderEnter'
 * ```
 */
export type EventName<T extends string> = `on${Capitalize<T>}`

/**
 * The **`EventsFromRecord`** type extracts event handler types from a record of `Event` instances.
 * Maps each event's `baseName` to its handler name and uses `exampleFun` for the callback type.
 *
 * @example
 * ```ts
 * type Handlers = EventsFromRecord<{
 *   damage: Event<[number], 'damage'>
 *   destroy: Event<[], 'destroy'>
 * }>
 * // { onDamage: (amount: number) => void; onDestroy: () => void }
 * ```
 */
export type EventsFromRecord<T extends Record<string, Event<any[], string>>> = {
  [P in keyof T as EventName<T[P]['baseName']>]: T[P]['exampleFun']
}
