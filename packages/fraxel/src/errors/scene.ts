import { FraxelError } from './base.js'

/**
 * The **`SceneError`** class is the base error for all scene-related errors.
 * Thrown when an error occurs during scene management, loading, or rendering.
 *
 * @example
 * ```ts
 * import { SceneError } from 'fraxel'
 *
 * try {
 *   Game.changeScene('nonexistent')
 * } catch (e) {
 *   if (e instanceof SceneError) console.error('Scene issue:', e.message)
 * }
 * ```
 */
export class SceneError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'SceneError'
  }
}

/**
 * The **`SceneNotFoundError`** class is thrown when attempting to access a scene
 * that does not exist in the scene registry. This occurs when `Game.changeScene()`
 * or `Game.preloadScene()` is called with a name that wasn't declared via `<Scene>`.
 *
 * @example
 * ```ts
 * import { Game } from 'fraxel'
 *
 * Game.changeScene('MainMenu') // SceneNotFoundError: Scene "MainMenu" does not exist
 * ```
 */
export class SceneNotFoundError extends SceneError {
  constructor(name: string) {
    super(`Scene "${name}" does not exist`)
  }
}

/**
 * The **`InvalidSceneRootError`** class is thrown when the root element returned by
 * a scene's `component` function is not a valid Node instance. The component must
 * return a single Node (e.g., `<transform>`, `<sprite>`).
 *
 * @example
 * ```tsx
 * // Thrown when scene component returns non-Node:
 * const scene = () => null // InvalidSceneRootError
 * ```
 */
export class InvalidSceneRootError extends SceneError {
  constructor() {
    super(`Scene root must be an instance of Node`)
  }
}
