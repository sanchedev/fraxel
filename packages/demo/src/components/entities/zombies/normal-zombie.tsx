import {
  kfFromSpriteSheet,
  loadTexture,
  PrimaryNode,
  shapes,
} from 'tiny-engine'
import type { InRowProps } from '../../types.js'
import {
  useContext,
  useEffect,
  useEvent,
  useMount,
  useRefNode,
  useSignal,
} from 'tiny-engine/hooks'
import { RowCtx } from '../../../contexts/row.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { NormalZombieScript } from '../../../scripts/zombie/normal-zombie.js'
import { BoardCtx } from '../../../contexts/board.js'

const NORMAL_ZOMBIE_WALK_0 = await loadTexture(
  '/assets/sprites/entities/zombies/normal-zombie/walk-0.png',
)
const NORMAL_ZOMBIE_WALK_1 = await loadTexture(
  '/assets/sprites/entities/zombies/normal-zombie/walk-1.png',
)
const NORMAL_ZOMBIE_EAT_0 = await loadTexture(
  '/assets/sprites/entities/zombies/normal-zombie/eat-0.png',
)
const NORMAL_ZOMBIE_EAT_1 = await loadTexture(
  '/assets/sprites/entities/zombies/normal-zombie/eat-1.png',
)
const states = {
  walk: ['walk-0', 'walk-1'],
  eat: ['eat-0', 'eat-1'],
} as const

interface NormalZombieProps extends InRowProps {}

export function NormalZombie({ position }: NormalZombieProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const { cellSize } = useContext(BoardCtx)

  const zombie = useRefNode(PrimaryNode.Transform)
  const sprite = useRefNode(PrimaryNode.Sprite)
  const anim = useRefNode(PrimaryNode.AnimationPlayer)
  const raycast = useRefNode(PrimaryNode.RayCast)

  const currentState = useSignal<number>(0)
  const currentPlant = useSignal<PlantScript | null>(null)

  useMount(() => {
    anim.node
      .define({
        [states.walk[0]]: {
          keyframes: kfFromSpriteSheet(sprite.node, NORMAL_ZOMBIE_WALK_0, 4),
          fps: 4,
          loop: true,
        },
        [states.walk[1]]: {
          keyframes: kfFromSpriteSheet(sprite.node, NORMAL_ZOMBIE_WALK_1, 4),
          fps: 4,
          loop: true,
        },
        [states.eat[0]]: {
          keyframes: kfFromSpriteSheet(sprite.node, NORMAL_ZOMBIE_EAT_0, 4),
          fps: 4,
          loop: true,
        },
        [states.eat[1]]: {
          keyframes: kfFromSpriteSheet(sprite.node, NORMAL_ZOMBIE_EAT_1, 4),
          fps: 4,
          loop: true,
        },
      })
      .play(states.walk[0])
  })

  useEvent(zombie, 'updated', (delta) => {
    if (currentPlant.value == null) {
      zombie.node.position.x -= delta * (cellSize.x / 4.5)
      if (zombie.node.position.x <= 0) zombie.node.destroy()
    }
  })

  useEvent(raycast, 'colliderEntered', (collider) => {
    const plant = collider.parent
    if (!(plant?.script instanceof PlantScript)) return
    currentPlant.value = plant.script
  })
  useEvent(raycast, 'colliderExited', (collider) => {
    const plant = collider.parent
    if (!(plant?.script instanceof PlantScript)) return
    if (plant.script != currentPlant.value) return
    currentPlant.value = null
  })

  useEvent(anim, 'animationIndexChanged', (index) => {
    if (anim.node.currentAnim === 'walk') return
    if (index % 2 === 0) return
    currentPlant.value?.applyDamage(50)
  })

  useEffect(() => {
    const key = currentPlant.value == null ? 'walk' : 'eat'
    const newAnim = states[key][currentState.value]
    if (newAnim == null) return
    anim.node.play(newAnim)
  }, [currentPlant, currentState])

  return (
    <transform
      ref={zombie}
      position={position}
      script={new NormalZombieScript()}>
      <sprite
        ref={sprite}
        textureId={NORMAL_ZOMBIE_WALK_0}
        sourceSize={[16, 16]}>
        <animation-player ref={anim} />
      </sprite>
      <ray-cast
        ref={raycast}
        position={[4, 14]}
        direction={[-2, 0]}
        collidesWith={[plantsLayer]}
      />
      <collider
        shape={shapes.rectangle(4, 12)}
        group={[zombiesLayer]}
        collidesWith={[]}
        position={[6, 4]}
      />
    </transform>
  )
}
