import type { Fraxel } from '../types.js'

type Component = () => Fraxel.Node

export type SceneComponent = (() => Promise<Component | { default: Component }>) | Component

export type SceneOptions = {
  /** **`Name`** of the Scene */
  name: string
  /** The **`component`** attribute is a function or a promise that returns a function that returns a `Node`.
   * @example
   * **Without lazy loading**
   * ```jsx
   * <Scene name='main' component={MainScene} />
   * ```
   * **With lazy loading**
   * ```jsx
   * <Scene name='main' component={() => import('./scenes/main.js')} />
   * ```
   */
  component: SceneComponent
}

/**
 * The **`Scene`** component is used to define a scene in the game. A scene is a collection of nodes that are rendered together. The `Scene` component takes a `name` and a `component` as props. The `name` is used to identify the scene, and the `component` is a function or a promise that returns a function that returns a `Node`. The `Node` returned by the `component` will be rendered when the scene is active.
 *
 * @example
 * **Without lazy loading**
 * ```jsx
 * <Scene name='main' component={MainScene} />
 * ```
 * **With lazy loading**
 * ```jsx
 * <Scene name='main' component={() => import('./scenes/main.js')} />
 * ```
 *
 * @param options The options for the scene, including the `name` and the `component`.
 * @returns A `Scene` element that can be used in the `Game` component to define a scene.
 */
export function Scene(_options: SceneOptions): null {
  return null
}
