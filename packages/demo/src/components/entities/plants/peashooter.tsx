import {
  animationFromSheet,
  getGlobalPosition,
  loadSound,
  loadTexture,
  PrimaryNode,
  shapes,
  Vector2,
} from 'fraxel'
import type { PlantProps } from '../../types.js'
import { useContext, useGame, useNode, useEffect } from 'fraxel/hooks'
import { useRayCast, useAnimation } from 'fraxel/hooks'
import { RowCtx, RowProjectileSpawnerCtx } from '../../../contexts/row.js'
import { Pea } from '../projectiles/pea.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { Plant } from '../../../lib/enums/plants.js'

const PEASHOOTER_IDLE = await loadTexture('/assets/sprites/entities/plants/peashooter/idle.png')
const PEASHOOTER_SHOOT = await loadTexture('/assets/sprites/entities/plants/peashooter/shoot.png')
const THROW_SOUND = await loadSound('/assets/audios/plants/peashooter/throw.ogg')

export function Peashooter({ position, onDestroy }: PlantProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const spawnProjectile = useContext(RowProjectileSpawnerCtx)

  const sprite = useNode(PrimaryNode.Sprite)
  const { ref: anim, animName, frameIndex } = useAnimation()
  const { ref: raycast, detected } = useRayCast()
  const audio = useNode(PrimaryNode.AudioPlayer)

  const width = useGame().getSize().x

  useEffect(() => {
    if (animName() !== 'shoot') return
    if (frameIndex() === 1) shoot()
  })

  useEffect(() => {
    anim.node.setNext(detected() ? 'shoot' : 'idle')
  })

  const shoot = () => {
    audio.node.play()
    spawnProjectile(
      <Pea
        position={sprite.node.globalPosition
          .toAdded(new Vector2(10, 8))
          .subtract(getGlobalPosition(sprite.node.parent?.parent))}
      />,
    )
  }

  return (
    <transform position={position} script={new PlantScript(Plant.Peashooter)} onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={PEASHOOTER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          ref={anim}
          animations={() => ({
            idle: animationFromSheet(sprite, PEASHOOTER_IDLE, {
              columns: 4,
              duration: 1.5,
              loop: true,
            }),
            shoot: animationFromSheet(sprite, PEASHOOTER_SHOOT, {
              columns: 4,
              duration: 1.5,
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
