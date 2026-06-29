import type { Theme } from './theme.js'
import { Vector2 } from '../math/vector2.js'

export class GameConfig {
  /** The `canvas` of the `Game` */
  static canvas: HTMLCanvasElement
  /** The `context` of the `canvas` */
  static ctx: CanvasRenderingContext2D
  /** The `width` of the `canvas` */
  static width: number
  /** The `height` of the `canvas` */
  static height: number

  /** The `theme` of the `Game` */
  static theme: Theme

  /** The `testOptions` of the `Game` */
  static testOptions: TestOptions

  /** The `translate` represents the global translation of the `Game` */
  static translate = Vector2.ZERO
}

export interface TestOptions {
  showColliders: boolean
  showRayCasts: boolean
  showClickables: boolean
}
const defaultTestOptions: TestOptions = {
  showColliders: false,
  showRayCasts: false,
  showClickables: false,
}

interface GCO {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  theme: Theme
  testOptions?: Partial<TestOptions>
}

export function _set_gc({
  canvas,
  ctx,
  width,
  height,
  theme,
  testOptions = {},
}: GCO) {
  GameConfig.canvas = canvas
  GameConfig.ctx = ctx
  GameConfig.width = width
  GameConfig.height = height
  GameConfig.testOptions = { ...defaultTestOptions, ...testOptions }
  GameConfig.theme = theme
}
