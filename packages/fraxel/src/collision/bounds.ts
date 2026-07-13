import { Vector2 } from '../math/vector2.js'
import type { Collider } from '../nodes/node2d/collider.js'
import type { CapsuleShape, CircleShape, CollisionBounds, RectangleShape, Shape } from './types.js'
import { getCapsuleBone } from './utils.js'

export function getBounds(collider: Collider): CollisionBounds {
  const position = collider.globalPosition
  const rotation = collider.globalRotation
  const shape = collider.shape

  switch (shape.type) {
    case 'rectangle':
      return getBoundsByRectangle({ position, rotation, shape })
    case 'circle':
      return getBoundsByCircle({ position, rotation, shape })
    case 'capsule':
      return getBoundsByCapsule({ position, rotation, shape })
    default:
      return {
        from: Vector2.ZERO.toJSON(),
        to: Vector2.ZERO.toJSON(),
      }
  }
}

interface GetBoundsOptions<T extends Shape> {
  shape: T
  position: Vector2
  rotation: number
}

function getBoundsByRectangle({
  position,
  rotation,
  shape,
}: GetBoundsOptions<RectangleShape>): CollisionBounds {
  const w = shape.size.x
  const h = shape.size.y

  if (rotation === 0) {
    return {
      from: position.toJSON(),
      to: { x: position.x + w, y: position.y + h },
    }
  }

  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const x0 = 0
  const y0 = 0
  const x1 = w * cos
  const y1 = w * sin
  const x2 = w * cos - h * sin
  const y2 = w * sin + h * cos
  const x3 = -h * sin
  const y3 = h * cos

  const minX = Math.min(x0, x1, x2, x3)
  const maxX = Math.max(x0, x1, x2, x3)
  const minY = Math.min(y0, y1, y2, y3)
  const maxY = Math.max(y0, y1, y2, y3)

  return {
    from: { x: position.x + minX, y: position.y + minY },
    to: { x: position.x + maxX, y: position.y + maxY },
  }
}

function getBoundsByCircle({ position, shape }: GetBoundsOptions<CircleShape>): CollisionBounds {
  return {
    from: position.toSubtracted(shape.radius).toJSON(),
    to: position.toAdded(shape.radius).toJSON(),
  }
}

function getBoundsByCapsule({
  position,
  rotation,
  shape,
}: GetBoundsOptions<CapsuleShape>): CollisionBounds {
  const bone = getCapsuleBone(shape, position, rotation)
  const r = shape.radius
  const min = Vector2.min(new Vector2(bone.a), new Vector2(bone.b)).subtract(r)
  const max = Vector2.max(new Vector2(bone.a), new Vector2(bone.b)).add(r)
  return {
    from: min.toJSON(),
    to: max.toJSON(),
  }
}
