import { GameConfig } from '../../core/game-config.js'
import { vector2 } from '../../math/vector2.js'
import { declareDerivedHook } from '../context'

/**
 * The **`useSize`** derived hook returns the game's canvas dimensions as a `Vector2`.
 *
 * @returns A `Vector2` representing the game width and height.
 *
 * @example
 * ```tsx
 * import { useSize, useEffect } from 'fraxel/hooks'
 *
 * const size = useSize()
 *
 * useEffect(() => {
 *   console.log(`Game size: ${size.x}x${size.y}`)
 * })
 * ```
 */
export function useSize() {
  declareDerivedHook('useSize')
  return vector2(GameConfig.width, GameConfig.height)
}
