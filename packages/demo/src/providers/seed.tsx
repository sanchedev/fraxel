import type { Tiny } from 'tiny-engine/jsx'
import { SeedCtx, type SeedSelected } from '../contexts/seed'
import { Plant } from '../lib/enums/plants'
import { createTrigger, useContext, useSignal } from 'tiny-engine/hooks'
import { BoardCtx } from '../contexts/board'
import { PlantComponents } from '../lib/components/plants'

export function SeedProvider({ children }: Tiny.WithChildren) {
  const [current, setCurrent] = useSignal<SeedSelected | null>(null)
  const { spawnPlant } = useContext(BoardCtx)

  const planted = createTrigger<[plant: Plant]>()

  const select = (plant: Plant) => {
    const Plant = PlantComponents[plant]
    setCurrent({
      plant,
      setPlant(position, unsub) {
        spawnPlant(position.y, position.x, (props) => (
          <Plant {...props} onDestroy={() => unsub()} />
        ))
        planted.emit(plant)
        setCurrent(null)
      },
      unselect() {
        setCurrent(null)
      },
    })
  }

  return (
    <SeedCtx.Provider
      value={{
        current,
        select,
        planted,
      }}>
      {children}
    </SeedCtx.Provider>
  )
}
