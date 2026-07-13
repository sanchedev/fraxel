import fs from 'node:fs'
import path from 'node:path'

import * as prompts from '@clack/prompts'
import mri from 'mri'

import { copyTemplate } from './copy.js'
import { getInstallCommand, getRunCommand, installDependencies, runDevServer } from './install.js'
import { TEMPLATES, getTemplate } from './templates.js'
import {
  formatTargetDir,
  getPackageManager,
  isEmpty,
  isValidPackageName,
  toValidPackageName,
} from './utils.js'

const argv = mri<{
  template?: string
  overwrite?: boolean
  install?: boolean
  help?: boolean
}>(process.argv.slice(2), {
  alias: {
    t: 'template',
    h: 'help',
  },
  boolean: ['overwrite', 'install', 'help'],
  string: ['template'],
})

const helpMessage = `\
Usage: create-fraxel [directory]

Options:

  -t, --template <name>    Template to use
  --install                Install dependencies
  --overwrite              Overwrite existing directory
  -h, --help               Show this help

Templates:

  empty
  platformer
  top-down
`

export async function runCli() {
  if (argv.help) {
    console.log(helpMessage)
    return
  }

  prompts.intro('🎮 create-fraxel')

  // ---------------------------------------------------------------------------
  // Project name
  // ---------------------------------------------------------------------------

  let targetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : undefined

  if (!targetDir) {
    const result = await prompts.text({
      message: 'Project name',
      placeholder: 'my-game',
      defaultValue: 'my-game',
    })

    if (prompts.isCancel(result)) {
      prompts.cancel('Operation cancelled.')
      return
    }

    targetDir = formatTargetDir(result)
  }

  // ---------------------------------------------------------------------------
  // Existing directory
  // ---------------------------------------------------------------------------

  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    if (!argv.overwrite) {
      const overwrite = await prompts.confirm({
        message: `Directory "${targetDir}" already exists. Overwrite?`,
      })

      if (prompts.isCancel(overwrite) || !overwrite) {
        prompts.cancel('Operation cancelled.')
        return
      }
    }

    fs.rmSync(targetDir, {
      recursive: true,
      force: true,
    })
  }

  // ---------------------------------------------------------------------------
  // Package name
  // ---------------------------------------------------------------------------

  let packageName = path.basename(path.resolve(targetDir))

  if (!isValidPackageName(packageName)) {
    const result = await prompts.text({
      message: 'Package name',
      defaultValue: toValidPackageName(packageName),
    })

    if (prompts.isCancel(result)) {
      prompts.cancel('Operation cancelled.')
      return
    }

    packageName = result
  }

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------

  let template = argv.template

  if (!template || !getTemplate(template)) {
    const result = await prompts.select({
      message: 'Choose a template',
      options: TEMPLATES.map((template) => ({
        value: template.name,
        label: template.color(template.display),
        hint: template.description,
      })),
    })

    if (prompts.isCancel(result)) {
      prompts.cancel('Operation cancelled.')
      return
    }

    template = result
  }

  // ---------------------------------------------------------------------------
  // Install
  // ---------------------------------------------------------------------------

  let install = argv.install

  if (install === undefined) {
    const result = await prompts.confirm({
      message: 'Install dependencies?',
      initialValue: true,
    })

    if (prompts.isCancel(result)) {
      prompts.cancel('Operation cancelled.')
      return
    }

    install = result
  }

  // ---------------------------------------------------------------------------
  // Scaffold
  // ---------------------------------------------------------------------------

  prompts.log.step('Creating project...')

  copyTemplate({
    targetDir,
    packageName,
    template,
  })

  if (install) {
    prompts.log.info(`✨ Using ${getPackageManager()}`)
    await installDependencies(targetDir, getPackageManager())
  }

  const manager = getPackageManager()

  prompts.outro(
    [
      '✨ Project ready!',
      '',
      `cd ${targetDir}`,
      `${getInstallCommand(manager).join(' ')}${install ? '  # already done' : ''}`,
      `${getRunCommand(manager, 'dev').join(' ')}`,
    ].join('\n'),
  )

  // ---------------------------------------------------------------------------
  // Dev Server
  // ---------------------------------------------------------------------------

  if (install) {
    const runDev = await prompts.confirm({
      message: 'Run server?',
      initialValue: true,
    })

    if (prompts.isCancel(runDev)) {
      prompts.cancel('Operation cancelled.')
      return
    }

    if (runDev) {
      runDevServer(targetDir, getPackageManager())
    }
  }
}
