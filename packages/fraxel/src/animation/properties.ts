import type { AnimationKeyframe } from '../nodes/animation-player.js'
import type { Node } from '../nodes/_node.js'

/**
 * The **`kfFromProp`** function creates a keyframe that sets a property on a `Node`.
 * The property is assigned the given value when the keyframe is executed.
 *
 * @param node The node instance to modify.
 * @param property The property name to set.
 * @param value The value to assign.
 * @returns A keyframe function.
 *
 * @example
 * ```ts
 * import { kfFromProp, multiKF } from 'fraxel'
 *
 * // Set texture and margin in the same frame
 * multiKF([
 *   kfFromProp(sprite, 'textureId', IDLE_TEXTURE),
 *   kfFromProp(sprite, 'margin', vector2(0, 0)),
 * ])
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
