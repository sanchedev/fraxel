import { InvalidSceneRootError } from '../errors/scene.js'
import { Node } from '../nodes/_node.js'

type NodeSceneComponent = Node | Promise<Node>

/**
 * The **`Scene`** class creates scenes for the game. Each scene wraps a render
 * function that returns a `Node` (or a `Promise<Node>` for lazy loading).
 *
 * @example
 * ```ts
 * import { Scene } from 'fraxel'
 *
 * // Scene without lazy loading
 * new Scene(() => {
 *   return new Node({
 *     children: [...]
 *   })
 * })
 * ```
 *
 * @example
 * ```ts
 * // Scene with lazy loading
 * new Scene(async () => (await import('./scenes/main.js')).default)
 *
 * // scenes/main.js
 * const main = new Node({
 *   children: [...]
 * })
 * export default main
 * ```
 */
export class Scene {
  constructor(
    /** The render function that returns a component or a promise resolving to one. */
    public render: () => NodeSceneComponent,
  ) {}

  /**
   * The **`load`** method loads the scene component by invoking the render function.
   * Throws `InvalidSceneRootError` if the result is not a `Node` instance.
   *
   * @returns The loaded `Node` instance.
   */
  async load() {
    const node = await this.render()

    if (node instanceof Node) return node
    throw new InvalidSceneRootError()
  }
}
