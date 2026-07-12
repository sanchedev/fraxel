import { InvalidSceneRootError, SceneNotFoundError } from '../errors/scene.js'
import { Node } from '../nodes/_node.js'
import type { Scene } from './scene.js'

/**
 * The **`SceneManager`** class manages scene registration, loading, and switching.
 * It is a standalone singleton — import directly from `'fraxel'`.
 *
 * @example
 * ```ts
 * import { SceneManager, Scene, Game } from 'fraxel'
 *
 * await SceneManager.addScene('main', new Scene(async () => (await import('./main.js')).default), true)
 * Game.play()
 *
 * await SceneManager.setScene('menu')
 * await SceneManager.setScene(null) // unload
 * ```
 */
export class SceneManager {
  static #scenes = new Map<string, Scene>()

  static #currentScene: string | null = null

  static #currentNode: Node | null = null

  /**
   * The **`addScene`** method registers a scene with the given name.
   * Optionally sets it as the current scene immediately.
   *
   * @param name Name of the scene.
   * @param scene Scene instance.
   * @param setit If `true`, sets this scene as current after creation.
   *
   * @example
   * ```ts
   * import { SceneManager, Scene } from 'fraxel'
   *
   * await SceneManager.addScene(
   *   'main',
   *   new Scene(async () => (await import('./scenes/main.js')).default),
   *   true,
   * )
   * ```
   */
  static async addScene(name: string, scene: Scene, setit = false) {
    this.#scenes.set(name, scene)
    if (setit) await this.setScene(name)
  }

  /**
   * The **`preloadScene`** method preloads a scene while the game is running.
   * Returns a function that, when called, switches to the preloaded scene instantly.
   *
   * @param scene Scene name to preload.
   * @returns A function that sets the preloaded scene when called.
   *
   * @example
   * ```ts
   * import { SceneManager } from 'fraxel'
   *
   * const setToGame = await SceneManager.preloadScene('game')
   * // Later, switch instantly:
   * setToGame()
   * ```
   */
  static async preloadScene(scene: string) {
    if (!this.#scenes.has(scene)) {
      throw new SceneNotFoundError(scene)
    }

    const node = await this.#scenes.get(scene)!.load()

    const setScene = () => {
      if (!(node instanceof Node)) {
        throw new InvalidSceneRootError()
      }
      this.#currentScene = scene
      this.#currentNode = node
    }

    return setScene
  }

  /**
   * The **`setScene`** method sets and loads a scene, destroying the previous one.
   * Pass `null` to unload the current scene without loading a new one.
   *
   * @param scene Scene name or `null`.
   *
   * @example
   * ```ts
   * import { SceneManager } from 'fraxel'
   *
   * await SceneManager.setScene('menu')
   * await SceneManager.setScene(null) // unload current scene
   * ```
   */
  static async setScene(scene: string | null) {
    this.#currentNode?.destroy()

    this.#currentScene = null
    this.#currentNode = null

    if (scene == null) return

    if (!this.#scenes.has(scene)) throw new SceneNotFoundError(scene)

    const node = await this.#scenes.get(scene)!.load()

    if (!(node instanceof Node)) {
      throw new InvalidSceneRootError()
    }

    this.#currentScene = scene
    this.#currentNode = node
  }

  /** The read-only **`currentScene`** property returns the current scene name, or `null` if none is active. */
  static get currentScene() {
    return this.#currentScene
  }

  /** The read-only **`currentNode`** property returns the current scene's root `Node`, or `null` if none is active. */
  static get currentNode() {
    return this.#currentNode
  }
}
