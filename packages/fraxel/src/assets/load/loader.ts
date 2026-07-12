import { loadTexture } from './load-texture.js'
import { loadSound } from './load-sound.js'

/**
 * The **`LoaderOptions`** interface configures batch loading behavior.
 */
export interface LoaderOptions {
  /**
   * Callback invoked as assets finish loading.
   *
   * @param loaded Number of assets loaded so far.
   * @param total Total number of assets to load.
   */
  onProgress?: (loaded: number, total: number) => void
}

/**
 * The **`AssetType`** type specifies the type of asset for `loadBatchAsset`.
 * - `'texture'` — loads via `loadTexture`
 * - `'sound'` — loads via `loadSound`
 */
export type AssetType = 'texture' | 'sound'

/**
 * The **`loadBatch`** function loads multiple assets in parallel with progress
 * tracking. Each loader is a function that returns a promise.
 *
 * @param loaders Array of loader functions.
 * @param options Optional loading options.
 * @returns Array of results in the same order as the input loaders.
 *
 * @example
 * ```ts
 * import { loadBatch, loadTexture, loadSound } from 'fraxel'
 *
 * const [bg, player, shoot] = await loadBatch([
 *   () => loadTexture('/assets/bg.png'),
 *   () => loadTexture('/assets/player.png'),
 *   () => loadSound('/assets/shoot.ogg'),
 * ], {
 *   onProgress: (loaded, total) => console.log(`${loaded}/${total}`),
 * })
 * ```
 */
export async function loadBatch<T>(
  loaders: (() => Promise<T>)[],
  options?: LoaderOptions,
): Promise<T[]> {
  let loaded = 0
  const total = loaders.length

  return Promise.all(
    loaders.map(async (fn) => {
      const result = await fn()
      loaded++
      options?.onProgress?.(loaded, total)
      return result
    }),
  )
}

/**
 * The **`loadBatchAsset`** function loads multiple assets of the same type
 * in parallel with progress tracking.
 *
 * @param type Asset type: `'texture'` or `'sound'`.
 * @param urls Array of URLs to load.
 * @param options Optional loading options.
 * @returns Array of symbol IDs in the same order as the input URLs.
 *
 * @example
 * ```ts
 * import { loadBatchAsset } from 'fraxel'
 *
 * const [bg, player] = await loadBatchAsset('texture', [
 *   '/assets/bg.png',
 *   '/assets/player.png',
 * ], {
 *   onProgress: (loaded, total) => console.log(`${loaded}/${total}`),
 * })
 *
 * const [shoot, hit] = await loadBatchAsset('sound', [
 *   '/assets/shoot.ogg',
 *   '/assets/hit.ogg',
 * ])
 * ```
 */
export async function loadBatchAsset(
  type: AssetType,
  urls: string[],
  options?: LoaderOptions,
): Promise<symbol[]> {
  const loader = type === 'texture' ? loadTexture : loadSound
  let loaded = 0
  const total = urls.length

  return Promise.all(
    urls.map(async (url) => {
      const id = await loader(url)
      loaded++
      options?.onProgress?.(loaded, total)
      return id
    }),
  )
}
