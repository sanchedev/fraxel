import { pushEffect } from './context.js'
import { warnUseRef } from '../warn/use-ref.js'

/**
 * The **`Reference`** class holds a mutable value that persists across renders.
 * @deprecated Use a plain `let` variable instead.
 */
export class Reference<T> {
  constructor(value: T) {
    this.current = value
  }

  current: T
}

/**
 * The **`useRef`** hook creates a mutable reference that persists across renders.
 *
 * @deprecated Use a plain `let` variable instead. Component functions in fraxel
 * execute only once, so a `let` at the top of the function body has the same
 * behavior as `useRef`.
 *
 * @param value The initial value
 * @returns A `Reference` object with a mutable `current` property
 *
 * @example
 * ```tsx
 * // Before (deprecated)
 * const count = useRef(0)
 * count.current++
 *
 * // After — use a plain let
 * let count = 0
 * count++
 * ```
 */
export function useRef<T>(value: T) {
  warnUseRef()
  pushEffect('useRef', () => {})
  return new Reference(value)
}
