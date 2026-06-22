import {
  kfFromSpriteSheet,
  loadTexture,
  PrimaryNode,
  Vector2,
} from 'tiny-engine'
import type { PlantProps } from '../types.js'
import {
  useEffect,
  useEvent,
  useMount,
  useRefNode,
  useSignal,
} from 'tiny-engine/hooks'
import { PeashooterScript } from '../../scripts/peashooter.js'

const PEASHOOTER_IDLE = await loadTexture(
  '/assets/sprites/plants/peashooter/idle.png',
)
const PEASHOOTER_SHOOT = await loadTexture(
  '/assets/sprites/plants/peashooter/shoot.png',
)

interface PeashooterProps extends PlantProps {}

export function Peashooter({ position }: PeashooterProps) {
  const sprite = useRefNode(PrimaryNode.Sprite)
  const anim = useRefNode(PrimaryNode.AnimationPlayer)

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

  useEffect(() => {
    anim.node.setNext(isZombieDetected.value ? 'shoot' : 'idle')
  }, [isZombieDetected])

  useEvent(anim, 'animationEnded', () => {
    isZombieDetected.value = !isZombieDetected.value
  })

  return (
    <transform position={position} script={new PeashooterScript()}>
      <sprite
        ref={sprite}
        textureId={PEASHOOTER_IDLE}
        sourceSize={new Vector2(16, 16)}>
        <animation-player ref={anim} />
      </sprite>
    </transform>
  )
}
