import { Game } from '../../core/game.js'
import type { Trigger } from '../../events/trigger.js'
import { declareDerivedHook } from '../context.js'
import { createTrigger } from '../use-trigger.js'

interface GameControllers {
  /** Starts the game loop. */
  play: () => void
  /** Stops the game loop (keeps mounted). */
  stop: () => void
  /** Stops the loop, removes all listeners, and cleans up. */
  destroy: () => void
  /** Fires when the browser tab loses focus. */
  blurred: Trigger<[]>
  /** Fires when the browser tab gains focus. */
  focused: Trigger<[]>
}

/**
 * The **`useGame`** derived hook provides imperative control over the game loop
 * and reactive triggers for browser focus events.
 *
 * @returns A `GameControllers` object with `play`, `stop`, `destroy` methods
 * and `blurred`/`focused` triggers.
 *
 * @example
 * ```tsx
 * import { useGame, useTrigger, useEffect } from 'fraxel/hooks'
 *
 * function GameController() {
 *   const { play, stop, blurred, focused } = useGame()
 *
 *   useTrigger(blurred, () => {
 *     console.log('Game lost focus')
 *   })
 *
 *   useTrigger(focused, () => {
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
  const blurred = createTrigger<[]>()
  Game.blurred.connect(blurred)
  const focused = createTrigger<[]>()
  Game.focused.connect(focused)
  return {
    play: () => Game.play(),
    stop: () => Game.stop(),
    destroy: () => Game.destroy(),
    blurred,
    focused,
  }
}
