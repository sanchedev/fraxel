import { Plant } from '../enums/plants'
import type { PlantProps } from '../../components/types'
import { Peashooter } from '../../components/entities/plants/peashooter'
import { WallNut } from '../../components/entities/plants/wall-nut'

export const PlantComponents: Record<
  Plant,
  (props: PlantProps) => JSX.Element
> = {
  [Plant.Peashooter]: Peashooter,
  [Plant.WallNut]: WallNut,
}
