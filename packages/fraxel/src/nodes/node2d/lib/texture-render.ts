import { GameConfig } from '../../../core/game-config.js'
import { Color, type ColorLike } from '../../../math/color.js'
import { Region } from '../../../math/region.js'
import type { Vector2, VectorLike } from '../../../math/vector2.js'
import type { Reactive } from '../../../reactivity/types.js'
import type { Texture } from '../../../assets/texture.js'

/** Shared texture filter options used by render nodes. */
export interface TextureFilterOptions {
  /** The **`displaySize`** property scales the rendered output. */
  displaySize?: Reactive<VectorLike>
  /** The **`brightness`** filter adjusts brightness. `1` is the base value. */
  brightness?: Reactive<number>
  /** The **`grayscale`** filter converts colors to grayscale. */
  grayscale?: Reactive<number>
  /** The **`tint`** filter multiplies colors by an RGBA tint. */
  tint?: Reactive<ColorLike>
  /** The **`contrast`** filter adjusts contrast. `1` is the base value. */
  contrast?: Reactive<number>
  /** The **`saturate`** filter adjusts color saturation. `1` is the base value. */
  saturate?: Reactive<number>
  /** The **`hueRotate`** filter rotates hue in degrees. */
  hueRotate?: Reactive<number>
  /** The **`invert`** filter inverts colors. */
  invert?: Reactive<number>
  /** The **`opacity`** filter adjusts transparency. */
  opacity?: Reactive<number>
}

export interface TextureFilterState {
  brightness: number
  grayscale: number
  tint: Color
  contrast: number
  saturate: number
  hueRotate: number
  invert: number
  opacity: number
}

interface DrawTextureOptions extends TextureFilterState {
  texture: Texture
  position: Vector2
  source?: Region
  displaySize: Vector2
  flipX?: boolean
  flipY?: boolean
}

export const DEFAULT_TEXTURE_FILTERS: TextureFilterState = {
  brightness: 1,
  grayscale: 0,
  tint: Color.WHITE,
  contrast: 1,
  saturate: 1,
  hueRotate: 0,
  invert: 0,
  opacity: 1,
}

export function drawTextureWithFilters(options: DrawTextureOptions): void {
  const ctx = GameConfig.ctx
  const filters: string[] = []
  if (options.brightness !== 1) filters.push(`brightness(${options.brightness})`)
  if (options.grayscale !== 0) filters.push(`grayscale(${options.grayscale})`)
  if (options.contrast !== 1) filters.push(`contrast(${options.contrast})`)
  if (options.saturate !== 1) filters.push(`saturate(${options.saturate})`)
  if (options.hueRotate !== 0) filters.push(`hue-rotate(${options.hueRotate}deg)`)
  if (options.invert !== 0) filters.push(`invert(${options.invert})`)
  if (options.opacity !== 1) filters.push(`opacity(${options.opacity})`)

  ctx.save()

  if (filters.length > 0) {
    ctx.filter = filters.join(' ')
  }

  options.texture.draw({
    display: new Region(options.position, options.displaySize),
    source: options.source,
    flipX: options.flipX,
    flipY: options.flipY,
  })

  if (!options.tint.equals(Color.WHITE)) {
    ctx.filter = 'none'
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = options.tint.toCSS()
    ctx.fillRect(
      options.position.x,
      options.position.y,
      options.displaySize.x,
      options.displaySize.y,
    )
    ctx.globalCompositeOperation = 'source-over'
  }

  ctx.restore()
}
