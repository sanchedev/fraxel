import { kfFromSpriteSheet, loadSound, loadTexture, PrimaryNode, shapes } from 'tiny-engine'
import type { InRowProps } from '../../types.js'
import {
  useComputed,
  useContext,
  useEffect,
  useEvent,
  useNode,
  useScript,
  useSignal,
} from 'tiny-engine/hooks'
import { RowCtx } from '../../../contexts/row.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { ZombieScript } from '../../../scripts/zombie/zombie.js'
import { BoardCtx } from '../../../contexts/board.js'
import { renderToNodes } from 'tiny-engine/jsx'
import { OneShot } from '../effects/one-shot.js'

const NORMAL_ZOMBIE_ARM = await loadTexture(
  '/assets/sprites/entities/zombies/arms/normal-arm-falling.png',
)

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
const GROAN_SOUND = await loadSound('/assets/audios/zombies/groan.ogg')
const CHOMP_SOUND = await loadSound('/assets/audios/zombies/chomp.ogg')

const states = {
  walk: ['walk-0', 'walk-1'],
  eat: ['eat-0', 'eat-1'],
} as const

interface NormalZombieProps extends InRowProps {}

export function NormalZombie({ position }: NormalZombieProps) {
  const { plantsLayer, zombiesLayer } = useContext(RowCtx)
  const { cellSize } = useContext(BoardCtx)

  const zombie = useNode(PrimaryNode.Transform)
  const sprite = useNode(PrimaryNode.Sprite)
  const anim = useNode(PrimaryNode.AnimationPlayer)
  const raycast = useNode(PrimaryNode.RayCast)
  const groanAudio = useNode(PrimaryNode.AudioPlayer)
  const chompAudio = useNode(PrimaryNode.AudioPlayer)

  const script = useScript<ZombieScript>(zombie)

  const [currentPlant, setCurrentPlant] = useSignal<PlantScript | null>(null)
  const currentState = useComputed(() => {
    const health = script()?.health.value ?? 181
    if (health > 90) return 0
    return 1
  })

  useEvent(zombie, 'started', () => {
    groanAudio.node.play()
  })

  useEvent(zombie, 'updated', (delta) => {
    if (currentPlant() == null) {
      zombie.node.position.x -= delta * (cellSize.x / 4.5)
      if (zombie.node.position.x <= 0) zombie.node.destroy()
    }
  })

  useEvent(raycast, 'colliderEntered', (collider) => {
    const plant = collider.parent
    if (!(plant?.script instanceof PlantScript)) return
    setCurrentPlant(plant.script)
  })
  useEvent(raycast, 'colliderExited', (collider) => {
    const plant = collider.parent
    if (!(plant?.script instanceof PlantScript)) return
    if (plant.script != currentPlant()) return
    setCurrentPlant(null)
  })

  useEvent(anim, 'animationIndexChanged', (index) => {
    if (anim.node.currentAnim?.startsWith('walk')) return
    if (index % 2 === 0) return
    currentPlant()?.applyDamage(50)
    if (index === 3) chompAudio.node.play()
  })

  const currentAnim = useComputed(() => {
    const plant = currentPlant()
    const state = currentState()

    const key = plant == null ? 'walk' : 'eat'
    return states[key][state]!
  })

  useEffect(() => {
    if (currentState() !== 1) return

    zombie.node.parent?.addChild(
      ...renderToNodes(
        <OneShot
          textureId={NORMAL_ZOMBIE_ARM}
          position={zombie.node.position.clone()}
          spriteCountX={10}
          fps={10}
        />,
      ),
    )
  })

  return (
    <transform ref={zombie} position={position} script={new ZombieScript(181)}>
      <sprite ref={sprite} textureId={NORMAL_ZOMBIE_WALK_0} sourceSize={[16, 16]}>
        <animation-player
          ref={anim}
          animations={() => ({
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
          })}
          currentAnim={currentAnim}
        />
      </sprite>
      <ray-cast ref={raycast} position={[4, 14]} direction={[-2, 0]} collidesWith={[plantsLayer]} />
      <collider
        shape={shapes.rectangle(4, 12)}
        group={[zombiesLayer]}
        collidesWith={[]}
        position={[6, 4]}
      />
      <audio-player ref={groanAudio} soundId={GROAN_SOUND} />
      <audio-player ref={chompAudio} soundId={CHOMP_SOUND} />
    </transform>
  )
}
