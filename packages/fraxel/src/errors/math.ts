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
 * The **`InvalidBoundsLikeError`** error is thrown when a value is not a valid BoundsLike.
 * A BoundsLike is a `Bounds` instance, number, `[horizontal, vertical]` tuple,
 * `[left, top, right, bottom]` tuple, or object with `left/top/right/bottom` or `horizontal/vertical` properties.
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidBoundsLikeError(null)
 * ```
 */
export class InvalidBoundsLikeError extends MathError {
  constructor(received: unknown) {
    const type =
      received === null
        ? 'null'
        : received === undefined
          ? 'undefined'
          : (received?.constructor?.name ?? typeof received)

    super(
      `Expected a BoundsLike but received ${type}. A BoundsLike is a Bounds, number, [horizontal, vertical] tuple, or { left, top, right, bottom } object.`,
    )
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
