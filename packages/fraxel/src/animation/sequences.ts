import type { TweenController } from './tween.js'

/**
 * The **`sequence`** function executes tweens sequentially — each tween starts
 * after the previous one completes.
 *
 * @param tweens Array of `TweenController` instances to run in sequence.
 *
 * @example
 * ```ts
 * import { tween, sequence } from 'fraxel'
 *
 * // Fade in, then move right
 * sequence([
 *   tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
 *   tween({ target: sprite, prop: 'position', from: 0, to: 100, duration: 1 }),
 * ])
 * ```
 */
export function sequence(tweens: TweenController[]): void {
  if (tweens.length === 0) return

  for (let i = tweens.length - 1; i > 0; i--) {
    const current = tweens[i]!
    const prev = tweens[i - 1]!

    current.pause()

    const check = () => {
      if (prev.isPlaying) {
        requestAnimationFrame(check)
        return
      }
      current.resume()
    }
    requestAnimationFrame(check)
  }

  tweens[0]!.resume()
}

/**
 * The **`parallel`** function executes tweens in parallel — all tweens start simultaneously.
 *
 * @param tweens Array of `TweenController` instances to run in parallel.
 *
 * @example
 * ```ts
 * import { tween, parallel } from 'fraxel'
 *
 * // Fade in and move right at the same time
 * parallel([
 *   tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
 *   tween({ target: sprite, prop: 'position', from: 0, to: 100, duration: 1 }),
 * ])
 * ```
 */
export function parallel(tweens: TweenController[]): void {
  for (const t of tweens) {
    t.resume()
  }
}
