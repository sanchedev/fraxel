import type { Plugin } from 'vite'
import { detectFraxelAsset, stripFraxelQuery } from './assets.js'
import { config } from './hooks/config.js'
import type { FraxelPluginOptions } from './options.js'
import { createContext } from './context.js'
import { configResolved } from './hooks/config-resolved.js'

const VIRTUAL_ID = 'virtual:fraxel'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

const ASSET_VIRTUAL_PREFIX = '\0fraxel:'

const assetRegistry = new Map<string, string>()

/**
 * Creates the official Vite plugin for Fraxel.
 *
 * The plugin configures the JSX runtime, enables the Fraxel asset pipeline,
 * and provides build-time tooling for developing 2D games with Vite.
 *
 * @param options Plugin configuration options.
 * @returns A Vite plugin instance.
 *
 * @example
 * ```js
 * import { defineConfig } from 'vite'
 * import { fraxel } from '@fraxel/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [fraxel()],
 * })
 * ```
 */
export function fraxel(options: FraxelPluginOptions = {}): Plugin {
  const ctx = createContext(options)

  return {
    name: 'fraxel',
    enforce: 'pre',

    config,

    configResolved: configResolved(ctx),

    async resolveId(source, importer, options) {
      if (source === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID
      }

      const type = detectFraxelAsset(source)
      if (type == null || importer == null) return

      if (importer.startsWith(ASSET_VIRTUAL_PREFIX)) return

      const cleanPath = stripFraxelQuery(source)
      const resolved = await this.resolve(cleanPath, importer, {
        skipSelf: true,
        kind: options.kind,
      })

      if (resolved == null) return

      const virtualId = `${ASSET_VIRTUAL_PREFIX}${type}:${resolved.id}`
      assetRegistry.set(virtualId, resolved.id)
      return virtualId
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return [
          `export const version = ${JSON.stringify(ctx.fraxelVersion ?? '0.0.0')};`,
          `export const mode = ${JSON.stringify(ctx.config?.mode ?? 'production')};`,
          `export const debug = ${JSON.stringify(ctx.options.debug ?? false)};`,
        ].join('\n')
      }

      if (!id.startsWith(ASSET_VIRTUAL_PREFIX)) return

      const filePath = assetRegistry.get(id)
      if (filePath == null) return

      const isTexture = id.includes(':texture:')
      const loader = isTexture ? 'loadTexture' : 'loadSound'

      const code = [
        `import assetUrl from ${JSON.stringify(filePath)};`,
        `import { ${loader} } from 'fraxel';`,
        `export default await ${loader}(assetUrl);`,
      ].join('\n')
      return code
    },
  }
}
