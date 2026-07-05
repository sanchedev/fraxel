import { FraxelError } from './base.js'

/**
 * The **`MathError`** error is thrown when an error occurs in math operations.
 * @example
 * ```ts
 * // When this happens:
 * throw new MathError('Math operation failed')
 * ```
 */
export class MathError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'MathError'
  }
}

/**
 * The **`InvalidVectorLikeError`** error is thrown when a value is not a valid VectorLike (Vector2, {x, y} object, [x, y] tuple, or number).
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidVectorLikeError(null)
 * ```
 */
export class InvalidVectorLikeError extends MathError {
  constructor(received: unknown) {
    const type =
      received === null
        ? 'null'
        : received === undefined
          ? 'undefined'
          : (received?.constructor?.name ?? typeof received)

    super(
      `Expected a VectorLike but received ${type}. A VectorLike is a Vector2, {x, y} object, [x, y] tuple, or number.`,
    )
  }
}
