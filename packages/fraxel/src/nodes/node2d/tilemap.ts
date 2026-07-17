import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode, getNode } from '../lib/registry.js'
import type { TileSet } from '../../assets/tileset.js'
import { Vector2, vector2 } from '../../math/vector2.js'
import { InvalidTileKeyError, InvalidMapRowLengthError } from '../../errors/tilemap.js'
import type { TileCollision } from '../../assets/tile.js'
import {
  CollisionLayer,
  type CollisionLayerValue,
  type CollisionMaskValue,
} from '../../collision/layers.js'

/**
 * The **`TileMapOptions`** interface defines the configuration for a `TileMap` node.
 * Extends `Node2DOptions` with tileset, map, and optional collision settings.
 */
export interface TileMapOptions<
  T extends string = string,
> extends Node2DOptions<PrimaryNode.TileMap> {
  /**
   * The **`tiles`** property defines the tileset used to render and resolve tile keys.
   *
   * @example
   * ```ts
   * import { tileset, tile, region, shapes } from 'fraxel'
   *
   * const tiles = tileset(vector2(16, 16), {
   *   x: tile(TILE_TEXTURE, region(0, 16), {
   *     shape: shapes.rectangle(16, 16),
   *   }),
   * })
   * ```
   */
  tiles: TileSet<T>
  /**
   * The **`map`** property defines the tilemap grid as an array of equal-length strings.
   * Each character maps to a tile key in the `TileSet`. Space characters render as empty.
   *
   * @example
   * ```tsx
   * <tilemap map={['   ', ' xxx', 'xxxxx']} />
   * ```
   */
  map: string[]
  /**
   * The **`collisionLayer`** property defines the default collision layer for tiles
   * that have collision data but no explicit `layer` override.
   *
   * @example
   * ```tsx
   * <tilemap collisionLayer={Layers.Ground} collisionMask={Layers.Player} />
   * ```
   */
  collisionLayer?: CollisionLayerValue
  /**
   * The **`collisionMask`** property defines the default layers that tile owners
   * can interact with, when the tile has no explicit `mask` override.
   *
   * @example
   * ```tsx
   * <tilemap collisionLayer={Layers.Ground} collisionMask={Layers.Player} />
   * ```
   */
  collisionMask?: CollisionMaskValue
  /**
   * The **`chunkSize`** property controls how static tiles are grouped into
   * physics bodies. Each chunk becomes a single `RigidBody` containing its
   * tile colliders. Set to `null` to disable chunking (one RigidBody for all tiles).
   *
   * Smaller chunks reduce the number of broadphase checks per body but increase
   * the total number of registered bodies. Larger chunks do the opposite.
   *
   * @default 8
   *
   * @example
   * ```tsx
   * // Disable chunking — single RigidBody for all tiles
   * <tilemap chunkSize={null} />
   *
   * // Smaller chunks for tighter broadphase
   * <tilemap chunkSize={4} />
   * ```
   */
  chunkSize?: number | null
}

interface StaticTileEntry {
  x: number
  y: number
  collision: TileCollision
}

/**
 * The **`TileMap`** node displays a tilemap in the world and generates physics
 * bodies and colliders for tiles with collision data.
 *
 * Static tiles (`static: true`, default) are grouped into chunked `RigidBody`
 * nodes that block dynamic bodies via physics resolution. Trigger tiles
 * (`static: false`) spawn `Detector` nodes for overlap detection only.
 *
 * All map rows must have the same length. Space characters render as empty tiles.
 *
 * @example
 * ```tsx
 * import { tileset, tile, region, shapes } from 'fraxel'
 * import { TILE_TEXTURE } from '../assets.js'
 *
 * const tiles = tileset(vector2(16, 16), {
 *   x: tile(TILE_TEXTURE, region(0, 16), {
 *     shape: shapes.rectangle(16, 16),
 *     layer: Layers.Solid,
 *     mask: Layers.Player,
 *   }),
 *   c: tile(TILE_TEXTURE, region(32, 16), {
 *     shape: shapes.circle(8),
 *     layer: Layers.Coin,
 *     mask: Layers.Player,
 *     static: false,
 *   }),
 *   o: tile(TILE_TEXTURE, region(16, 16)),
 * })
 *
 * function Map() {
 *   return (
 *     <tilemap
 *       tiles={tiles}
 *       collisionLayer={Layers.Ground}
 *       collisionMask={Layers.Player}
 *       map={[
 *         'xxxxxxxxx',
 *         'x.c...c.x',
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
  #collisionLayer: CollisionLayerValue
  #collisionMask: CollisionMaskValue
  #chunkSize: number | null
  #physicsCreated = false

  /**
   * The **`tiles`** property returns the tileset used by this tilemap.
   */
  get tiles(): TileSet<T> {
    return this.#tiles
  }

  /**
   * The **`map`** property returns a copy of the tilemap grid.
   */
  get map(): string[] {
    return this.#map.slice()
  }

  constructor(options: TileMapOptions<T>) {
    super(PrimaryNode.TileMap, options)
    this.#tiles = options.tiles
    this.#map = options.map.slice()
    this.#collisionLayer = options.collisionLayer ?? CollisionLayer.Default
    this.#collisionMask = options.collisionMask ?? CollisionLayer.Default
    this.#chunkSize = options.chunkSize ?? 8

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

  /** @internal Creates physics bodies and colliders for tiles with collision data. */
  start(): void {
    if (!this.#physicsCreated) {
      this.#createPhysics()
      this.#physicsCreated = true
    }
    super.start()
  }

  #classifyTiles(): { staticTiles: StaticTileEntry[]; triggerTiles: StaticTileEntry[] } {
    const staticTiles: StaticTileEntry[] = []
    const triggerTiles: StaticTileEntry[] = []

    for (let y = 0; y < this.#map.length; y++) {
      const row = this.#map[y]!
      for (let x = 0; x < row.length; x++) {
        const char = row[x]! as T
        const collision = this.#tiles.getCollision(char)
        if (collision == null) continue

        if (collision.static !== false) {
          staticTiles.push({ x, y, collision })
        } else {
          triggerTiles.push({ x, y, collision })
        }
      }
    }

    return { staticTiles, triggerTiles }
  }

  #createPhysics(): void {
    const { staticTiles, triggerTiles } = this.#classifyTiles()
    const tileSize = this.#tiles.size as Vector2

    if (this.#chunkSize != null && staticTiles.length > 0) {
      this.#createChunkedBodies(staticTiles, tileSize)
    } else {
      this.#createSingleBody(staticTiles, tileSize)
    }

    for (const tile of triggerTiles) {
      const detector = getNode(PrimaryNode.Detector, {
        position: vector2(tile.x, tile.y).multiply(tileSize),
        layer: tile.collision.layer ?? this.#collisionLayer,
        mask: tile.collision.mask ?? this.#collisionMask,
      })

      detector.addChild(
        getNode(PrimaryNode.Collider, {
          shape: tile.collision.shape,
        }),
      )

      this.addChild(detector)
    }
  }

  #createChunkedBodies(staticTiles: StaticTileEntry[], tileSize: Vector2): void {
    const chunks = new Map<string, { originX: number; originY: number; tiles: StaticTileEntry[] }>()
    const chunkSize = this.#chunkSize as number

    for (const tile of staticTiles) {
      const cx = Math.floor(tile.x / chunkSize)
      const cy = Math.floor(tile.y / chunkSize)
      const key = `${cx}:${cy}`

      if (!chunks.has(key)) {
        chunks.set(key, {
          originX: cx * chunkSize,
          originY: cy * chunkSize,
          tiles: [],
        })
      }
      chunks.get(key)!.tiles.push(tile)
    }

    for (const [, chunk] of chunks) {
      const firstTile = chunk.tiles[0]!
      const body = getNode(PrimaryNode.RigidBody, {
        position: vector2(chunk.originX, chunk.originY).multiply(tileSize),
        isStatic: true,
        mass: 0,
        useGravity: false,
        layer: firstTile.collision.layer ?? this.#collisionLayer,
        mask: firstTile.collision.mask ?? this.#collisionMask,
      })

      for (const tile of chunk.tiles) {
        body.addChild(
          getNode(PrimaryNode.Collider, {
            position: vector2(tile.x - chunk.originX, tile.y - chunk.originY).multiply(tileSize),
            shape: tile.collision.shape,
          }),
        )
      }

      this.addChild(body)
    }
  }

  #createSingleBody(staticTiles: StaticTileEntry[], tileSize: Vector2): void {
    if (staticTiles.length === 0) return

    const body = getNode(PrimaryNode.RigidBody, {
      position: vector2(0, 0),
      isStatic: true,
      mass: 0,
      useGravity: false,
      layer: staticTiles[0]?.collision.layer ?? this.#collisionLayer,
      mask: staticTiles[0]?.collision.mask ?? this.#collisionMask,
    })

    for (const tile of staticTiles) {
      body.addChild(
        getNode(PrimaryNode.Collider, {
          position: vector2(tile.x, tile.y).multiply(tileSize),
          shape: tile.collision.shape,
        }),
      )
    }

    this.addChild(body)
  }

  draw(delta: number): void {
    for (let y = 0; y < this.#map.length; y++) {
      const row = this.#map[y]!
      for (let x = 0; x < row.length; x++) {
        const char = row[x]! as T
        this.#tiles.draw(char, this.position.toAdded(vector2(x, y).multiply(this.#tiles.size)))
      }
    }
    super.draw(delta)
  }
}

registerNode(PrimaryNode.TileMap, TileMap)
