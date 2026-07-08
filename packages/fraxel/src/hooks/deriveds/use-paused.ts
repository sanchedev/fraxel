import { getPaused, setPaused } from '../../core/paused.js'
import type { SignalGetter } from '../../reactivity/types.js'
import { declareDerivedHook } from '../context'

interface PausedControllers {
  /** Reactive boolean indicating if the game is paused. */
  paused: SignalGetter<boolean>
  /** Unpauses the game. */
  play: () => void
  /** Pauses the game. */
  pause: () => void
}

/**
 * The **`usePaused`** derived hook provides reactive access to the game's pause state
 * and imperative controls to play or pause.
 *
 * @returns A `PausedControllers` object with `paused` reactive signal, `play`, and `pause` methods.
 *
 * @example
 * ```tsx
 * import { usePaused, useEffect } from 'fraxel/hooks'
 * import { Input } from 'fraxel'
 *
 * const Pause = Input.createAction({ key: 'p' })
 *
 * function PauseManager() {
 *   const { paused, play, pause } = usePaused()
 *
 *   useEffect(() => {
 *     if (Input.justActionPressed(Pause)) {
 *       paused() ? play() : pause()
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
    paused: getPaused(),
    play: () => setPaused(false),
    pause: () => setPaused(true),
  }
}
