import { loadTexture, type VectorLike } from 'tiny-engine'
import { useContext } from 'tiny-engine/hooks'
import { SunCountCtx } from '../../contexts/sun-count'
import { Text } from '../ui/text'

const SUN_COUNTER = await loadTexture('/assets/sprites/ui/sun-counter.png')

export function SunCounter({ position }: { position: VectorLike }) {
  const [sunCount, setSunCount] = useContext(SunCountCtx)
  return (
    <sprite position={position} textureId={SUN_COUNTER}>
      <Text position={[8, 2]} text={() => (sunCount() * 25).toString()} />
      <clickable size={[4, 4]} onClick={() => setSunCount(sunCount() + 1)} />
    </sprite>
  )
}
