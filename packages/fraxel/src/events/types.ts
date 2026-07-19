import type { Trigger } from './trigger'

/**
 * The **`Fun`** type represents a callable function with the given parameter types.
 * Used as the callback type for `Trigger` subscriptions.
 *
 * @typeParam T The parameter types of the function.
 */
export type Fun<T extends any[]> = (...args: T) => void

export type TriggersFrom<T extends Record<keyof any, any>> = {
  [P in keyof T as T[P] extends Trigger ? P : never]: T[P]
}
