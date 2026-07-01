import { InvalidVectorLikeError } from '../errors/math.js'

/** **`Vector2`** class helps to manage points in the plane. */
export class Vector2 {
  /** Vector in position ZERO (0, 0) */
  static get ZERO() {
    return new Vector2(0, 0)
  }
  /** Vector in position ONE (1, 1) */
  static get ONE() {
    return new Vector2(1, 1)
  }

  /**
   * The **`fromJSON`** method creates a `Vector2` from a `Position` object.
   * @param position The position object with `x` and `y` properties.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const vec = Vector2.fromJSON({ x: 10, y: 20 })
   * vec.x // 10
   * vec.y // 20
   * ```
   */
  static fromJSON(position: Position): Vector2 {
    return new Vector2(position.x, position.y)
  }

  static vectorize(vectorlike: VectorLike) {
    return vectorize(vectorlike)
  }

  constructor(
    /** The **`x`** property of `Vector2` represents the x-coordinate. */
    public x: number,
    /** The **`y`** property of `Vector2` represents the y-coordinate. */
    public y: number,
  ) {}

  /**
   * The **`clone`** method clones the vector without the same reference.
   */
  clone() {
    return new Vector2(this.x, this.y)
  }

  /**
   * The **`add`** method adds other vector to this vector.
   * @param vector2
   */
  add(vector2: Vector2): Vector2
  /**
   * The **`add`** method adds a number to `x` and `y` of this vector.
   * @param vector2
   */
  add(num: number): Vector2
  add(arg: Vector2 | number): Vector2 {
    if (arg instanceof Vector2) {
      this.x += arg.x
      this.y += arg.y
    }
    if (typeof arg === 'number') {
      this.x += arg
      this.y += arg
    }

    return this
  }

  /**
   * The **`toAdded`** method clones this vector and adds other vector to the clone.
   * @param vector2
   */
  toAdded(vector2: Vector2): Vector2
  /**
   * The **`toAdded`** method clones this vector and adds a number to `x` and `y` of the clone.
   * @param num
   */
  toAdded(num: number): Vector2
  toAdded(arg: Vector2 | number): Vector2 {
    return this.clone().add(arg as number)
  }

  /**
   * The **`subtract`** method subtracts other vector to this vector.
   * @param vector2
   */
  subtract(vector2: Vector2): Vector2
  /**
   * The **`subtract`** method subtracts a number to `x` and `y` of this vector.
   * @param num
   */
  subtract(num: number): Vector2
  subtract(arg: Vector2 | number): Vector2 {
    if (arg instanceof Vector2) {
      this.x -= arg.x
      this.y -= arg.y
    }
    if (typeof arg === 'number') {
      this.x -= arg
      this.y -= arg
    }

    return this
  }

  /**
   * The **`toSubtracted`** method clones this vector and subtracts other vector to the clone.
   * @param vector2
   */
  toSubtracted(vector2: Vector2): Vector2
  /**
   * The **`toSubtracted`** method clones this vector and subtracts a number to `x` and `y` of the clone.
   * @param num
   */
  toSubtracted(num: number): Vector2
  toSubtracted(arg: Vector2 | number): Vector2 {
    return this.clone().subtract(arg as number)
  }

  /**
   * The **`multiply`** method multiplies other vector to this vector.
   * @param vector2
   */
  multiply(vector2: Vector2): Vector2
  /**
   * The **`multiply`** method multiplies a number to `x` and `y` of this vector.
   * @param num
   */
  multiply(num: number): Vector2
  multiply(arg: Vector2 | number): Vector2 {
    if (arg instanceof Vector2) {
      this.x *= arg.x
      this.y *= arg.y
    }
    if (typeof arg === 'number') {
      this.x *= arg
      this.y *= arg
    }

    return this
  }

  /**
   * The **`toMultiplied`** method clones this vector and multiplies other vector to the clone.
   * @param vector2
   */
  toMultiplied(vector2: Vector2): Vector2
  /**
   * The **`toMultiplied`** method clones this vector and multiplies a number to `x` and `y` of the clone.
   * @param num
   */
  toMultiplied(num: number): Vector2
  toMultiplied(arg: Vector2 | number): Vector2 {
    return this.clone().multiply(arg as number)
  }

  apply(fn: (coord: number, axis: 'x' | 'y') => number): Vector2 {
    this.x = fn(this.x, 'x')
    this.y = fn(this.y, 'y')
    return this
  }
  toApplied(fn: (coord: number, axis: 'x' | 'y') => number): Vector2 {
    return this.clone().apply(fn)
  }

  /**
   * The **`equals`** method checks if this vector has the same x and y values as another vector.
   * @param vector2 The vector to compare with.
   * @returns `true` if both components are equal, `false` otherwise.
   *
   * @example
   * ```ts
   * const a = new Vector2(1, 2)
   * const b = new Vector2(1, 2)
   * a.equals(b) // true
   * ```
   */
  equals(vector2: Vector2): boolean {
    return this.x === vector2.x && this.y === vector2.y
  }

  /**
   * The **`normalize`** method scales this vector to unit length (magnitude of 1).
   * If the vector is zero, it remains zero.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const dir = new Vector2(3, 4)
   * dir.normalize() // magnitude is now 1
   * ```
   */
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y)
    if (length > 0) {
      this.x /= length
      this.y /= length
    }

    return this
  }

  /**
   * The **`toJSON`** method converts this vector to a plain `Position` object.
   * @returns A `Position` object with `x` and `y` properties.
   *
   * @example
   * ```ts
   * const pos = new Vector2(10, 20)
   * pos.toJSON() // { x: 10, y: 20 }
   * ```
   */
  toJSON(): Position {
    return {
      x: this.x,
      y: this.y,
    }
  }
}

/**
 * The **`Position`** interface represents a 2D point with `x` and `y` coordinates.
 * Used as a lightweight alternative to `Vector2` when methods are not needed.
 */
export interface Position {
  /** The x-coordinate. */
  x: number
  /** The y-coordinate. */
  y: number
}

export type VectorLike = Vector2 | Position | [x: number, y: number] | number

export function vectorize(vectorLike: VectorLike) {
  if (vectorLike instanceof Vector2) return vectorLike
  if (typeof vectorLike === 'number') return new Vector2(vectorLike, vectorLike)
  if (
    'x' in vectorLike &&
    typeof vectorLike.x === 'number' &&
    'y' in vectorLike &&
    typeof vectorLike.y === 'number'
  )
    return Vector2.fromJSON(vectorLike)
  if (
    Array.isArray(vectorLike) &&
    vectorLike.length === 2 &&
    typeof vectorLike[0] === 'number' &&
    typeof vectorLike[1] === 'number'
  )
    return new Vector2(...vectorLike)

  throw new InvalidVectorLikeError(vectorLike)
}
