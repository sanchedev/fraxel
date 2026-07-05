/**
 * The **`Color`** type represents an RGBA color as a tuple `[r, g, b, a]`.
 * Each channel ranges from `0` (no intensity) to `1` (full intensity).
 *
 * @example
 * ```ts
 * const red: Color = [1, 0, 0, 1]
 * const orange: Color = [1, 0.5, 0, 1]
 * const transparentBlue: Color = [0, 0, 1, 0.5]
 * ```
 */
export type Color = [number, number, number, number]
