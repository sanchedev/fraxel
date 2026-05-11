import type { Event } from './event'

export type Fun<T extends any[]> = (...args: T) => void

export type EventName<T extends string> = `on${Capitalize<T>}`

export type EventsFromRecord<T extends Record<string, Event<any[], string>>> = {
  [P in keyof T as EventName<T[P]['baseName']>]: T[P]['exampleFun']
}
