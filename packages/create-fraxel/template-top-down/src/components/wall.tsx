import { shapes, vector2, type ColorLike, type VectorLike } from 'fraxel'
import { Layers } from '../layers'

interface WallProps {
  position: VectorLike
  size: VectorLike
  fillColor?: ColorLike
}

export function Wall({ position, size, fillColor }: WallProps) {
  const shapeSize = vector2(size)

  return (
    <body position={position} isStatic layer={Layers.Wall} mask={Layers.Player}>
      <geometry
        shape={shapes.rectangle(shapeSize.x, shapeSize.y)}
        fillColor={fillColor ?? [0.22, 0.28, 0.36, 1]}
      />
      <collider shape={shapes.rectangle(shapeSize.x, shapeSize.y)} />
    </body>
  )
}
