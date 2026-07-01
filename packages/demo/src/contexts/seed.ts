import { createContext } from 'tiny-engine/hooks'
import type { Plant } from '../lib/enums/plants'
import type { Event, SignalGetter, Vector2 } from 'tiny-engine'

export interface SeedSelected {
  plant: Plant
  setPlant: (position: Vector2, unsub: () => void) => void
  unselect: () => void
}

export const SeedCtx = createContext<{
  current: SignalGetter<SeedSelected | null>
  select: (plant: Plant) => void
  planted: Event<[plant: Plant], 'plant'>
}>({
  current: () => null,
  select: () => {},
  planted: null!,
})
