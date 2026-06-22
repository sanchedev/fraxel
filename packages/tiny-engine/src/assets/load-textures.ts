import { Texture, textures } from '../assets/texture.js'

/**
 * The **`loadTexture`** function loads textures for be used.
 * @param url Image Url
 */
export async function loadTexture(url: string): Promise<symbol> {
  const entry = [...textures.entries()].find(
    ([_, val]) => val.image.src === url,
  )
  if (entry != null) return entry[0]

  const id = Symbol(url)
  const image = new Image()

  await new Promise<void>((resolve, reject) => {
    const removeEvents = () => {
      image.removeEventListener('loadedmetadata', onLoaded)
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
