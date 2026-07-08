import { createGame, Game, Scene } from 'fraxel/jsx'

const game = createGame(
  <Game width={192} height={112} defaultScene="test" /*testOptions={{ showColliders: true }}*/>
    <Scene name="test" component={() => import('./scenes/test.js')} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
