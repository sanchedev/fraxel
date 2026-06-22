import { PrimaryNode } from 'tiny-engine'
import { TinyScript } from 'tiny-engine/scripts'

export class PlantScript extends TinyScript<PrimaryNode.Transform> {
  setup(): void {
    throw new Error('Method not implemented.')
  }

  health: number = 0
}
