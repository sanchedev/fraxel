import { isVectorLike, Vector2, type VectorLike } from './vector2.js'

/**
 * The **`Region`** class represents a rectangular region by size in 2D space with
 * `offset`, and `size`. Used for tilemaps, sprite regions, and spacial spaces.
 *
 * @example
 * ```ts
 * import { Region } from 'fraxel'
 *
 * // Using vector like
 * const a = new Region(10, 20) // ofset=vector2(10, 10), size=vector2(20, 20)
 *
 * // Using numbers
 * const b = new Region(10, 16, 32, 48) // ofset=vector2(10, 16), size=vector2(32, 48)
 * ```
 */
export class Region {
  /** The left edge of the bounds. */
  offset = Vector2.ZERO
  /** The bottom edge of the bounds. */
  size = Vector2.ZERO

  constructor(offset: VectorLike, size: VectorLike)
  constructor(x: number, y: number, width: number, height: number)
  constructor(...args: unknown[]) {
    const [arg1, arg2, arg3, arg4] = args
    if (arg1 != null && arg2 != null) {
      if (
        arg3 != null &&
        arg4 != null &&
        typeof arg1 === 'number' &&
        typeof arg2 === 'number' &&
        typeof arg3 === 'number' &&
        typeof arg4 === 'number'
      ) {
        this.offset = new Vector2(arg1, arg2)
        this.size = Vector2.max(Vector2.ZERO, new Vector2(arg3, arg4))
      } else if (isVectorLike(arg1) && isVectorLike(arg2)) {
        this.offset = new Vector2(arg1)
        this.size = new Vector2(arg2)
      }
      this.size = Vector2.max(Vector2.ZERO, this.size)
    }
  }

  /**
   * The **`clone`** method returns a new `Region` with the same offset and size cloned values.
   * @returns A new `Region` instance.
   *
   * @example
   * ```ts
   * const a = new Region(16, 32)
   * const b = a.clone()
   * b.size.x = 16
   * console.log(a.size) // Vector2(32, 32) (unchanged)
   * ```
   */
  clone() {
    return new Region(this.offset.clone(), this.size.clone())
  }

  /**
   * The **`equals`** method checks if this region has the same offset and size as another.
   * @param other The region to compare with.
   * @returns `true` if both offset and size are equal, `false` otherwise.
   *
   * @example
   * ```ts
   * const a = new Region(10, 20, 32, 48)
   * const b = new Region(10, 20, 32, 48)
   * a.equals(b) // true
   * ```
   */
  equals(other: Region): boolean {
    return this.offset.equals(other.offset) && this.size.equals(other.size)
  }

  /** Returns a readable string representation of this region. */
  toString() {
    return `Region(offset=${this.offset.toString()}, size=${this.size.toString()})`
  }
}

/**
 * The **`region`** function creates a `Region` from various input formats.
 * Convenience factory that delegates to the `Region` constructor.
 *
 * @example
 * ```ts
 * import { region } from 'fraxel'
 *
 * const a = region(10, 20)            // offset=vector2(10, 10), size=vector2(20, 20)
 * const b = region(16, 32, 32, 48)    // offset=vector2(16, 32), size=vector2(32, 48)
 * ```
 */
export function region(offset: VectorLike, size: VectorLike): Region
export function region(x: number, y: number, width: number, height: number): Region
export function region(...args: unknown[]): Region {
  return new Region(...(args as [number, number]))
}
