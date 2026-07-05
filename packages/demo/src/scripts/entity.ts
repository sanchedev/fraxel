import { PrimaryNode, Signal } from 'tiny-engine'
import { DinyScript } from 'tiny-engine/scripts'

export abstract class EntityScript extends DinyScript<PrimaryNode.Transform> {
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
