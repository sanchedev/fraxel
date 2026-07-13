import {
  shapes,
  useCollider,
  useScene,
  useTrigger,
  vector2,
  type ColorLike,
  type VectorLike,
} from 'fraxel'

interface WinAreaProps {
  position: VectorLike
  size: VectorLike
  fillColor?: ColorLike
}

export function WinArea({ position, size, fillColor }: WinAreaProps) {
  const winArea = useCollider()
  const scene = useScene()
  const shapeSize = vector2(size)

  useTrigger(winArea.colliderEntered, () => {
    void scene.change('win')
  })

  return (
    <transform position={position}>
      <geometry
        shape={shapes.rectangle(shapeSize.x, shapeSize.y)}
        fillColor={fillColor ?? [0.9, 0.72, 0.26, 1]}
      />
      <collider
        ref={winArea}
        shape={shapes.rectangle(shapeSize.x, shapeSize.y)}
        group="winArea"
        collidesWith="player"
      />
    </transform>
  )
}
