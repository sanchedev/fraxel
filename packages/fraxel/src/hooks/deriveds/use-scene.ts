import { Game } from '../../core/game.js'
import { declareDerivedHook } from '../context.js'

interface SceneControllers {
  /** The current scene name. */
  current: string
  /** Switches to a different scene. Pass `null` to unload the current scene. */
  change: (sceneName: string | null) => Promise<void>
  /** Preloads a scene and returns a cleanup function to free memory. */
  preload: (scene: string) => Promise<() => void>
}

/**
 * The **`useScene`** derived hook provides imperative access to the scene manager.
 *
 * @returns A `SceneControllers` object with `current` scene name, `change` to switch scenes,
 *   and `preload` to preload scenes.
 *
 * @example
 * ```tsx
 * import { useScene, useEffect } from 'fraxel/hooks'
 * import { Input } from 'fraxel'
 *
 * const Restart = Input.createAction({ key: 'r' })
 *
 * function GameOver() {
 *   const scene = useScene()
 *
 *   useEffect(() => {
 *     if (Input.justActionPressed(Restart)) {
 *       scene.change('game')
 *     }
 *   })
 *
 *   return <text text="Game Over" />
 * }
 * ```
 */
export function useScene(): SceneControllers {
  declareDerivedHook('useScene')
  return {
    current: Game.sceneManager.currentScene!,
    change: (name) => Game.sceneManager.setScene(name),
    preload: (name) => Game.sceneManager.preloadScene(name),
  }
}
