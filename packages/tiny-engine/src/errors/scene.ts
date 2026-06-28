import { TinyEngineError } from './base.js'

/**
 * The **`SceneError`** error is thrown when an error occurs during scene management, loading, or rendering.
 * @example
 * ```ts
 * // When this happens:
 * throw new SceneError('Scene operation failed')
 * ```
 */
export class SceneError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'SceneError'
  }
}

/**
 * The **`SceneNotFoundError`** error is thrown when attempting to access a scene that does not exist in the scene registry.
 * @example
 * ```ts
 * // When this happens:
 * throw new SceneNotFoundError('MainMenu')
 * ```
 */
export class SceneNotFoundError extends SceneError {
  constructor(name: string) {
    super(`Scene "${name}" does not exist`)
  }
}

/**
 * The **`InvalidSceneRootError`** error is thrown when the root element of a scene is not a valid Node instance.
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidSceneRootError()
 * ```
 */
export class InvalidSceneRootError extends SceneError {
  constructor() {
    super(`Scene root must be an instance of Node`)
  }
}
