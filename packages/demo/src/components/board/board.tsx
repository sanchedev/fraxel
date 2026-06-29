import { Vector2, type VectorLike } from 'tiny-engine'
import { Row } from './row.js'
import { BoardCtx } from '../../contexts/board.js'
import { PeashooterSeed } from '../seeds/peashooter.js'
import { useRef } from 'tiny-engine/hooks'
import type { InRowProps } from '../types.js'

interface BoardProps {
  position: VectorLike
  cellsCount: VectorLike
  cellSize: VectorLike
}

export function Board({ position, cellsCount, cellSize }: BoardProps) {
  const plantSpawners = useRef<
    ((colIndex: number, Comp: (props: InRowProps) => JSX.Element) => void)[]
  >([])

  return (
    <BoardCtx.Provider
      value={{
        cellSize: Vector2.vectorize(cellSize),
        cellsCount: Vector2.vectorize(cellsCount),
        spawnPlant(rowIndex, colIndex, Comp) {
          plantSpawners.current[rowIndex]?.(colIndex, Comp)
        },
      }}>
      <transform>
        <PeashooterSeed position={16} />
      </transform>
      <transform position={position}>
        {Array.from({ length: 1 }, (_, i) => (
          <Row
            registerSpawners={(plants) => {
              plantSpawners.current.push(plants)
            }}
            rowIndex={i}
          />
        ))}
      </transform>
    </BoardCtx.Provider>
  )
}
