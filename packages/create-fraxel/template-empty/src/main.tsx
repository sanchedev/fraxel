import { createGame, GameRoot, SceneRoot } from 'fraxel'
import './style.css'

const game = createGame(
  <GameRoot width={480} height={360} defaultScene="main">
    <SceneRoot name="main" component={() => import('./scenes/main')} />
  </GameRoot>,
  document.querySelector('#app')!,
)

game.play()
