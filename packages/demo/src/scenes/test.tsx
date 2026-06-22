import { loadTexture, Vector2 } from 'tiny-engine'
import { Board } from '../components/board/board.js'

const BG_DAY_4 = await loadTexture('/assets/sprites/ui/bgs/day/bg-4.png')

export default function Test() {
  return (
    <transform>
      <sprite textureId={BG_DAY_4} displaySize={new Vector2(288, 112)} />
      <Board
        position={new Vector2(40, 24)}
        cellSize={new Vector2(64, 64)}
        cellsCount={new Vector2(9, 5)}
      />
    </transform>
  )
}
