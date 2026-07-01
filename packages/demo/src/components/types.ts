import type { VectorLike } from 'tiny-engine'

export interface InRowProps {
  position: VectorLike
}

export interface PlantProps extends InRowProps {
  onDestroy?: () => void
}
