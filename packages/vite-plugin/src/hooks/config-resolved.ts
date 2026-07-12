import type { Plugin } from 'vite'

import type { FraxelContext } from '../context.js'

import { runDiagnostics } from '../diagnostics.js'
import { logger } from '../utils/logger.js'

export function configResolved(ctx: FraxelContext): Plugin['configResolved'] {
  return (config) => {
    ctx.config = config

    logger.info(`Running in ${config.command} mode`)

    runDiagnostics(ctx)
  }
}
