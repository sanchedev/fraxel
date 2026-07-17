import { InvalidVectorLikeError } from '../errors/math.js'

/**
 * The **`Vector2`** class represents a 2D vector and helps manage points in the plane.
 * Supports construction from multiple formats and provides immutable/mutable operations.
 *
 * @example
 * ```ts
 * import { Vector2 } from 'fraxel'
 *
 * // From x, y
 * const a = new Vector2(10, 20)
 *
 * // From array
 * const b = new Vector2([5, 15])
 *
 * // From object
 * const c = new Vector2({ x: 3, y: 7 })
 *
 * // Uniform scale
 * const d = new Vector2(5) // (5, 5)
 * ```
 */
export class Vector2 {
  /** The **`ZERO`** constant returns a vector at position (0, 0). */
  static get ZERO() {
    return new Vector2(0, 0)
  }
  /** The **`ONE`** constant returns a vector at position (1, 1). */
  static get ONE() {
    return new Vector2(1, 1)
  }

  /**
   * The **`from`** static method creates a `Vector2` from various input formats.
   * @throws {InvalidVectorLikeError} if the input is not a valid vector format.
   *
   * @example
   * ```ts
   * const a = Vector2.from(new Vector2(1, 2))       // from Vector2
   * const b = Vector2.from({ x: 3, y: 4 })          // from Position
   * const c = Vector2.from([5, 6])                   // from tuple
   * const d = Vector2.from(7)                         // uniform scale (7, 7)
   * const e = Vector2.from(3, 4)                      // from x, y
   * ```
   */
  static from(vector2: Vector2): Vector2
  static from(position: Position): Vector2
  static from(coords: [x: number, y: number]): Vector2
  static from(scale: number): Vector2
  static from(vectorLike: VectorLike): Vector2
  static from(x: number, y: number): Vector2
  static from(arg1: VectorLike, arg2?: number): Vector2 {
    return new Vector2(arg1 as number, arg2!)
  }

  /**
   * The **`min`** static method takes the min axis in `vectors` and creates a new `Vector2` with they.
   *
   * @example
   * ```ts
   * const minVector = Vector2.min(Vector2.ZERO, new Vector(0, -10), new Vector(100, 3))
   * minVector.x    // 0
   * minVector.y    // -10
   * ```
   */
  static min(...vectors: Vector2[]): Vector2 {
    const axisX = Math.min(...vectors.map((v) => v.x))
    const axisY = Math.min(...vectors.map((v) => v.y))
    return new Vector2(axisX, axisY)
  }

  /**
   * The **`max`** static method takes the max axis in `vectors` and creates a new `Vector2` with they.
   *
   * @example
   * ```ts
   * const maxVector = Vector2.max(Vector2.ZERO, new Vector(20, -10), new Vector(1, -3))
   * maxVector.x    // 20
   * maxVector.y    // 0
   * ```
   */
  static max(...vectors: Vector2[]): Vector2 {
    const axisX = Math.max(...vectors.map((v) => v.x))
    const axisY = Math.max(...vectors.map((v) => v.y))
    return new Vector2(axisX, axisY)
  }

  /** The x-coordinate of the vector. */
  x: number
  /** The y-coordinate of the vector. */
  y: number

  /**
   * Creates a new `Vector2`. Accepts multiple input formats.
   * @throws {InvalidVectorLikeError} if the input is not a valid vector format.
   *
   * @example
   * ```ts
   * new Vector2(10, 20)          // (10, 20)
   * new Vector2([5, 15])         // (5, 15)
   * new Vector2({ x: 3, y: 7 }) // (3, 7)
   * new Vector2(5)               // (5, 5)
   * ```
   */
  constructor(vector2: Vector2)
  constructor(position: Position)
  constructor(coords: [x: number, y: number])
  constructor(scale: number)
  constructor(vectorLike: VectorLike)
  constructor(x: number, y: number)
  constructor(arg1: VectorLike, arg2?: number) {
    if (arg1 instanceof Vector2) {
      this.x = arg1.x
      this.y = arg1.y
    } else if (typeof arg1 === 'number') {
      this.x = arg1
      this.y = arg2 ?? arg1
    } else if (
      'x' in arg1 &&
      typeof arg1.x === 'number' &&
      'y' in arg1 &&
      typeof arg1.y === 'number'
    ) {
      this.x = arg1.x
      this.y = arg1.y
    } else if (
      Array.isArray(arg1) &&
      arg1.length === 2 &&
      typeof arg1[0] === 'number' &&
      typeof arg1[1] === 'number'
    ) {
      this.x = arg1[0]
      this.y = arg1[1]
    } else {
      throw new InvalidVectorLikeError(arg1)
    }
  }

  /**
   * The **`clone`** method returns a new `Vector2` with the same x and y values.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(1, 2)
   * const b = a.clone()
   * b.x = 10
   * console.log(a.x) // 1 (unchanged)
   * ```
   */
  clone() {
    return new Vector2(this.x, this.y)
  }

  /**
   * The **`add`** method adds a vector to this vector (mutating).
   * @param vectorLike The vector to add.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(1, 2)
   * v.add([3, 4]) // v is now (4, 6)
   * ```
   */
  add(vectorLike: VectorLike): Vector2 {
    const vector = new Vector2(vectorLike)
    return this.apply((coord, axis) => coord + vector[axis])
  }

  /**
   * The **`toAdded`** method returns a new vector with the sum of this and another vector.
   * @param vectorLike The vector to add.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(1, 2)
   * const b = a.toAdded([3, 4]) // (4, 6)
   * console.log(a.x)           // 1 (unchanged)
   * ```
   */
  toAdded(vectorLike: VectorLike): Vector2 {
    return this.clone().add(vectorLike)
  }

  /**
   * The **`subtract`** method subtracts a vector from this vector (mutating).
   * @param vectorLike The vector to subtract.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(5, 10)
   * v.subtract([2, 3]) // v is now (3, 7)
   * ```
   */
  subtract(vectorLike: VectorLike): Vector2 {
    const vector = new Vector2(vectorLike)
    return this.apply((coord, axis) => coord - vector[axis])
  }

  /**
   * The **`toSubtracted`** method returns a new vector with the difference of this and another vector.
   * @param vectorLike The vector to subtract.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(5, 10)
   * const b = a.toSubtracted([2, 3]) // (3, 7)
   * console.log(a.x)                 // 5 (unchanged)
   * ```
   */
  toSubtracted(vectorLike: VectorLike): Vector2 {
    return this.clone().subtract(vectorLike)
  }

  /**
   * The **`multiply`** method multiplies this vector by another vector (mutating).
   * @param vectorLike The vector to multiply by.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(2, 3)
   * v.multiply([4, 5]) // v is now (8, 15)
   * ```
   */
  multiply(vectorLike: VectorLike): Vector2 {
    const vector = new Vector2(vectorLike)
    return this.apply((coord, axis) => coord * vector[axis])
  }

  /**
   * The **`toMultiplied`** method returns a new vector with the product of this and another vector.
   * @param vectorLike The vector to multiply by.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(2, 3)
   * const b = a.toMultiplied([4, 5]) // (8, 15)
   * console.log(a.x)                 // 2 (unchanged)
   * ```
   */
  toMultiplied(vectorLike: VectorLike): Vector2 {
    return this.clone().multiply(vectorLike)
  }

  /**
   * The **`divide`** method divides this vector by another vector (mutating).
   * @param vectorLike The vector to divide by.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(8, 15)
   * v.divide([4, 5]) // v is now (2, 3)
   * ```
   */
  divide(vectorLike: VectorLike): Vector2 {
    const vector = new Vector2(vectorLike)
    return this.apply((coord, axis) => (vector[axis] === 0 ? 0 : coord / vector[axis]))
  }

  /**
   * The **`toDivided`** method returns a new vector with the quotient of this and another vector.
   * @param vectorLike The vector to divide by.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(8, 15)
   * const b = a.toDivided([4, 5]) // (2, 3)
   * console.log(a.x)              // 8 (unchanged)
   * ```
   */
  toDivided(vectorLike: VectorLike): Vector2 {
    return this.clone().divide(vectorLike)
  }

  /**
   * The **`apply`** method transforms each component using a callback function (mutating).
   * @param fn A function that receives the current coordinate and axis name, returns the new value.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(3, 4)
   * v.apply((coord) => coord * 2) // v is now (6, 8)
   * ```
   */
  apply(fn: (coord: number, axis: 'x' | 'y') => number): Vector2 {
    this.x = fn(this.x, 'x')
    this.y = fn(this.y, 'y')
    return this
  }

  /**
   * The **`toApplied`** method returns a new vector with each component transformed by a callback.
   * @param fn A function that receives the current coordinate and axis name, returns the new value.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(3, 4)
   * const b = a.toApplied((coord) => coord * 2) // (6, 8)
   * console.log(a.x) // 3 (unchanged)
   * ```
   */
  toApplied(fn: (coord: number, axis: 'x' | 'y') => number): Vector2 {
    return this.clone().apply(fn)
  }

  /**
   * The **`lerp`** method linearly interpolates this vector towards the target by the given weight (mutating).
   * @param to The target vector.
   * @param weight The interpolation factor (0 = this, 1 = to).
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const v = new Vector2(0, 0)
   * v.lerp([10, 10], 0.5) // v is now (5, 5)
   * ```
   */
  lerp(to: VectorLike, weight: number): Vector2 {
    const target = new Vector2(to)
    this.x += (target.x - this.x) * weight
    this.y += (target.y - this.y) * weight
    return this
  }

  /**
   * The **`toLerped`** method returns a new vector linearly interpolated towards the target by the given weight.
   * @param to The target vector.
   * @param weight The interpolation factor (0 = this, 1 = to).
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const a = new Vector2(0, 0)
   * const b = a.toLerped([10, 10], 0.5) // (5, 5)
   * console.log(a.x)                     // 0 (unchanged)
   * ```
   */
  toLerped(to: VectorLike, weight: number): Vector2 {
    return this.clone().lerp(to, weight)
  }

  /**
   * The **`rotate`** method rotates the vector in `angle` degrees (mutating).
   * @param angle The angle in hexadecimal.
   * @returns This vector for chaining.
   *
   * @example
   * ```ts
   * const dir = new Vector2(5, 5)
   * dir.rotate(180) // Vector2(-5, -5)
   * ```
   */
  rotate(angle: number): Vector2 {
    if (this.equals(Vector2.ZERO)) return this

    const h = Math.sqrt(this.x ** 2 + this.y ** 2)
    const a = ((this.getAngle() + angle) / 180) * Math.PI
    this.x = Math.cos(a) * h
    this.y = Math.sin(a) * h
    return this
  }

  /**
   * The **`rotate`** method rotates the vector in `angle` degrees.
   * @param angle The angle in hexadecimal.
   * @returns A new `Vector2` instance.
   *
   * @example
   * ```ts
   * const dir = new Vector2(5, 5)
   * dir.toRotated(180) // Vector2(-5, -5)
   * ```
   */
  toRotated(degree: number): Vector2 {
    return this.clone().rotate(degree)
  }

  /**
   * The **`equals`** method checks if this vector has the same x and y values as another vector.
   * @param vectorLike The vector to compare with.
   * @returns `true` if both components are equal, `false` otherwise.
   *
   * @example
   * ```ts
   * const a = new Vector2(1, 2)
   * const b = new Vector2(1, 2)
   * a.equals(b) // true
   * ```
   */
  equals(vectorLike: VectorLike): boolean {
    const vector2 = new Vector2(vectorLike)
    return this.x === vector2.x && this.y === vector2.y
  }

  getAngle() {
    return (Math.atan2(this.y, this.x) * 180) / Math.PI
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

  /** Returns a readable string representation of this vector. */
  toString() {
    return `Vector2(${this.x}, ${this.y})`
  }
}

/**
 * The **`Position`** interface represents a 2D point with `x` and `y` coordinates.
 * Used as a lightweight alternative to `Vector2` when methods are not needed.
 *
 * @example
 * ```ts
 * const pos: Position = { x: 10, y: 20 }
 * const vec = new Vector2(pos) // Vector2(10, 20)
 * ```
 */
export interface Position {
  /** The x-coordinate. */
  x: number
  /** The y-coordinate. */
  y: number
}

/**
 * The **`VectorLike`** type represents all accepted formats for vector input.
 * Can be a `Vector2`, `Position`, `[x, y]` tuple, or a single `number` for uniform scale.
 *
 * @example
 * ```ts
 * const a: VectorLike = new Vector2(1, 2)
 * const b: VectorLike = { x: 3, y: 4 }
 * const c: VectorLike = [5, 6]
 * const d: VectorLike = 7 // both x and y become 7
 * ```
 */
export type VectorLike = Vector2 | Position | [x: number, y: number] | number

/**
 * The **`isVectorLike`** function checks if a value is a valid `VectorLike` format.
 * Useful as a type guard before passing unknown data to vector constructors.
 * @param object The value to check.
 * @returns `true` if the value is a `Vector2`, `number`, `[number, number]` tuple, or `{ x, y }` object.
 *
 * @example
 * ```ts
 * isVectorLike(new Vector2(1, 2)) // true
 * isVectorLike([3, 4])            // true
 * isVectorLike({ x: 5, y: 6 })   // true
 * isVectorLike(7)                 // true
 * isVectorLike('hello')           // false
 * isVectorLike({ x: 'a', y: 'b' }) // false
 * ```
 */
export function isVectorLike(object: unknown): object is VectorLike {
  if (object instanceof Vector2) return true
  if (typeof object === 'number') return true
  if (
    Array.isArray(object) &&
    object.length === 2 &&
    typeof object[0] === 'number' &&
    typeof object[1] === 'number'
  )
    return true
  if (
    typeof object === 'object' &&
    object != null &&
    'x' in object &&
    typeof object.x === 'number' &&
    'y' in object &&
    typeof object.y === 'number'
  )
    return true
  return false
}

/**
 * The **`vector2`** function creates a `Vector2` from various input formats.
 * @throws {InvalidVectorLikeError} if the input is not a valid vector format.
 *
 * @example
 * ```ts
 * const a = vector2(new Vector2(1, 2))       // from Vector2
 * const b = vector2({ x: 3, y: 4 })          // from Position
 * const c = vector2([5, 6])                   // from tuple
 * const d = vector2(7)                         // uniform scale (7, 7)
 * const e = vector2(3, 4)                      // from x, y
 * ```
 */
export function vector2(vector2: Vector2): Vector2
export function vector2(position: Position): Vector2
export function vector2(coords: [x: number, y: number]): Vector2
export function vector2(scale: number): Vector2
export function vector2(vectorLike: VectorLike): Vector2
export function vector2(x: number, y: number): Vector2
export function vector2(arg1: VectorLike, arg2?: number): Vector2 {
  return new Vector2(arg1 as number, arg2!)
}
