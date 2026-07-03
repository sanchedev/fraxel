import { TinyEngineError } from './base.js'

/**
 * The **`HookError`** error is thrown when an error occurs during hook execution or registration.
 * @example
 * ```ts
 * // When this happens:
 * throw new HookError('Hook failed to execute')
 * ```
 */
export class HookError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'HookError'
  }
}

/**
 * The **`HookOutsideComponentError`** error is thrown when a hook is called outside of a component's render context.
 * @example
 * ```ts
 * // When this happens:
 * throw new HookOutsideComponentError('useMyHook')
 * ```
 */
export class HookOutsideComponentError extends HookError {
  constructor(hookName: string) {
    super(`${hookName}() must be used inside a component`)
  }
}

/**
 * The **`HookRequiresNodeRootError`** error is thrown when a hook requires the component root element to be a single Node, but a fragment or array was returned instead.
 * @example
 * ```ts
 * // When this happens:
 * throw new HookRequiresNodeRootError('useEffect')
 * ```
 */
export class HookRequiresNodeRootError extends HookError {
  constructor(hookName: string) {
    super(
      `${hookName}() requires the component root element to be a Node. Fragments or arrays are not allowed.`,
    )
  }
}

/**
 * The **`InvalidEventInHookError`** error is thrown when the `useEvent` hook's `getEvent()` callback does not return a valid Event instance.
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidEventInHookError('useEvent', 'myEvent')
 * ```
 */
export class InvalidEventInHookError extends HookError {
  constructor(hookName: string, eventName: string) {
    super(
      `${hookName} expected the event ${eventName} to be a valid Event instance`,
    )
  }
}
