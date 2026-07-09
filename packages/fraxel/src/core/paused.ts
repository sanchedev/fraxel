import { Signal } from '../reactivity/signal.js'
import type { SignalGetter } from '../reactivity/types.js'

const paused = new Signal(false)

/**
 * The **`getPaused`** function returns the reactive `paused` signal getter.
 * Use this to read the game's pause state reactively.
 *
 * @returns A `SignalGetter<boolean>` that tracks the pause state.
 */
export function getPaused(): SignalGetter<boolean> {
  return paused.getter
}

/**
 * The **`setPaused`** function sets the game's pause state.
 *
 * @param value `true` to pause, `false` to resume.
 */
export function setPaused(value: boolean) {
  paused.setter(value)
}

/**
 * The **`isPaused`** function reads the current pause state (non-reactive).
 * Use this for one-time checks outside of reactive contexts.
 *
 * @returns `true` if the game is currently paused.
 */
export function isPaused(): boolean {
  return paused.getter.value()
}
