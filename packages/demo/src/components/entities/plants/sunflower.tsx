import { animationFromSheet, loadTexture, shapes } from 'fraxel'
import type { PlantProps } from '../../types'
import { useContext, useSprite, useTransform, useTimer } from 'fraxel/hooks'
import { PlantScript } from '../../../scripts/plant/plant'
import { Plant } from '../../../lib/enums/plants'
import { RowCtx } from '../../../contexts/row'
import { Sun } from '../../sun/sun'

const SUNFLOWER_IDLE = await loadTexture('/assets/sprites/entities/plants/sunflower/idle.png')

export function Sunflower({ position, onDestroy }: PlantProps) {
  const { plantsLayer } = useContext(RowCtx)

  const sprite = useSprite()
  const sunContainer = useTransform()
  const timer = useTimer()

  return (
    <transform position={position} script={new PlantScript(Plant.Sunflower)} onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={SUNFLOWER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          animations={() => ({
            idle: animationFromSheet(sprite, SUNFLOWER_IDLE, {
              columns: 3,
              duration: 2,
              loop: true,
            }),
          })}
          currentAnim="idle"
        />
      </sprite>
      <transform ref={sunContainer} />
      <timer
        ref={timer}
        duration={8}
        autoPlay
        onTimeout={() => {
          sunContainer.spawn(<Sun position={[0, -4]} />)
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
