import { useContext, useEvent, useGame, useRefNode } from 'tiny-engine/hooks'
import { loadTexture, PrimaryNode, shapes, type VectorLike } from 'tiny-engine'
import { RowCtx } from '../../../contexts/row'
import { ZombieScript } from '../../../scripts/zombie/zombie'
import { BoardCtx } from '../../../contexts/board'

const PEA = await loadTexture('/assets/sprites/entities/projectiles/pea.png')

const PEA_DAMAGE = 20

export function Pea({ position }: { position: VectorLike }) {
  const { projectilesLayer, zombiesLayer } = useContext(RowCtx)
  const { cellSize } = useContext(BoardCtx)

  const pea = useRefNode(PrimaryNode.Transform)
  const collider = useRefNode(PrimaryNode.Collider)

  const width = useGame().getSize().x

  useEvent(pea, 'updated', (delta) => {
    pea.node.position.x += delta * 4.5 * cellSize.x
    if (pea.node.position.x >= width) pea.node.destroy()
  })

  useEvent(collider, 'colliderEntered', (zombieCollider) => {
    const zombie = zombieCollider.parent
    if (!(zombie?.script instanceof ZombieScript)) return
    zombie.script.applyDamage(PEA_DAMAGE)
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
    </transform>
  )
}
