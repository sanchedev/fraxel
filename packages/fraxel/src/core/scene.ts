import { InvalidSceneRootError } from '../errors/scene.js'
import { Node } from '../nodes/_node.js'

type NodeSceneComponent = Node | Promise<Node>

/**
 * The **`Scene`** class creates scenes for the game.
 *
 *
 * @example
 * **Scene without lazy loading**
 * ```ts
 * new Scene(
 *   new Node({
 *     children: [...]
 *   }),
 * )
 * ```
 *
 *
 * **Scene with lazy loading**
 * ```ts
 * new Scene(
 *   async () => (await import('./scenes/main.js')).default,
 * )
 *
 * // scenes/main.js
 *
 * const main = new Node({
 *   children: [...]
 * })
 *
 * export default main
 * ```
 */
export class Scene {
  constructor(
    /** The **`render`** property is a function that returns a component. */
    public render: () => NodeSceneComponent,
  ) {}

  /** The **`load`** method loads the component and assets. */
  async load() {
    const node = await this.render()

    if (node instanceof Node) return node
    throw new InvalidSceneRootError()
  }
}
