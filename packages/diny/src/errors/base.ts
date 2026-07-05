/**
 * The **`TinyEngineError`** error is the base error class for all errors thrown by the Tiny Engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new TinyEngineError('Something went wrong')
 * ```
 */
export class TinyEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TinyEngineError'
  }
}
