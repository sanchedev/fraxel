import { InvalidSceneRootError, SceneNotFoundError } from '../errors/scene.js'
import { Node } from '../nodes/_node.js'
import type { Scene } from './scene.js'

export class SceneManager {
  #scenes = new Map<string, Scene>()

  #currentScene: string | null = null

  #currentNode: Node | null = null

  /**
   * The **`addScene`** method adds the `scene` with the `name`.
   * @param name Name of the Scene
   * @param scene Scene instance
   * @param setit If you want set this scene after create it.
   */
  async addScene(name: string, scene: Scene, setit = false) {
    this.#scenes.set(name, scene)
    if (setit) await this.setScene(name)
  }

  /**
   * The **`preloadScene`** method preloads the scene while the Game is running.
   * @param scene Scene name
   * @returns Returns a function to set the preloaded scene.
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
   * The **`setScene`** method sets and loads the `scene` with the Game paused.
   * @param scene Scene name or `null`
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

  /** The read-only **`currentScene`** property returns the current scene name. */
  get currentScene() {
    return this.#currentScene
  }

  /** The read-only **`currentNode`** property returns the current scene node. */
  get currentNode() {
    return this.#currentNode
  }
}
