import { FraxelError } from './base.js'

/**
 * The **`AnimationError`** error is thrown when an error occurs during animation processing or playback.
 * @example
 * ```ts
 * // When this happens:
 * throw new AnimationError('Animation failed to play')
 * ```
 */
export class AnimationError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'AnimationError'
  }
}

/**
 * The **`KeyframeNotFoundError`** error is thrown when attempting to access a keyframe at an index that does not exist in the animation's keyframe list.
 * @example
 * ```ts
 * // When this happens:
 * throw new KeyframeNotFoundError(5)
 * ```
 */
export class KeyframeNotFoundError extends AnimationError {
  constructor(index: number) {
    super(`Keyframe at index ${index} does not exist`)
  }
}
