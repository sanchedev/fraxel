import { PrimaryNode } from '../../nodes/index.js'
import { Signal } from '../../reactivity/signal.js'
import { pushEffect } from '../context.js'
import { Trigger } from '../use-trigger.js'
import { NodeReference } from './reference.js'

/**
 * The **`useTimer`** hook creates a reference to a `Timer` node with reactive
 * time tracking and imperative play/pause/stop control.
 *
 * @returns A `TimerReference` with reactive time properties and control methods
 *
 * @example
 * ```tsx
 * import { useTimer, useTrigger, useEffect } from 'fraxel/hooks'
 *
 * function Cooldown() {
 *   const timer = useTimer()
 *
 *   useTrigger(timer.timeout, () => {
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
  /** Reactive progress ratio (0 to 1). */
  progress = new Signal(0).getter

  /** Fires when the timer reaches its duration. */
  timeout = new Trigger<[]>()
  /** Fires every frame with the current elapsed time. */
  timeChanged = new Trigger<[time: number]>()

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
    let unsubs: (() => void)[] = []
    super(
      PrimaryNode.Timer,
      (node) => {
        const sets = [
          () => {
            this.time.signal.setter(0)
            this.duration.signal.setter(node.duration)
            this.progress.signal.setter(0)
          },
        ]
        sets.forEach((set) => set())

        unsubs.push(
          node.timeChanged.on((elapsed) => {
            this.time.signal.setter(elapsed)
            this.progress.signal.setter(elapsed / node.duration)
            this.timeChanged.emit(elapsed)
          }),
          node.timeout.on(() => {
            this.time.signal.setter(node.duration)
            this.progress.signal.setter(1)
            this.timeout.emit()
          }),
          node.updated.on(() => {
            this.duration.signal.setter(node.duration)
          }),
        )

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
        this.timeout.clear()
        this.timeChanged.clear()
        unsubs.forEach((unsub) => unsub())
        unsubs = []
      },
    )
  }
}
