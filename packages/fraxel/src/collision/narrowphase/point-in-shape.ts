import { getCapsuleBone } from '../utils.js'
import type { Shape } from './shapes.js'

interface Point {
  x: number
  y: number
}

export function pointInShape(
  point: Point,
  position: Point,
  rotation: number,
  shape: Shape,
): boolean {
  if (shape.type === 'rectangle') {
    const local = toLocalPoint(point, position, rotation)
    return local.x >= 0 && local.x <= shape.size.x && local.y >= 0 && local.y <= shape.size.y
  }

  if (shape.type === 'circle') {
    const dx = point.x - position.x
    const dy = point.y - position.y
    return dx * dx + dy * dy <= shape.radius * shape.radius
  }

  const bone = getCapsuleBone(shape, position, rotation)
  return distanceToSegmentSquared(point, bone.a, bone.b) <= shape.radius * shape.radius
}

function toLocalPoint(point: Point, origin: Point, rotation: number): Point {
  if (rotation === 0) return { x: point.x - origin.x, y: point.y - origin.y }

  const rad = (-rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = point.x - origin.x
  const dy = point.y - origin.y
  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos,
  }
}

function distanceToSegmentSquared(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSq = dx * dx + dy * dy

  if (lengthSq === 0) {
    const px = point.x - a.x
    const py = point.y - a.y
    return px * px + py * py
  }

  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq))
  const closestX = a.x + t * dx
  const closestY = a.y + t * dy
  const px = point.x - closestX
  const py = point.y - closestY
  return px * px + py * py
}
