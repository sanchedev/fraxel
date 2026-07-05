import { loadTexture, loadSound } from 'tiny-engine'
import { Board } from '../components/board/board.js'

const BG_DAY_4 = await loadTexture('/assets/sprites/ui/bgs/day/bg-4.png')
const GRASSWALK = await loadSound('/assets/audios/music/grasswalk.mp3')

export default function Test() {
  return (
    <transform>
      <sprite textureId={BG_DAY_4} displaySize={[288, 112]} />
      <audio-player soundId={GRASSWALK} loop volume={0.3} />
      <Board position={[40, 24]} cellSize={[16, 16]} cellsCount={[9, 5]} />
    </transform>
  )
}
