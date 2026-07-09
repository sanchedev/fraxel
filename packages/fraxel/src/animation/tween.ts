import type { EasingFn } from './easing.js'
import { linear } from './easing.js'

/**
 * The **`TweenOptions`** interface configures a tween animation.
 *
 * @typeParam T The type of the target object.
 */
export interface TweenOptions<T> {
  /** The object whose property will be interpolated. */
  target: T
  /** The property name to interpolate. */
  prop: keyof T
  /** Start value. */
  from: number
  /** End value. */
  to: number
  /** Duration in seconds. */
  duration: number
  /** Easing function. @default linear */
  easing?: EasingFn
  /** Called every frame with the current interpolated value. */
  onUpdate?: (value: number) => void
  /** Called when the tween completes. */
  onComplete?: () => void
}

/**
 * The **`TweenController`** interface controls a running tween.
 * Returned by `tween()` and `tweenValue()`.
 */
export interface TweenController {
  /** Whether the tween is currently playing. */
  readonly isPlaying: boolean
  /** Current progress from 0 to 1. */
  readonly progress: number
  /** Pauses the tween. */
  pause(): void
  /** Resumes the tween. */
  resume(): void
  /** Stops the tween and resets progress to 0. */
  stop(): void
}

/**
 * The **`tween`** function creates a tween that interpolates a numeric property
 * on a target object over a given duration with optional easing.
 *
 * @param options Tween configuration.
 * @returns A `TweenController` for pausing, resuming, or stopping the tween.
 *
 * @example
 * ```ts
 * import { tween, easeOutQuad } from 'fraxel'
 *
 * const controller = tween({
 *   target: sprite,
 *   prop: 'opacity',
 *   from: 0,
 *   to: 1,
 *   duration: 0.5,
 *   easing: easeOutQuad,
 *   onComplete: () => console.log('fade in done'),
 * })
 *
 * // Control the tween:
 * controller.pause()
 * controller.resume()
 * controller.stop()
 * ```
 */
export function tween<T>(options: TweenOptions<T>): TweenController {
  const { target, prop, from, to, duration, easing = linear, onUpdate, onComplete } = options

  let elapsed = 0
  let playing = true
  let rafId = 0
  let lastTime = 0

  const step = (time: number) => {
    if (!playing) return

    if (lastTime === 0) lastTime = time
    const dt = (time - lastTime) / 1000
    lastTime = time

    elapsed += dt

    const t = Math.min(elapsed / duration, 1)
    const easedT = easing(t)
    const value = from + (to - from) * easedT

    target[prop] = value as T[typeof prop]
    onUpdate?.(value)

    if (t >= 1) {
      onComplete?.()
      return
    }

    rafId = requestAnimationFrame(step)
  }

  rafId = requestAnimationFrame(step)

  return {
    get isPlaying() {
      return playing
    },
    get progress() {
      return Math.min(elapsed / duration, 1)
    },
    pause() {
      playing = false
      cancelAnimationFrame(rafId)
    },
    resume() {
      if (playing) return
      playing = true
      lastTime = 0
      rafId = requestAnimationFrame(step)
    },
    stop() {
      playing = false
      cancelAnimationFrame(rafId)
      elapsed = 0
    },
  }
}

/**
 * The **`tweenValue`** function creates a tween that updates a callback with
 * interpolated values. Useful for animating values without a target object.
 *
 * @param options Tween configuration (without `target` and `prop`).
 * @returns A `TweenController` for pausing, resuming, or stopping the tween.
 *
 * @example
 * ```ts
 * import { tweenValue } from 'fraxel'
 *
 * tweenValue({
 *   from: 0,
 *   to: 100,
 *   duration: 1,
 *   onUpdate: (value) => console.log(value),
 * })
 * ```
 */
export function tweenValue(
  options: Omit<TweenOptions<Record<string, number>>, 'target' | 'prop'>,
): TweenController {
  const holder: Record<string, number> = { v: 0 }
  const { onUpdate: userOnUpdate, ...rest } = options
  return tween({
    target: holder,
    prop: 'v',
    ...rest,
    onUpdate: (value) => {
      userOnUpdate?.(value)
    },
  })
}
