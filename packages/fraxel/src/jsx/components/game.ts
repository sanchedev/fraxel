import type { Game as GameP } from '../../core/game.js'
import type { Fraxel } from '../types.js'

export type GameOptions = Fraxel.WithChildren<
  Omit<Parameters<(typeof GameP)['setup']>[0], 'root'>
> & {
  /** The **`defaultScene`** of the Game */
  defaultScene: string
}

/**
 * The **`GameRoot`** component is the root component of the game. It is used to set up the game with its properties and its children, which are the scenes of the game.
 *
 * @example
 * ```jsx
 * <GameRoot width={150} height={75} defaultScene='main'>
 *   <SceneRoot name='main' component={() => import('./scenes/main.js')} />
 * </GameRoot>
 * ```
 *
 * @param options - The options for the GameRoot component, which include the properties of the game and its children (the scenes).
 * @returns A JSX element representing the GameRoot component with its properties and children.
 */
export function GameRoot(_options: GameOptions): null {
  return null
}
