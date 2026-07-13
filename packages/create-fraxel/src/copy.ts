import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { templateDir } from './templates.js'

export interface CopyTemplateOptions {
  targetDir: string
  packageName: string
  template: string
}

const renameFiles: Record<string, string> = {
  _gitignore: '.gitignore',
}

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')

export function copyTemplate(options: CopyTemplateOptions) {
  const templatePath = path.join(rootDir, templateDir(options.template))

  fs.mkdirSync(options.targetDir, {
    recursive: true,
  })

  const files = fs.readdirSync(templatePath)

  for (const file of files) {
    if (file === 'package.json') {
      continue
    }

    copy(path.join(templatePath, file), path.join(options.targetDir, renameFiles[file] ?? file))
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templatePath, 'package.json'), 'utf8'))

  pkg.name = options.packageName

  fs.writeFileSync(
    path.join(options.targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
  )
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    copyDir(src, dest)
    return
  }

  fs.copyFileSync(src, dest)
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, {
    recursive: true,
  })

  for (const file of fs.readdirSync(src)) {
    copy(path.join(src, file), path.join(dest, renameFiles[file] ?? file))
  }
}
