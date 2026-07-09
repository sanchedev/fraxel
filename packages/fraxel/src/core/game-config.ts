import type { Theme } from './theme.js'
import { Vector2 } from '../math/vector2.js'

/**
 * The **`GameConfig`** class is a static singleton that holds the canvas, context,
 * dimensions, theme, and test options for the game. Accessed internally by the
 * rendering pipeline.
 */
export class GameConfig {
  /** The game's `HTMLCanvasElement`. */
  static canvas: HTMLCanvasElement
  /** The canvas `CanvasRenderingContext2D`. */
  static ctx: CanvasRenderingContext2D
  /** The logical width of the canvas. */
  static width: number
  /** The logical height of the canvas. */
  static height: number

  /** The game's default `Theme`. */
  static theme: Theme

  /** Debug rendering options. */
  static testOptions: TestOptions

  /** The global translation offset used by the camera system. */
  static translate = Vector2.ZERO
}

/**
 * The **`TestOptions`** interface configures debug visualization overlays.
 */
export interface TestOptions {
  /** Show collider shapes overlaid on sprites. */
  showColliders: boolean
  /** Show raycast lines. */
  showRayCasts: boolean
  /** Show clickable hit areas. */
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

export function _set_gc({ canvas, ctx, width, height, theme, testOptions = {} }: GCO) {
  GameConfig.canvas = canvas
  GameConfig.ctx = ctx
  GameConfig.width = width
  GameConfig.height = height
  GameConfig.testOptions = { ...defaultTestOptions, ...testOptions }
  GameConfig.theme = theme
}
