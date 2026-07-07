import { FraxelError } from './base.js'

/**
 * The **`InputError`** error is thrown when an error occurs during action creating or management.
 * @example
 * ```ts
 * // When this happens:
 * throw new InputError('Action does not exist')
 * ```
 */
export class InputError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'InputError'
  }
}

/**
 * Thrown when trying to access an action that hasn't been registered.
 */
export class ActionNotFoundError extends InputError {
  constructor(action: symbol) {
    super(`Input action not found: ${action.toString()}. Did you call Input.createAction()?`)
  }
}

/**
 * Thrown when trying to bind a key combo that's already used by another action.
 */
export class DuplicateKeyError extends InputError {
  constructor(keyCombo: string, existingAction: symbol, newAction: symbol) {
    super(
      `Key combo "${keyCombo}" is already bound to action ${existingAction.toString()}. Cannot bind to ${newAction.toString()}.`,
    )
  }
}
