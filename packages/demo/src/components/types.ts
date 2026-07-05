import type { VectorLike } from 'diny'

export interface InRowProps {
  position: VectorLike
}

export interface PlantProps extends InRowProps {
  onDestroy?: () => void
}
