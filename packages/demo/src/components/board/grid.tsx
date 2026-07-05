import { tween, easeOutQuad, type VectorLike } from 'diny'
import {
  useComputed,
  useContext,
  useEvent,
  useRef,
  useClickable,
  useSignal,
  useEffect,
} from 'diny/hooks'
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
    clickable.position().apply((coord, axis) => Math.floor(coord / cellSize[axis])),
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

  useEvent(clickable.ref, 'clicked', () => {
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
    <clickable ref={clickable.ref} position={position} size={cellSize.toMultiplied(cellsCount)}>
      <rectangle
        position={() => [pos().x * cellSize.x, 0]}
        size={[cellSize.x, cellSize.y * cellsCount.y]}
        fillColor={() => [0.9, 0.9, 0.9, transparency()]}
      />
      <rectangle
        position={() => [0, pos().y * cellSize.y]}
        size={[cellSize.x * cellsCount.x, cellSize.y]}
        fillColor={() => [0.8, 0.8, 0.8, transparency()]}
      />
    </clickable>
  )
}
