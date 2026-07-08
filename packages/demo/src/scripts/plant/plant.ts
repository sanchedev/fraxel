import type { Plant } from '../../lib/enums/plants'
import { plantsInfo } from '../../lib/info/plants'
import { EntityScript } from '../entity'

export class PlantScript extends EntityScript {
  constructor(plant: Plant) {
    super()
    this.setHealth(plantsInfo[plant].health)
  }
}
