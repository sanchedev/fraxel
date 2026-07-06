import { createGame, Game, Scene } from 'fraxel/jsx'

const game = createGame(
  <Game
    width={480}
    height={480}
    defaultScene="test"
    // testOptions={{ showClickables: true, showColliders: true }}
  >
    <Scene name="test" component={() => import('./scenes/main.js')} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
