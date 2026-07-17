import {
  bounds,
  shapes,
  useDraggable,
  useSignal,
  useTrigger,
  type ColorLike,
  type VectorLike,
} from 'fraxel'
import { dropKey } from '../constants'

const coinRadius = 18

interface CoinProps {
  id: string
  position: VectorLike
  screenSize: { x: number; y: number }
}

export function Coin({ id, position, screenSize }: CoinProps) {
  const coin = useDraggable()
  const [fillColor, setFillColor] = useSignal<ColorLike>('#facc15')

  useTrigger(coin.onDragStart, () => {
    setFillColor('#fde68a')
  })

  useTrigger(coin.onDragEnd, () => {
    setFillColor('#facc15')
  })

  return (
    <draggable
      ref={coin}
      position={position}
      shape={shapes.circle(coinRadius)}
      bounds={bounds(coinRadius, coinRadius, screenSize.x - coinRadius, screenSize.y - coinRadius)}
      dropKey={dropKey}
      dropData={id}
      zIndex={10}
    >
      <geometry shape={shapes.circle(coinRadius)} fillColor={fillColor} />
      <geometry shape={shapes.circle(coinRadius * 0.55)} fillColor="#f59e0b" />
    </draggable>
  )
}
