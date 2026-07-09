/**
 * The **`warnUseRef`** function logs a console warning when `useRef` is used.
 * `useRef` is deprecated — component functions in fraxel execute only once, so a
 * plain `let` variable at the top of the function body has the same behavior.
 *
 * @example
 * ```tsx
 * import { warnUseRef } from 'fraxel'
 *
 * // Before (deprecated)
 * const count = useRef(0)
 * count.current++
 *
 * // After — use a plain let
 * let count = 0
 * count++
 * ```
 */
export function warnUseRef(): void {
  console.warn(
    '[fraxel] useRef is deprecated. Use a plain `let` variable instead. See docs/warn.md for details.',
  )
}
