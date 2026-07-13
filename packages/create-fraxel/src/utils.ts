import fs from 'node:fs'

export function formatTargetDir(targetDir: string): string {
  return targetDir
    .trim()
    .replace(/[<>:"\\|?*]/g, '')
    .replace(/\/+$/g, '')
}

export function isEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return true
  }

  const files = fs.readdirSync(dir)

  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

export function isValidPackageName(name: string): boolean {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/i.test(name)
}

export function toValidPackageName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d-~]+/g, '-')
}

export function getPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent

  if (!userAgent) {
    return 'npm'
  }

  return userAgent.split(' ')[0]!.split('/')[0]!
}
