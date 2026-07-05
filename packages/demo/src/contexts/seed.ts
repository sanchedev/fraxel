import { createContext, type Trigger } from 'fraxel/hooks'
import type { Plant } from '../lib/enums/plants'
import type { SignalGetter, Vector2 } from 'fraxel'

export interface SeedSelected {
  plant: Plant
  setPlant: (position: Vector2, unsub: () => void) => void
  unselect: () => void
}

export const SeedCtx = createContext<{
  current: SignalGetter<SeedSelected | null>
  select: (plant: Plant) => void
  planted: Trigger<[plant: Plant]>
}>({
  current: () => null,
  select: () => {},
  planted: null!,
})
