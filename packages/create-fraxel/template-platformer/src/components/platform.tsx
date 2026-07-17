import { shapes, vector2, type ColorLike, type VectorLike } from 'fraxel'
import { Layers } from '../layers'

interface PlatformProps {
  position: VectorLike
  size: VectorLike
  fillColor?: ColorLike
}

export function Platform({ position, size, fillColor }: PlatformProps) {
  const shapeSize = vector2(size)

  return (
    <body position={position} isStatic layer={Layers.Platform} mask={Layers.Player}>
      <geometry
        shape={shapes.rectangle(shapeSize.x, shapeSize.y)}
        fillColor={fillColor ?? [0.32, 0.47, 0.4, 1]}
      />
      <collider shape={shapes.rectangle(shapeSize.x, shapeSize.y)} />
    </body>
  )
}
