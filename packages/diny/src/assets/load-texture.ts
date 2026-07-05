import { Texture, textures } from './texture.js'

/**
 * The **`loadTexture`** function loads a single texture.
 * @param url Image URL
 * @returns A symbol ID referencing the loaded texture
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
 * Unloads a texture from memory.
 * @param id The texture symbol ID to unload
 */
export function unloadTexture(id: symbol): void {
  textures.delete(id)
}
