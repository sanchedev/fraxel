import { Vector2 } from 'tiny-engine'
import { Row } from './row.js'
import { BoardCtx } from '../../contexts/board.js'

interface BoardProps {
  position: Vector2
  cellsCount: Vector2
  cellSize: Vector2
}

export function Board({ position, cellsCount, cellSize }: BoardProps) {
  return (
    <BoardCtx.Provider value={{ cellSize, cellsCount }}>
      <transform position={position}>
        {Array.from({ length: 1 }, (_, i) => (
          <Row rowIndex={i} />
        ))}
      </transform>
    </BoardCtx.Provider>
  )
}
