/**
 * The **`FraxelError`** class is the base error class for all errors thrown by the Fraxel engine.
 * All engine-specific errors extend this class, allowing catch blocks to use
 * `instanceof FraxelError` to handle any engine error uniformly.
 *
 * @example
 * ```ts
 * import { FraxelError } from 'fraxel'
 *
 * try {
 *   // any fraxel operation
 * } catch (e) {
 *   if (e instanceof FraxelError) {
 *     console.error('Engine error:', e.message)
 *   }
 * }
 * ```
 */
export class FraxelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FraxelError'
  }
}
