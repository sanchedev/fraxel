import { animationFromSheet, PrimaryNode, type VectorLike } from 'tiny-engine'
import { useNode } from 'tiny-engine/hooks'

interface OneShotProps {
  textureId: symbol
  position?: VectorLike
  spriteCountX?: number
  spriteCountY?: number
  fps: number
}

export function OneShot({
  textureId,
  position,
  spriteCountX = 1,
  spriteCountY = 1,
  fps,
}: OneShotProps) {
  const sprite = useNode(PrimaryNode.Sprite)

  const totalFrames = spriteCountX * spriteCountY
  const duration = totalFrames / fps

  return (
    <animation-player
      animations={() => ({
        play: animationFromSheet(sprite, textureId, {
          columns: spriteCountX,
          rows: spriteCountY,
          duration,
        }),
      })}
      currentAnim="play"
      destroyOnEnd
    >
      <sprite ref={sprite} textureId={textureId} position={position} />
    </animation-player>
  )
}
