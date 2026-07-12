import { Vector2 } from '../math/vector2.js'
import { Tile, type TileCollision } from './tile.js'
import { InvalidTileSetError } from '../errors/tilemap.js'

/**
 * The **`TileSet`** class represents a rectangular tileset by size in 2D space with
 * `offset`, and `size`. Used for tilemaps, sprite tiles, and spacial spaces.
 *
 * Each key must be a single character. The space character `' '` is reserved for
 * empty tiles and does not require an entry in the tile record.
 *
 * @example
 * ```ts
 * import { TileSet, tile, region, shapes } from 'fraxel'
 *
 * const tiles = new TileSet(vector2(16, 16), {
 *   x: tile(TILE_TEXTURE, region(0, 16)),
 *   o: tile(TILE_TEXTURE, region(16, 16), {
 *     shape: shapes.circle(8),
 *     group: ['solid'],
 *   }),
 * })
 * ```
 */
export class TileSet<const T extends string> {
  #tiles: Record<T, Tile>
  #size: Vector2

  /** The **`size`** property returns the dimensions of each tile cell in pixels. */
  get size() {
    return this.#size
  }
  /** The **`keys`** property returns all tile character keys in this set. */
  get keys(): T[] {
    return Object.keys(this.#tiles) as T[]
  }

  constructor(size: Vector2, tiles: Record<T, Tile>) {
    this.#size = Vector2.max(Vector2.ZERO, size)
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
   * @param key - The tile character key.
   * @param position - The position to draw the tile at.
   */
  draw(key: T, position: Vector2) {
    if (this.#size.equals(Vector2.ZERO)) return
    const tile = this.#tiles[key]
    if (tile instanceof Tile) {
      this.#tiles[key]!.draw(position, this.#size)
    }
  }

  /**
   * The **`getCollision`** method returns the collision configuration for a tile key.
   * @param key - The tile character key.
   * @returns The `TileCollision` for this key, or `undefined` if the tile has no collision.
   */
  getCollision(key: T): TileCollision | undefined {
    return this.#tiles[key]?.collision
  }
}

/**
 * The **`tileset`** function creates a `TileSet`.
 * Convenience factory that delegates to the `TileSet` constructor.
 *
 * @param size - The dimensions of each tile cell.
 * @param tiles - A record mapping single-character keys to `Tile` instances.
 * @returns A new `TileSet` instance.
 *
 * @example
 * ```ts
 * import { tileset, tile, region, shapes } from 'fraxel'
 *
 * const tiles = tileset(vector2(16, 16), {
 *   x: tile(TILE_TEXTURE, region(0, 16)),
 *   o: tile(TILE_TEXTURE, region(16, 16), {
 *     shape: shapes.rectangle(16, 16),
 *     group: ['solid'],
 *   }),
 * })
 * ```
 */
export function tileset<const T extends string>(size: Vector2, tiles: Record<T, Tile>): TileSet<T> {
  return new TileSet(size, tiles)
}
