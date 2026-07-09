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
 * querying input state with an unregistered action symbol.
 *
 * @example
 * ```ts
 * import { Input } from 'fraxel'
 *
 * const Unknown = Symbol('unknown')
 * Input.isActionPressed(Unknown) // ActionNotFoundError: Did you call Input.createAction()?
 * ```
 */
export class ActionNotFoundError extends InputError {
  constructor(action: symbol) {
    super(`Input action not found: ${action.toString()}. Did you call Input.createAction()?`)
  }
}

/**
 * The **`DuplicateKeyError`** class is thrown when trying to bind a key combination
 * that's already used by another action. Each key combo can only be bound to one action.
 *
 * @example
 * ```ts
 * import { Input } from 'fraxel'
 *
 * const Jump = Input.createAction({ key: ' ' })
 * const DoubleJump = Input.createAction({ key: ' ' })
 * // DuplicateKeyError: Key combo " " is already bound to Symbol(Jump)
 * ```
 */
export class DuplicateKeyError extends InputError {
  constructor(keyCombo: string, existingAction: symbol, newAction: symbol) {
    super(
      `Key combo "${keyCombo}" is already bound to action ${existingAction.toString()}. Cannot bind to ${newAction.toString()}.`,
    )
  }
}
