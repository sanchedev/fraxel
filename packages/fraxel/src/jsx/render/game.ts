import { Game, type GameOptions } from '../components/game.js'
import { Game as GameP } from '../../core/game.js'
import { Scene as SceneP } from '../../core/scene.js'
import type { Fraxel } from '../types.js'
import { getFraxelElementFromNode, getFraxelNodesFromNode } from '../utils.js'
import { Scene, type SceneComponent, type SceneOptions } from '../components/scene.js'
import { renderToNodes } from './to-nodes.js'
import { Node } from '../../nodes/_node.js'
import {
  InvalidGameElementError,
  InvalidSceneComponentError,
  MissingGameRootError,
  MissingSceneError,
} from '../../errors/jsx.js'
import { vector2, Vector2 } from '../../math/vector2.js'
import { GameConfig } from '../../core/game-config.js'

/** The **`createGame`** function creates the game and returns an object with control methods that can be used to play, pause the game, change the scene, etc...
 *
 * @example
 * ```js
 * const game = createGame(
 *   <Game width={150} height={75} defaultScene='main'>
 *     <Scene name='main' component={() => import('./scenes/main.js')} />
 *   </Game>,
 *   document.querySelector('#root')
 * )
 * ```
 *
 * @param jsx The jsx to create the game
 * @param root Where the canvas will create
 */
export function createGame(jsx: Fraxel.Node, root: HTMLElement): GameControls {
  if (root == null) {
    throw new MissingGameRootError()
  }

  const jsxEl = getFraxelElementFromNode(jsx)
  if (jsxEl == null || jsxEl.type !== Game) {
    throw new InvalidGameElementError()
  }
  const { children, defaultScene, ...setupOptions } = jsxEl.props as GameOptions

  GameP.setup({
    ...setupOptions,
    root,
  })

  const scenes = getFraxelNodesFromNode(children)

  for (const scene of scenes) {
    const sceneEl = getFraxelElementFromNode(scene)
    if (sceneEl?.type !== Scene) {
      throw new MissingSceneError()
    }

    const { name, component } = sceneEl.props as SceneOptions
    GameP.sceneManager.addScene(
      name,
      new SceneP(async () => {
        return await SceneComponentToNode(component)
      }),
    )
  }

  GameP.sceneManager.setScene(defaultScene)

  return {
    play: () => GameP.play(),
    pause: () => GameP.pause(),
    destroy: () => GameP.destroy(),
    changeScene: (name) => {
      return GameP.sceneManager.setScene(name)
    },
    preloadScene: (name) => {
      return GameP.sceneManager.preloadScene(name)
    },
    getSize() {
      return vector2(GameConfig.width, GameConfig.height)
    },
  }
}

export interface GameControls {
  /**
   * The **`play`** method starts the game.
   */
  play: () => void
  /**
   * The **`pause`** method pauses the game.
   */
  pause: () => void
  /**
   * The **`destroy`** method destroys the game.
   */
  destroy: () => void
  /**
   * The **`changeScene`** method sets and loads the scene.
   */
  changeScene: (name: string) => Promise<void>
  /**
   * The **`preloadScene`** method preloads the scene while the Game is running and returns a function to set this scene when it is loaded.
   */
  preloadScene: (name: string) => Promise<() => void>
  /**
   * The **`getSize`** method returns the size of the game screen as Vector2.
   */
  getSize: () => Vector2
}

async function SceneComponentToNode(component: SceneComponent): Promise<Node> {
  const node = await component()

  let nodesRendered: Node[]

  if (node == null || typeof node === 'string' || typeof node === 'number' || 'type' in node) {
    nodesRendered = renderToNodes(node)
  } else if (typeof node === 'function') {
    nodesRendered = renderToNodes(node())
  } else if ('default' in node) {
    nodesRendered = renderToNodes(node.default())
  } else {
    nodesRendered = renderToNodes(node)
  }

  if (nodesRendered.length !== 1 || !(nodesRendered[0] instanceof Node)) {
    throw new InvalidSceneComponentError()
  }
  return nodesRendered[0]
}
