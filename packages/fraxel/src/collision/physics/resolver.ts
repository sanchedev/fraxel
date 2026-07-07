import { vector2, type Vector2 } from '../../math/vector2.js'
import { clamp } from '../../math/utils.js'
import type { RigidBody } from '../../nodes/index.js'
import type { Collider } from '../../nodes/node2d/collider.js'
import type { CapsuleShape } from '../narrowphase/shapes.js'

/**
 * The **`resolveCollision`** function corrects overlap between two rigid bodies and applies impulse-based velocity changes.
 * @param bodyA The first rigid body
 * @param bodyB The second rigid body
 * @param overlap The overlap vector from B to A
 * @param normal The collision normal (from B to A)
 * @returns The position correction applied to body A
 */
export function resolveCollision(
  bodyA: RigidBody,
  bodyB: RigidBody,
  overlap: Vector2,
  normal: Vector2,
): Vector2 {
  const totalInvMass = (bodyA.isStatic ? 0 : 1 / bodyA.mass) + (bodyB.isStatic ? 0 : 1 / bodyB.mass)
  if (totalInvMass === 0) return vector2(0, 0)

  const ratioA = bodyA.isStatic ? 0 : 1 / bodyA.mass / totalInvMass
  const ratioB = bodyB.isStatic ? 0 : 1 / bodyB.mass / totalInvMass

  const correctionA_x = overlap.x * ratioA
  const correctionA_y = overlap.y * ratioA

  bodyA.position.x += correctionA_x
  bodyA.position.y += correctionA_y
  bodyB.position.x -= overlap.x * ratioB
  bodyB.position.y -= overlap.y * ratioB

  const relVelX = bodyA.velocity.x - bodyB.velocity.x
  const relVelY = bodyA.velocity.y - bodyB.velocity.y
  const velAlongNormal = relVelX * normal.x + relVelY * normal.y

  if (velAlongNormal > 0) return vector2(correctionA_x, correctionA_y)

  const restitution = Math.min(bodyA.bounce, bodyB.bounce)
  let j = -(1 + restitution) * velAlongNormal
  j /= totalInvMass

  const impulseX = j * normal.x
  const impulseY = j * normal.y

  if (!bodyA.isStatic) {
    bodyA.velocity.x += impulseX / bodyA.mass
    bodyA.velocity.y += impulseY / bodyA.mass
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.x -= impulseX / bodyB.mass
    bodyB.velocity.y -= impulseY / bodyB.mass
  }

  const tangentX = relVelX - velAlongNormal * normal.x
  const tangentY = relVelY - velAlongNormal * normal.y
  const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY)

  if (tangentLen > 0.0001) {
    const tx = tangentX / tangentLen
    const ty = tangentY / tangentLen
    const friction = Math.sqrt(bodyA.friction * bodyB.friction)

    let jt = -(relVelX * tx + relVelY * ty)
    jt /= totalInvMass
    jt = clamp(-j * friction, jt, j * friction)

    if (!bodyA.isStatic) {
      bodyA.velocity.x += (jt * tx) / bodyA.mass
      bodyA.velocity.y += (jt * ty) / bodyA.mass
    }
    if (!bodyB.isStatic) {
      bodyB.velocity.x -= (jt * tx) / bodyB.mass
      bodyB.velocity.y -= (jt * ty) / bodyB.mass
    }
  }

  return vector2(correctionA_x, correctionA_y)
}

/**
 * The **`computeOverlap`** function computes the overlap and collision normal between two colliders.
 * It dispatches to the appropriate shape-pair algorithm (rect-rect, circle-circle, rect-circle, etc.).
 * @param colliderA The first collider
 * @param colliderB The second collider
 * @returns The overlap vector and collision normal, or `null` if no overlap
 */
export function computeOverlap(
  colliderA: Collider,
  colliderB: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  const a = colliderA.shape
  const b = colliderB.shape

  if (a.type === 'rectangle' && b.type === 'rectangle') {
    return computeRectRectOverlap(colliderA, colliderB)
  }
  if (a.type === 'circle' && b.type === 'circle') {
    return computeCircleCircleOverlap(colliderA, colliderB)
  }
  if (a.type === 'rectangle' && b.type === 'circle') {
    return computeRectCircleOverlap(colliderA, colliderB)
  }
  if (a.type === 'circle' && b.type === 'rectangle') {
    const result = computeRectCircleOverlap(colliderB, colliderA)
    if (result) {
      result.overlap.x = -result.overlap.x
      result.overlap.y = -result.overlap.y
      result.normal.x = -result.normal.x
      result.normal.y = -result.normal.y
    }
    return result
  }
  if (a.type === 'capsule' && b.type === 'capsule') {
    return computeCapsuleCapsuleOverlap(colliderA, colliderB)
  }
  if (a.type === 'rectangle' && b.type === 'capsule') {
    return computeRectCapsuleOverlap(colliderA, colliderB)
  }
  if (a.type === 'capsule' && b.type === 'rectangle') {
    const result = computeRectCapsuleOverlap(colliderB, colliderA)
    if (result) {
      result.overlap.x = -result.overlap.x
      result.overlap.y = -result.overlap.y
      result.normal.x = -result.normal.x
      result.normal.y = -result.normal.y
    }
    return result
  }
  if (a.type === 'circle' && b.type === 'capsule') {
    return computeCircleCapsuleOverlap(colliderA, colliderB)
  }
  if (a.type === 'capsule' && b.type === 'circle') {
    const result = computeCircleCapsuleOverlap(colliderB, colliderA)
    if (result) {
      result.overlap.x = -result.overlap.x
      result.overlap.y = -result.overlap.y
      result.normal.x = -result.normal.x
      result.normal.y = -result.normal.y
    }
    return result
  }
  return null
}

function computeRectRectOverlap(
  colliderA: Collider,
  colliderB: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  const shapeA = colliderA.shape
  const shapeB = colliderB.shape
  if (shapeA.type !== 'rectangle' || shapeB.type !== 'rectangle') return null

  const posA = colliderA.globalPosition
  const sizeA = shapeA.size
  const posB = colliderB.globalPosition
  const sizeB = shapeB.size

  const overlapX = Math.min(posA.x + sizeA.x, posB.x + sizeB.x) - Math.max(posA.x, posB.x)
  const overlapY = Math.min(posA.y + sizeA.y, posB.y + sizeB.y) - Math.max(posA.y, posB.y)

  if (overlapX <= 0 || overlapY <= 0) return null

  const centerA_x = posA.x + sizeA.x / 2
  const centerA_y = posA.y + sizeA.y / 2
  const centerB_x = posB.x + sizeB.x / 2
  const centerB_y = posB.y + sizeB.y / 2

  const bodyA = colliderA.parent
  const velX = bodyA && 'velocity' in bodyA ? (bodyA.velocity as Vector2).x : 0
  const velY = bodyA && 'velocity' in bodyA ? (bodyA.velocity as Vector2).y : 0

  let resolveHorizontal = false

  if (overlapX < overlapY - 0.5) {
    resolveHorizontal = true
  } else if (overlapY < overlapX - 0.5) {
    resolveHorizontal = false
  } else {
    if (Math.abs(velX) > Math.abs(velY)) {
      resolveHorizontal = true
    } else {
      resolveHorizontal = overlapX < overlapY
    }
  }

  if (resolveHorizontal) {
    const normalX = centerA_x < centerB_x ? -1 : 1
    return { overlap: vector2(normalX * overlapX, 0), normal: vector2(normalX, 0) }
  } else {
    const normalY = centerA_y < centerB_y ? -1 : 1
    return { overlap: vector2(0, normalY * overlapY), normal: vector2(0, normalY) }
  }
}

function computeCircleCircleOverlap(
  colliderA: Collider,
  colliderB: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  const shapeA = colliderA.shape
  const shapeB = colliderB.shape
  if (shapeA.type !== 'circle' || shapeB.type !== 'circle') return null

  const posA = colliderA.globalPosition
  const posB = colliderB.globalPosition
  const rA = shapeA.radius
  const rB = shapeB.radius

  const dx = posB.x - posA.x
  const dy = posB.y - posA.y
  const distSq = dx * dx + dy * dy
  const radiiSum = rA + rB

  if (distSq >= radiiSum * radiiSum) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    return { overlap: vector2(radiiSum, 0), normal: vector2(-1, 0) }
  }

  const overlapMag = radiiSum - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: vector2(-nx * overlapMag, -ny * overlapMag),
    normal: vector2(-nx, -ny),
  }
}

function computeRectCircleOverlap(
  rect: Collider,
  circle: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (rect.shape.type !== 'rectangle' || circle.shape.type !== 'circle') return null

  const rectPos = rect.globalPosition
  const rectSize = rect.shape.size
  const cx = circle.globalPosition.x
  const cy = circle.globalPosition.y
  const r = circle.shape.radius

  const closestX = clamp(rectPos.x, cx, rectPos.x + rectSize.x)
  const closestY = clamp(rectPos.y, cy, rectPos.y + rectSize.y)

  const dx = cx - closestX
  const dy = cy - closestY
  const distSq = dx * dx + dy * dy

  if (distSq >= r * r) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    const escapeLeft = cx - rectPos.x
    const escapeRight = rectPos.x + rectSize.x - cx
    const escapeTop = cy - rectPos.y
    const escapeBottom = rectPos.y + rectSize.y - cy
    const minEscape = Math.min(escapeLeft, escapeRight, escapeTop, escapeBottom)

    if (minEscape === escapeLeft)
      return { overlap: vector2(escapeLeft + r, 0), normal: vector2(-1, 0) }
    if (minEscape === escapeRight)
      return { overlap: vector2(escapeRight + r, 0), normal: vector2(1, 0) }
    if (minEscape === escapeTop)
      return { overlap: vector2(0, escapeTop + r), normal: vector2(0, -1) }
    return { overlap: vector2(0, escapeBottom + r), normal: vector2(0, 1) }
  }

  const overlapMag = r - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: vector2(-nx * overlapMag, -ny * overlapMag),
    normal: vector2(-nx, -ny),
  }
}

// ─── Capsule helpers ─────────────────────────────────────────────

function getCapsuleBone(
  shape: CapsuleShape,
  pos: { x: number; y: number },
): { ax: number; ay: number; bx: number; by: number } {
  if (shape.direction === 'vertical') {
    return {
      ax: pos.x + shape.radius,
      ay: pos.y + shape.radius,
      bx: pos.x + shape.radius,
      by: pos.y + shape.length - shape.radius,
    }
  }
  return {
    ax: pos.x + shape.radius,
    ay: pos.y + shape.radius,
    bx: pos.x + shape.length - shape.radius,
    by: pos.y + shape.radius,
  }
}

function closestPointOnSegment(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number,
): { x: number; y: number; t: number } {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return { x: ax, y: ay, t: 0 }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = clamp(0, t, 1)

  return { x: ax + t * dx, y: ay + t * dy, t }
}

function closestPointsOnSegments(
  a: { ax: number; ay: number; bx: number; by: number },
  b: { ax: number; ay: number; bx: number; by: number },
): { aX: number; aY: number; bX: number; bY: number } {
  const dAx = a.bx - a.ax
  const dAy = a.by - a.ay
  const dBx = b.bx - b.ax
  const dBy = b.by - b.ay
  const rx = a.ax - b.ax
  const ry = a.ay - b.ay

  const dotA = dAx * dAx + dAy * dAy
  const dotB = dBx * dBx + dBy * dBy
  const dotAB = dAx * dBx + dAy * dBy
  const dotAR = dAx * rx + dAy * ry
  const dotBR = dBx * rx + dBy * ry

  const denom = dotA * dotB - dotAB * dotAB
  let s: number
  let t: number

  if (denom !== 0) {
    s = (dotAB * dotBR - dotA * dotAR) / denom
    t = (dotB * dotBR - dotAB * dotAR) / denom
  } else {
    s = 0
    t = dotBR / dotB
  }

  s = clamp(0, s, 1)
  t = clamp(0, t, 1)

  if (dotA !== 0) {
    s = clamp(0, (dotAR - dotAB * t) / dotA, 1)
  }

  return {
    aX: a.ax + s * dAx,
    aY: a.ay + s * dAy,
    bX: b.ax + t * dBx,
    bY: b.ay + t * dBy,
  }
}

// ─── Capsule overlap functions ───────────────────────────────────

function computeCapsuleCapsuleOverlap(
  colliderA: Collider,
  colliderB: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (colliderA.shape.type !== 'capsule' || colliderB.shape.type !== 'capsule') return null

  const aBone = getCapsuleBone(colliderA.shape, colliderA.globalPosition)
  const bBone = getCapsuleBone(colliderB.shape, colliderB.globalPosition)

  const closest = closestPointsOnSegments(aBone, bBone)
  const dx = closest.bX - closest.aX
  const dy = closest.bY - closest.aY
  const distSq = dx * dx + dy * dy
  const radiiSum = colliderA.shape.radius + colliderB.shape.radius

  if (distSq >= radiiSum * radiiSum) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    return { overlap: vector2(radiiSum, 0), normal: vector2(-1, 0) }
  }

  const overlapMag = radiiSum - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: vector2(-nx * overlapMag, -ny * overlapMag),
    normal: vector2(-nx, -ny),
  }
}

function computeRectCapsuleOverlap(
  rect: Collider,
  capsule: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (rect.shape.type !== 'rectangle' || capsule.shape.type !== 'capsule') return null

  const bone = getCapsuleBone(capsule.shape, capsule.globalPosition)
  const rectPos = rect.globalPosition
  const rectSize = rect.shape.size
  const r = capsule.shape.radius

  const closest = closestPointOnSegment(
    bone.ax,
    bone.ay,
    bone.bx,
    bone.by,
    rectPos.x + rectSize.x / 2,
    rectPos.y + rectSize.y / 2,
  )

  const clampX = Math.max(rectPos.x, Math.min(closest.x, rectPos.x + rectSize.x))
  const clampY = Math.max(rectPos.y, Math.min(closest.y, rectPos.y + rectSize.y))

  const dx = closest.x - clampX
  const dy = closest.y - clampY
  const distSq = dx * dx + dy * dy

  if (distSq >= r * r) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    const escapeLeft = closest.x - rectPos.x
    const escapeRight = rectPos.x + rectSize.x - closest.x
    const escapeTop = closest.y - rectPos.y
    const escapeBottom = rectPos.y + rectSize.y - closest.y
    const minEscape = Math.min(escapeLeft, escapeRight, escapeTop, escapeBottom)

    if (minEscape === escapeLeft)
      return { overlap: vector2(escapeLeft + r, 0), normal: vector2(-1, 0) }
    if (minEscape === escapeRight)
      return { overlap: vector2(escapeRight + r, 0), normal: vector2(1, 0) }
    if (minEscape === escapeTop)
      return { overlap: vector2(0, escapeTop + r), normal: vector2(0, -1) }
    return { overlap: vector2(0, escapeBottom + r), normal: vector2(0, 1) }
  }

  const overlapMag = r - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: vector2(-nx * overlapMag, -ny * overlapMag),
    normal: vector2(-nx, -ny),
  }
}

function computeCircleCapsuleOverlap(
  circle: Collider,
  capsule: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (circle.shape.type !== 'circle' || capsule.shape.type !== 'capsule') return null

  const bone = getCapsuleBone(capsule.shape, capsule.globalPosition)
  const cx = circle.globalPosition.x
  const cy = circle.globalPosition.y
  const rCircle = circle.shape.radius
  const rCapsule = capsule.shape.radius

  const closest = closestPointOnSegment(bone.ax, bone.ay, bone.bx, bone.by, cx, cy)
  const dx = cx - closest.x
  const dy = cy - closest.y
  const distSq = dx * dx + dy * dy
  const radiiSum = rCircle + rCapsule

  if (distSq >= radiiSum * radiiSum) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    return { overlap: vector2(radiiSum, 0), normal: vector2(-1, 0) }
  }

  const overlapMag = radiiSum - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: vector2(-nx * overlapMag, -ny * overlapMag),
    normal: vector2(-nx, -ny),
  }
}
