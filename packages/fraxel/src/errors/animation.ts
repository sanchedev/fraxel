import { FraxelError } from './base.js'

/**
 * The **`AnimationError`** class is the base error for all animation-related errors.
 * Thrown when an error occurs during animation processing, playback, or keyframe resolution.
 *
 * @example
 * ```ts
 * import { FraxelError } from 'fraxel'
 *
 * // Caught when animation playback fails
 * try {
 *   anim.play('nonexistent')
 * } catch (e) {
 *   if (e instanceof AnimationError) console.error(e.message)
 * }
 * ```
 */
export class AnimationError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'AnimationError'
  }
}

/**
 * The **`KeyframeNotFoundError`** class is thrown when attempting to access a keyframe
 * at an index that does not exist in the animation's keyframe list. This typically
 * occurs when an animation's `frameIndex` exceeds the number of available keyframes.
 *
 * @example
 * ```ts
 * // If an animation has 4 keyframes (indices 0-3) and frameIndex becomes 5:
 * // Keyframe at index 5 does not exist
 * ```
 */
export class KeyframeNotFoundError extends AnimationError {
  constructor(index: number) {
    super(`Keyframe at index ${index} does not exist`)
  }
}
