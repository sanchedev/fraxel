import type { AnimationKeyframe } from './types.js'

/**
 * The **`multiKF`** function combines multiple keyframes into a single keyframe.
 * When executed, all provided keyframes run in order within the same animation frame.
 *
 * @param kfs Array of keyframe functions to combine.
 * @returns A single keyframe function that executes all provided keyframes.
 *
 * @example
 * ```ts
 * import { multiKF, kfFromProp, region } from 'fraxel'
 *
 * // Both assignments happen in the same frame
 * multiKF([
 *   kfFromProp(sprite, 'textureId', IDLE_TEXTURE),
 *   kfFromProp(sprite, 'source', region(0, 0, 16, 16)),
 * ])
 * ```
 */
export function multiKF(kfs: AnimationKeyframe[]): AnimationKeyframe {
  return (time) => kfs.forEach((kf) => kf(time))
}
