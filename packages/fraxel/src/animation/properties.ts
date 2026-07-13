import type { AnimationKeyframe } from './types.js'
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
 * import { kfFromProp, multiKF, region, vector2 } from 'fraxel'
 *
 * // Set texture and source region in the same frame
 * multiKF([
 *   kfFromProp(sprite, 'textureId', IDLE_TEXTURE),
 *   kfFromProp(sprite, 'source', region(0, 0, 16, 16)),
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
