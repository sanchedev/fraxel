import { Vector2 } from 'fraxel'
import { createContext } from 'fraxel/hooks'
import type { InRowProps } from '../components/types'

export interface BoardContext {
  cellSize: Vector2
  cellsCount: Vector2
  floorTypeOnCells: ('grass' | 'roof' | 'water')[][]
  spawnPlant(rowIndex: number, colIndex: number, Comp: (props: InRowProps) => JSX.Element): void
}

export const BoardCtx = createContext<BoardContext>({
  cellSize: Vector2.ZERO,
  cellsCount: Vector2.ZERO,
  floorTypeOnCells: [],
  spawnPlant() {},
})
