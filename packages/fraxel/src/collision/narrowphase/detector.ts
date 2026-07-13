import type { Collider } from '../../nodes/node2d/collider.js'
import { clamp } from '../../math/utils.js'
import {
  getCapsuleBone,
  obbRectOverlap,
  closestPointOnRotatedRect,
  getRotatedRectCorners,
} from '../utils.js'

/**
 * The **`Narrowphase`** class performs precise collision detection between two colliders.
 * It supports rectangle, circle, and capsule overlap tests.
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
    const { type: typeA } = a.shape
    const { type: typeB } = b.shape

    if (typeA === 'rectangle' && typeB === 'rectangle') {
      return this.#rectangleOverlap(a, b)
    }
    if (typeA === 'circle' && typeB === 'circle') {
      return this.#circleOverlap(a, b)
    }
    if (typeA === 'rectangle' && typeB === 'circle') {
      return this.#rectangleCircleOverlap(a, b)
    }
    if (typeA === 'circle' && typeB === 'rectangle') {
      return this.#rectangleCircleOverlap(b, a)
    }
    if (typeA === 'capsule' && typeB === 'capsule') {
      return this.#capsuleOverlap(a, b)
    }
    if (typeA === 'rectangle' && typeB === 'capsule') {
      return this.#rectangleCapsuleOverlap(a, b)
    }
    if (typeA === 'capsule' && typeB === 'rectangle') {
      return this.#rectangleCapsuleOverlap(b, a)
    }
    if (typeA === 'circle' && typeB === 'capsule') {
      return this.#circleCapsuleOverlap(a, b)
    }
    if (typeA === 'capsule' && typeB === 'circle') {
      return this.#circleCapsuleOverlap(b, a)
    }
    return false
  }

  static #rectangleOverlap(a: Collider, b: Collider): boolean {
    if (a.shape.type !== 'rectangle' || b.shape.type !== 'rectangle') return false
    return (
      obbRectOverlap(
        a.globalPosition,
        a.shape.size,
        a.globalRotation,
        b.globalPosition,
        b.shape.size,
        b.globalRotation,
      ) !== null
    )
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
    const closest = closestPointOnRotatedRect(
      rectangle.globalPosition,
      rectangle.shape.size,
      rectangle.globalRotation,
      circle.globalPosition,
    )
    const dx = circle.globalPosition.x - closest.x
    const dy = circle.globalPosition.y - closest.y

    return dx * dx + dy * dy < circle.shape.radius * circle.shape.radius
  }

  static #capsuleOverlap(a: Collider, b: Collider): boolean {
    if (a.shape.type !== 'capsule' || b.shape.type !== 'capsule') return false

    const aBone = getCapsuleBone(a.shape, a.globalPosition, a.globalRotation)
    const bBone = getCapsuleBone(b.shape, b.globalPosition, b.globalRotation)

    const closest = this.#closestPointsOnSegments(aBone, bBone)
    const dx = closest.b.x - closest.a.x
    const dy = closest.b.y - closest.a.y
    const distSq = dx * dx + dy * dy
    const radiusSum = a.shape.radius + b.shape.radius

    return distSq < radiusSum * radiusSum
  }

  static #rectangleCapsuleOverlap(rect: Collider, capsule: Collider): boolean {
    if (rect.shape.type !== 'rectangle' || capsule.shape.type !== 'capsule') return false

    const bone = getCapsuleBone(capsule.shape, capsule.globalPosition, capsule.globalRotation)

    // Check closest point on rect to each bone endpoint
    const closestA = closestPointOnRotatedRect(
      rect.globalPosition,
      rect.shape.size,
      rect.globalRotation,
      bone.a,
    )
    const dxA = bone.a.x - closestA.x
    const dyA = bone.a.y - closestA.y
    if (dxA * dxA + dyA * dyA < capsule.shape.radius * capsule.shape.radius) return true

    const closestB = closestPointOnRotatedRect(
      rect.globalPosition,
      rect.shape.size,
      rect.globalRotation,
      bone.b,
    )
    const dxB = bone.b.x - closestB.x
    const dyB = bone.b.y - closestB.y
    if (dxB * dxB + dyB * dyB < capsule.shape.radius * capsule.shape.radius) return true

    // Check closest point on bone to each rect corner
    const corners = getRotatedRectCorners(rect.globalPosition, rect.shape.size, rect.globalRotation)

    const closest = this.#closestPointOnSegment(bone, corners[0]!.x, corners[0]!.y)
    for (const corner of corners) {
      const c = this.#closestPointOnSegment(bone, corner.x, corner.y)
      if (c.t > closest.t) Object.assign(closest, c)
    }

    const dx = closest.x - (bone.a.x + (bone.b.x - bone.a.x) * closest.t)
    const dy = closest.y - (bone.a.y + (bone.b.y - bone.a.y) * closest.t)
    return dx * dx + dy * dy < capsule.shape.radius * capsule.shape.radius
  }

  static #circleCapsuleOverlap(circle: Collider, capsule: Collider): boolean {
    if (circle.shape.type !== 'circle' || capsule.shape.type !== 'capsule') return false

    const bone = getCapsuleBone(capsule.shape, capsule.globalPosition, capsule.globalRotation)
    const cx = circle.globalPosition.x
    const cy = circle.globalPosition.y

    const closest = this.#closestPointOnSegment(bone, cx, cy)
    const dx = cx - closest.x
    const dy = cy - closest.y
    const distSq = dx * dx + dy * dy
    const radiusSum = circle.shape.radius + capsule.shape.radius

    return distSq < radiusSum * radiusSum
  }

  /** Finds the closest point on a line segment to a point. */
  static #closestPointOnSegment(
    seg: { a: { x: number; y: number }; b: { x: number; y: number } },
    px: number,
    py: number,
  ): { x: number; y: number; t: number } {
    const dx = seg.b.x - seg.a.x
    const dy = seg.b.y - seg.a.y
    const lenSq = dx * dx + dy * dy

    if (lenSq === 0) return { x: seg.a.x, y: seg.a.y, t: 0 }

    let t = ((px - seg.a.x) * dx + (py - seg.a.y) * dy) / lenSq
    t = clamp(0, t, 1)

    return { x: seg.a.x + t * dx, y: seg.a.y + t * dy, t }
  }

  /** Finds the closest points between two line segments. */
  static #closestPointsOnSegments(
    segA: { a: { x: number; y: number }; b: { x: number; y: number } },
    segB: { a: { x: number; y: number }; b: { x: number; y: number } },
  ): { a: { x: number; y: number }; b: { x: number; y: number } } {
    const dA = { x: segA.b.x - segA.a.x, y: segA.b.y - segA.a.y }
    const dB = { x: segB.b.x - segB.a.x, y: segB.b.y - segB.a.y }
    const r = { x: segA.a.x - segB.a.x, y: segA.a.y - segB.a.y }

    const dotA = dA.x * dA.x + dA.y * dA.y
    const dotB = dB.x * dB.x + dB.y * dB.y
    const dotAB = dA.x * dB.x + dA.y * dB.y
    const dotAR = dA.x * r.x + dA.y * r.y
    const dotBR = dB.x * r.x + dB.y * r.y

    let s = dotAR / dotA
    let t = (dotBR + dotAB * s) / dotB

    s = clamp(0, s, 1)
    t = clamp(0, t, 1)

    // Reclamp s given clamped t
    const d = dotA - (dotAB * dotAB) / dotB
    if (d !== 0) {
      s = clamp(0, (dotAR - dotAB * t) / dotA, 1)
    }

    return {
      a: { x: segA.a.x + s * dA.x, y: segA.a.y + s * dA.y },
      b: { x: segB.a.x + t * dB.x, y: segB.a.y + t * dB.y },
    }
  }

  /** Finds the closest point on a segment to an AABB. */
  static #closestPointOnSegmentToRect(
    seg: { a: { x: number; y: number }; b: { x: number; y: number } },
    rectFrom: { x: number; y: number },
    rectTo: { x: number; y: number },
  ): { x: number; y: number; t: number } {
    // Clamp segment center to rect, then find closest point on segment
    const midX = (seg.a.x + seg.b.x) / 2
    const midY = (seg.a.y + seg.b.y) / 2
    const closestRectX = clamp(rectFrom.x, midX, rectTo.x)
    const closestRectY = clamp(rectFrom.y, midY, rectTo.y)

    return this.#closestPointOnSegment(seg, closestRectX, closestRectY)
  }
}
