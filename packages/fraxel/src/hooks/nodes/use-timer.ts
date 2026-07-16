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
  play: (from?: number) => void = () => {}
  /** Pauses the timer without resetting. */
  pause: () => void = () => {}
  /** Pauses and resets the timer to 0. */
  stop: () => void = () => {}

  constructor() {
    super(
      PrimaryNode.Timer,
      (node) => {
        this.onTimeout.link(node.onTimeout)
        this.onTimeChange.link(node.onTimeChange)

        const sets = [
          () => {
            this.time.signal.setter(0)
            this.duration.signal.setter(node.duration)
            this.progress.signal.setter(0)
          },
        ]
        sets.forEach((set) => set())

        node.onTimeChange.connect((elapsed) => {
          this.time.signal.setter(elapsed)
          this.progress.signal.setter(elapsed / node.duration)
        })
        node.onTimeout.connect(() => {
          this.time.signal.setter(node.duration)
          this.progress.signal.setter(1)
        })
        node.onUpdate.connect(() => {
          this.duration.signal.setter(node.duration)
        })

        this.play = (from) => node.play(from)
        this.pause = () => node.pause()
        this.stop = () => {
          node.stop()
          this.time.signal.setter(0)
          this.progress.signal.setter(0)
        }
      },
      () => {
        this.time.signal.clearSubs()
        this.duration.signal.clearSubs()
        this.progress.signal.clearSubs()
      },
    )
  }
}
