import { Vector2 } from '../../math/vector2.js'
import type { RigidBody } from '../../nodes/index.js'
import type { Collider } from '../../nodes/node2d/collider.js'

/**
 * Resolves the physical response between two colliding bodies.
 * Handles separation (pushing apart) and impulse (bouncing).
 */
export function resolveCollision(
  bodyA: RigidBody,
  bodyB: RigidBody,
  overlap: Vector2,
  normal: Vector2,
): void {
  const totalInvMass = (bodyA.isStatic ? 0 : 1 / bodyA.mass) + (bodyB.isStatic ? 0 : 1 / bodyB.mass)
  if (totalInvMass === 0) return

  // Separation — push both bodies apart proportional to inverse mass
  const ratioA = bodyA.isStatic ? 0 : 1 / bodyA.mass / totalInvMass
  const ratioB = bodyB.isStatic ? 0 : 1 / bodyB.mass / totalInvMass

  bodyA.position.x += overlap.x * ratioA
  bodyA.position.y += overlap.y * ratioA
  bodyB.position.x -= overlap.x * ratioB
  bodyB.position.y -= overlap.y * ratioB

  // Impulse resolution
  const relVelX = bodyA.velocity.x - bodyB.velocity.x
  const relVelY = bodyA.velocity.y - bodyB.velocity.y
  const velAlongNormal = relVelX * normal.x + relVelY * normal.y

  // Don't resolve if moving apart
  if (velAlongNormal > 0) return

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

  // Friction
  const tangentX = relVelX - velAlongNormal * normal.x
  const tangentY = relVelY - velAlongNormal * normal.y
  const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
  if (tangentLen < 0.0001) return

  const tx = tangentX / tangentLen
  const ty = tangentY / tangentLen
  const friction = Math.sqrt(bodyA.friction * bodyB.friction)

  let jt = -(relVelX * tx + relVelY * ty)
  jt /= totalInvMass
  jt = Math.max(-j * friction, Math.min(jt, j * friction))

  if (!bodyA.isStatic) {
    bodyA.velocity.x += (jt * tx) / bodyA.mass
    bodyA.velocity.y += (jt * ty) / bodyA.mass
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.x -= (jt * tx) / bodyB.mass
    bodyB.velocity.y -= (jt * ty) / bodyB.mass
  }

  // Stop velocity along normal for resting contacts
  const velA_n = bodyA.velocity.x * normal.x + bodyA.velocity.y * normal.y
  if (!bodyA.isStatic && velA_n < 0) {
    bodyA.velocity.x -= velA_n * normal.x
    bodyA.velocity.y -= velA_n * normal.y
  }
  const velB_n = bodyB.velocity.x * normal.x + bodyB.velocity.y * normal.y
  if (!bodyB.isStatic && velB_n > 0) {
    bodyB.velocity.x -= velB_n * normal.x
    bodyB.velocity.y -= velB_n * normal.y
  }
}

/**
 * Computes overlap and collision normal between two colliders.
 * Handles rectangle-rectangle, circle-circle, and rectangle-circle pairs.
 * Returns null if no overlap.
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

  if (overlapX < overlapY) {
    const normalX = posA.x < posB.x ? -1 : 1
    return { overlap: new Vector2(-overlapX, 0), normal: new Vector2(normalX, 0) }
  }
  const normalY = posA.y < posB.y ? -1 : 1
  return { overlap: new Vector2(0, -overlapY), normal: new Vector2(0, normalY) }
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
    // Circles nearly coincident — push along arbitrary axis
    return { overlap: new Vector2(radiiSum, 0), normal: new Vector2(-1, 0) }
  }

  const overlapMag = radiiSum - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: new Vector2(nx * overlapMag, ny * overlapMag),
    normal: new Vector2(-nx, -ny),
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

  // Closest point on rectangle to circle center
  const closestX = Math.max(rectPos.x, Math.min(cx, rectPos.x + rectSize.x))
  const closestY = Math.max(rectPos.y, Math.min(cy, rectPos.y + rectSize.y))

  const dx = cx - closestX
  const dy = cy - closestY
  const distSq = dx * dx + dy * dy

  if (distSq >= r * r) return null

  const dist = Math.sqrt(distSq)
  if (dist < 0.0001) {
    // Circle center inside rectangle — find minimum escape axis
    const escapeLeft = cx - rectPos.x
    const escapeRight = rectPos.x + rectSize.x - cx
    const escapeTop = cy - rectPos.y
    const escapeBottom = rectPos.y + rectSize.y - cy
    const minEscape = Math.min(escapeLeft, escapeRight, escapeTop, escapeBottom)

    if (minEscape === escapeLeft)
      return { overlap: new Vector2(escapeLeft + r, 0), normal: new Vector2(-1, 0) }
    if (minEscape === escapeRight)
      return { overlap: new Vector2(escapeRight + r, 0), normal: new Vector2(1, 0) }
    if (minEscape === escapeTop)
      return { overlap: new Vector2(0, escapeTop + r), normal: new Vector2(0, -1) }
    return { overlap: new Vector2(0, escapeBottom + r), normal: new Vector2(0, 1) }
  }

  const overlapMag = r - dist
  const nx = dx / dist
  const ny = dy / dist

  return {
    overlap: new Vector2(nx * overlapMag, ny * overlapMag),
    normal: new Vector2(-nx, -ny),
  }
}
