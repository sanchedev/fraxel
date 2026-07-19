import { InvalidBoundsLikeError } from '../errors/math.js'

/**
 * The **`Bounds`** class represents a rectangular region in 2D space with
 * `left`, `top`, `right`, and `bottom` edges. Used for camera limits,
 * collision boundaries, and spatial queries.
 *
 * @example
 * ```ts
 * import { Bounds } from 'fraxel'
 *
 * // All edges equal
 * const a = new Bounds(10) // left=10, top=10, right=10, bottom=10
 *
 * // Horizontal and vertical
 * const b = new Bounds(100, 200) // left=100, top=200, right=100, bottom=200
 *
 * // Left, top, right (bottom = top)
 * const c = new Bounds(0, 0, 800) // left=0, top=0, right=800, bottom=0
 *
 * // All edges
 * const d = new Bounds(0, 0, 800, 600) // left=0, top=0, right=800, bottom=600
 * ```
 */
export class Bounds {
  /** The left edge of the bounds. */
  left: number = 0
  /** The top edge of the bounds. */
  top: number = 0
  /** The right edge of the bounds. */
  right: number = 0
  /** The bottom edge of the bounds. */
  bottom: number = 0

  constructor()
  constructor(all: number)
  constructor(boundsLike: BoundsLike)
  constructor(horizontal: number, vertical: number)
  constructor(left: number, vertical: number, right: number)
  constructor(left: number, top: number, right: number, bottom: number)
  constructor(...args: unknown[]) {
    if (args.length === 0) return
    if (args.slice(0, 4).every((l) => typeof l === 'number')) {
      const [s1, s2, s3, s4] = args as number[]
      if (s1 == null) return
      if (s2 == null) {
        this.left = s1
        this.top = s1
        this.right = s1
        this.bottom = s1
      } else if (s3 == null) {
        this.left = s1
        this.top = s2
        this.right = s1
        this.bottom = s2
      } else if (s4 == null) {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s2
      } else {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s4
      }
    } else if (
      Array.isArray(args[0]) &&
      args[0].length > 1 &&
      args[0].length <= 4 &&
      args[0].every((s) => typeof s === 'number')
    ) {
      const [s1, s2, s3, s4] = args[0]
      if (s1 == null) return
      if (s2 == null) {
        this.left = s1
        this.top = s1
        this.right = s1
        this.bottom = s1
      } else if (s3 == null) {
        this.left = s1
        this.top = s2
        this.right = s1
        this.bottom = s2
      } else if (s4 == null) {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s2
      } else {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s4
      }
    } else if (args[0] instanceof Bounds) {
      this.left = args[0].left
      this.top = args[0].top
      this.right = args[0].right
      this.bottom = args[0].bottom
    } else if (args[0] != null && typeof args[0] === 'object') {
      const obj = args[0]
      if (
        'horizontal' in obj &&
        typeof obj.horizontal === 'number' &&
        'vertical' in obj &&
        typeof obj.vertical === 'number'
      ) {
        this.left = obj.horizontal
        this.top = obj.vertical
        this.right = obj.horizontal
        this.bottom = obj.vertical
      } else if (
        'left' in obj &&
        typeof obj.left === 'number' &&
        'right' in obj &&
        typeof obj.right === 'number'
      ) {
        this.left = obj.left
        this.right = obj.right
        if ('vertical' in obj && typeof obj.vertical === 'number') {
          this.top = obj.vertical
          this.bottom = obj.vertical
        } else if (
          'top' in obj &&
          typeof obj.top === 'number' &&
          'bottom' in obj &&
          typeof obj.bottom === 'number'
        ) {
          this.top = obj.top
          this.bottom = obj.bottom
        }
      }
    }
    if (!isBoundsLike(args[0])) throw new InvalidBoundsLikeError(args[0])
  }

  /**
   * The **`clone`** method returns a new `Bounds` with the same side values.
   * @returns A new `Bounds` instance.
   *
   * @example
   * ```ts
   * const a = new Bounds(4, 2)
   * const b = a.clone()
   * b.bottom = 8
   * console.log(a.bottom) // 2 (unchanged)
   * ```
   */
  clone() {
    return new Bounds(this)
  }

  /** Returns a readable string representation of this bounds. */
  toString() {
    return `Bounds(${this.left}, ${this.top}, ${this.right}, ${this.bottom})`
  }
}

/**
 * The **`BoundsLike`** type represents all accepted formats for bounds input.
 * Can be a `Bounds` instance, `number`, `[horizontal, vertical]` tuple,
 * `[left, top, right]` tuple, `[left, top, right, bottom]` tuple, or
 * object with edge properties.
 *
 * @example
 * ```ts
 * import { type BoundsLike } from 'fraxel'
 *
 * const a: BoundsLike = new Bounds(0, 0, 800, 600)
 * const b: BoundsLike = 10                           // all edges = 10
 * const c: BoundsLike = [100, 200]                   // horizontal, vertical
 * const d: BoundsLike = { left: 0, top: 0, right: 800, bottom: 600 }
 * ```
 */
export type BoundsLike =
  | number
  | [horizontal: number, vertical: number]
  | [left: number, vertical: number, right: number]
  | [left: number, top: number, right: number, bottom: number]
  | { horizontal: number; vertical: number }
  | { left: number; vertical: number; right: number }
  | { left: number; top: number; right: number; bottom: number }
  | Bounds

/**
 * The **`isBoundsLike`** function checks if a value is a valid `BoundsLike` format.
 * Type guard that verifies the structure before passing unknown data to bounds constructors.
 *
 * @param object The value to check.
 * @returns `true` if the value is a valid `BoundsLike`.
 *
 * @example
 * ```ts
 * import { isBoundsLike } from 'fraxel'
 *
 * isBoundsLike(new Bounds(0, 0, 800, 600)) // true
 * isBoundsLike(10)                          // true
 * isBoundsLike([100, 200])                  // true
 * isBoundsLike('hello')                     // false
 * ```
 */
export function isBoundsLike(object: unknown): object is BoundsLike {
  if (typeof object === 'number') return true
  if (
    Array.isArray(object) &&
    object.length > 1 &&
    object.length <= 4 &&
    object.every((s) => typeof s === 'number')
  ) {
    return true
  } else if (object instanceof Bounds) {
    return true
  } else if (object != null && typeof object === 'object') {
    const obj = object
    if (
      'horizontal' in obj &&
      typeof obj.horizontal === 'number' &&
      'vertical' in obj &&
      typeof obj.vertical === 'number'
    ) {
      return true
    } else if (
      'left' in obj &&
      typeof obj.left === 'number' &&
      'right' in obj &&
      typeof obj.right === 'number'
    ) {
      if ('vertical' in obj && typeof obj.vertical === 'number') {
        return true
      } else if (
        'top' in obj &&
        typeof obj.top === 'number' &&
        'bottom' in obj &&
        typeof obj.bottom === 'number'
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * The **`bounds`** function creates a `Bounds` from various input formats.
 * Convenience factory that delegates to the `Bounds` constructor.
 *
 * @throws {InvalidBoundsLikeError} if the input is not a valid bounds format.
 *
 * @example
 * ```ts
 * import { bounds } from 'fraxel'
 *
 * const a = bounds(10)                       // all edges = 10
 * const b = bounds(100, 200)                 // horizontal=100, vertical=200
 * const c = bounds(0, 0, 800)               // left=0, top=0, right=800, bottom=0
 * const d = bounds(0, 0, 800, 600)          // left=0, top=0, right=800, bottom=600
 * const e = bounds({ left: 0, right: 800 }) // from object
 * ```
 */
export function bounds(): Bounds
export function bounds(all: number): Bounds
export function bounds(boundsLike: BoundsLike): Bounds
export function bounds(horizontal: number, vertical: number): Bounds
export function bounds(left: number, vertical: number, right: number): Bounds
export function bounds(left: number, top: number, right: number, bottom: number): Bounds
export function bounds(...args: unknown[]): Bounds {
  return new Bounds(...(args as [number]))
}
