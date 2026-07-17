import type { TileSet } from '../../assets/tileset.js'
import { InvalidMapRowLengthError, InvalidTileKeyError } from '../../errors/tilemap.js'
import { Color, type ColorLike } from '../../math/color.js'
import { Vector2, vector2, type VectorLike } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { ns, propSignal, signalColor, signalVector } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { drawTextureWithFilters } from './lib/texture-render.js'

/**
 * The **`TileMapOptions`** interface defines the configuration for a `TileMap` node.
 *
 * Use it to configure the tileset, string grid, and Sprite-style render filters
 * for a render-only tilemap. Physics and triggers are created separately with
 * `RigidBody`/`Detector` and `Collider` nodes.
 *
 * @typeParam T - Union of valid single-character tile keys accepted by `tiles`.
 *
 * @example
 * ```tsx
 * <tilemap tiles={tiles} map={['xxx', 'x x', 'xxx']} opacity={0.8} />
 * ```
 */
export interface TileMapOptions<
  T extends string = string,
> extends Node2DOptions<PrimaryNode.TileMap> {
  /**
   * The **`tiles`** property defines the tileset used to render and resolve tile keys.
   *
   * Use it to connect map characters to texture regions. Every non-space character
   * in `map` must exist in this `TileSet`.
   *
   * @example
   * ```ts
   * import { tileset, tile } from 'fraxel'
   *
   * const tiles = tileset(TILE_TEXTURE, [16, 16], {
   *   x: tile([0, 16]),
   * })
   * ```
   */
  tiles: TileSet<T>
  /**
   * The **`map`** property defines the tilemap grid as an array of equal-length strings.
   *
   * Each character maps to a tile key in the `TileSet`. Space characters render as empty.
   *
   * @example
   * ```tsx
   * <tilemap map={['   ', ' xxx', 'xxxxx']} />
   * ```
   */
  map: string[]
  /**
   * The **`displaySize`** property defines the rendered size of each tile cell.
   *
   * Use it to scale the tilemap without changing the source tile size. When omitted,
   * each tile renders at `tiles.size`.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} displaySize={[32, 32]} />
   * ```
   */
  displaySize?: Reactive<VectorLike>
  /**
   * The **`brightness`** filter adjusts every rendered tile's brightness.
   *
   * Use values below `1` to darken and above `1` to brighten the whole tilemap.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} brightness={1.2} />
   * ```
   */
  brightness?: Reactive<number>
  /**
   * The **`grayscale`** filter converts every rendered tile toward grayscale.
   *
   * Use `0` for original colors and `1` for fully grayscale rendering.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} grayscale={1} />
   * ```
   */
  grayscale?: Reactive<number>
  /**
   * The **`tint`** filter multiplies every rendered tile by a color.
   *
   * Use it for map-wide color states such as damage, selection, or biome tinting.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} tint="#88ccff" />
   * ```
   */
  tint?: Reactive<ColorLike>
  /**
   * The **`contrast`** filter adjusts every rendered tile's contrast.
   *
   * Use `1` for original contrast, lower values to flatten contrast, and higher
   * values to increase separation between light and dark colors.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} contrast={1.25} />
   * ```
   */
  contrast?: Reactive<number>
  /**
   * The **`saturate`** filter adjusts every rendered tile's color saturation.
   *
   * Use `1` for original saturation, `0` for desaturated colors, and values above
   * `1` for more intense colors.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} saturate={1.5} />
   * ```
   */
  saturate?: Reactive<number>
  /**
   * The **`hueRotate`** filter rotates every rendered tile's hue in degrees.
   *
   * Use it to shift tile colors without changing texture assets.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} hueRotate={90} />
   * ```
   */
  hueRotate?: Reactive<number>
  /**
   * The **`invert`** filter inverts every rendered tile's colors.
   *
   * Use `0` for original colors and `1` for fully inverted colors.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} invert={1} />
   * ```
   */
  invert?: Reactive<number>
  /**
   * The **`opacity`** filter adjusts every rendered tile's transparency.
   *
   * Use `1` for fully opaque and `0` for fully transparent rendering.
   *
   * @example
   * ```tsx
   * <tilemap tiles={tiles} map={map} opacity={0.5} />
   * ```
   */
  opacity?: Reactive<number>
}

/**
 * The **`TileMap`** node displays a tilemap in the world.
 *
 * `TileMap` is render-only. Use explicit `RigidBody`/`Detector` and `Collider` nodes
 * for physics or trigger zones.
 * All map rows must have the same length. Space characters render as empty tiles.
 *
 * @typeParam T - Union of valid single-character tile keys accepted by `tiles`.
 *
 * @example
 * ```tsx
 * import { tileset, tile } from 'fraxel'
 * import { TILE_TEXTURE } from '../assets.js'
 *
 * const tiles = tileset(TILE_TEXTURE, [16, 16], {
 *   x: tile([0, 16]),
 *   o: tile([16, 16]),
 * })
 *
 * function Map() {
 *   return (
 *     <tilemap
 *       tiles={tiles}
 *       map={[
 *         'xxxxxxxxx',
 *         'x.......x',
 *         'x.......x',
 *         'xxxxxxxxx',
 *       ]}
 *     />
 *   )
 * }
 * ```
 */
export class TileMap<const T extends string> extends Node2D<PrimaryNode.TileMap> {
  #tiles: TileSet<T>
  #map: string[]

  /**
   * The **`displaySize`** property returns or sets the rendered size of each tile cell.
   *
   * Use it to scale a tilemap at runtime while keeping source crops based on the
   * original `TileSet.size`.
   *
   * @example
   * ```ts
   * tilemap.displaySize = vector2(32, 32)
   * ```
   */
  displaySize?: Vector2 | undefined

  #brightness = 1
  #grayscale = 0
  #tint: Color = Color.WHITE
  #contrast = 1
  #saturate = 1
  #hueRotate = 0
  #invert = 0
  #opacity = 1

  /**
   * The **`tiles`** property returns the tileset used by this tilemap.
   *
   * Use it to inspect the tile keys, cell size, or texture data used by the node.
   *
   * @example
   * ```ts
   * const keys = tilemap.tiles.keys
   * ```
   */
  get tiles(): TileSet<T> {
    return this.#tiles
  }

  /**
   * The **`map`** property returns a copy of the tilemap grid.
   *
   * Use it to inspect the current grid without mutating the internal map array.
   *
   * @example
   * ```ts
   * const rows = tilemap.map
   * ```
   */
  get map(): string[] {
    return this.#map.slice()
  }

  /**
   * The **`brightness`** property adjusts the tilemap brightness filter.
   *
   * Use values below `1` to darken and above `1` to brighten all rendered tiles.
   *
   * @example
   * ```ts
   * tilemap.brightness = 1.2
   * ```
   */
  get brightness() {
    return this.#brightness
  }
  set brightness(value) {
    this.#brightness = value
  }

  /**
   * The **`grayscale`** property adjusts the tilemap grayscale filter.
   *
   * Use `0` for original colors and `1` for fully grayscale rendering.
   *
   * @example
   * ```ts
   * tilemap.grayscale = 1
   * ```
   */
  get grayscale() {
    return this.#grayscale
  }
  set grayscale(value) {
    this.#grayscale = value
  }

  /**
   * The **`tint`** property multiplies the tilemap colors by an RGBA color.
   *
   * Use it for map-wide color changes such as selected, highlighted, or damaged states.
   *
   * @example
   * ```ts
   * tilemap.tint = color('#88ccff')
   * ```
   */
  get tint() {
    return this.#tint
  }
  set tint(value) {
    this.#tint = value
  }

  /**
   * The **`contrast`** property adjusts the tilemap contrast filter.
   *
   * Use `1` for original contrast and higher values for stronger separation.
   *
   * @example
   * ```ts
   * tilemap.contrast = 1.25
   * ```
   */
  get contrast() {
    return this.#contrast
  }
  set contrast(value) {
    this.#contrast = value
  }

  /**
   * The **`saturate`** property adjusts the tilemap saturation filter.
   *
   * Use `1` for original saturation, `0` to desaturate, and higher values for
   * stronger colors.
   *
   * @example
   * ```ts
   * tilemap.saturate = 1.5
   * ```
   */
  get saturate() {
    return this.#saturate
  }
  set saturate(value) {
    this.#saturate = value
  }

  /**
   * The **`hueRotate`** property rotates tilemap hue in degrees.
   *
   * Use it to shift the tilemap palette without changing the original texture.
   *
   * @example
   * ```ts
   * tilemap.hueRotate = 90
   * ```
   */
  get hueRotate() {
    return this.#hueRotate
  }
  set hueRotate(value) {
    this.#hueRotate = value
  }

  /**
   * The **`invert`** property adjusts the tilemap invert filter.
   *
   * Use `0` for original colors and `1` for fully inverted colors.
   *
   * @example
   * ```ts
   * tilemap.invert = 1
   * ```
   */
  get invert() {
    return this.#invert
  }
  set invert(value) {
    this.#invert = value
  }

  /**
   * The **`opacity`** property adjusts tilemap transparency.
   *
   * Use `1` for fully opaque rendering and `0` for fully transparent rendering.
   *
   * @example
   * ```ts
   * tilemap.opacity = 0.5
   * ```
   */
  get opacity() {
    return this.#opacity
  }
  set opacity(value) {
    this.#opacity = value
  }

  /**
   * Creates a new `TileMap` node.
   *
   * Use JSX `<tilemap />` in application code. Construct `TileMap` directly only
   * for low-level tooling, tests, or custom node factories.
   *
   * @param options - Tilemap options including `tiles`, `map`, and render filters.
   *
   * @example
   * ```ts
   * const node = new TileMap({ tiles, map: ['xxx', 'x x', 'xxx'] })
   * ```
   */
  constructor(options: TileMapOptions<T>) {
    super(PrimaryNode.TileMap, options)
    this.#tiles = options.tiles
    this.#map = options.map.slice()

    this.displaySize = ns(
      options.displaySize,
      (vector) => propSignal(this, 'displaySize', signalVector(vector)),
      this.displaySize,
    )
    this.#brightness = propSignal(this, 'brightness', options.brightness)
    this.#grayscale = propSignal(this, 'grayscale', options.grayscale)
    this.#tint = ns(options.tint, (c) => propSignal(this, 'tint', signalColor(c)), this.#tint)
    this.#contrast = propSignal(this, 'contrast', options.contrast)
    this.#saturate = propSignal(this, 'saturate', options.saturate)
    this.#hueRotate = propSignal(this, 'hueRotate', options.hueRotate)
    this.#invert = propSignal(this, 'invert', options.invert)
    this.#opacity = propSignal(this, 'opacity', options.opacity)

    const keys = this.#tiles.keys
    const expectedLength = this.#map[0]?.length

    for (let i = 0; i < this.#map.length; i++) {
      const row = this.#map[i]!

      if (expectedLength != null && row.length !== expectedLength) {
        throw new InvalidMapRowLengthError(i, expectedLength, row.length)
      }

      for (const char of row) {
        if (char === ' ') continue
        if (!keys.includes(char as T)) {
          throw new InvalidTileKeyError(char)
        }
      }
    }
  }

  #cellSize(): Vector2 {
    return this.displaySize ?? this.#tiles.size
  }

  draw(delta: number): void {
    const cellSize = this.#cellSize()

    for (let y = 0; y < this.#map.length; y++) {
      const row = this.#map[y]!
      for (let x = 0; x < row.length; x++) {
        const char = row[x]! as T
        if (char === ' ') continue

        drawTextureWithFilters({
          texture: this.#tiles.getTexture(char),
          position: this.position.toAdded(vector2(x, y).multiply(cellSize)),
          source: this.#tiles.getSource(char),
          displaySize: cellSize,
          brightness: this.#brightness,
          grayscale: this.#grayscale,
          tint: this.#tint,
          contrast: this.#contrast,
          saturate: this.#saturate,
          hueRotate: this.#hueRotate,
          invert: this.#invert,
          opacity: this.#opacity,
        })
      }
    }

    super.draw(delta)
  }
}

registerNode(PrimaryNode.TileMap, TileMap)
