import {
  shapes,
  useDetector,
  useScene,
  useTrigger,
  vector2,
  type ColorLike,
  type VectorLike,
} from 'fraxel'
import { Layers } from '../layers'

interface WinAreaProps {
  position: VectorLike
  size: VectorLike
  fillColor?: ColorLike
}

export function WinArea({ position, size, fillColor }: WinAreaProps) {
  const winArea = useDetector()
  const scene = useScene()
  const shapeSize = vector2(size)

  useTrigger(winArea.onBodyEnter, () => {
    void scene.change('win')
  })

  return (
    <detector ref={winArea} position={position} layer={Layers.WinArea} mask={Layers.Player}>
      <geometry
        shape={shapes.rectangle(shapeSize.x, shapeSize.y)}
        fillColor={fillColor ?? [0.9, 0.72, 0.26, 1]}
      />
      <collider shape={shapes.rectangle(shapeSize.x, shapeSize.y)} />
    </detector>
  )
}
