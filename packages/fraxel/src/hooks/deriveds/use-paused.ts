import { Game } from '../../core/game.js'
import type { SignalGetter } from '../../reactivity/types.js'
import { declareDerivedHook } from '../context'

interface PausedControllers {
  /** Reactive boolean indicating if the game is paused. */
  paused: SignalGetter<boolean>
  /** Unpauses the game. */
  resume: () => void
  /** Pauses the game. */
  pause: () => void
}

/**
 * The **`usePaused`** derived hook provides reactive access to the game's pause state
 * and imperative controls to resume or pause.
 *
 * @returns A `PausedControllers` object with `paused` reactive signal, `resume`, and `pause` methods.
 *
 * @example
 * ```tsx
 * import { usePaused, useEffect } from 'fraxel'
 * import { Input } from 'fraxel'
 *
 * const Pause = Input.createAction({ key: 'p' })
 *
 * function PauseManager() {
 *   const { paused, resume, pause } = usePaused()
 *
 *   useEffect(() => {
 *     if (Input.justActionPressed(Pause)) {
 *       paused() ? resume() : pause()
 *     }
 *   })
 *
 *   return null
 * }
 * ```
 */
export function usePaused(): PausedControllers {
  declareDerivedHook('usePaused')
  return {
    paused: Game.isPaused,
    resume: () => Game.resume(),
    pause: () => Game.pause(),
  }
}
