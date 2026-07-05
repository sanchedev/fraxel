import { Vector2 } from '../../math/vector2.js'
import type { PhysicsBody } from './physics-body.js'

/**
 * Resolves the physical response between two colliding bodies.
 * Handles separation (pushing apart) and impulse (bouncing).
 */
export function resolveCollision(
  bodyA: PhysicsBody,
  bodyB: PhysicsBody,
  overlap: Vector2,
  normal: Vector2,
): void {
  const totalMass = bodyA.mass + bodyB.mass
  if (totalMass === 0) return

  // Separation — push both bodies apart proportional to inverse mass
  if (!bodyA.isStatic && !bodyB.isStatic) {
    const ratioA = bodyB.mass / totalMass
    overlap.x *= ratioA
    overlap.y *= ratioA
  } else if (bodyA.isStatic) {
    // B gets pushed entirely
  } else if (bodyB.isStatic) {
    overlap.x = -overlap.x
    overlap.y = -overlap.y
  }

  if (!bodyA.isStatic) {
    // overlap already adjusted for A
  }
  if (!bodyB.isStatic) {
    overlap.x = -overlap.x
    overlap.y = -overlap.y
  }

  // Impulse resolution
  const relVelX = bodyA.velocity.x - bodyB.velocity.x
  const relVelY = bodyA.velocity.y - bodyB.velocity.y
  const velAlongNormal = relVelX * normal.x + relVelY * normal.y

  // Don't resolve if moving apart
  if (velAlongNormal > 0) return

  const restitution = Math.min(bodyA.bounce, bodyB.bounce)
  let j = -(1 + restitution) * velAlongNormal
  j /= 1 / bodyA.mass + 1 / bodyB.mass

  const impulseX = j * normal.x
  const impulseY = j * normal.y

  if (!bodyA.isStatic) {
    bodyA.velocity.x -= impulseX / bodyA.mass
    bodyA.velocity.y -= impulseY / bodyA.mass
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.x += impulseX / bodyB.mass
    bodyB.velocity.y += impulseY / bodyB.mass
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
  jt /= 1 / bodyA.mass + 1 / bodyB.mass
  jt = Math.max(-j * friction, Math.min(jt, j * friction))

  if (!bodyA.isStatic) {
    bodyA.velocity.x -= (jt * tx) / bodyA.mass
    bodyA.velocity.y -= (jt * ty) / bodyA.mass
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.x += (jt * tx) / bodyB.mass
    bodyB.velocity.y += (jt * ty) / bodyB.mass
  }
}

/**
 * Computes overlap and collision normal between two axis-aligned bounding boxes.
 * Returns null if no overlap.
 */
export function computeAABBOverlap(
  posA: Vector2,
  sizeA: Vector2,
  posB: Vector2,
  sizeB: Vector2,
): { overlap: Vector2; normal: Vector2 } | null {
  const overlapX = Math.min(posA.x + sizeA.x, posB.x + sizeB.x) - Math.max(posA.x, posB.x)
  const overlapY = Math.min(posA.y + sizeA.y, posB.y + sizeB.y) - Math.max(posA.y, posB.y)

  if (overlapX <= 0 || overlapY <= 0) return null

  let normalX = 0
  let normalY = 0

  if (overlapX < overlapY) {
    normalX = posA.x < posB.x ? -1 : 1
    return { overlap: new Vector2(overlapX, 0), normal: new Vector2(normalX, 0) }
  } else {
    normalY = posA.y < posB.y ? -1 : 1
    return { overlap: new Vector2(0, overlapY), normal: new Vector2(0, normalY) }
  }
}
