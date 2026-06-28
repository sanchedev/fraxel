import type { Event } from './event'

/**
 * The **`Fun`** type represents a function with the given parameter types.
 * @typeParam T The parameter types of the function.
 */
export type Fun<T extends any[]> = (...args: T) => void

/**
 * The **`EventName`** type converts a base event name to its handler name.
 * For example, `'damage'` becomes `'onDamage'`.
 * @typeParam T The base event name string.
 */
export type EventName<T extends string> = `on${Capitalize<T>}`

/**
 * The **`EventsFromRecord`** type extracts event handler types from a record of `Event` instances.
 * Used internally to generate type-safe event handler properties.
 */
export type EventsFromRecord<T extends Record<string, Event<any[], string>>> = {
  [P in keyof T as EventName<T[P]['baseName']>]: T[P]['exampleFun']
}
