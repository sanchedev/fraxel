#!/usr/bin/env node

import { runCli } from './cli.js'

runCli().catch((error) => {
  console.error(error)

  process.exit(
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'ABORT_ERR'
      ? 0
      : 1,
  )
})
