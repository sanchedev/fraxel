import { useContext, useGame, useEffect, useComputed, useUpdate } from 'fraxel/hooks'
import { useCollider, useTransform, useAudio } from 'fraxel/hooks'
import { getParentScript, loadSound, loadTexture, shapes, type VectorLike } from 'fraxel'
import { RowCtx } from '../../../contexts/row'
import { ZombieScript } from '../../../scripts/zombie/zombie'
import { BoardCtx } from '../../../contexts/board'

const PEA = await loadTexture('/assets/sprites/entities/projectiles/pea.png')
const SPLAT_SOUND = await loadSound('/assets/audios/plants/pea/splat.ogg')

const PEA_DAMAGE = 20

export function Pea({ position }: { position: VectorLike }) {
  const { projectilesLayer, zombiesLayer } = useContext(RowCtx)
  const { cellSize } = useContext(BoardCtx)

  const pea = useTransform()
  const collider = useCollider()
  const audio = useAudio()

  const zombie = useComputed(() => {
    const colliders = collider.detectedColliders()
    for (const col of colliders) {
      const script = getParentScript(col, ZombieScript)
      if (script) return script
    }
  })

  useEffect(() => {
    if (zombie() == null) return
    zombie()!.applyDamage(PEA_DAMAGE)
    audio.play()
    pea.node.destroy()
  })

  const width = useGame().getSize().x

  useUpdate((delta) => {
    pea.node.position.x += delta * 4.5 * cellSize.x
    if (pea.node.position.x >= width) pea.node.destroy()
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
