import {
  getGlobalPosition,
  kfFromSpriteSheet,
  loadSound,
  loadTexture,
  PrimaryNode,
  shapes,
  Vector2,
} from 'tiny-engine'
import type { PlantProps } from '../../types.js'
import { useContext, useEvent, useGame, useNode, useCondition, useEffect } from 'tiny-engine/hooks'
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

  const sprite = useNode(PrimaryNode.Sprite)
  const anim = useNode(PrimaryNode.AnimationPlayer)
  const raycast = useNode(PrimaryNode.RayCast)
  const audio = useNode(PrimaryNode.AudioPlayer)

  const width = useGame().getSize().x

  useEvent(anim, 'animationIndexChanged', (index) => {
    if (anim.node.currentAnim !== 'shoot') return
    if (index === 1 || index === 3) shoot()
  })

  const isZombieDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')

  useEffect(() => {
    anim.node.setNext(isZombieDetected() ? 'shoot' : 'idle')
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
    <transform position={position} script={new PlantScript(Plant.Repeater)} onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={REPEATER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          ref={anim}
          animations={() => ({
            idle: {
              keyframes: kfFromSpriteSheet(sprite.node, REPEATER_IDLE, 4),
              fps: 3 / 2,
              loop: true,
            },
            shoot: {
              keyframes: kfFromSpriteSheet(sprite.node, REPEATER_SHOOT, 4),
              fps: 3 / 2,
              loop: true,
            },
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
