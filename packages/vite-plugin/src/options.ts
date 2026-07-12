export type DiagnosticsLevel = boolean | 'warn' | 'error'

export interface FraxelPluginOptions {
  debug?: boolean
  diagnostics?: DiagnosticsLevel
}
