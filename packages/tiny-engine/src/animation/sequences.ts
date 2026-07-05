import type { TweenController } from './tween.js'

/**
 * Executes tweens sequentially — each tween starts after the previous one completes.
 *
 * @example
 * ```ts
 * import { tween, sequence } from 'tiny-engine/animation'
 *
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
 * Executes tweens in parallel — all tweens start simultaneously.
 *
 * @example
 * ```ts
 * import { tween, parallel } from 'tiny-engine/animation'
 *
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
