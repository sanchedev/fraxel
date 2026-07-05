import { createGame, Game, Scene } from 'diny/jsx'

const game = createGame(
  <Game
    width={192}
    height={112}
    defaultScene="test"
    // testOptions={{ showClickables: true, showColliders: true }}
  >
    <Scene name="test" component={() => import('./scenes/test.js')} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
