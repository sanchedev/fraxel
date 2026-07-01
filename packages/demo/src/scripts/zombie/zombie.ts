import { Signal } from 'tiny-engine'
import { EntityScript } from '../entity'

export class ZombieScript extends EntityScript {
  health: Signal<number>

  constructor(health: number) {
    super()
    this.health = new Signal(health)
  }
}
