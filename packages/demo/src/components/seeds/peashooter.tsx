import { loadTexture, type VectorLike } from 'tiny-engine'
import { PlantSeed } from './plant'
import { Plant } from '../../lib/enums/plants'

const PEASHOOTER_SEED = await loadTexture(
  '/assets/sprites/seeds/peashooter.png',
)

export function PeashooterSeed({ position }: { position: VectorLike }) {
  return (
    <PlantSeed
      position={position}
      plant={Plant.Peashooter}
      seedTexture={PEASHOOTER_SEED}
    />
  )
}
