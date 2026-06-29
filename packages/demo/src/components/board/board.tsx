import { Vector2, type VectorLike } from 'tiny-engine'
import { Row } from './row.js'
import { BoardCtx } from '../../contexts/board.js'

interface BoardProps {
  position: VectorLike
  cellsCount: VectorLike
  cellSize: VectorLike
}

export function Board({ position, cellsCount, cellSize }: BoardProps) {
  return (
    <BoardCtx.Provider
      value={{
        cellSize: Vector2.vectorize(cellSize),
        cellsCount: Vector2.vectorize(cellsCount),
      }}>
      <transform position={position}>
        {Array.from({ length: 1 }, (_, i) => (
          <Row rowIndex={i} />
        ))}
      </transform>
    </BoardCtx.Provider>
  )
}
