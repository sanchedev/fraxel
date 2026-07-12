import type { Plugin } from 'vite'

export const config: Plugin['config'] = (config) => {
  return {
    ...config,
    oxc:
      config.oxc === false
        ? false
        : {
            ...(config.oxc || {}),
            jsx:
              config.oxc?.jsx === 'preserve'
                ? 'preserve'
                : { runtime: 'automatic', importSource: 'fraxel', ...(config.oxc?.jsx ?? {}) },
          },
  }
}
