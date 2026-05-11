import { Node, type NodeOptions } from 'tiny-engine'

export interface PlantOptions extends NodeOptions {}

export class Plant extends Node {
  health: number = 0

  constructor(options: PlantOptions) {
    super(options)
  }
}
