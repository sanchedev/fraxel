import { FraxelError } from './base.js'

/**
 * The **`MathError`** class is the base error for all math-related errors.
 * Thrown when an error occurs in math operations such as vector, color, or bounds construction.
 *
 * @example
 * ```ts
 * import { MathError } from 'fraxel'
 *
 * try {
 *   vector2(invalidValue)
 * } catch (e) {
 *   if (e instanceof MathError) console.error('Math issue:', e.message)
 * }
 * ```
 */
export class MathError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'MathError'
  }
}

/**
 * The **`InvalidBoundsLikeError`** class is thrown when a value passed to `bounds()` or
 * a `Bounds` constructor is not a valid `BoundsLike`. Accepted formats: `Bounds` instance,
 * `number`, `[horizontal, vertical]` tuple, `[left, top, right, bottom]` tuple, or
 * `{ left, top, right, bottom }` / `{ horizontal, vertical }` object.
 *
 * @example
 * ```ts
 * import { bounds } from 'fraxel'
 *
 * bounds(null)      // throws InvalidBoundsLikeError
 * bounds(undefined) // throws InvalidBoundsLikeError
 * bounds([1, 2])    // works — [horizontal, vertical]
 * bounds(10)        // works — uniform bounds
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
 * The **`InvalidColorLikeError`** class is thrown when a value passed to `color()` or
 * a `Color` constructor is not a valid `ColorLike`. Accepted formats: `Color` instance,
 * `[red, green, blue]` tuple, `[red, green, blue, alpha]` tuple, or
 * `{ r, g, b }` / `{ r, g, b, a }` object, or CSS-style hex strings (`#RGB`, `#RGBA`,
 * `#RRGGBB`, `#RRGGBBAA`).
 *
 * @example
 * ```ts
 * import { color } from 'fraxel'
 *
 * color(null)      // throws InvalidColorLikeError
 * color([1, 0, 0]) // works — red
 * color('#f00')    // works — red
 * color(0.5)       // throws InvalidColorLikeError — number not accepted
 * ```
 */
export class InvalidColorLikeError extends MathError {
  constructor(received: unknown) {
    const type =
      received === null
        ? 'null'
        : received === undefined
          ? 'undefined'
          : (received?.constructor?.name ?? typeof received)

    super(
      `Expected a ColorLike but received ${type}. A ColorLike is a Color instance, #RGB/#RGBA/#RRGGBB/#RRGGBBAA hex string, [red, green, blue] tuple, [red, green, blue, alpha] tuple, or object with red/green/blue or red/green/blue/alpha properties`,
    )
  }
}

/**
 * The **`InvalidVectorLikeError`** class is thrown when a value passed to `vector2()` or
 * a `Vector2` constructor is not a valid `VectorLike`. Accepted formats: `Vector2` instance,
 * `{ x, y }` object, `[x, y]` tuple, or a single `number` (sets both x and y).
 *
 * @example
 * ```ts
 * import { vector2 } from 'fraxel'
 *
 * vector2(null)       // throws InvalidVectorLikeError
 * vector2([1, 2])     // works — Vector2(1, 2)
 * vector2({ x: 1 })  // throws InvalidVectorLikeError — missing y
 * vector2(5)          // works — Vector2(5, 5)
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
