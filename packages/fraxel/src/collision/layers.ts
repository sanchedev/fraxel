import { InvalidCollisionLayerIndexError } from '../errors/collision.js'

export type CollisionLayerValue = number
export type CollisionMaskValue = number

export const CollisionLayer = {
  Default: 1 << 0,

  create(index: number): CollisionLayerValue {
    if (!Number.isInteger(index) || index < 0 || index > 31) {
      throw new InvalidCollisionLayerIndexError(index)
    }
    return 1 << index
  },
} as const

export const CollisionMask = {
  None: 0,
  All: 0xffffffff,

  only(...layers: CollisionLayerValue[]): CollisionMaskValue {
    return layers.reduce((mask, layer) => mask | layer, 0)
  },

  except(...layers: CollisionLayerValue[]): CollisionMaskValue {
    return ~CollisionMask.only(...layers)
  },
} as const
