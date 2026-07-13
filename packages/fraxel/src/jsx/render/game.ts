import { GameRoot, type GameOptions } from '../components/game.js'
import { Game as GameP } from '../../core/game.js'
import { Scene as SceneP } from '../../core/scene.js'
import type { Fraxel } from '../types.js'
import { getFraxelElementFromNode, getFraxelNodesFromNode } from '../utils.js'
import { SceneRoot, type SceneComponent, type SceneOptions } from '../components/scene.js'
import { renderToNodes } from './to-nodes.js'
import { Node } from '../../nodes/_node.js'
import {
  InvalidGameElementError,
  InvalidSceneComponentError,
  MissingGameRootError,
  MissingSceneError,
} from '../../errors/jsx.js'
import { SceneManager } from '../../core/scene-manager.js'
import { finishHooks, startHooks } from '../../hooks/context.js'

/** The **`createGame`** function creates the game and returns an object with control methods that can be used to play, pause the game, change the scene, etc...
 *
 * @example
 * ```js
 * const game = createGame(
 *   <GameRoot width={150} height={75} defaultScene='main'>
 *     <SceneRoot name='main' component={() => import('./scenes/main.js')} />
 *   </GameRoot>,
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
  if (jsxEl == null || jsxEl.type !== GameRoot) {
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
    if (sceneEl?.type !== SceneRoot) {
      throw new MissingSceneError()
    }

    const { name, component } = sceneEl.props as SceneOptions
    SceneManager.addScene(
      name,
      new SceneP(async () => {
        return await SceneComponentToNode(component)
      }),
    )
  }

  SceneManager.setScene(defaultScene)

  return {
    play: () => GameP.play(),
    pause: () => GameP.pause(),
    destroy: () => GameP.destroy(),
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
}

async function SceneComponentToNode(component: SceneComponent): Promise<Node> {
  startHooks()

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

  finishHooks(nodesRendered)

  if (nodesRendered.length !== 1 || !(nodesRendered[0] instanceof Node)) {
    throw new InvalidSceneComponentError()
  }
  return nodesRendered[0]
}
