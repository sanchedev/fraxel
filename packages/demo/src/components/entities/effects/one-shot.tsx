import { kfFromSpriteSheet, PrimaryNode, type VectorLike } from 'tiny-engine'
import { useRefNode } from 'tiny-engine/hooks'

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
  const sprite = useRefNode(PrimaryNode.Sprite)

  return (
    <animation-player
      animations={() => ({
        play: {
          fps,
          keyframes: kfFromSpriteSheet(
            sprite.node,
            textureId,
            spriteCountX,
            spriteCountY,
          ),
        },
      })}
      currentAnim='play'
      destroyOnEnd>
      <sprite ref={sprite} textureId={textureId} position={position} />
    </animation-player>
  )
}
