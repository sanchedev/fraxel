import pc from 'picocolors'

export interface Template {
  /**
   * Template identifier.
   */
  name: string

  /**
   * Display name shown in the CLI.
   */
  display: string

  /**
   * Small description shown as hint.
   */
  description: string

  /**
   * Color used by the prompt.
   */
  color(text: string): string
}

export const TEMPLATES: Template[] = [
  {
    name: 'empty',
    display: 'Empty',
    description: 'Minimal Fraxel project.',
    color: pc.yellow,
  },
  {
    name: 'platformer',
    display: 'Platformer',
    description: 'Basic side-scrolling platformer.',
    color: pc.green,
  },
  {
    name: 'top-down',
    display: 'Top-down',
    description: 'Basic top-down movement.',
    color: pc.cyan,
  },
  {
    name: 'coin-box',
    display: 'Coin Box',
    description: 'Drag-and-drop coin collection game.',
    color: pc.magenta,
  },
]

export function getTemplate(name: string): Template | undefined {
  return TEMPLATES.find((template) => template.name === name)
}

export function hasTemplate(name: string): boolean {
  return getTemplate(name) !== undefined
}

export function templateDir(name: string): string {
  return `template-${name}`
}
