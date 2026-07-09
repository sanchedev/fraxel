import { FraxelError } from './base.js'

/**
 * The **`AssetError`** class is the base error for all asset-related errors.
 * Thrown when an error occurs during asset loading, management, or retrieval.
 *
 * @example
 * ```ts
 * import { AssetError } from 'fraxel'
 *
 * try {
 *   loadTexture('/broken/path.png')
 * } catch (e) {
 *   if (e instanceof AssetError) console.error('Asset failed:', e.message)
 * }
 * ```
 */
export class AssetError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'AssetError'
  }
}

/**
 * The **`TextureNotFoundError`** class is thrown when attempting to access a texture
 * by its symbol ID and no matching texture exists in the asset registry. This happens
 * when `getTexture(id)` is called with an ID that was never loaded or has been unloaded.
 *
 * @example
 * ```ts
 * import { getTexture } from 'fraxel'
 *
 * const MISSING = Symbol('missing')
 * getTexture(MISSING) // throws TextureNotFoundError: Texture "Symbol(missing)" does not exist
 * ```
 */
export class TextureNotFoundError extends AssetError {
  constructor(id: string) {
    super(`Texture "${id}" does not exist`)
  }
}

/**
 * The **`SoundNotFoundError`** class is thrown when attempting to access a sound
 * by its symbol ID and no matching sound exists in the audio registry. This happens
 * when `getSound(id)` is called with an ID that was never loaded or has been unloaded.
 *
 * @example
 * ```ts
 * import { getSound } from 'fraxel'
 *
 * const MISSING = Symbol('missing')
 * getSound(MISSING) // throws SoundNotFoundError: Sound "Symbol(missing)" does not exist
 * ```
 */
export class SoundNotFoundError extends AssetError {
  constructor(id: string) {
    super(`Sound "${id}" does not exist`)
  }
}
