import type { AnimationKeyframe } from '../nodes/animation-player.js'

/**
 * The **`multiKF`** function returns a keyframe using multiple keyframes.
 * @param kfs The keyframes
 * @returns A keyframe
 *
 * @example
 * ```ts
 * animPlayer
 *   .add('idle', {
 *     fps: 4,
 *     keyframes: [
 *       multiKF([ // In the same frame `multiKF` executes both keyframes.
 *         () => sprite.textureId = 'idle',
 *         () => sprite.margin.x = 0,
 *       ]),
 *       () => sprite.margin.x = 16,
 *       () => sprite.margin.x = 32,
 *       () => sprite.margin.x = 48,
 *     ],
 *     loop: true,
 *   })
 * ```
 */
export function multiKF(kfs: AnimationKeyframe[]): AnimationKeyframe {
  return (time) => kfs.forEach((kf) => kf(time))
}
