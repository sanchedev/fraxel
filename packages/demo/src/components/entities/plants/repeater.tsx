import { animationFromSheet, getGlobalPosition, loadSound, loadTexture, shapes } from 'fraxel'
import type { PlantProps } from '../../types.js'
import { useContext, useGame, useEffect } from 'fraxel/hooks'
import { useRayCast, useAnimation, useSprite, useAudio } from 'fraxel/hooks'
import { RowCtx, RowProjectileSpawnerCtx } from '../../../contexts/row.js'
import { Pea } from '../projectiles/pea.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { Plant } from '../../../lib/enums/plants.js'

const REPEATER_IDLE = await loadTexture('/assets/sprites/entities/plants/repeater/idle.png')
const REPEATER_SHOOT = await loadTexture('/assets/sprites/entities/plants/repeater/shoot.png')
const THROW_SOUND = await loadSound('/assets/audios/plants/peashooter/throw.ogg')

export function Repeater({ position, onDestroy }: PlantProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const spawnProjectile = useContext(RowProjectileSpawnerCtx)

  const sprite = useSprite()
  const anim = useAnimation()
  const raycast = useRayCast()
  const audio = useAudio()

  const width = useGame().getSize().x

  useEffect(() => {
    if (anim.animName() !== 'shoot') return
    if (anim.frameIndex() === 1 || anim.frameIndex() === 3) shoot()
  })

  useEffect(() => {
    anim.node.setNext(raycast.detected() ? 'shoot' : 'idle')
  })

  const shoot = () => {
    audio.play()
    spawnProjectile(
      <Pea
        position={sprite.node.globalPosition
          .toAdded([10, 8])
          .subtract(getGlobalPosition(sprite.node.parent?.parent))}
      />,
    )
  }

  return (
    <transform position={position} script={new PlantScript(Plant.Repeater)} onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={REPEATER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          ref={anim}
          animations={() => ({
            idle: animationFromSheet(sprite, REPEATER_IDLE, {
              columns: 4,
              duration: 8 / 3,
              loop: true,
            }),
            shoot: animationFromSheet(sprite, REPEATER_SHOOT, {
              columns: 4,
              duration: 8 / 3,
              loop: true,
            }),
          })}
          currentAnim="idle"
        />
      </sprite>
      <ray-cast
        ref={raycast}
        position={[8, 10]}
        direction={[100, 0]}
        collidesWith={[zombiesLayer]}
        onStart={() => {
          raycast.node.direction.x = width - raycast.node.globalPosition.x
          raycast.node.direction.y = 0
        }}
      />
      <collider
        group={[plantsLayer]}
        collidesWith={[]}
        shape={shapes.rectangle(7, 9)}
        position={[4, 7]}
      />
      <audio-player ref={audio} soundId={THROW_SOUND} />
    </transform>
  )
}
