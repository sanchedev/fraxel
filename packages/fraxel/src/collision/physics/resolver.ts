import { vector2, Vector2 } from '../../math/vector2.js'
import { clamp } from '../../math/utils.js'
import type { RigidBody } from '../../nodes/index.js'
import type { Collider } from '../../nodes/node2d/collider.js'
import { worldToLocal, localToWorld, getCapsuleBone, obbRectOverlap } from '../utils.js'

/**
 * The **`resolveCollision`** function corrects overlap between two rigid bodies and applies impulse-based velocity changes.
 * @param bodyA The first rigid body
 * @param bodyB The second rigid body
 * @param overlap The overlap vector from B to A (world space)
 * @param normal The collision normal from B to A (world space)
 * @returns The position correction applied to body A (local space)
 */
export function resolveCollision(
  bodyA: RigidBody,
  bodyB: RigidBody,
  overlap: Vector2,
  normal: Vector2,
): Vector2 {
  const invMassA = Math.max(0, bodyA.isStatic || bodyA.mass === 0 ? 0 : 1 / bodyA.mass)
  const invMassB = Math.max(0, bodyB.isStatic || bodyB.mass === 0 ? 0 : 1 / bodyB.mass)
  const totalInvMass = invMassA + invMassB

  if (totalInvMass === 0) return vector2(0, 0)

  const ratioA = invMassA / totalInvMass
  const ratioB = invMassB / totalInvMass

  const localOverlapA = worldToLocal(bodyA, overlap)
  const localOverlapB = worldToLocal(bodyB, overlap)

  bodyA.position.x += localOverlapA.x * ratioA
  bodyA.position.y += localOverlapA.y * ratioA
  bodyB.position.x -= localOverlapB.x * ratioB
  bodyB.position.y -= localOverlapB.y * ratioB

  const worldVelA = localToWorld(bodyA, bodyA.velocity)
  const worldVelB = localToWorld(bodyB, bodyB.velocity)
  const relVelX = worldVelA.x - worldVelB.x
  const relVelY = worldVelA.y - worldVelB.y
  const velAlongNormal = relVelX * normal.x + relVelY * normal.y

  if (velAlongNormal > 0) return localOverlapA

  const restitution = Math.min(bodyA.bounce, bodyB.bounce)
  let j = -(1 + restitution) * velAlongNormal
  j /= totalInvMass

  const impulseX = j * normal.x
  const impulseY = j * normal.y

  const localImpulseA = worldToLocal(bodyA, vector2(impulseX, impulseY))
  const localImpulseB = worldToLocal(bodyB, vector2(impulseX, impulseY))

  if (!bodyA.isStatic) {
    bodyA.velocity.x += localImpulseA.x * invMassA
    bodyA.velocity.y += localImpulseA.y * invMassA
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.x -= localImpulseB.x * invMassB
    bodyB.velocity.y -= localImpulseB.y * invMassB
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

    const localTangentA = worldToLocal(bodyA, vector2(tx, ty))
    const localTangentB = worldToLocal(bodyB, vector2(tx, ty))

    if (!bodyA.isStatic) {
      bodyA.velocity.x += jt * localTangentA.x * invMassA
      bodyA.velocity.y += jt * localTangentA.y * invMassA
    }
    if (!bodyB.isStatic) {
      bodyB.velocity.x -= jt * localTangentB.x * invMassB
      bodyB.velocity.y -= jt * localTangentB.y * invMassB
    }
  }

  return localOverlapA
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

  const result = obbRectOverlap(
    colliderA.globalPosition,
    shapeA.size,
    colliderA.globalRotation,
    colliderB.globalPosition,
    shapeB.size,
    colliderB.globalRotation,
  )
  if (!result) return null

  return {
    overlap: vector2(result.overlap.x, result.overlap.y),
    normal: vector2(result.normal.x, result.normal.y),
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

  const w = rect.shape.size.x
  const h = rect.shape.size.y
  const angle = (rect.globalRotation * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const cx = rect.globalPosition.x
  const cy = rect.globalPosition.y

  const circleCx = circle.globalPosition.x
  const circleCy = circle.globalPosition.y
  const r = circle.shape.radius

  const dx = circleCx - cx
  const dy = circleCy - cy
  const localX = dx * cos + dy * sin
  const localY = -dx * sin + dy * cos

  const clampedX = Math.max(0, Math.min(w, localX))
  const clampedY = Math.max(0, Math.min(h, localY))

  const isInside = localX === clampedX && localY === clampedY

  let overlapMag: number
  let nx: number
  let ny: number

  if (isInside) {
    const distRight = w - localX
    const distLeft = localX
    const distBottom = h - localY
    const distTop = localY

    let minEdge = distRight
    let localNx = 1
    let localNy = 0

    if (distLeft < minEdge) {
      minEdge = distLeft
      localNx = -1
      localNy = 0
    }
    if (distBottom < minEdge) {
      minEdge = distBottom
      localNx = 0
      localNy = 1
    }
    if (distTop < minEdge) {
      minEdge = distTop
      localNx = 0
      localNy = -1
    }

    overlapMag = minEdge + r

    const worldNx = localNx * cos - localNy * sin
    const worldNy = localNx * sin + localNy * cos
    nx = -worldNx
    ny = -worldNy
  } else {
    const localDx = localX - clampedX
    const localDy = localY - clampedY
    const distSq = localDx * localDx + localDy * localDy

    if (distSq >= r * r) return null

    const dist = Math.sqrt(distSq)
    overlapMag = r - dist

    if (dist < 0.0001) {
      return { overlap: vector2(r, 0), normal: vector2(-1, 0) }
    }

    const worldDx = circleCx - (cx + clampedX * cos - clampedY * sin)
    const worldDy = circleCy - (cy + clampedX * sin + clampedY * cos)

    nx = -(worldDx / dist)
    ny = -(worldDy / dist)
  }

  return {
    overlap: vector2(nx * overlapMag, ny * overlapMag),
    normal: vector2(nx, ny),
  }
}

// ─── Capsule helpers ─────────────────────────────────────────────

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
  a: { a: { x: number; y: number }; b: { x: number; y: number } },
  b: { a: { x: number; y: number }; b: { x: number; y: number } },
): { aX: number; aY: number; bX: number; bY: number } {
  const dAx = a.b.x - a.a.x
  const dAy = a.b.y - a.a.y
  const dBx = b.b.x - b.a.x
  const dBy = b.b.y - b.a.y
  const rx = a.a.x - b.a.x
  const ry = a.a.y - b.a.y

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
    aX: a.a.x + s * dAx,
    aY: a.a.y + s * dAy,
    bX: b.a.x + t * dBx,
    bY: b.a.y + t * dBy,
  }
}

// ─── Capsule overlap functions ───────────────────────────────────

function computeCapsuleCapsuleOverlap(
  colliderA: Collider,
  colliderB: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (colliderA.shape.type !== 'capsule' || colliderB.shape.type !== 'capsule') return null

  const aBone = getCapsuleBone(colliderA.shape, colliderA.globalPosition, colliderA.globalRotation)
  const bBone = getCapsuleBone(colliderB.shape, colliderB.globalPosition, colliderB.globalRotation)

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

  const w = rect.shape.size.x
  const h = rect.shape.size.y
  const angle = (rect.globalRotation * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const cx = rect.globalPosition.x
  const cy = rect.globalPosition.y

  const localVerts = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]

  const verts = localVerts.map((v) => ({
    x: cx + v.x * cos - v.y * sin,
    y: cy + v.x * sin + v.y * cos,
  }))

  const rectAxes = [
    { x: cos, y: sin },
    { x: -sin, y: cos },
  ]

  const bone = getCapsuleBone(capsule.shape, capsule.globalPosition, capsule.globalRotation)
  const r = capsule.shape.radius

  const boneDx = bone.b.x - bone.a.x
  const boneDy = bone.b.y - bone.a.y
  const boneLen = Math.sqrt(boneDx * boneDx + boneDy * boneDy)

  const axesToTest = [...rectAxes]
  if (boneLen > 0.0001) {
    axesToTest.push({ x: -boneDy / boneLen, y: boneDx / boneLen })
  }

  // VORONOI FILTER: Only test corner axes if the capsule endpoint is actually near that corner.
  for (const p of [bone.a, bone.b]) {
    const pdx = p.x - cx
    const pdy = p.y - cy
    const localX = pdx * cos + pdy * sin
    const localY = -pdx * sin + pdy * cos

    if (localX < 0 && localY < 0) {
      const cornerWorldX = cx
      const cornerWorldY = cy
      const cdx = p.x - cornerWorldX
      const cdy = p.y - cornerWorldY
      const cLen = Math.sqrt(cdx * cdx + cdy * cdy)
      if (cLen > 0.0001) {
        axesToTest.push({ x: cdx / cLen, y: cdy / cLen })
      }
    } else if (localX > w && localY < 0) {
      const cornerWorldX = cx + w * cos
      const cornerWorldY = cy + w * sin
      const cdx = p.x - cornerWorldX
      const cdy = p.y - cornerWorldY
      const cLen = Math.sqrt(cdx * cdx + cdy * cdy)
      if (cLen > 0.0001) {
        axesToTest.push({ x: cdx / cLen, y: cdy / cLen })
      }
    } else if (localX > w && localY > h) {
      const cornerWorldX = cx + w * cos - h * sin
      const cornerWorldY = cy + w * sin + h * cos
      const cdx = p.x - cornerWorldX
      const cdy = p.y - cornerWorldY
      const cLen = Math.sqrt(cdx * cdx + cdy * cdy)
      if (cLen > 0.0001) {
        axesToTest.push({ x: cdx / cLen, y: cdy / cLen })
      }
    } else if (localX < 0 && localY > h) {
      const cornerWorldX = cx - h * sin
      const cornerWorldY = cy + h * cos
      const cdx = p.x - cornerWorldX
      const cdy = p.y - cornerWorldY
      const cLen = Math.sqrt(cdx * cdx + cdy * cdy)
      if (cLen > 0.0001) {
        axesToTest.push({ x: cdx / cLen, y: cdy / cLen })
      }
    }
  }

  let minOverlap = Infinity
  let smallestAxis = { x: 0, y: 0 }

  for (const axis of axesToTest) {
    let rectMin = Infinity
    let rectMax = -Infinity
    for (const v of verts) {
      const proj = v.x * axis.x + v.y * axis.y
      if (proj < rectMin) rectMin = proj
      if (proj > rectMax) rectMax = proj
    }

    const p1 = bone.a.x * axis.x + bone.a.y * axis.y
    const p2 = bone.b.x * axis.x + bone.b.y * axis.y
    const capMin = Math.min(p1, p2) - r
    const capMax = Math.max(p1, p2) + r

    if (rectMax <= capMin || capMax <= rectMin) {
      return null // We found a TRUE separating axis
    }

    const overlap1 = rectMax - capMin
    const overlap2 = capMax - rectMin
    const overlap = Math.min(overlap1, overlap2)

    if (overlap < minOverlap) {
      minOverlap = overlap

      const capCx = (bone.a.x + bone.b.x) / 2
      const capCy = (bone.a.y + bone.b.y) / 2
      const rectCx = cx + (w * cos - h * sin) / 2
      const rectCy = cy + (w * sin + h * cos) / 2
      const dirX = rectCx - capCx
      const dirY = rectCy - capCy

      const finalAxis = { x: axis.x, y: axis.y }
      if (dirX * axis.x + dirY * axis.y < 0) {
        finalAxis.x = -axis.x
        finalAxis.y = -axis.y
      }
      smallestAxis = finalAxis
    }
  }

  return {
    overlap: vector2(smallestAxis.x * minOverlap, smallestAxis.y * minOverlap),
    normal: vector2(smallestAxis.x, smallestAxis.y),
  }
}

function computeCircleCapsuleOverlap(
  circle: Collider,
  capsule: Collider,
): { overlap: Vector2; normal: Vector2 } | null {
  if (circle.shape.type !== 'circle' || capsule.shape.type !== 'capsule') return null

  const bone = getCapsuleBone(capsule.shape, capsule.globalPosition, capsule.globalRotation)
  const cx = circle.globalPosition.x
  const cy = circle.globalPosition.y
  const rCircle = circle.shape.radius
  const rCapsule = capsule.shape.radius

  const closest = closestPointOnSegment(bone.a.x, bone.a.y, bone.b.x, bone.b.y, cx, cy)
  const dx = closest.x - cx
  const dy = closest.y - cy
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
