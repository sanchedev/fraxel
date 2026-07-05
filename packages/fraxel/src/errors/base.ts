/**
 * The **`FraxelError`** error is the base error class for all errors thrown by the Fraxel Engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new FraxelError('Something went wrong')
 * ```
 */
export class FraxelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FraxelError'
  }
}
