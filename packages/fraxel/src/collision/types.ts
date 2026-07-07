import type { Position } from '../math/vector2.js'

export type { RectangleShape, CircleShape, CapsuleShape, Shape } from './narrowphase/shapes.js'
export { shapes } from './narrowphase/shapes.js'

/**
 * The **`CollisionBounds`** interface defines an axis-aligned bounding box used for spatial queries.
 * It consists of a `from` (min corner) and `to` (max corner) position.
 *
 * @example
 * ```ts
 * const bounds: CollisionBounds = {
 *   from: { x: 0, y: 0 },
 *   to: { x: 100, y: 100 },
 * }
 * ```
 */
export interface CollisionBounds {
  /** The minimum corner (top-left) of the bounding box. */
  from: Position
  /** The maximum corner (bottom-right) of the bounding box. */
  to: Position
}
