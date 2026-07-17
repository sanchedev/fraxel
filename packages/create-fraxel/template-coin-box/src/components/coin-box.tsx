import {
  TextAlign,
  shapes,
  useDropArea,
  useScene,
  useSignal,
  useTrigger,
  type ColorLike,
} from 'fraxel'
import { coinCount, dropKey } from '../constants'

export function CoinBox() {
  const box = useDropArea()
  const scene = useScene()
  const [boxColor, setBoxColor] = useSignal<ColorLike>('#7c4a22')
  const [collected, setCollected] = useSignal(0)
  const collectedCoins = new Set<string>()

  useTrigger(box.onDragOver, () => {
    setBoxColor('#9a5d2a')
  })

  useTrigger(box.onDragLeave, () => {
    setBoxColor('#7c4a22')
  })

  useTrigger(box.onDrop, (event) => {
    const id = String(event.data)
    if (collectedCoins.has(id)) return

    collectedCoins.add(id)
    event.draggable.deactivate()
    setBoxColor('#7c4a22')
    setCollected(collectedCoins.size)

    if (collectedCoins.size === coinCount) {
      void scene.change('win')
    }
  })

  return (
    <droparea ref={box} position={[610, 165]} shape={shapes.rectangle(130, 130)} dropKey={dropKey}>
      <geometry shape={shapes.rectangle(130, 130)} fillColor={boxColor} />
      <geometry position={[14, 14]} shape={shapes.rectangle(102, 102)} fillColor="#3f2a1b" />
      <text
        position={[65, 48]}
        text={() => `${collected()}/5`}
        textAlign={TextAlign.Center}
        fillColor="#fef3c7"
        fontSize={28}
      />
      <text
        position={[65, 92]}
        text={() => `Coins ${collected()}`}
        textAlign={TextAlign.Center}
        fillColor="#fef3c7"
        fontSize={14}
      />
    </droparea>
  )
}
