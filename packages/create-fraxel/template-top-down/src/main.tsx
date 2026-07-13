import { createGame, GameRoot, SceneRoot } from 'fraxel'
import './style.css'

const game = createGame(
  <GameRoot width={800} height={450} defaultScene="main">
    <SceneRoot name="main" component={() => import('./scenes/main')} />
    <SceneRoot name="game" component={() => import('./scenes/game')} />
    <SceneRoot name="win" component={() => import('./scenes/win')} />
  </GameRoot>,
  document.querySelector('#app')!,
)

game.play()
