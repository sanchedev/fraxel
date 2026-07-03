import {
  getGlobalPosition,
  kfFromSpriteSheet,
  loadTexture,
  PrimaryNode,
  shapes,
  Vector2,
} from 'tiny-engine'
import type { PlantProps } from '../../types.js'
import {
  useContext,
  useEvent,
  useGame,
  useNode,
  useCondition,
  useEffect,
} from 'tiny-engine/hooks'
import { RowCtx, RowProjectileSpawnerCtx } from '../../../contexts/row.js'
import { Pea } from '../projectiles/pea.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { Plant } from '../../../lib/enums/plants.js'

const PEASHOOTER_IDLE = await loadTexture(
  '/assets/sprites/entities/plants/peashooter/idle.png',
)
const PEASHOOTER_SHOOT = await loadTexture(
  '/assets/sprites/entities/plants/peashooter/shoot.png',
)

export function Peashooter({ position, onDestroy }: PlantProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const spawnProjectile = useContext(RowProjectileSpawnerCtx)

  const sprite = useNode(PrimaryNode.Sprite)
  const anim = useNode(PrimaryNode.AnimationPlayer)
  const raycast = useNode(PrimaryNode.RayCast)

  const width = useGame().getSize().x

  useEvent(anim, 'animationIndexChanged', (index) => {
    if (anim.node.currentAnim !== 'shoot') return
    if (index === 1) shoot()
  })

  const isZombieDetected = useCondition(
    raycast,
    'colliderEntered',
    'colliderExited',
  )

  useEffect(() => {
    anim.node.setNext(isZombieDetected() ? 'shoot' : 'idle')
  })

  const shoot = () => {
    spawnProjectile(
      <Pea
        position={sprite.node.globalPosition
          .toAdded(new Vector2(10, 8))
          .subtract(getGlobalPosition(sprite.node.parent?.parent))}
      />,
    )
  }

  return (
    <transform
      position={position}
      script={new PlantScript(Plant.Peashooter)}
      onDestroy={onDestroy}>
      <sprite ref={sprite} textureId={PEASHOOTER_IDLE} sourceSize={[16, 16]}>
        <animation-player
          ref={anim}
          animations={() => ({
            idle: {
              keyframes: kfFromSpriteSheet(sprite.node, PEASHOOTER_IDLE, 4),
              fps: 8 / 3,
            },
            shoot: {
              keyframes: kfFromSpriteSheet(sprite.node, PEASHOOTER_SHOOT, 4),
              fps: 8 / 3,
            },
          })}
          currentAnim='idle'
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
    </transform>
  )
}
