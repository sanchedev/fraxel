import type { AnimationKeyframe } from '../nodes/animation-player.js'
import type { Node } from '../nodes/_node.js'

/**
 * The **`kfFromProp`** function returns a keyframe that sets a property in a `Node`.
 * @param node A instance of `Node`
 * @param property A key
 * @param value A value
 * @returns A keyframe
 *
 * @example
 * ```ts
 * animPlayer
 *   .add('idle', {
 *     fps: 4,
 *     keyframes: [
 *       multiKF([
 *         kfFromProp(sprite, 'textureId', 'idle'),
 *         // () => sprite.margin.x = 0,
 *         kfFromProp(sprite, 'margin', new Vector2(0, 0)),
 *       ]),
 *       kfFromProp(sprite, 'margin', new Vector2(16, 0)),
 *       kfFromProp(sprite, 'margin', new Vector2(32, 0)),
 *       kfFromProp(sprite, 'margin', new Vector2(48, 0)),
 *     ],
 *     loop: true,
 *   })
 * ```
 */
export function kfFromProp<T extends Node, K extends keyof T>(
  node: T,
  property: K,
  value: T[K],
): AnimationKeyframe {
  return () => {
    node[property] = value
  }
}
