import { Region } from '../math/region.js'
import { Vector2 } from '../math/vector2.js'
import { getTexture, type Texture } from './texture.js'
import type { Shape } from '../collision/narrowphase/shapes.js'

/**
 * The **`TileCollision`** interface defines the collision configuration for a `Tile`.
 * When a tile has collision data, the `TileMap` will automatically create `Collider`
 * nodes for that tile's position in the grid.
 *
 * Static tiles (`static: true`, default) block dynamic bodies via physics resolution.
 * Trigger tiles (`static: false`) only detect overlaps without blocking.
 *
 * @example
 * ```ts
 * import { tile, region, shapes } from 'fraxel'
 *
 * // Solid wall (blocks bodies)
 * const wall = tile(WALL_TEX, region(0, 16), {
 *   shape: shapes.rectangle(16, 16),
 *   group: ['solid'],
 *   collidesWith: ['player'],
 * })
 *
 * // Trigger zone (detects only)
 * const coin = tile(COIN_TEX, region(32, 16), {
 *   shape: shapes.circle(8),
 *   group: ['coin'],
 *   collidesWith: ['player'],
 *   static: false,
 * })
 * ```
 */
export interface TileCollision {
  /** The collision shape for this tile. */
  shape: Shape
  /**
   * The collision groups this tile belongs to.
   * Overrides the TileMap's default `collisionGroup` when set.
   */
  group?: string[]
  /**
   * The groups this tile can collide with.
   * Overrides the TileMap's default `collidesWith` when set.
   */
  collidesWith?: string[]
  /**
   * Whether this tile is a static solid that blocks dynamic bodies.
   * When `true`, the tile's collider participates in physics resolution.
   * When `false`, the collider only detects overlaps (trigger).
   *
   * @default true
   */
  static?: boolean
}

/**
 * The **`Tile`** class represents a rectangular tile by size in 2D space with
 * `offset`, and `size`. Used for tilemaps, sprite tiles, and spacial spaces.
 *
 * @example
 * ```ts
 * import { tile, region, shapes } from 'fraxel'
 *
 * // Basic tile (no collision)
 * const grass = tile(GRASS_TEX, region(0, 16))
 *
 * // Tile with collision
 * const wall = tile(WALL_TEX, region(16, 16), {
 *   shape: shapes.rectangle(16, 16),
 *   group: ['solid'],
 *   collidesWith: ['player'],
 * })
 * ```
 */
export class Tile {
  #texture: Texture
  #region: Region
  #collision?: TileCollision

  /**
   * The **`collision`** property returns the tile's collision configuration, if any.
   * Used by `TileMap` to generate `Collider` nodes for solid tiles.
   */
  get collision(): TileCollision | undefined {
    return this.#collision
  }

  constructor(textureId: symbol, region: Region, collision?: TileCollision) {
    this.#texture = getTexture(textureId)
    this.#region = region
    this.#collision = collision
  }

  draw(position: Vector2, size: Vector2) {
    this.#texture.draw({
      source: this.#region,
      display: new Region(position, size),
    })
  }
}

/**
 * The **`tile`** function creates a `Tile`.
 * Convenience factory that delegates to the `Tile` constructor.
 *
 * @param textureId - The texture symbol returned by `loadTexture()`.
 * @param region - The source region within the texture.
 * @param collision - Optional collision configuration for solid tiles.
 * @returns A new `Tile` instance.
 *
 * @example
 * ```ts
 * import { tile, region, shapes } from 'fraxel'
 *
 * // Tile without collision
 * const grass = tile(GRASS_TEX, region(0, 16))
 *
 * // Tile with collision
 * const wall = tile(WALL_TEX, region(16, 16), {
 *   shape: shapes.rectangle(16, 16),
 * })
 * ```
 */
export function tile(textureId: symbol, region: Region, collision?: TileCollision): Tile {
  return new Tile(textureId, region, collision)
}
