import { loadTexture, type VectorLike } from 'tiny-engine'
import { Plant } from '../../lib/enums/plants'
import {
  useClickable,
  useComputed,
  useContext,
  useMount,
  useSignal,
  useTimer,
  useTrigger,
  useWhen,
} from 'tiny-engine/hooks'
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

  const timer = useTimer()
  const clickable = useClickable()

  const [loaded, setLoaded] = useSignal(false)

  const disabled = useComputed(
    () => !loaded() || sunCount() < plantsInfo[plant].price,
  )

  const brightness = useWhen(clickable.hovered, 1.1, 1)
  const grayscale = useWhen(disabled, 0.75, 0)

  const sourceSize = useComputed<VectorLike>(() => [
    24,
    (1 - timer.progress()) * 16,
  ])

  useTrigger(planted, (p) => {
    if (p !== plant) return
    setLoaded(false)
    setSunCount(sunCount() - plantsInfo[plant].price)
    timer.play()
  })

  const handleClick = () => {
    if (current()?.plant === plant) current()!.unselect()
    else select(plant)
  }

  useMount(() => {
    console.log(timer.time())
  })

  return (
    <sprite
      textureId={PLANT_SEEDS[plant]}
      position={position}
      brightness={brightness}
      grayscale={grayscale}>
      <sprite
        id={plantsInfo[plant].name}
        textureId={PLANT_SEEDS[plant]}
        grayscale={1}
        brightness={0.75}
        sourceSize={sourceSize}
      />
      <clickable
        ref={clickable.ref}
        size={[18, 14]}
        position={[3, 1]}
        onClick={handleClick}
        disabled={disabled}
      />
      <timer
        ref={timer.ref}
        duration={plantsInfo[plant].seedCooldown}
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
