import { PrimaryNode, type VectorLike } from 'tiny-engine'
import type { Plant } from '../../lib/enums/plants'
import { PlantComponents } from '../../lib/components/plants'
import { useContext, useEffect, useRefNode, useSignal } from 'tiny-engine/hooks'
import { BoardCtx } from '../../contexts/board'
import { plantsInfo } from '../../lib/info/plants'

export function PlantSeed({
  plant,
  seedTexture,
  position,
}: {
  plant: Plant
  seedTexture: symbol
  position?: VectorLike
}) {
  const { spawnPlant } = useContext(BoardCtx)
  const sprite = useRefNode(PrimaryNode.Sprite)
  const timer = useRefNode(PrimaryNode.Timer)
  const hover = useSignal(false)
  const ready = useSignal(false)

  const time = useSignal(0)

  useEffect(() => {
    if (ready.value) {
      sprite.node.brightness = hover.value ? 1.2 : 1
      sprite.node.grayscale = 0
    } else {
      sprite.node.brightness =
        0.75 + 0.25 * (time.value / plantsInfo[plant].seedCooldown)
      sprite.node.grayscale =
        1 - 0.5 * (time.value / plantsInfo[plant].seedCooldown)
    }
  }, [hover, ready, time])

  const handleClick = () => {
    if (!ready.value) return
    spawnPlant(0, 2, PlantComponents[plant])
    ready.value = false
    timer.node.play()
  }

  return (
    <sprite ref={sprite} textureId={seedTexture} position={position}>
      <clickable
        size={[18, 14]}
        position={[3, 1]}
        onMouseEnter={() => (hover.value = true)}
        onMouseExit={() => (hover.value = false)}
        onClick={handleClick}
      />
      <timer
        ref={timer}
        duration={plantsInfo[plant].seedCooldown}
        onTimeChange={(t) => (time.value = t)}
        onTimeout={() => (ready.value = true)}
        autoPlay
      />
    </sprite>
  )
}
