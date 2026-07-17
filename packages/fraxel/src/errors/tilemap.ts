import { FraxelError } from './base.js'

/**
 * The **`TileMapError`** class is the base error for all tilemap-related errors.
 * Thrown when an error occurs during tilemap creation, validation, or tile configuration.
 *
 * @example
 * ```ts
 * import { TileMapError } from 'fraxel'
 *
 * try {
 *   // tilemap operation
 * } catch (e) {
 *   if (e instanceof TileMapError) console.error('TileMap failed:', e.message)
 * }
 * ```
 */
export class TileMapError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'TileMapError'
  }
}

/**
 * The **`InvalidTileKeyError`** class is thrown when a tilemap map string contains
 * a character that does not match any key in the associated `TileSet` and is not
 * a whitespace character.
 *
 * @example
 * ```ts
 * import { TileMap, tileset, tile } from 'fraxel'
 *
 * const tiles = tileset(TEX, [16, 16], { x: tile([0, 16]) })
 *
 * // Throws InvalidTileKeyError: Tile key "z" does not exist in the TileSet
 * new TileMap({ tiles, map: ['xxz'] })
 * ```
 */
export class InvalidTileKeyError extends TileMapError {
  constructor(key: string) {
    super(`Tile key "${key}" does not exist in the TileSet`)
  }
}

/**
 * The **`InvalidMapRowLengthError`** class is thrown when a tilemap map contains
 * rows with different lengths. All rows must have the same length for a valid grid.
 *
 * @example
 * ```ts
 * // Throws InvalidMapRowLengthError: Row 1 has length 5, expected 3
 * new TileMap({ tiles, map: ['xxx', 'xxxxx', 'xxx'] })
 * ```
 */
export class InvalidMapRowLengthError extends TileMapError {
  constructor(rowIndex: number, expected: number, actual: number) {
    super(`Row ${rowIndex} has length ${actual}, expected ${expected}`)
  }
}

/**
 * The **`InvalidTileSetError`** class is thrown when a `TileSet` is configured
 * with invalid tile keys — keys must be single characters and cannot be spaces.
 *
 * @example
 * ```ts
 * // Throws InvalidTileSetError: Tile key "ab" must be a single character
 * tileset(TEX, [16, 16], { ab: tile([0, 16]) })
 * ```
 */
export class InvalidTileSetError extends TileMapError {
  constructor(message: string) {
    super(message)
  }
}
