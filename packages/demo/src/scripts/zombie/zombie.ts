import { EntityScript } from '../entity'

export class ZombieScript extends EntityScript {
  constructor(health: number) {
    super()
    this.setHealth(health)
  }
}
