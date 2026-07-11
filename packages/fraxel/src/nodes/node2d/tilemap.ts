import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'

/**
 * The **`TileMapOptions`** interface defines the configuration for a `TileMap` node.
 * Extends `Node2DOptions` with no additional properties.
 */
export interface TileMapOptions extends Node2DOptions<PrimaryNode.TileMap> {}

/**
 * The **`TileMap`** node displays a tilemap in the world.
 *
 * @example
 * ```tsx
 * import { tile, tileset, region } from 'fraxel'
 * import { TILE_TEXTURE } from '../assets.js'
 *
 * const tiles = tileset({
 *   x: tile(TILE_TEXTURE, region(0, 16)),
 * })
 *
 * function Map() {
 *   return (
 *     <tilemap
 *       tiles={tiles}
 *       map={[
 *         '        ',
 *         '        ',
 *         '      xx',
 *         'xxxxxxxx',
 *       ]}
 *     />
 *   )
 * }
 * ```
 */
export class TileMap extends Node2D<PrimaryNode.TileMap> {
  constructor(options: TileMapOptions) {
    super(PrimaryNode.TileMap, options)
  }
}

registerNode(PrimaryNode.TileMap, TileMap)
