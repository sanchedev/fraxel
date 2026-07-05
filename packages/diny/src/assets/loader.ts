import { loadTexture } from './load-texture.js'
import { loadSound } from './load-sound.js'

/**
 * Options for batch loading.
 */
export interface LoaderOptions {
  /**
   * Callback invoked as assets finish loading.
   * @param loaded Number of assets loaded so far
   * @param total Total number of assets to load
   */
  onProgress?: (loaded: number, total: number) => void
}

/**
 * Asset type for `loadBatchAsset`.
 */
export type AssetType = 'texture' | 'sound'

/**
 * Loads multiple assets in parallel with progress tracking.
 * Each loader is a function that returns a promise.
 *
 * @param loaders Array of loader functions
 * @param options Loading options
 * @returns Array of results in the same order as the input loaders
 *
 * @example
 * ```ts
 * const [bg, player] = await loadBatch([
 *   () => loadTexture('/assets/bg.png'),
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
 * Loads multiple assets of the same type in parallel with progress tracking.
 *
 * @param type Asset type: `'texture'` or `'sound'`
 * @param urls Array of URLs to load
 * @param options Loading options
 * @returns Array of symbol IDs in the same order as the input URLs
 *
 * @example
 * ```ts
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
