import { Texture, textures } from './texture.js'

/**
 * The **`loadTexture`** function loads a single texture from a URL and returns
 * a symbol ID for referencing it. Deduplicates by URL — calling it multiple
 * times with the same URL returns the same symbol.
 *
 * @param url Image URL to load.
 * @returns A symbol ID referencing the loaded texture.
 *
 * @example
 * ```ts
 * import { loadTexture } from 'fraxel'
 *
 * const PLAYER = await loadTexture('/assets/player.png')
 * const BG = await loadTexture('/assets/bg.png')
 * ```
 */
export async function loadTexture(url: string): Promise<symbol> {
  const entry = [...textures.entries()].find(([_, val]) => val.image.src === url)
  if (entry != null) return entry[0]

  const id = Symbol(url)
  const image = new Image()

  await new Promise<void>((resolve, reject) => {
    const removeEvents = () => {
      image.removeEventListener('load', onLoaded)
      image.removeEventListener('error', onError)
    }

    const onLoaded = () => {
      removeEvents()
      resolve()
    }
    const onError = (err: ErrorEvent) => {
      removeEvents()
      reject(err)
    }

    image.addEventListener('load', onLoaded)
    image.addEventListener('error', onError)

    image.src = url
  })

  textures.set(id, new Texture(image))

  return id
}

/**
 * The **`unloadTexture`** function removes a texture from memory by its symbol ID.
 * The texture will no longer be accessible via `getTexture`.
 *
 * @param id The texture symbol ID to unload.
 *
 * @example
 * ```ts
 * import { unloadTexture } from 'fraxel'
 *
 * unloadTexture(PLAYER) // frees the texture from memory
 * ```
 */
export function unloadTexture(id: symbol): void {
  textures.delete(id)
}
