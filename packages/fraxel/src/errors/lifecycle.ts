import { FraxelError } from './base.js'

/**
 * The **`EngineStateError`** class is the base error for engine lifecycle errors.
 * Thrown when an operation is attempted that is invalid given the current state
 * of the engine (e.g., using a node before the engine is set up).
 *
 * @example
 * ```ts
 * import { EngineStateError } from 'fraxel'
 *
 * try {
 *   Game.play() // if setup() was never called
 * } catch (e) {
 *   if (e instanceof EngineStateError) console.error('Engine not ready:', e.message)
 * }
 * ```
 */
export class EngineStateError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'EngineStateError'
  }
}

/**
 * The **`EngineNotSetupError`** class is thrown when attempting to start the game
 * (via `Game.play()`) before calling `Game.setup()` to initialize the engine.
 *
 * @example
 * ```ts
 * // Thrown when game loop starts before initialization:
 * // Game.play() called without prior Game.setup()
 * ```
 */
export class EngineNotSetupError extends EngineStateError {
  constructor() {
    super('Game cannot start before calling setup()')
  }
}

/**
 * The **`NodeNotInitializedError`** class is thrown when a node is accessed or used
 * before it has been initialized by the engine, or when a `ref` from a native hook
 * is used before the node mounts. This commonly happens when calling hook methods
 * outside of `useEffect` or `useMount`.
 *
 * @example
 * ```ts
 * // Thrown when a node ref is used before the node is placed in the scene:
 * const sprite = useSprite()
 * sprite.setBrightness(1.2) // NodeNotInitializedError if called outside useEffect
 * ```
 */
export class NodeNotInitializedError extends EngineStateError {
  constructor(nodeName: string) {
    super(
      `Node "${nodeName}" was used before initialization or It has not been placed in the ref attribute`,
    )
  }
}
