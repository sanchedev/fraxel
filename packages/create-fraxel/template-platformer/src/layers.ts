import { CollisionLayer } from 'fraxel'

export const Layers = {
  Player: CollisionLayer.create(1),
  Platform: CollisionLayer.create(2),
  WinArea: CollisionLayer.create(3),
} as const
