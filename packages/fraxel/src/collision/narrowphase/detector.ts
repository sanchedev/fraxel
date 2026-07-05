import type { Collider } from '../../nodes/node2d/collider.js'

/**
 * The **`Narrowphase`** class performs precise collision detection between two colliders.
 * It supports rectangle-rectangle, circle-circle, and rectangle-circle overlap tests.
 *
 * Used internally by the `CollisionSystem` after broadphase filtering.
 */
export class Narrowphase {
  /**
   * The **`detect`** method checks if two colliders overlap based on their shapes.
   * @param a The first collider.
   * @param b The second collider.
   * @returns `true` if the shapes overlap, `false` otherwise.
   *
   * @example
   * ```ts
   * const hit = Narrowphase.detect(playerCollider, enemyCollider)
   * if (hit) {
   *   console.log('Collision detected!')
   * }
   * ```
   */
  static detect(a: Collider, b: Collider): boolean {
    if (a.shape.type === 'rectangle' && b.shape.type === 'rectangle') {
      return this.#rectangleOverlap(a, b)
    }
    if (a.shape.type === 'circle' && b.shape.type === 'circle') {
      return this.#circleOverlap(a, b)
    }
    if (a.shape.type === 'rectangle' && b.shape.type === 'circle') {
      return this.#rectangleCircleOverlap(a, b)
    }
    if (a.shape.type === 'circle' && b.shape.type === 'rectangle') {
      return this.#rectangleCircleOverlap(b, a)
    }
    return false
  }

  static #rectangleOverlap(a: Collider, b: Collider): boolean {
    if (a.shape.type !== 'rectangle' || b.shape.type !== 'rectangle') return false
    const fromA = a.globalPosition
    const toA = fromA.toAdded(a.shape.size)
    const fromB = b.globalPosition
    const toB = fromB.toAdded(b.shape.size)

    return fromA.x < toB.x && toA.x > fromB.x && fromA.y < toB.y && toA.y > fromB.y
  }

  static #circleOverlap(a: Collider, b: Collider): boolean {
    if (a.shape.type !== 'circle' || b.shape.type !== 'circle') return false
    const dx = a.globalPosition.x - b.globalPosition.x
    const dy = a.globalPosition.y - b.globalPosition.y
    const distSq = dx * dx + dy * dy
    const radiusSum = a.shape.radius + b.shape.radius
    return distSq < radiusSum * radiusSum
  }

  static #rectangleCircleOverlap(rectangle: Collider, circle: Collider): boolean {
    if (rectangle.shape.type !== 'rectangle' || circle.shape.type !== 'circle') return false
    const rectFrom = rectangle.globalPosition
    const rectTo = rectFrom.toAdded(rectangle.shape.size)
    const cx = circle.globalPosition.x
    const cy = circle.globalPosition.y
    const r = circle.shape.radius

    const closestX = Math.max(rectFrom.x, Math.min(cx, rectTo.x))
    const closestY = Math.max(rectFrom.y, Math.min(cy, rectTo.y))
    const dx = cx - closestX
    const dy = cy - closestY

    return dx * dx + dy * dy < r * r
  }
}
