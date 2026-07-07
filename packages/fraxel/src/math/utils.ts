/**
 * The **`clamp`** function restricts a value to lie within a given range.
 * @param min The minimum bound.
 * @param value The value to clamp.
 * @param max The maximum bound.
 * @returns The clamped value, guaranteed to be between `min` and `max`.
 *
 * @example
 * ```ts
 * clamp(0, 5, 10)    // 5
 * clamp(0, -3, 10)   // 0
 * clamp(0, 15, 10)   // 10
 * clamp(5, 3, 5)     // 5 (min >= max returns min)
 * ```
 */
export function clamp(min: number, value: number, max: number): number {
  if (min >= max) return min
  return Math.max(min, Math.min(value, max))
}
