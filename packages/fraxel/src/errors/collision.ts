import { FraxelError } from './base.js'

/** Base error for collision-related configuration errors. */
export class CollisionError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'CollisionError'
  }
}

/** Thrown when a collision layer index cannot be represented by a JS bitmask. */
export class InvalidCollisionLayerIndexError extends CollisionError {
  constructor(index: unknown) {
    super(
      `Invalid collision layer index ${String(index)}. CollisionLayer.create(index) expects an integer from 0 to 31 because JavaScript bitwise operators use 32-bit masks.`,
    )
    this.name = 'InvalidCollisionLayerIndexError'
  }
}
