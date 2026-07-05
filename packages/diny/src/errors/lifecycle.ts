import { TinyEngineError } from './base.js'

/**
 * The **`EngineStateError`** error is thrown when an operation is attempted that is invalid given the current state of the engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new EngineStateError('Invalid engine state')
 * ```
 */
export class EngineStateError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'EngineStateError'
  }
}

/**
 * The **`EngineNotSetupError`** error is thrown when attempting to start the game before calling `setup()` to initialize the engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new EngineNotSetupError()
 * ```
 */
export class EngineNotSetupError extends EngineStateError {
  constructor() {
    super('Game cannot start before calling setup()')
  }
}

/**
 * The **`NodeNotInitializedError`** error is thrown when a node is accessed or used before it has been initialized by the engine.
 * @example
 * ```ts
 * // When this happens:
 * throw new NodeNotInitializedError('Player')
 * ```
 */
export class NodeNotInitializedError extends EngineStateError {
  constructor(nodeName: string) {
    super(
      `Node "${nodeName}" was used before initialization or It has not been placed in the ref attribute`,
    )
  }
}
