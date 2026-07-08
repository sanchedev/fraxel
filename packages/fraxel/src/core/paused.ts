import { Signal } from '../reactivity/signal.js'
import type { SignalGetter } from '../reactivity/types.js'

const paused = new Signal(false)

/**
 * Returns the reactive `paused` signal getter.
 * Use this to read the game's pause state reactively.
 */
export function getPaused(): SignalGetter<boolean> {
  return paused.getter
}

/**
 * Sets the game's pause state.
 */
export function setPaused(value: boolean) {
  paused.setter(value)
}

/**
 * Reads the current pause state (non-reactive).
 */
export function isPaused(): boolean {
  return paused.getter.value()
}
