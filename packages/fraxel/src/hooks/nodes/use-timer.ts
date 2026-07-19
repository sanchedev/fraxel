import { Trigger } from '../../events/trigger.js'
import { PrimaryNode } from '../../nodes/index.js'
import { Signal } from '../../reactivity/signal.js'
import type { SignalSetter } from '../../reactivity/types.js'
import { pushEffect } from '../context.js'
import { NodeReference } from './reference.js'

/**
 * The **`useTimer`** hook creates a reference to a `Timer` node with reactive
 * time tracking and imperative play/pause/stop control.
 *
 * @returns A `TimerReference` with reactive time properties and control methods
 *
 * @example
 * ```tsx
 * import { useTimer, useTrigger, useEffect } from 'fraxel'
 *
 * function Cooldown() {
 *   const timer = useTimer()
 *
 *   useTrigger(timer.onTimeout, () => {
 *     console.log('Cooldown finished!')
 *   })
 *
 *   useEffect(() => {
 *     console.log(`Progress: ${(timer.progress() * 100).toFixed(0)}%`)
 *   })
 *
 *   return (
 *     <timer ref={timer} duration={3} autoPlay />
 *   )
 * }
 * ```
 */
export function useTimer() {
  pushEffect('useTimer', () => {})
  return new TimerReference()
}

/**
 * The **`TimerReference`** class provides reactive access to a `Timer` node's
 * elapsed time, duration, progress, and control methods, plus timeout and time change triggers.
 */
export class TimerReference extends NodeReference<PrimaryNode.Timer> {
  /** Reactive elapsed time in seconds. */
  time = new Signal(0).getter
  /** Reactive total duration in seconds. */
  duration = new Signal(1).getter
  /** Sets the total duration in seconds. */
  setDuration: SignalSetter<number> = (value) => (this.node.duration = value)
  /** Reactive progress ratio (0 to 1). */
  progress = new Signal(0).getter

  /** Fires when the timer reaches its duration. */
  onTimeout = new Trigger<[]>()
  /** Fires every frame with the current elapsed time. */
  onTimeChange = new Trigger<[time: number]>()

  /**
   * Starts or resumes the timer.
   *
   * @param from Optional start time in seconds
   */
  play = (from: number) => this.node.play(from)
  /** Pauses the timer without resetting. */
  pause = () => this.node.pause()
  /** Pauses and resets the timer to 0. */
  stop = () => {
    this.node.stop()
    this.time.signal.setter(0)
    this.progress.signal.setter(0)
  }

  constructor() {
    super({
      type: PrimaryNode.Timer,
      linkEvents: ({ link, on }, node) => {
        link(this, 'onTimeout', 'onTimeChange')
        on('onTimeChange', (time) => {
          this.time.signal.setter(time)
          this.progress.signal.setter(time / node.duration)
        })
        on('onTimeout', () => {
          this.time.signal.setter(node.duration)
          this.progress.signal.setter(1)
        })
      },
      regSignal: ({ reg }) => {
        reg<TimerReference>(this, 'time', 'duration', 'progress')
      },
      onFrame: (node) => {
        this.duration.signal.setter(node.duration)
      },
    })
  }
}
