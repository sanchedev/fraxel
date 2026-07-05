import { kfFromSpriteSheet, loadTexture, PrimaryNode, shapes } from 'tiny-engine'
import type { PlantProps } from '../../types'
import { useComputed, useContext, useNode, useScript } from 'tiny-engine/hooks'
import { PlantScript } from '../../../scripts/plant/plant'
import { Plant } from '../../../lib/enums/plants'
import { RowCtx } from '../../../contexts/row'

const WALL_NUT_IDLE = await loadTexture('/assets/sprites/entities/plants/wall-nut/idle.png')

const states = {
  idle: ['idle-0', 'idle-1', 'idle-2'],
} as const

export function WallNut({ position, onDestroy }: PlantProps) {
  const { plantsLayer } = useContext(RowCtx)

  const sprite = useNode(PrimaryNode.Sprite)

  const wallNut = useNode(PrimaryNode.Transform)
  const script = useScript<PlantScript>(wallNut)

  const currentState = useComputed(() => {
    const health = script()?.health.value ?? 4000
    if (health > 3000) return 0
    if (health > 1500) return 1
    return 2
  })

  return (
    <transform
      ref={wallNut}
      position={position}
      script={new PlantScript(Plant.WallNut)}
      onDestroy={onDestroy}
    >
      <sprite ref={sprite}>
        <animation-player
          animations={() => ({
            [states.idle[0]]: {
              fps: 3 / 2,
              keyframes: kfFromSpriteSheet(sprite.node, WALL_NUT_IDLE, 2, 3, [0, 1]),
              loop: true,
            },
            [states.idle[1]]: {
              fps: 3 / 2,
              keyframes: kfFromSpriteSheet(sprite.node, WALL_NUT_IDLE, 2, 3, [2, 3]),
              loop: true,
            },
            [states.idle[2]]: {
              fps: 3 / 2,
              keyframes: kfFromSpriteSheet(sprite.node, WALL_NUT_IDLE, 2, 3, [4, 5]),
              loop: true,
            },
          })}
          currentAnim={() => states.idle[currentState()]}
        />
      </sprite>
      <collider
        position={[5, 6]}
        group={[plantsLayer]}
        collidesWith={[]}
        shape={shapes.rectangle(6, 10)}
      />
    </transform>
  )
}
