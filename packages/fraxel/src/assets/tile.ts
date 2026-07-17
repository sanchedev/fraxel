import type { VectorLike } from '../math/vector2.js'

/**
 * The **`TileOptions`** interface defines optional configuration for a tile.
 *
 * Use it when a tile needs to override values inherited from its `TileSet`, such
 * as drawing from a different texture while keeping the same tile size and map key.
 *
 * @example
 * ```ts
 * import { tile } from 'fraxel'
 *
 * const portal = tile([32, 0], { textureId: PORTAL_TEXTURE })
 * ```
 */
export interface TileOptions {
  /**
   * The **`textureId`** property overrides the tileset texture for this tile.
   *
   * Use it when a tilemap mostly uses one atlas but a few tiles should render from
   * another loaded texture. When omitted, the parent `TileSet.textureId` is used.
   *
   * @example
   * ```ts
   * const tiles = tileset(TERRAIN_TEXTURE, [16, 16], {
   *   g: tile([0, 0]),
   *   p: tile([0, 0], { textureId: PORTAL_TEXTURE }),
   * })
   * ```
   */
  textureId?: symbol
}

/**
 * The **`Tile`** interface describes one drawable tile in a `TileSet`.
 *
 * Use it to map a single-character tile key to a source offset inside a texture.
 * `TileMap` reads this data to render each non-space character in its map grid.
 *
 * @example
 * ```ts
 * import { tile } from 'fraxel'
 *
 * const grass = tile([0, 16])
 * ```
 */
export interface Tile extends TileOptions {
  /**
   * The **`source`** property is the tile source offset inside the texture.
   *
   * The parent `TileSet` provides the source size through its tile size, so tiles
   * only need to describe where their crop starts.
   *
   * @example
   * ```ts
   * const grass = tile([0, 16]) // crop starts at x=0, y=16
   * ```
   */
  source: VectorLike
}

/**
 * The **`tile`** function creates a declarative tile definition.
 *
 * Use it inside `tileset()` records to describe which texture offset a tile key
 * should draw from. `tile()` does not load textures and does not create physics;
 * it only returns data consumed by `TileSet` and `TileMap`.
 *
 * @param source - The source offset inside the tileset texture.
 * @param options - Optional per-tile overrides.
 * @returns A tile definition.
 *
 * @example
 * ```ts
 * import { tile } from 'fraxel'
 *
 * const grass = tile([0, 16])
 * ```
 */
export function tile(source: VectorLike, options: TileOptions = {}): Tile {
  return { source, ...options }
}
