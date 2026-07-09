import { FraxelError } from './base.js'

/**
 * The **`HookError`** class is the base error for all hook-related errors.
 * Thrown when an error occurs during hook execution or registration.
 *
 * @example
 * ```ts
 * import { HookError } from 'fraxel'
 *
 * try {
 *   myCustomHook()
 * } catch (e) {
 *   if (e instanceof HookError) console.error('Hook issue:', e.message)
 * }
 * ```
 */
export class HookError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'HookError'
  }
}

/**
 * The **`HookOutsideComponentError`** class is thrown when a hook is called outside
 * of a component's render context. Hooks must be called directly inside a JSX component
 * function, not in callbacks, timeouts, or nested functions.
 *
 * @example
 * ```ts
 * // Thrown when:
 * useEffect(() => {
 *   // This is fine — inside component
 * })
 *
 * // But NOT here:
 * const handler = () => useEffect(() => {}) // HookOutsideComponentError
 * ```
 */
export class HookOutsideComponentError extends HookError {
  constructor(hookName: string) {
    super(`${hookName}() must be used inside a component`)
  }
}

/**
 * The **`HookRequiresNodeRootError`** class is thrown when a hook requires the component
 * root element to be a single Node, but a fragment or array was returned instead.
 * Hooks like `useEffect` and `useUpdate` need a node root to attach lifecycle listeners.
 *
 * @example
 * ```tsx
 * // Thrown when a component returns a fragment:
 * function Bad() {
 *   useEffect(() => { console.log('mounted') })
 *   return <><sprite /><sprite /></> // HookRequiresNodeRootError
 * }
 * ```
 */
export class HookRequiresNodeRootError extends HookError {
  constructor(hookName: string) {
    super(
      `${hookName}() requires the component root element to be a Node. Fragments or arrays are not allowed.`,
    )
  }
}
