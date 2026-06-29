import { Plant } from '../enums/plants'
import type { InRowProps } from '../../components/types'
import { Peashooter } from '../../components/entities/plants/peashooter'

export const PlantComponents: Record<
  Plant,
  (props: InRowProps) => JSX.Element
> = {
  [Plant.Peashooter]: Peashooter,
}
