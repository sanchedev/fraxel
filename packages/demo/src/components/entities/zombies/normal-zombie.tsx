import { animationFromSheet, getParentScript, loadSound, loadTexture, shapes } from 'fraxel'
import type { InRowProps } from '../../types.js'
import {
  useAnimation,
  useAudio,
  useComputed,
  useContext,
  useEffect,
  useMount,
  useRayCast,
  useSprite,
  useTransform,
  useUpdate,
} from 'fraxel/hooks'
import { RowCtx } from '../../../contexts/row.js'
import { PlantScript } from '../../../scripts/plant/plant.js'
import { ZombieScript } from '../../../scripts/zombie/zombie.js'
import { BoardCtx } from '../../../contexts/board.js'
import { renderToNodes } from 'fraxel/jsx'
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

  const zombie = useTransform()
  const sprite = useSprite()
  const anim = useAnimation()
  const raycast = useRayCast()
  const groanAudio = useAudio()
  const chompAudio = useAudio()

  const health = useComputed(() => zombie.script(ZombieScript)?.health.getter() ?? 181)

  const currentPlant = useComputed(() => getParentScript(raycast.collider(), PlantScript) ?? null)
  const currentState = useComputed(() => {
    if (health() > 90) return 0
    return 1
  })

  useMount(() => {
    groanAudio.play()
  })

  useUpdate((delta) => {
    if (currentPlant() != null) return
    zombie.node.position.x -= delta * (cellSize.x / 4.5)
    if (zombie.node.position.x <= 0) zombie.node.destroy()
  })

  const currentAnim = useComputed(() => {
    const plant = currentPlant()
    const state = currentState()

    const key = plant == null ? 'walk' : 'eat'
    return states[key][state]!
  })

  useEffect(() => {
    if (currentPlant() == null) return

    if (anim.animName()?.startsWith('walk')) return
    if (anim.frameIndex() % 2 === 0) return
    currentPlant()!.applyDamage(50)
    if (anim.frameIndex() === 3) chompAudio.play()
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
            [states.walk[0]]: animationFromSheet(sprite, NORMAL_ZOMBIE_WALK_0, {
              columns: 4,
              duration: 1,
              loop: true,
            }),
            [states.walk[1]]: animationFromSheet(sprite, NORMAL_ZOMBIE_WALK_1, {
              columns: 4,
              duration: 1,
              loop: true,
            }),
            [states.eat[0]]: animationFromSheet(sprite, NORMAL_ZOMBIE_EAT_0, {
              columns: 4,
              duration: 1,
              loop: true,
            }),
            [states.eat[1]]: animationFromSheet(sprite, NORMAL_ZOMBIE_EAT_1, {
              columns: 4,
              duration: 1,
              loop: true,
            }),
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
