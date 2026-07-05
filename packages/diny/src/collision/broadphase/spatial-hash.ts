import type { Collider } from '../../nodes/node2d/collider.js'
import type { CollisionBounds } from '../types.js'

/**
 * The **`SpatialHash`** class is a broadphase spatial partitioning structure.
 * It divides the game world into a grid of cells and tracks which colliders occupy each cell.
 * This allows the collision system to quickly narrow down potential collision pairs.
 */
export class SpatialHash {
  #cellSize: number
  #grid = new Map<string, Set<Collider>>()

  /**
   * Creates a new `SpatialHash` with the given cell size.
   * @param cellSize The size of each grid cell in pixels. Defaults to 64.
   */
  constructor(cellSize = 64) {
    this.#cellSize = cellSize
  }

  /**
   * The **`clear`** method removes all colliders from the grid.
   * Called automatically before each broadphase rebuild.
   */
  clear() {
    this.#grid.clear()
  }

  /**
   * The **`insert`** method adds a collider to all grid cells it overlaps.
   * @param collider The collider to insert into the spatial hash.
   */
  insert(collider: Collider) {
    const bounds = this.#getBounds(collider)
    const minCellX = Math.floor(bounds.from.x / this.#cellSize)
    const minCellY = Math.floor(bounds.from.y / this.#cellSize)
    const maxCellX = Math.floor(bounds.to.x / this.#cellSize)
    const maxCellY = Math.floor(bounds.to.y / this.#cellSize)

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        const key = this.#getKey(x, y)
        let cell = this.#grid.get(key)
        if (!cell) {
          cell = new Set()
          this.#grid.set(key, cell)
        }
        cell.add(collider)
      }
    }
  }

  /**
   * The **`query`** method returns all colliders that overlap with the given bounds.
   * @param bounds The bounding box to query.
   * @returns A set of colliders that may intersect the bounds.
   */
  query(bounds: CollisionBounds): Set<Collider> {
    const result = new Set<Collider>()
    const minCellX = Math.floor(bounds.from.x / this.#cellSize)
    const minCellY = Math.floor(bounds.from.y / this.#cellSize)
    const maxCellX = Math.floor(bounds.to.x / this.#cellSize)
    const maxCellY = Math.floor(bounds.to.y / this.#cellSize)

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        const key = this.#getKey(x, y)
        const cell = this.#grid.get(key)
        if (cell) {
          for (const collider of cell) {
            result.add(collider)
          }
        }
      }
    }

    return result
  }

  #getBounds(collider: Collider): CollisionBounds {
    if (collider.shape.type === 'circle') {
      const pos = collider.globalPosition
      const r = collider.shape.radius
      return {
        from: { x: pos.x - r, y: pos.y - r },
        to: { x: pos.x + r, y: pos.y + r },
      }
    }
    return {
      from: collider.globalPosition,
      to: collider.globalPosition.toAdded(collider.shape.size),
    }
  }

  #getKey(x: number, y: number): string {
    return `${x},${y}`
  }
}
