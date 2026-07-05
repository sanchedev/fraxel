import { Vector2 } from '../../math/vector2.js'

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
 * The **`Shape`** type represents all supported collision shapes.
 * Discriminate by checking `shape.type` (`'rectangle'` or `'circle'`).
 *
 * @example
 * ```ts
 * function getArea(shape: Shape): number {
 *   if (shape.type === 'rectangle') {
 *     return shape.size.x * shape.size.y
 *   }
 *   return Math.PI * shape.radius * shape.radius
 * }
 * ```
 */
export type Shape = RectangleShape | CircleShape

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
    size: new Vector2(width, height),
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
}
