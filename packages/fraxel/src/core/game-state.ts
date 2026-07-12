import { Signal } from '../reactivity/signal.js'

export const paused = new Signal(false).getter
export const running = new Signal(false).getter
