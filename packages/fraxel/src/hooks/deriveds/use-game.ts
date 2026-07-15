import { Game } from '../../core/game.js'
import type { Trigger } from '../../events/trigger.js'
import { declareDerivedHook } from '../context.js'

interface GameControllers {
  /** Starts the game loop. */
  play: () => void
  /** Stops the game loop (keeps mounted). */
  stop: () => void
  /** Stops the loop, removes all listeners, and cleans up. */
  destroy: () => void
  /** Fires when the browser tab loses focus. */
  onBlur: Trigger<[]>
  /** Fires when the browser tab gains focus. */
  onFocus: Trigger<[]>
}

/**
 * The **`useGame`** derived hook provides imperative control over the game loop
 * and reactive triggers for browser focus events.
 *
 * @returns A `GameControllers` object with `play`, `stop`, `destroy` methods
 * and `onBlur`/`onFocus` triggers.
 *
 * @example
 * ```tsx
 * import { useGame, useTrigger, useEffect } from 'fraxel'
 *
 * function GameController() {
 *   const { play, stop, onBlur, onFocus } = useGame()
 *
 *   useTrigger(onBlur, () => {
 *     console.log('Game lost focus')
 *   })
 *
 *   useTrigger(onFocus, () => {
 *     console.log('Game regained focus')
 *   })
 *
 *   return (
 *     <clickable onClick={() => stop()} size={[64, 32]}>
 *       <text text="Pause" />
 *     </clickable>
 *   )
 * }
 * ```
 */
export function useGame(): GameControllers {
  declareDerivedHook('useGame')
  return {
    play: () => Game.play(),
    stop: () => Game.stop(),
    destroy: () => Game.destroy(),
    onBlur: Game.onBlur,
    onFocus: Game.onFocus,
  }
}
