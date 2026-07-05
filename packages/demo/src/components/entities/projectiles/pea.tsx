import { useContext, useEvent, useGame, useNode } from 'tiny-engine/hooks'
import { loadSound, loadTexture, PrimaryNode, shapes, type VectorLike } from 'tiny-engine'
import { RowCtx } from '../../../contexts/row'
import { ZombieScript } from '../../../scripts/zombie/zombie'
import { BoardCtx } from '../../../contexts/board'

const PEA = await loadTexture('/assets/sprites/entities/projectiles/pea.png')
const SPLAT_SOUND = await loadSound('/assets/audios/plants/pea/splat.ogg')

const PEA_DAMAGE = 20

export function Pea({ position }: { position: VectorLike }) {
  const { projectilesLayer, zombiesLayer } = useContext(RowCtx)
  const { cellSize } = useContext(BoardCtx)

  const pea = useNode(PrimaryNode.Transform)
  const collider = useNode(PrimaryNode.Collider)
  const audio = useNode(PrimaryNode.AudioPlayer)

  const width = useGame().getSize().x

  useEvent(pea, 'updated', (delta) => {
    pea.node.position.x += delta * 4.5 * cellSize.x
    if (pea.node.position.x >= width) pea.node.destroy()
  })

  useEvent(collider, 'colliderEntered', (zombieCollider) => {
    const zombie = zombieCollider.parent
    if (!(zombie?.script instanceof ZombieScript)) return
    zombie.script.applyDamage(PEA_DAMAGE)
    audio.node.play()
    pea.node.destroy()
  })

  return (
    <transform ref={pea} position={position}>
      <sprite textureId={PEA}>
        <collider
          ref={collider}
          shape={shapes.circle(2)}
          group={[projectilesLayer]}
          collidesWith={[zombiesLayer]}
          position={[2, 2]}
        />
      </sprite>
      <audio-player ref={audio} soundId={SPLAT_SOUND} persistUntilEnd />
    </transform>
  )
}
