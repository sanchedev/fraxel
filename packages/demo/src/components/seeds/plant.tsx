import { loadTexture, PrimaryNode, Vector2, type VectorLike } from 'tiny-engine'
import { Plant } from '../../lib/enums/plants'
import { useComputed, useContext, useNode, useSignal } from 'tiny-engine/hooks'
import { plantsInfo } from '../../lib/info/plants'
import { SunCountCtx } from '../../contexts/sun-count'
import { SeedCtx } from '../../contexts/seed'

export function PlantSeed({
  plant,
  position,
}: {
  plant: Plant
  position?: VectorLike
}) {
  const { current, planted, select } = useContext(SeedCtx)
  const [sunCount, setSunCount] = useContext(SunCountCtx)
  const timer = useNode(PrimaryNode.Timer)

  const [hover, setHover] = useSignal(false)
  const [loaded, setLoaded] = useSignal(false)
  const [time, setTime] = useSignal(0)

  const progress = useComputed(() => time() / plantsInfo[plant].seedCooldown)

  const disabled = useComputed(
    () => !loaded() || sunCount() < plantsInfo[plant].price,
  )

  const brightness = useComputed(() => (hover() ? 1.1 : 1))
  const grayscale = useComputed(() => (disabled() ? 0.75 : 0))
  const sourceSize = useComputed(() => new Vector2(24, (1 - progress()) * 16))

  planted.on((p) => {
    if (p !== plant) return
    setLoaded(false)
    setSunCount(sunCount() - plantsInfo[plant].price)
    timer.node.play()
  })
  const handleClick = () => {
    if (current()?.plant === plant) current()!.unselect()
    else select(plant)
  }

  return (
    <sprite
      textureId={PLANT_SEEDS[plant]}
      position={position}
      brightness={brightness}
      grayscale={grayscale}>
      <sprite
        textureId={PLANT_SEEDS[plant]}
        grayscale={1}
        brightness={0.75}
        sourceSize={sourceSize}
      />
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
        onTimeout={() => setLoaded(true)}
        autoPlay
      />
    </sprite>
  )
}

const PLANT_SEEDS: Record<Plant, symbol> = {
  [Plant.Peashooter]: await loadTexture('/assets/sprites/seeds/peashooter.png'),
  [Plant.WallNut]: await loadTexture('/assets/sprites/seeds/wall-nut.png'),
}
