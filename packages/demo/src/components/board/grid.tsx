import { tween, easeOutQuad, type VectorLike, shapes } from 'fraxel'
import {
  useComputed,
  useContext,
  useRef,
  useClickable,
  useSignal,
  useEffect,
  useTrigger,
} from 'fraxel/hooks'
import { BoardCtx } from '../../contexts/board'
import { SeedCtx } from '../../contexts/seed'

export function Grid({ position }: { position: VectorLike }) {
  const { cellSize, cellsCount, floorTypeOnCells } = useContext(BoardCtx)
  const { current } = useContext(SeedCtx)

  const plants = useRef<{ platform: boolean; plant: boolean }[][]>(
    floorTypeOnCells.map((floors) => floors.map(() => ({ platform: false, plant: false }))),
  )

  const clickable = useClickable()
  const pos = useComputed(() =>
    clickable.mousePosition().apply((coord, axis) => Math.floor(coord / cellSize[axis])),
  )

  const ableToPlant = useComputed(
    () => current() != null && !plants.current[pos().y]![pos().x]!.plant && clickable.hovered(),
  )

  const [transparency, setTransparency] = useSignal(0)
  const tweenRef = useRef<ReturnType<typeof tween> | null>(null)

  useEffect(() => {
    tweenRef.current?.stop()
    const target = ableToPlant() ? 0.5 : 0
    const from = transparency()
    if (from === target) return
    tweenRef.current = tween({
      target: { v: from },
      prop: 'v',
      from,
      to: target,
      duration: 0.15,
      easing: easeOutQuad,
      onUpdate: (v) => setTransparency(v),
    })
  })

  useTrigger(clickable.clicked, () => {
    const c = current()
    if (c == null) return
    if (!ableToPlant()) return

    const { x, y } = pos()
    plants.current[y]![x]!.plant = true
    c.setPlant(pos(), () => {
      plants.current[y]![x]!.plant = false
    })
  })

  return (
    <clickable ref={clickable} position={position} size={cellSize.toMultiplied(cellsCount)}>
      <geometry
        position={() => [pos().x * cellSize.x, 0]}
        shape={shapes.rectangle(cellSize.x, cellSize.y * cellsCount.y)}
        fillColor={() => [0.9, 0.9, 0.9, transparency()]}
      />
      <geometry
        position={() => [0, pos().y * cellSize.y]}
        shape={shapes.rectangle(cellSize.x * cellsCount.x, cellSize.y)}
        fillColor={() => [0.8, 0.8, 0.8, transparency()]}
      />
    </clickable>
  )
}
