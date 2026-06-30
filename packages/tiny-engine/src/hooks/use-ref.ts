import { pushEffect } from './context'

/**
 * The **`Reference`** class holds a mutable value that persists across renders.
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
 * @param value The initial value
 * @returns A `Reference` object with a mutable `current` property
 *
 * @example
 * ```tsx
 * const count = useRef(0)
 *
 * const handleClick = () => {
 *   count.current++
 *   console.log(count.current)
 * }
 *
 * return <clickable onClick={handleClick} />
 * ```
 */
export function useRef<T>(value: T) {
  pushEffect('useRef', () => {})
  return new Reference(value)
}
