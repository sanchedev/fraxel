import { Plant } from '../enums/plants'
import type { PlantProps } from '../../components/types'
import { Peashooter } from '../../components/entities/plants/peashooter'
import { WallNut } from '../../components/entities/plants/wall-nut'
import { Sunflower } from '../../components/entities/plants/sunflower'
import { Repeater } from '../../components/entities/plants/repeater'

export const PlantComponents: Record<Plant, (props: PlantProps) => JSX.Element> = {
  [Plant.Peashooter]: Peashooter,
  [Plant.WallNut]: WallNut,
  [Plant.Sunflower]: Sunflower,
  [Plant.Repeater]: Repeater,
}
