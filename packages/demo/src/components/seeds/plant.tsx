import { PrimaryNode, Vector2, type VectorLike } from 'tiny-engine'
import type { Plant } from '../../lib/enums/plants'
import { PlantComponents } from '../../lib/components/plants'
import {
  useComputed,
  useContext,
  useRefNode,
  useSignal,
} from 'tiny-engine/hooks'
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
  const timer = useRefNode(PrimaryNode.Timer)

  const [hover, setHover] = useSignal(false)
  const [disabled, setDisabled] = useSignal(true)
  const [time, setTime] = useSignal(0)

  const progress = useComputed(() => time() / plantsInfo[plant].seedCooldown)

  const brightness = useComputed(() => (hover() ? 1.1 : 1))
  const grayscale = useComputed(() => (disabled() ? 0.75 : 0))
  const sourceSize = useComputed(() => new Vector2(24, (1 - progress()) * 16))

  const handleClick = () => {
    spawnPlant(0, 2, PlantComponents[plant])
    setDisabled(true)
    timer.node.play()
  }

  return (
    <sprite
      textureId={seedTexture}
      position={position}
      brightness={brightness}
      grayscale={grayscale}>
      <sprite textureId={seedTexture} grayscale={1} sourceSize={sourceSize} />
      <clickable
        size={[18, 14]}
        position={[3, 1]}
        onMouseEnter={() => setHover(true)}
        onMouseExit={() => setHover(false)}
        onClick={handleClick}
        disabled={disabled}
      />
      <timer
        ref={timer}
        duration={plantsInfo[plant].seedCooldown}
        onTimeChange={setTime}
        onTimeout={() => setDisabled(false)}
        autoPlay
      />
    </sprite>
  )
}
