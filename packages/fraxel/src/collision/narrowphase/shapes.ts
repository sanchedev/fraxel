import { vector2, type Vector2 } from '../../math/vector2.js'

/**
 * The **`RectangleShape`** interface defines a rectangular collision shape.
 * Used for axis-aligned bounding box (AABB) collision detection.
 *
 * @example
 * ```tsx
 * <collider shape={shapes.rectangle(32, 32)} ... />
 * ```
 */
export interface RectangleShape {
  /** Discriminant identifier for rectangle shapes. */
  type: 'rectangle'
  /** The width and height of the rectangle. */
  size: Vector2
}

/**
 * The **`CircleShape`** interface defines a circular collision shape.
 * Used for circle-based collision detection.
 *
 * @example
 * ```tsx
 * <collider shape={shapes.circle(16)} ... />
 * ```
 */
export interface CircleShape {
  /** Discriminant identifier for circle shapes. */
  type: 'circle'
  /** The radius of the circle. */
  radius: number
}

/**
 * The **`CapsuleShape`** interface defines a capsule (stadium) collision shape.
 * A capsule is a rectangle with semicircular caps on two opposite ends.
 *
 * The `length` is the total tip-to-tip dimension (including caps).
 * The `radius` is the radius of the semicircular caps.
 * The `direction` controls orientation: `'vertical'` (default) or `'horizontal'`.
 *
 * Minimum constraint: `length >= radius * 2`. When `length === radius * 2`,
 * the capsule degenerates to a circle.
 *
 * @example
 * ```tsx
 * // Vertical capsule (default)
 * <collider shape={shapes.capsule(64, 12)} ... />
 *
 * // Horizontal capsule
 * <collider shape={shapes.capsule(64, 12, 'horizontal')} ... />
 * ```
 */
export interface CapsuleShape {
  /** Discriminant identifier for capsule shapes. */
  type: 'capsule'
  /** Total tip-to-tip length (including caps). */
  length: number
  /** Radius of the semicircular caps. */
  radius: number
  /** Orientation of the capsule. `'vertical'` (default) or `'horizontal'`. */
  direction: 'vertical' | 'horizontal'
}

/**
 * The **`Shape`** type represents all supported collision shapes.
 * Discriminate by checking `shape.type` (`'rectangle'`, `'circle'`, or `'capsule'`).
 *
 * @example
 * ```ts
 * function getArea(shape: Shape): number {
 *   if (shape.type === 'rectangle') {
 *     return shape.size.x * shape.size.y
 *   }
 *   if (shape.type === 'circle') {
 *     return Math.PI * shape.radius * shape.radius
 *   }
 *   // capsule
 *   const bodyLen = shape.length - shape.radius * 2
 *   return shape.radius * 2 * bodyLen + Math.PI * shape.radius * shape.radius
 * }
 * ```
 */
export type Shape = RectangleShape | CircleShape | CapsuleShape

/**
 * The **`shapes`** constant provides factory methods to create collision shapes.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 *
 * // Rectangle
 * <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
 *
 * // Circle
 * <collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
 *
 * // Capsule
 * <collider shape={shapes.capsule(64, 12)} group={['player']} collidesWith={['obstacle']} />
 * ```
 */
export const shapes = {
  /**
   * Creates a `RectangleShape` with the given width and height.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   * @returns A `RectangleShape` object.
   *
   * @example
   * ```ts
   * const box = shapes.rectangle(64, 32)
   * console.log(box.type)    // 'rectangle'
   * console.log(box.size.x)  // 64
   * console.log(box.size.y)  // 32
   * ```
   */
  rectangle: (width: number, height: number): RectangleShape => ({
    type: 'rectangle',
    size: vector2(width, height),
  }),

  /**
   * Creates a `CircleShape` with the given radius.
   * @param radius The radius of the circle.
   * @returns A `CircleShape` object.
   *
   * @example
   * ```ts
   * const ball = shapes.circle(12)
   * console.log(ball.type)     // 'circle'
   * console.log(ball.radius)   // 12
   * ```
   */
  circle: (radius: number): CircleShape => ({
    type: 'circle',
    radius,
  }),

  /**
   * Creates a `CapsuleShape` with the given length, radius, and optional direction.
   * @param length Total tip-to-tip length (including caps). Must be >= radius * 2.
   * @param radius Radius of the semicircular caps.
   * @param direction Orientation: `'vertical'` (default) or `'horizontal'`.
   * @returns A `CapsuleShape` object.
   *
   * @example
   * ```ts
   * const pill = shapes.capsule(64, 12)
   * console.log(pill.type)       // 'capsule'
   * console.log(pill.length)     // 64
   * console.log(pill.radius)     // 12
   * console.log(pill.direction)  // 'vertical'
   *
   * const horizontal = shapes.capsule(80, 8, 'horizontal')
   * console.log(horizontal.direction)  // 'horizontal'
   * ```
   */
  capsule: (
    length: number,
    radius: number,
    direction: 'vertical' | 'horizontal' = 'vertical',
  ): CapsuleShape => {
    if (length < radius * 2) {
      throw new Error(`Capsule length (${length}) must be >= radius * 2 (${radius * 2})`)
    }
    return { type: 'capsule', length, radius, direction }
  },
}
