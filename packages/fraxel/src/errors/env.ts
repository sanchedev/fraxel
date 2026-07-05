import { FraxelError } from './base.js'

/**
 * The **`EnvironmentError`** error is thrown when the runtime environment does not support a required feature or configuration.
 * @example
 * ```ts
 * // When this happens:
 * throw new EnvironmentError('Feature not supported')
 * ```
 */
export class EnvironmentError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

/**
 * The **`Context2DNotSupportedError`** error is thrown when the browser does not support the `CanvasRenderingContext2D` API required for 2D rendering.
 * @example
 * ```ts
 * // When this happens:
 * throw new Context2DNotSupportedError()
 * ```
 */
export class Context2DNotSupportedError extends EnvironmentError {
  constructor() {
    super('CanvasRenderingContext2D is not supported in this browser')
  }
}
