import { GameConfig } from '../core/game-config.js'
import { Game } from '../core/game.js'
import type { GameControls } from '../jsx/render/game.js'
import { vector2 } from '../math/vector2.js'
import { pushEffect } from './context.js'

/**
 * The **`useGame`** hook gets the game controls.
 *
 * @returns A `GameControls` object with play, pause, destroy, changeScene, preloadScene, and getSize methods
 *
 * @example
 * ```tsx
 * import { useGame } from 'fraxel/hooks'
 *
 * function MyComponent() {
 *   const game = useGame()
 *
 *   const handleStart = () => {
 *     game.pause()
 *   }
 *
 *   return <transform onStart={handleStart} />
 * }
 * ```
 */
export function useGame(): GameControls {
  pushEffect('useGame', () => {})

  return {
    play: () => Game.play(),
    pause: () => Game.pause(),
    destroy: () => Game.destroy(),
    changeScene: (name) => {
      return Game.sceneManager.setScene(name)
    },
    preloadScene: (name) => {
      return Game.sceneManager.preloadScene(name)
    },
    getSize() {
      return vector2(GameConfig.width, GameConfig.height)
    },
  }
}
