/**
 * The **`Color`** type represents an RGB color as a tuple `[r, g, b]`.
 * Each channel ranges from `0` (no intensity) to `1` (full intensity).
 *
 * @example
 * ```ts
 * const red: Color = [1, 0, 0]
 * const white: Color = [1, 1, 1]
 * const orange: Color = [1, 0.5, 0]
 * ```
 */
export type Color = [number, number, number]
