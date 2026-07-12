import type { ResolvedConfig } from 'vite'

import type { FraxelPluginOptions } from './options.js'

export interface FraxelContext {
  options: FraxelPluginOptions
  config?: ResolvedConfig
  fraxelVersion?: string
}

export function createContext(options: FraxelPluginOptions): FraxelContext {
  return {
    options,
  }
}
