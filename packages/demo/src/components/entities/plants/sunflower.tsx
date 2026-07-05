import { kfFromSpriteSheet, loadTexture, PrimaryNode, shapes } from 'tiny-engine'
import type { PlantProps } from '../../types'
import { useContext, useNode, useSpawn, useTimer } from 'tiny-engine/hooks'
import { PlantScript } from '../../../scripts/plant/plant'
import { Plant } from '../../../lib/enums/plants'
import { RowCtx } from '../../../contexts/row'
import { Sun } from '../../sun/sun'

const SUNFLOWER_IDLE = await loadTexture('/assets/sprites/entities/plants/sunflower/idle.png')

export function Sunflower({ position, onDestroy }: PlantProps) {
  const { plantsLayer } = useContext(RowCtx)

  const sprite = useNode(PrimaryNode.Sprite)
  const sunContainer = useNode(PrimaryNode.Transform)
  const spawnSun = useSpawn(sunContainer)
  const timer = useTimer()

  return (
    <transform position={position} script={new PlantScript(Plant.Sunflower)} onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={SUNFLOWER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          animations={() => ({
            idle: {
              keyframes: kfFromSpriteSheet(sprite.node, SUNFLOWER_IDLE, 3),
              fps: 3 / 2,
              loop: true,
            },
          })}
          currentAnim="idle"
        />
      </sprite>
      <transform ref={sunContainer} />
      <timer
        ref={timer.ref}
        duration={8}
        autoPlay
        onTimeout={() => {
          spawnSun(<Sun position={[0, -4]} />)
          timer.play()
        }}
      />
      <collider
        position={[5, 6]}
        group={[plantsLayer]}
        collidesWith={[]}
        shape={shapes.rectangle(6, 10)}
      />
    </transform>
  )
}
