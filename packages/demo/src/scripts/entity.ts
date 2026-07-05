import { PrimaryNode, Signal } from 'fraxel'
import { FraxelScript } from 'fraxel/scripts'

export abstract class EntityScript extends FraxelScript<PrimaryNode.Transform> {
  abstract health: Signal<number>

  setup(): void {
    this.connect('destroyed', () => this.health.clearSubs())
  }

  applyDamage(damage: number) {
    this.health.value -= damage
    if (this.health.value <= 0) {
      this.me.destroy()
      return true
    }
    return false
  }
}
