import { PrimaryNode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { registerNode } from './lib/registry.js'
import type { Reactive } from '../reactivity/types.js'
import { propSignal } from '../utils/ternaries.js'
import { Trigger } from '../events/trigger.js'

/**
 * The **`TimerOptions`** interface defines the options for a `Timer` node.
 */
export interface TimerOptions extends NodeOptions<PrimaryNode.Timer> {
  /**
   * The **`duration`** property defines the total duration of the timer in seconds.
   *
   * @example
   * ```tsx
   * // 5 second timer
   * <timer duration={5} />
   * ```
   */
  duration: Reactive<number>
  /**
   * The **`autoPlay`** property determines whether the timer starts automatically.
   *
   * @default false
   *
   * @example
   * ```tsx
   * // Auto-starts when the node is added to the scene
   * <timer duration={3} autoPlay />
   * ```
   */
  autoPlay?: boolean
}

/**
 * The **`Timer`** node counts up to a duration and emits events when time changes
 * or the timer completes. It has no visual representation but can contain child nodes.
 *
 * @example
 * ```tsx
 * import { useTimer, useTrigger } from 'fraxel'
 *
 * function CooldownTimer() {
 *   const timer = useTimer()
 *
 *   useTrigger(timer.onTimeout, () => {
 *     console.log('Cooldown finished!')
 *   })
 *
 *   useTrigger(timer.onTimeChange, (time) => {
 *     console.log('Time:', time)
 *   })
 *
 *   return (
 *     <timer ref={timer} duration={5} autoPlay />
 *   )
 * }
 * ```
 */
export class Timer extends Node<PrimaryNode.Timer> {
  #counter = 0
  /**
   * The **`duration`** property defines the total duration of the timer in seconds.
   * Accepts a reactive getter via the `duration` option.
   */
  duration: number
  #isPlaying = false

  /**
   * Creates a new `Timer` node.
   *
   * @param options Timer configuration options
   */
  constructor(options: TimerOptions) {
    super(PrimaryNode.Timer, options)
    this.duration = propSignal(this, 'duration', options.duration)
    if (options.autoPlay) this.play()
  }

  // Triggers
  onTimeout = new Trigger<[]>()
  onTimeChange = new Trigger<[time: number]>()

  /**
   * The **`play`** method starts or resumes the timer.
   *
   * @param from Optional time in seconds to start from. Clamped to `[0, duration]`.
   *
   * @example
   * ```tsx
   * timer.node.play()      // Resume from current position
   * timer.node.play(0)     // Start from the beginning
   * timer.node.play(2.5)   // Start from 2.5 seconds
   * ```
   */
  play(from?: number) {
    this.#counter = Math.min(from ?? this.#counter, this.duration)
    this.#isPlaying = true
  }

  /**
   * The **`pause`** method pauses the timer without resetting its position.
   *
   * @example
   * ```tsx
   * timer.node.pause()
   * ```
   */
  pause() {
    this.#isPlaying = false
  }

  /**
   * The **`stop`** method stops the timer and resets the elapsed time to zero.
   *
   * @example
   * ```tsx
   * timer.node.stop()
   * ```
   */
  stop() {
    this.#isPlaying = false
    this.#counter = 0
  }

  /** @internal Updates the timer each frame. */
  update(delta: number): void {
    if (this.#isPlaying) {
      if (this.#counter >= this.duration) {
        this.stop()
        this.onTimeout.emit()
      } else {
        this.onTimeChange.emit(this.#counter)
        this.#counter += delta
      }
    }

    super.update(delta)
  }

  /** @internal Cleans up custom event listeners. */
  cleanEvents(): void {
    this.onTimeout.clear()
    this.onTimeChange.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Timer, Timer)
