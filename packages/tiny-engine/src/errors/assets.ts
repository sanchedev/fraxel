import { TinyEngineError } from './base.js'

/**
 * The **`AssetError`** error is thrown when an error occurs during asset loading, management, or retrieval.
 * @example
 * ```ts
 * // When this happens:
 * throw new AssetError('Failed to load asset')
 * ```
 */
export class AssetError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'AssetError'
  }
}

/**
 * The **`TextureNotFoundError`** error is thrown when attempting to access a texture that does not exist in the asset registry.
 * @example
 * ```ts
 * // When this happens:
 * throw new TextureNotFoundError('my-texture-id')
 * ```
 */
export class TextureNotFoundError extends AssetError {
  constructor(id: string) {
    super(`Texture "${id}" does not exist`)
  }
}
