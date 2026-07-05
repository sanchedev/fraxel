import type { VectorLike } from 'fraxel'

export interface InRowProps {
  position: VectorLike
}

export interface PlantProps extends InRowProps {
  onDestroy?: () => void
}
