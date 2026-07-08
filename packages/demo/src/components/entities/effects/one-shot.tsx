import { animationFromSheet, type VectorLike } from 'fraxel'
import { useSprite } from 'fraxel/hooks'

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
  const sprite = useSprite()

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
