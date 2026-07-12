import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import type { FraxelContext } from './context.js'
import type { DiagnosticsLevel } from './options.js'
import { logger } from './utils/logger.js'

const REACT_PLUGIN_PATTERN = /react/

function emit(ctx: FraxelContext, level: DiagnosticsLevel, message: string, isError: boolean) {
  if (level === false) return

  if (isError && level === 'error') {
    throw new Error(`[Fraxel] ${message}`)
  }

  if (isError) {
    logger.warn(message)
  } else {
    logger.info(message)
  }
}

function checkReactPluginConflict(ctx: FraxelContext, level: DiagnosticsLevel) {
  if (!ctx.config) return

  const reactPlugins = ctx.config.plugins.filter((plugin) => {
    const name = plugin.name ?? ''
    return REACT_PLUGIN_PATTERN.test(name)
  })

  if (reactPlugins.length > 0) {
    const names = reactPlugins.map((p) => p.name).join(', ')
    emit(
      ctx,
      level,
      `Conflicting React plugin(s) detected: ${names}. ` +
        'This will override the Fraxel JSX transform. ' +
        'Remove the React plugin or place fraxel() after it in the plugins array.',
      true,
    )
  }
}

function checkJsxConfig(ctx: FraxelContext, level: DiagnosticsLevel) {
  if (!ctx.config) return

  const oxc = ctx.config.oxc

  if (oxc === false) {
    emit(ctx, level, 'oxc is disabled. JSX transform may not work correctly with Fraxel.', true)
    return
  }

  const jsx = oxc?.jsx

  if (typeof jsx !== 'object' || jsx === null) {
    emit(
      ctx,
      level,
      'oxc.jsx is not configured. The fraxel plugin should handle this automatically.',
      true,
    )
    return
  }

  if (jsx.runtime !== 'automatic') {
    emit(
      ctx,
      level,
      `JSX runtime is "${jsx.runtime}" but should be "automatic" for Fraxel. ` +
        'The fraxel plugin sets this automatically — check for conflicting plugins.',
      true,
    )
  }

  if (jsx.importSource !== 'fraxel') {
    emit(
      ctx,
      level,
      `JSX import source is "${jsx.importSource}" but should be "fraxel". ` +
        'The fraxel plugin sets this automatically — check for conflicting plugins.',
      true,
    )
  }
}

function checkTsconfig(ctx: FraxelContext, level: DiagnosticsLevel) {
  if (!ctx.config) return

  const tsconfigPath = path.resolve(ctx.config.root, 'tsconfig.json')

  if (!fs.existsSync(tsconfigPath)) {
    emit(
      ctx,
      level,
      `tsconfig.json not found at ${tsconfigPath}. ` +
        'TypeScript will not be able to type-check Fraxel JSX without it.',
      true,
    )
    return
  }

  const parsed = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (parsed.error) {
    emit(ctx, level, `Failed to parse tsconfig.json at ${tsconfigPath}`, true)
    return
  }

  const compilerOptions = (parsed.config?.compilerOptions ?? {}) as Record<string, unknown>

  if (Object.keys(compilerOptions).length === 0) {
    emit(
      ctx,
      level,
      'tsconfig.json is missing "compilerOptions". ' +
        'Add "jsx": "react-jsx" and "jsxImportSource": "fraxel" for Fraxel JSX support.',
      true,
    )
    return
  }

  if (compilerOptions.jsx !== 'react-jsx') {
    emit(
      ctx,
      level,
      `tsconfig.json has "jsx": "${compilerOptions.jsx}" but should be "react-jsx" for Fraxel. ` +
        'TypeScript will not recognize Fraxel JSX elements.',
      true,
    )
  }

  if (compilerOptions.jsxImportSource !== 'fraxel') {
    emit(
      ctx,
      level,
      `tsconfig.json has "jsxImportSource": "${compilerOptions.jsxImportSource}" but should be "fraxel". ` +
        'TypeScript will not resolve Fraxel JSX components.',
      true,
    )
  }
}

export function getFraxelVersion(ctx: FraxelContext): string | undefined {
  if (!ctx.config) return undefined

  try {
    const pkgPath = path.resolve(ctx.config.root, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version?: string }
    return pkg.version
  } catch {
    return undefined
  }
}

function checkVersions(ctx: FraxelContext, level: DiagnosticsLevel) {
  const version = getFraxelVersion(ctx)

  if (version) {
    ctx.fraxelVersion = version
    return
  }

  emit(
    ctx,
    level,
    'Could not resolve fraxel package. Make sure fraxel is installed in your project.',
    true,
  )
}

export function runDiagnostics(ctx: FraxelContext) {
  const level: DiagnosticsLevel = ctx.options.diagnostics ?? 'warn'
  if (level === false) return

  checkReactPluginConflict(ctx, level)
  checkJsxConfig(ctx, level)
  checkTsconfig(ctx, level)
  checkVersions(ctx, level)
}
