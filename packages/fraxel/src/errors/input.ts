import type { Action, ActionString } from '../input/input.js'
import { FraxelError } from './base.js'

/**
 * The **`InputError`** class is the base error for all input-related errors.
 * Thrown when an error occurs during action creation, key binding, or input queries.
 *
 * @example
 * ```ts
 * import { InputError } from 'fraxel'
 *
 * try {
 *   Input.getAction(unknownAction)
 * } catch (e) {
 *   if (e instanceof InputError) console.error('Input issue:', e.message)
 * }
 * ```
 */
export class InputError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'InputError'
  }
}

/**
 * The **`ActionNotFoundError`** class is thrown when trying to access an action that
 * hasn't been registered via `Input.createAction()`. This commonly happens when
 * querying input state with an unregistered action identifier.
 *
 * @example
 * ```ts
 * import { Input } from 'fraxel'
 *
 * const Unknown = 'key:unknown|false|false|false'
 * Input.isActionPressed(Unknown) // ActionNotFoundError: Did you call Input.createAction()?
 * ```
 */
export class ActionNotFoundError extends InputError {
  constructor(action: ActionString) {
    super(`Action not found: ${action}. Did you call Input.createAction()?`)
  }
}

export class InvalidActionTypeError extends InputError {
  constructor(action: Action) {
    super(`Invalid action type: ${action?.type}`)
  }
}
