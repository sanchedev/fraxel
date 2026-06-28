import { GameConfig } from '../core/game-config.js'
import { Game } from '../core/game.js'
import type { GameControls } from '../jsx/render/game.js'
import { Vector2 } from '../math/vector2.js'
import { pushEffect } from './context.js'

/**
 * The **`useGame`** hooks gets the game controls.
 *
 * @example
 * ```tsx
 * const game = useGame()
 *
 * const handleStart = () => {
 *   game.pause()
 * }
 *
 * return <transform onStart={handleStart} />
 * ```
 */
export function useGame(): GameControls {
  pushEffect('useGame', () => {})

  return {
    play: () => Game.play(),
    pause: () => Game.pause(),
    changeScene: (name) => {
      return Game.sceneManager.setScene(name)
    },
    preloadScene: (name) => {
      return Game.sceneManager.preloadScene(name)
    },
    getSize() {
      return new Vector2(GameConfig.width, GameConfig.height)
    },
  }
}
