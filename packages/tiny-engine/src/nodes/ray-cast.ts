import { GameConfig } from '../core/game-config.js'
import { Event } from '../events/event.js'
import { Vector2 } from '../math/vector2.js'
import { colliders, detectCollision, type Collider } from './collider.js'
import { PrimaryNode } from './enum.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface RayCastOptions extends NodeOptions<PrimaryNode.RayCast> {
  /**
   * The **`length`** property of `RayCast` is used to define the length of the ray. It is a number that represents the distance from the starting point of the ray to its end point. The `length` property is essential for raycasting, as it determines how far the ray will extend in the game world.
   *
   * @example
   * ```tsx
   * <ray-cast length={100} ... />
   * ```
   */
  length: number
  /**
   * The **`mesh`** property of `RayCast` is used to define the layers that the ray can interact with. It is an array of strings, where each string represents a layer name. The `mesh` property is essential for raycasting, as it determines which layers the ray can collide with.
   *
   * @example
   * ```tsx
   * <ray-cast length={...} mesh={['enemy', 'obstacle']} ... />
   * ```
   */
  mesh: string[]
}

export class RayCast extends Node<PrimaryNode.RayCast> {
  length: number
  mesh: string[]

  constructor(options: RayCastOptions) {
    super(PrimaryNode.RayCast, options)

    this.length = options.length
    this.mesh = Array.from(new Set(options.mesh))
  }

  #collider: Collider | null = null

  // Events
  colliderEntered = new Event('colliderEnter', (collider: Collider) => {})
  colliderExited = new Event('colliderExit', (collider: Collider) => {})

  // utils
  /**
   * The **`getCollider`** method of `RayCast` is used to retrieve the current collider that the ray is interacting with. It returns a `Collider` object if the ray is currently colliding with a collider, or `null` if there is no collision. This method is essential for determining which objects in the game world are being affected by the raycast.
   * @returns The current collider that the ray is interacting with, or `null` if there is no collision.
   * @example
   * ```tsx
   * const rayCast = new RayCast({ length: 100, mesh: ['enemy'] })
   * const collider = rayCast.getCollider()
   * if (collider) {
   *   // The ray is colliding with a collider, you can access its properties and methods here
   * } else {
   *   // The ray is not colliding with any collider
   * }
   * ```
   */
  getCollider() {
    return this.#collider
  }

  start(): void {
    super.start()
  }

  draw(delta: number): void {
    GameConfig.ctx.fillStyle = '#b83c3c55'
    GameConfig.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.length - 2,
      1,
    )
    GameConfig.ctx.beginPath()
    GameConfig.ctx.lineTo(
      this.position.x + this.length - 2,
      this.position.y - 1,
    )
    GameConfig.ctx.lineTo(this.position.x + this.length, this.position.y + 0.5)
    GameConfig.ctx.lineTo(
      this.position.x + this.length - 2,
      this.position.y + 2,
    )
    GameConfig.ctx.fill()
    GameConfig.ctx.closePath()

    super.draw(delta)
  }

  update(delta: number): void {
    let nearest: { collider: Collider; pos: Vector2 } | undefined
    const collidersByLayer = new Set(
      ...this.mesh.flatMap((n) => colliders.get(n) ?? []),
    )

    for (const collider of collidersByLayer) {
      if (this.mesh.every((m) => !collider.layer.includes(m))) continue

      const from1 = this.globalPosition
      const to1 = from1.toAdded(new Vector2(this.length, 0))
      const from2 = collider.globalPosition
      const to2 = from2.toAdded(collider.size)

      if (!detectCollision(from1, to1, from2, to2)) continue

      if (nearest == null) {
        nearest = { collider, pos: from2 }
        continue
      }

      const diff1 = nearest.pos.x - from1.x
      const diff2 = from2.x - from1.x

      if (diff2 >= diff1) continue

      nearest.collider = collider
      nearest.pos = from2
    }

    if (nearest?.collider !== this.#collider) {
      if (this.#collider != null) this.colliderExited.emit(this.#collider)
      if (nearest != null) this.colliderEntered.emit(nearest.collider)
    }

    this.#collider = nearest?.collider ?? null

    super.update(delta)
  }
}

Nodes['ray-cast'] = RayCast
