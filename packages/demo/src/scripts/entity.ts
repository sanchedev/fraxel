import { FraxelScript, PrimaryNode } from 'fraxel'
import { createSignal, signalSetterFrom } from 'fraxel/hooks'

export abstract class EntityScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(0)
  setHealth = signalSetterFrom(this.health)

  setup(): void {
    this.connect('destroyed', () => this.health.signal.clearSubs())
  }

  applyDamage(damage: number) {
    const newHealth = this.health() - damage
    this.setHealth(newHealth)
    if (newHealth <= 0) {
      this.me.destroy()
      return true
    }
    return false
  }
}
