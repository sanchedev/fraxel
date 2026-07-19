import { GameConfig } from '../../../core/game-config.js'
import { Color, type ColorLike } from '../../../math/color.js'
import { Region } from '../../../math/region.js'
import type { Vector2, VectorLike } from '../../../math/vector2.js'
import type { Reactive } from '../../../reactivity/types.js'
import type { TextureDrawOptions } from '../../../assets/texture.js'
import { OffscreenCanvas } from '../../../core/offscreen-canvas.js'
import { OffscreenTexture } from '../../../assets/offscreen-texture.js'

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

interface DrawableTexture {
  width: number
  height: number
  draw(options: TextureDrawOptions): void
}

interface DrawTextureOptions extends TextureFilterState {
  texture: DrawableTexture
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

const tintCache = new Map<DrawableTexture, Map<string, OffscreenTexture>>()

function getTintCacheKey(tint: Color): string {
  return tint.toString()
}

function getOrCreateTintedTexture(texture: DrawableTexture, tint: Color): OffscreenTexture {
  let textureCache = tintCache.get(texture)
  if (!textureCache) {
    textureCache = new Map()
    tintCache.set(texture, textureCache)
  }

  const cacheKey = getTintCacheKey(tint)
  let cached = textureCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const offscreenCanvas = new OffscreenCanvas(texture.width, texture.height)
  const ctx = offscreenCanvas.ctx

  ctx.save()

  texture.draw({
    display: new Region(0, [texture.width, texture.height]),
    ctx,
  })

  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = tint.a
  ctx.fillStyle = tint.toCSS()
  ctx.fillRect(0, 0, texture.width, texture.height)

  ctx.globalCompositeOperation = 'destination-in'
  ctx.globalAlpha = 1

  texture.draw({
    display: new Region(0, [texture.width, texture.height]),
    ctx,
  })

  ctx.restore()

  cached = new OffscreenTexture(offscreenCanvas)
  textureCache.set(cacheKey, cached)

  return cached
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

  let textureToDraw = options.texture

  if (!options.tint.equals(Color.WHITE)) {
    textureToDraw = getOrCreateTintedTexture(options.texture, options.tint)
  }

  textureToDraw.draw({
    display: new Region(options.position, options.displaySize),
    source: options.source,
    flipX: options.flipX,
    flipY: options.flipY,
  })

  ctx.restore()
}
