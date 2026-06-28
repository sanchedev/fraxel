import type { Game as GameP } from '../../core/game.js'
import type { Tiny } from '../types.js'

export type GameOptions = Tiny.WithChildren<
  Omit<Parameters<(typeof GameP)['setup']>[0], 'root'>
> & {
  /** The **`defaultScene`** of the Game */
  defaultScene: string
}

/**
 * The **`Game`** component is the root component of the game. It is used to set up the game with its properties and its children, which are the scenes of the game.
 *
 * @example
 * ```jsx
 * <Game width={150} height={75} defaultScene='main'>
 *   <Scene name='main' component={() => import('./scenes/main.js')} />
 * </Game>
 * ```
 *
 * @param options - The options for the Game component, which include the properties of the game and its children (the scenes).
 * @returns A JSX element representing the Game component with its properties and children.
 */
export function Game(_options: GameOptions): null {
  return null
}
