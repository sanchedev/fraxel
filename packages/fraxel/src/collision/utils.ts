import { Vector2, type Position, type VectorLike } from '../math/vector2.js'
import type { Node2D } from '../nodes/node2d/_node2d.js'
import type { CapsuleShape } from './narrowphase/shapes.js'

/**
 * Converts a world-space vector to the node's parent local space.
 * Rotates the vector by the negative parent global rotation.
 * @param node The node whose parent space defines the target coordinate system.
 * @param worldVec The vector in world space.
 * @returns The vector rotated into parent-local space.
 */
export function worldToLocal(node: Node2D, worldVec: VectorLike): Vector2 {
  const parentRotation = node.globalRotation - node.rotation
  return new Vector2(worldVec).toRotated(-parentRotation)
}

/**
 * Converts a local-space vector to world space.
 * Rotates the vector by the parent global rotation.
 * @param node The node whose parent space defines the source coordinate system.
 * @param localVec The vector in parent-local space.
 * @returns The vector rotated into world space.
 */
export function localToWorld(node: Node2D, localVec: VectorLike): Vector2 {
  const parentRotation = node.globalRotation - node.rotation
  return new Vector2(localVec).toRotated(parentRotation)
}

interface CapsuleBone {
  a: Position
  b: Position
}

/**
 * Computes the world-space bone endpoints of a capsule shape.
 * The bone is rotated by the given angle and positioned at `pos`.
 * @param shape The capsule shape definition.
 * @param pos The world-space position (center of the capsule's bounding box origin).
 * @param rotation The world-space rotation in degrees.
 * @returns The two bone endpoints in world space.
 */
export function getCapsuleBone(shape: CapsuleShape, pos: Position, rotation: number): CapsuleBone {
  let lx: number
  let ly: number
  let rx: number
  let ry: number

  if (shape.direction === 'vertical') {
    lx = shape.radius
    ly = shape.radius
    rx = shape.radius
    ry = shape.length - shape.radius
  } else {
    lx = shape.radius
    ly = shape.radius
    rx = shape.length - shape.radius
    ry = shape.radius
  }

  if (rotation === 0) {
    return {
      a: { x: pos.x + lx, y: pos.y + ly },
      b: { x: pos.x + rx, y: pos.y + ry },
    }
  }

  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  return {
    a: { x: pos.x + lx * cos - ly * sin, y: pos.y + lx * sin + ly * cos },
    b: { x: pos.x + rx * cos - ry * sin, y: pos.y + rx * sin + ry * cos },
  }
}

// ─── OBB helpers ─────────────────────────────────────────────

interface Point {
  x: number
  y: number
}

/**
 * Returns the 4 corners of a rotated rectangle in world space.
 * The rectangle extends from `pos` to `pos + size`, rotated by `rotation` degrees around `pos`.
 */
export function getRotatedRectCorners(
  pos: { x: number; y: number },
  size: { x: number; y: number },
  rotation: number,
): [Point, Point, Point, Point] {
  if (rotation === 0) {
    return [
      { x: pos.x, y: pos.y },
      { x: pos.x + size.x, y: pos.y },
      { x: pos.x + size.x, y: pos.y + size.y },
      { x: pos.x, y: pos.y + size.y },
    ]
  }

  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const w = size.x
  const h = size.y

  return [
    { x: pos.x, y: pos.y },
    { x: pos.x + w * cos, y: pos.y + w * sin },
    { x: pos.x + w * cos - h * sin, y: pos.y + w * sin + h * cos },
    { x: pos.x - h * sin, y: pos.y + h * cos },
  ]
}

/**
 * Returns the 2 unique edge normals of a rotated rectangle.
 * These are the separating axes to test for SAT.
 */
export function getRotatedRectNormals(rotation: number): [Point, Point] {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return [
    { x: cos, y: sin },
    { x: -sin, y: cos },
  ]
}

/**
 * Projects a set of corners onto an axis and returns [min, max] projections.
 */
function projectOnAxis(corners: Point[], axis: Point): { min: number; max: number } {
  let min = corners[0]!.x * axis.x + corners[0]!.y * axis.y
  let max = min
  for (let i = 1; i < corners.length; i++) {
    const proj = corners[i]!.x * axis.x + corners[i]!.y * axis.y
    if (proj < min) min = proj
    if (proj > max) max = proj
  }
  return { min, max }
}

export interface OBBOverlapResult {
  overlap: { x: number; y: number }
  normal: { x: number; y: number }
}

/**
 * Computes SAT overlap between two rotated rectangles.
 * @returns The overlap vector and collision normal, or `null` if no overlap.
 */
export function obbRectOverlap(
  posA: { x: number; y: number },
  sizeA: { x: number; y: number },
  rotA: number,
  posB: { x: number; y: number },
  sizeB: { x: number; y: number },
  rotB: number,
): OBBOverlapResult | null {
  const cornersA = getRotatedRectCorners(posA, sizeA, rotA)
  const cornersB = getRotatedRectCorners(posB, sizeB, rotB)
  const normalsA = getRotatedRectNormals(rotA)
  const normalsB = getRotatedRectNormals(rotB)
  const axes = [normalsA[0], normalsA[1], normalsB[0], normalsB[1]]

  let minOverlap = Infinity
  let minAxis = axes[0]!

  for (const axis of axes) {
    const projA = projectOnAxis(cornersA, axis)
    const projB = projectOnAxis(cornersB, axis)
    const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min)

    if (overlap <= 0) return null

    if (overlap < minOverlap) {
      minOverlap = overlap
      minAxis = axis
    }
  }

  // Ensure normal points from B to A (compute centers from corners)
  const centerA = {
    x: (cornersA[0]!.x + cornersA[2]!.x) / 2,
    y: (cornersA[0]!.y + cornersA[2]!.y) / 2,
  }
  const centerB = {
    x: (cornersB[0]!.x + cornersB[2]!.x) / 2,
    y: (cornersB[0]!.y + cornersB[2]!.y) / 2,
  }
  const dx = centerA.x - centerB.x
  const dy = centerA.y - centerB.y
  if (dx * minAxis.x + dy * minAxis.y < 0) {
    minAxis = { x: -minAxis.x, y: -minAxis.y }
  }

  return {
    overlap: { x: minAxis.x * minOverlap, y: minAxis.y * minOverlap },
    normal: minAxis,
  }
}

/**
 * Computes the closest point on a rotated rectangle to a given point.
 * @param pos Rectangle origin (top-left before rotation).
 * @param size Rectangle dimensions.
 * @param rotation Rectangle rotation in degrees.
 * @param point The query point in world space.
 * @returns The closest point on the rectangle surface.
 */
export function closestPointOnRotatedRect(
  pos: { x: number; y: number },
  size: { x: number; y: number },
  rotation: number,
  point: { x: number; y: number },
): Point {
  if (rotation === 0) {
    return {
      x: Math.max(pos.x, Math.min(point.x, pos.x + size.x)),
      y: Math.max(pos.y, Math.min(point.y, pos.y + size.y)),
    }
  }

  const rad = (-rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = point.x - pos.x
  const dy = point.y - pos.y
  const localX = dx * cos - dy * sin
  const localY = dx * sin + dy * cos
  const clampedX = Math.max(0, Math.min(localX, size.x))
  const clampedY = Math.max(0, Math.min(localY, size.y))

  const rad2 = (rotation * Math.PI) / 180
  const cos2 = Math.cos(rad2)
  const sin2 = Math.sin(rad2)
  return {
    x: pos.x + clampedX * cos2 - clampedY * sin2,
    y: pos.y + clampedX * sin2 + clampedY * cos2,
  }
}
