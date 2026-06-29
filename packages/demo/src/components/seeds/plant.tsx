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

  const [hover, setHover] = useSignal(false)
  const [ready, setReady] = useSignal(false)
  const [time, setTime] = useSignal(0)

  useEffect(() => {
    const isReady = ready()
    const isHover = hover()
    const timeCount = time()

    if (isReady) {
      sprite.node.brightness = isHover ? 1.2 : 1
      sprite.node.grayscale = 0
    } else {
      sprite.node.brightness =
        0.75 + 0.25 * (timeCount / plantsInfo[plant].seedCooldown)
      sprite.node.grayscale =
        1 - 0.5 * (timeCount / plantsInfo[plant].seedCooldown)
    }
  })

  const handleClick = () => {
    if (!ready()) return
    spawnPlant(0, 2, PlantComponents[plant])
    setReady(false)
    timer.node.play()
  }

  return (
    <sprite ref={sprite} textureId={seedTexture} position={position}>
      <clickable
        size={[18, 14]}
        position={[3, 1]}
        onMouseEnter={() => setHover(true)}
        onMouseExit={() => setHover(false)}
        onClick={handleClick}
      />
      <timer
        ref={timer}
        duration={plantsInfo[plant].seedCooldown}
        onTimeChange={setTime}
        onTimeout={() => setReady(true)}
        autoPlay
      />
    </sprite>
  )
}
