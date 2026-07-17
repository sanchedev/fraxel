import { Region } from '../math/region.js'
import { Vector2, type VectorLike } from '../math/vector2.js'
import { getTexture } from './texture.js'
import type { Tile } from './tile.js'
import { InvalidTileSetError } from '../errors/tilemap.js'

/**
 * The **`TileDrawOptions`** interface configures direct `TileSet.draw()` calls.
 *
 * Use it when drawing a tile manually and you need the rendered size to differ
 * from the source tile size stored in the `TileSet`.
 *
 * @example
 * ```ts
 * tiles.draw('x', vector2(0, 0), { displaySize: vector2(32, 32) })
 * ```
 */
export interface TileDrawOptions {
  /**
   * The **`displaySize`** property defines the rendered size of a tile cell.
   *
   * When omitted, `TileSet.size` is used for display and the tile is rendered at
   * its source size.
   *
   * @example
   * ```ts
   * tiles.draw('x', vector2(0, 0), { displaySize: vector2(32, 32) })
   * ```
   */
  displaySize?: Vector2
}

/**
 * The **`TileSet`** class maps single-character tile keys to texture regions.
 *
 * Use it with `TileMap` to render string grids from a loaded texture atlas. Each
 * key must be a single character. The space character `' '` is reserved for empty
 * cells and does not require an entry in the tile record.
 *
 * @typeParam T - Union of valid single-character tile keys for this set.
 *
 * @example
 * ```ts
 * import { tileset, tile } from 'fraxel'
 *
 * const tiles = tileset(TILE_TEXTURE, [16, 16], {
 *   x: tile([0, 16]),
 *   o: tile([16, 16]),
 * })
 * ```
 */
export class TileSet<const T extends string> {
  #tiles: Record<T, Tile>
  #textureId: symbol
  #tileSize: Vector2

  /**
   * The **`textureId`** property returns the default texture used by this tileset.
   *
   * Use it to inspect which loaded texture backs tiles that do not define a
   * per-tile texture override.
   *
   * @example
   * ```ts
   * const texture = tiles.textureId
   * ```
   */
  get textureId() {
    return this.#textureId
  }
  /**
   * The **`size`** property returns the dimensions of each source tile cell.
   *
   * Use it when aligning other nodes, such as manual colliders, to the same grid
   * as a `TileMap`.
   *
   * @example
   * ```ts
   * const cellSize = tiles.size
   * ```
   */
  get size() {
    return this.#tileSize
  }
  /**
   * The **`keys`** property returns all tile character keys in this set.
   *
   * Use it to validate maps, build editor tooling, or inspect the characters that
   * can appear in a `TileMap.map` row.
   *
   * @example
   * ```ts
   * const validKeys = tiles.keys
   * ```
   */
  get keys(): T[] {
    return Object.keys(this.#tiles) as T[]
  }

  /**
   * Creates a new `TileSet`.
   *
   * Use `tileset()` for most app code; construct `TileSet` directly when a class
   * instance is more convenient for tooling or factories.
   *
   * @param textureId - The default texture symbol returned by `loadTexture()`.
   * @param tileSize - The dimensions of each source tile cell.
   * @param tiles - A record mapping single-character keys to tile definitions.
   *
   * @example
   * ```ts
   * const tiles = new TileSet(TILE_TEXTURE, [16, 16], {
   *   x: tile([0, 16]),
   * })
   * ```
   */

  constructor(textureId: symbol, tileSize: VectorLike, tiles: Record<T, Tile>) {
    this.#textureId = textureId
    this.#tileSize = Vector2.max(Vector2.ZERO, new Vector2(tileSize))
    this.#tiles = tiles
    for (const k of this.keys) {
      if (k.length !== 1) {
        throw new InvalidTileSetError(`Tile key "${k}" must be a single character`)
      }
      if (k === ' ') {
        throw new InvalidTileSetError(
          `Tile key cannot be a space character — spaces are reserved for empty tiles`,
        )
      }
    }
  }

  /**
   * The **`draw`** method renders a tile at the given position.
   *
   * Use it for low-level manual rendering. Most games should prefer `<tilemap />`,
   * which handles map validation and repeated cell drawing.
   *
   * @param key - The tile character key.
   * @param position - The position to draw the tile at.
   * @param options - Optional display settings for this draw call.
   *
   * @example
   * ```ts
   * tiles.draw('x', vector2(64, 32), { displaySize: vector2(32, 32) })
   * ```
   */
  draw(key: T, position: Vector2, options: TileDrawOptions = {}) {
    if (this.#tileSize.equals(Vector2.ZERO)) return
    const tile = this.#tiles[key]
    if (tile == null) return

    this.getTexture(key).draw({
      source: this.getSource(key),
      display: new Region(position, options.displaySize ?? this.#tileSize),
    })
  }

  /**
   * The **`getTexture`** method returns the texture used to render a tile key.
   *
   * Use it when implementing custom tile renderers that still rely on the same
   * texture resolution rules as `TileSet.draw()`.
   *
   * @param key - The tile character key.
   * @returns The loaded texture for the tile.
   *
   * @example
   * ```ts
   * const texture = tiles.getTexture('x')
   * ```
   */
  getTexture(key: T) {
    return getTexture(this.#tiles[key]?.textureId ?? this.#textureId)
  }

  /**
   * The **`getSource`** method returns the source region used to render a tile key.
   *
   * Use it when implementing custom tile renderers or debug tools that need to know
   * exactly which texture crop corresponds to a tile key.
   *
   * @param key - The tile character key.
   * @returns The source `Region` for the tile.
   *
   * @example
   * ```ts
   * const source = tiles.getSource('x')
   * ```
   */
  getSource(key: T): Region {
    const tile = this.#tiles[key]
    return new Region(tile?.source ?? Vector2.ZERO, this.#tileSize)
  }
}

/**
 * The **`tileset`** function creates a `TileSet`.
 *
 * Use it to declare a texture atlas for `<tilemap />`. The texture and tile size
 * are shared by default, while individual tiles can override their texture with
 * `tile(source, { textureId })`.
 *
 * @typeParam T - Union of valid single-character tile keys inferred from `tiles`.
 *
 * @param textureId - The default texture symbol returned by `loadTexture()`.
 * @param tileSize - The dimensions of each tile cell.
 * @param tiles - A record mapping single-character keys to tile definitions.
 * @returns A new `TileSet` instance.
 *
 * @example
 * ```ts
 * import { tileset, tile } from 'fraxel'
 *
 * const tiles = tileset(TILE_TEXTURE, [16, 16], {
 *   x: tile([0, 16]),
 *   o: tile([16, 16]),
 * })
 * ```
 */
export function tileset<const T extends string>(
  textureId: symbol,
  tileSize: VectorLike,
  tiles: Record<T, Tile>,
): TileSet<T> {
  return new TileSet(textureId, tileSize, tiles)
}
