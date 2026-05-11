import { createGame, Game, Scene } from 'tiny-engine/jsx'

const game = createGame(
  <Game width={192} height={112} defaultScene='test'>
    <Scene name='test' component={() => import('./scenes/test.js')} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
