import { InvalidColorLikeError } from '../errors/math.js'
import { clamp } from './utils.js'

/**
 * The **`Color`** class represents an RGBA color with channels in the `0`–`1` range.
 * All values are clamped on construction. Supports construction from tuples, objects,
 * CSS-style hex strings, and individual channel values.
 *
 * @example
 * ```ts
 * import { Color } from 'fraxel'
 *
 * const red = new Color(1, 0, 0)
 * const transparentBlue = new Color(0, 0, 1, 0.5)
 * const fromTuple: Color = new Color([0.5, 0.5, 0.5])
 * const fromObject: Color = new Color({ r: 1, g: 0.5, b: 0 })
 * const fromHex: Color = new Color('#ff8800')
 * ```
 */
export class Color {
  /** White `(1, 1, 1, 1)` */
  static get WHITE() {
    return new Color(1, 1, 1)
  }
  /** Black `(0, 0, 0, 1)` */
  static get BLACK() {
    return new Color(0, 0, 0)
  }
  /** Red `(1, 0, 0, 1)` */
  static get RED() {
    return new Color(1, 0, 0)
  }
  /** Green `(0, 1, 0, 1)` */
  static get GREEN() {
    return new Color(0, 1, 0)
  }
  /** Blue `(0, 0, 1, 1)` */
  static get BLUE() {
    return new Color(0, 0, 1)
  }
  /** Transparent white `(1, 1, 1, 0)` */
  static get TRANSPARENT() {
    return new Color(1, 1, 1, 0)
  }

  /** Red channel (`0`–`1`) */
  r: number
  /** Green channel (`0`–`1`) */
  g: number
  /** Blue channel (`0`–`1`) */
  b: number
  /** Alpha channel (`0`–`1`) */
  a: number

  constructor(colorLike: ColorLike)
  constructor(r: number, g: number, b: number)
  constructor(r: number, g: number, b: number, a: number)
  constructor(...args: unknown[]) {
    if (args.length >= 3 && args.slice(4).every((val) => typeof val === 'number')) {
      const [r, g, b, a = 1] = args as number[]
      if (r != null && g != null && b != null) {
        this.r = clamp(0, r, 1)
        this.g = clamp(0, g, 1)
        this.b = clamp(0, b, 1)
        this.a = clamp(0, a, 1)
      } else {
        throw new InvalidColorLikeError(r)
      }
    } else {
      const obj = args[0]
      if (obj instanceof Color) {
        this.r = obj.r
        this.g = obj.g
        this.b = obj.b
        this.a = obj.a
      } else if (typeof obj === 'string') {
        const parsed = parseHexColor(obj)
        if (parsed == null) throw new InvalidColorLikeError(obj)
        this.r = parsed.r
        this.g = parsed.g
        this.b = parsed.b
        this.a = parsed.a
      } else if (
        Array.isArray(obj) &&
        (obj.length === 3 || obj.length === 4) &&
        obj.every((val) => typeof val === 'number') &&
        obj[0] != null &&
        obj[1] != null &&
        obj[2] != null
      ) {
        this.r = clamp(0, obj[0], 1)
        this.g = clamp(0, obj[1], 1)
        this.b = clamp(0, obj[2], 1)
        this.a = clamp(0, obj[3] ?? 1, 1)
      } else if (
        typeof obj === 'object' &&
        obj != null &&
        'r' in obj &&
        typeof obj.r === 'number' &&
        'g' in obj &&
        typeof obj.g === 'number' &&
        'b' in obj &&
        typeof obj.b === 'number'
      ) {
        this.r = clamp(0, obj.r, 1)
        this.g = clamp(0, obj.g, 1)
        this.b = clamp(0, obj.b, 1)
        this.a = clamp(0, 'a' in obj && typeof obj.a === 'number' ? obj.a : 1, 1)
      } else {
        throw new InvalidColorLikeError(obj)
      }
    }
  }

  /**
   * The **`clone`** method returns a new `Color` with the same RGBA values.
   *
   * @returns A new `Color` instance.
   *
   * @example
   * ```ts
   * const red = Color.RED
   * const copy = red.clone()
   * copy.r = 0
   * console.log(red.r) // 1 (unchanged)
   * ```
   */
  clone() {
    return new Color(this)
  }

  /**
   * The **`equals`** method checks if this color has the same RGBA values as another.
   *
   * @param colorLike The color to compare against.
   * @returns `true` if all RGBA channels match.
   *
   * @example
   * ```ts
   * const a = new Color(1, 0, 0)
   * const b = new Color(1, 0, 0)
   * a.equals(b) // true
   * ```
   */
  equals(colorLike: ColorLike) {
    const color = new Color(colorLike)
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a
  }

  /**
   * The **`toCSS`** method converts this color to a CSS `rgba()` string.
   *
   * @returns CSS color string, e.g. `"rgba(255, 0, 0, 1)"`.
   *
   * @example
   * ```ts
   * const red = new Color(1, 0, 0)
   * red.toCSS() // "rgba(255, 0, 0, 1)"
   * ```
   */
  toCSS() {
    return `rgba(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`
  }

  /**
   * The **`toJSON`** method serializes this color to a plain object.
   *
   * @returns `{ r, g, b, a }` object with channel values.
   *
   * @example
   * ```ts
   * const red = new Color(1, 0, 0)
   * red.toJSON() // { r: 1, g: 0, b: 0, a: 1 }
   * ```
   */
  toJSON() {
    return { r: this.r, g: this.g, b: this.b, a: this.a }
  }

  /** Returns a readable string representation of this color. */
  toString() {
    return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`
  }
}

/**
 * The **`ColorLike`** type represents all accepted formats for color input.
 * Can be a `Color` instance, `[r, g, b]` tuple, `[r, g, b, a]` tuple,
 * `{ r, g, b }` object, `{ r, g, b, a }` object, or a CSS-style hex string.
 *
 * @example
 * ```ts
 * import { Color, type ColorLike } from 'fraxel'
 *
 * const a: ColorLike = new Color(1, 0, 0)       // Color instance
 * const b: ColorLike = [1, 0.5, 0]              // RGB tuple
 * const c: ColorLike = [0, 1, 0, 0.5]          // RGBA tuple
 * const d: ColorLike = { r: 0, g: 0, b: 1 }    // RGB object
 * const e: ColorLike = { r: 1, g: 0, b: 0, a: 0.5 } // RGBA object
 * const f: ColorLike = '#ff8800'               // hex string
 * const g: ColorLike = '#f808'                 // short hex with alpha
 * ```
 */
export type HexColor = `#${string}`

export type ColorLike =
  | Color
  | HexColor
  | [r: number, g: number, b: number]
  | [r: number, g: number, b: number, a: number]
  | { r: number; g: number; b: number }
  | { r: number; g: number; b: number; a: number }

/**
 * The **`color`** function creates a `Color` from a `ColorLike` value.
 * Convenience factory that delegates to the `Color` constructor.
 *
 * @param colorLike A `ColorLike` value to convert.
 * @returns A new `Color` instance.
 *
 * @example
 * ```ts
 * import { color } from 'fraxel'
 *
 * const red = color(1, 0, 0)
 * const transparent = color(1, 1, 1, 0)
 * const fromArray = color([0.5, 0.5, 0.5])
 * const fromObject = color({ r: 1, g: 0.5, b: 0 })
 * const fromHex = color('#ff880080')
 * ```
 */
export function color(colorLike: ColorLike): Color
export function color(r: number, g: number, b: number): Color
export function color(r: number, g: number, b: number, a: number): Color
export function color(...args: unknown[]): Color {
  return new Color(...(args as [ColorLike]))
}

function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } | null {
  if (!/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex)) return null

  const raw = hex.slice(1)
  const normalized = raw.length <= 4 ? raw.replaceAll(/./g, (char) => char + char) : raw
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    g: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    b: Number.parseInt(normalized.slice(4, 6), 16) / 255,
    a: normalized.length === 8 ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1,
  }
}
