import { FraxelError } from './base.js'

/**
 * The **`EnvironmentError`** class is the base error for environment-related errors.
 * Thrown when the runtime environment does not support a required feature or configuration.
 *
 * @example
 * ```ts
 * import { EnvironmentError } from 'fraxel'
 *
 * try {
 *   Game.setup({ canvas: myCanvas, width: 800, height: 600 })
 * } catch (e) {
 *   if (e instanceof EnvironmentError) console.error('Environment issue:', e.message)
 * }
 * ```
 */
export class EnvironmentError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

/**
 * The **`Context2DNotSupportedError`** class is thrown when the browser does not support
 * the `CanvasRenderingContext2D` API required for 2D rendering. This occurs during
 * `Game.setup()` when the canvas context cannot be obtained.
 *
 * @example
 * ```ts
 * // Thrown automatically when:
 * Game.setup({ canvas: myCanvas, width: 800, height: 600 })
 * // If myCanvas.getContext('2d') returns null
 * ```
 */
export class Context2DNotSupportedError extends EnvironmentError {
  constructor() {
    super('CanvasRenderingContext2D is not supported in this browser')
  }
}
