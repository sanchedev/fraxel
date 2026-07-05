import { Signal } from 'fraxel'
import type { Plant } from '../../lib/enums/plants'
import { plantsInfo } from '../../lib/info/plants'
import { EntityScript } from '../entity'

export class PlantScript extends EntityScript {
  health: Signal<number>

  constructor(plant: Plant) {
    super()
    this.health = new Signal(plantsInfo[plant].health)
  }
}
