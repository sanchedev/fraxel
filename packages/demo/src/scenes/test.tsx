import { loadTexture } from 'tiny-engine'
import { Board } from '../components/board/board.js'

const BG_DAY_4 = await loadTexture('/assets/sprites/ui/bgs/day/bg-4.png')

export default function Test() {
  return (
    <transform>
      <sprite textureId={BG_DAY_4} displaySize={[288, 112]} />
      <Board position={[40, 24]} cellSize={[16, 16]} cellsCount={[9, 5]} />
    </transform>
  )
}
