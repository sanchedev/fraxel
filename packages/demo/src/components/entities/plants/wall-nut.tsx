import { animationFromSheet, loadTexture, PrimaryNode, shapes } from 'diny'
import type { PlantProps } from '../../types'
import { useComputed, useContext, useNode, useScript } from 'diny/hooks'
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
    const health = script()?.health.getter() ?? 4000
    if (health > 3000) return 0
    if (health > 1500) return 1
    return 2
  })

  const currentAnim = useComputed(() => states.idle[currentState()])

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
            [states.idle[0]]: animationFromSheet(sprite, WALL_NUT_IDLE, {
              columns: 2,
              rows: 3,
              range: [0, 1],
              duration: 2,
              loop: true,
            }),
            [states.idle[1]]: animationFromSheet(sprite, WALL_NUT_IDLE, {
              columns: 2,
              rows: 3,
              range: [2, 3],
              duration: 2,
              loop: true,
            }),
            [states.idle[2]]: animationFromSheet(sprite, WALL_NUT_IDLE, {
              columns: 2,
              rows: 3,
              range: [4, 5],
              duration: 2,
              loop: true,
            }),
          })}
          currentAnim={currentAnim}
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
