/**
 * The **`DinyError`** error is the base error class for all errors thrown by the Diny Engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new DinyError('Something went wrong')
 * ```
 */
export class DinyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DinyError'
  }
}
