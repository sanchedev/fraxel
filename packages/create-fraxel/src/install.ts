import spawn from 'cross-spawn'
import * as prompts from '@clack/prompts'

export async function installDependencies(cwd: string, packageManager: string) {
  prompts.log.step(`Installing dependencies with ${packageManager}...`)

  run(getInstallCommand(packageManager), cwd)
}

export function runDevServer(cwd: string, packageManager: string) {
  prompts.log.step('Starting development server...')

  run(getRunCommand(packageManager, 'dev'), cwd)
}

function run([command, ...args]: string[], cwd: string) {
  const { status, error } = spawn.sync(command!, args, {
    cwd,
    stdio: 'inherit',
  })

  if (error) {
    throw error
  }

  if (status && status > 0) {
    process.exit(status)
  }
}

export function getInstallCommand(agent: string): string[] {
  switch (agent) {
    case 'npm':
      return ['npm', 'install']

    case 'pnpm':
      return ['pnpm', 'install']

    case 'yarn':
      return ['yarn']

    case 'bun':
      return ['bun', 'install']

    default:
      return [agent, 'install']
  }
}

export function getRunCommand(agent: string, script: string): string[] {
  switch (agent) {
    case 'npm':
      return ['npm', 'run', script]

    case 'pnpm':
      return ['pnpm', script]

    case 'yarn':
      return ['yarn', script]

    case 'bun':
      return ['bun', 'run', script]

    default:
      return [agent, 'run', script]
  }
}
