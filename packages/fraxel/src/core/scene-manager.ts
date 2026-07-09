import { InvalidSceneRootError, SceneNotFoundError } from '../errors/scene.js'
import { Node } from '../nodes/_node.js'
import type { Scene } from './scene.js'

/**
 * The **`SceneManager`** class manages scene registration, loading, and switching.
 * Access via `Game.sceneManager`.
 */
export class SceneManager {
  #scenes = new Map<string, Scene>()

  #currentScene: string | null = null

  #currentNode: Node | null = null

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
   * import { Scene } from 'fraxel'
   *
   * await Game.sceneManager.addScene(
   *   'main',
   *   new Scene(async () => (await import('./scenes/main.js')).default),
   *   true, // set as current scene
   * )
   * ```
   */
  async addScene(name: string, scene: Scene, setit = false) {
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
   * const setToGame = await Game.sceneManager.preloadScene('game')
   * // Later, switch instantly:
   * setToGame()
   * ```
   */
  async preloadScene(scene: string) {
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
   * await Game.sceneManager.setScene('menu')
   * await Game.sceneManager.setScene(null) // unload current scene
   * ```
   */
  async setScene(scene: string | null) {
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
  get currentScene() {
    return this.#currentScene
  }

  /** The read-only **`currentNode`** property returns the current scene's root `Node`, or `null` if none is active. */
  get currentNode() {
    return this.#currentNode
  }
}
