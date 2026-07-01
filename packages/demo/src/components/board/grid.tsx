import { PrimaryNode, Vector2, type VectorLike } from 'tiny-engine'
import {
  useComputed,
  useContext,
  useEvent,
  useRef,
  useRefNode,
  useSignal,
} from 'tiny-engine/hooks'
import { BoardCtx } from '../../contexts/board'
import { SeedCtx } from '../../contexts/seed'

export function Grid({ position }: { position: VectorLike }) {
  const { cellSize, cellsCount, floorTypeOnCells } = useContext(BoardCtx)
  const { current } = useContext(SeedCtx)

  const grid = useRefNode(PrimaryNode.Clickable)

  const plants = useRef<{ platform: boolean; plant: boolean }[][]>(
    floorTypeOnCells.map((floors) =>
      floors.map(() => ({ platform: false, plant: false })),
    ),
  )

  const [hover, setHover] = useSignal(false)
  const [pos, setPos] = useSignal(Vector2.ZERO)

  const transparency = useComputed(() => {
    if (current() == null) return 0

    const p = pos()
    if (plants.current[p.y]![p.x]!.plant) return 0
    if (!hover()) return 0
    return 0.5
  })

  useEvent(grid, 'mouseOver', (position) => {
    setPos(position.apply((coord, axis) => Math.floor(coord / cellSize[axis])))
  })

  useEvent(grid, 'clicked', () => {
    const c = current()
    if (c == null) return
    const { x, y } = pos()
    plants.current[y]![x]!.plant = true
    c.setPlant(pos(), () => {
      plants.current[y]![x]!.plant = false
    })
  })

  return (
    <clickable
      ref={grid}
      position={position}
      onMouseEnter={() => setHover(true)}
      onMouseExit={() => setHover(false)}
      size={cellSize.toMultiplied(cellsCount)}>
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
