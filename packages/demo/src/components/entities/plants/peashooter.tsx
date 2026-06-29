import {
  kfFromSpriteSheet,
  loadTexture,
  PrimaryNode,
  shapes,
  Vector2,
} from 'tiny-engine'
import type { InRowProps } from '../../types.js'
import {
  useContext,
  useEvent,
  useGame,
  useMount,
  useRefNode,
  useSignal,
} from 'tiny-engine/hooks'
import { PeashooterScript } from '../../../scripts/plant/peashooter.js'
import { RowCtx, RowProjectileSpawnerCtx } from '../../../contexts/row.js'
import { Pea } from '../projectiles/pea.js'

const PEASHOOTER_IDLE = await loadTexture(
  '/assets/sprites/entities/plants/peashooter/idle.png',
)
const PEASHOOTER_SHOOT = await loadTexture(
  '/assets/sprites/entities/plants/peashooter/shoot.png',
)

interface PeashooterProps extends InRowProps {}

export function Peashooter({ position }: PeashooterProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const spawnProjectile = useContext(RowProjectileSpawnerCtx)

  const sprite = useRefNode(PrimaryNode.Sprite)
  const anim = useRefNode(PrimaryNode.AnimationPlayer)
  const raycast = useRefNode(PrimaryNode.RayCast)

  const width = useGame().getSize().x

  const isZombieDetected = useSignal(false)

  useMount(() => {
    anim.node
      .define({
        idle: {
          keyframes: kfFromSpriteSheet(sprite.node, PEASHOOTER_IDLE, 4),
          fps: 8 / 3,
        },
        shoot: {
          keyframes: kfFromSpriteSheet(sprite.node, PEASHOOTER_SHOOT, 4),
          fps: 8 / 3,
        },
      })
      .play('idle')
  })

  useEvent(anim, 'animationEnded', () => {
    anim.node.setNext(isZombieDetected.value ? 'shoot' : 'idle')
  })

  useEvent(anim, 'animationIndexChanged', (index) => {
    if (anim.node.currentAnim !== 'shoot') return
    if (index === 1) shoot()
  })

  useEvent(raycast, 'colliderEntered', () => {
    isZombieDetected.value = true
  })

  useEvent(raycast, 'colliderExited', () => {
    isZombieDetected.value = false
  })

  const shoot = () => {
    spawnProjectile(
      <Pea
        position={sprite.node.globalPosition
          .toAdded(new Vector2(10, 8))
          .subtract(sprite.node.parent?.parent?.globalPosition ?? Vector2.ZERO)}
      />,
    )
  }

  return (
    <transform position={position} script={new PeashooterScript()}>
      <sprite ref={sprite} textureId={PEASHOOTER_IDLE} sourceSize={[16, 16]}>
        <animation-player ref={anim} />
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
