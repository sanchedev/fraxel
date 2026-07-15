/**
 * The **`Fun`** type represents a callable function with the given parameter types.
 * Used as the callback type for `Trigger` subscriptions.
 *
 * @typeParam T The parameter types of the function.
 */
export type Fun<T extends any[]> = (...args: T) => void
