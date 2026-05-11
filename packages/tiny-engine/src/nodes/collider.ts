import { GameConfig } from '../core/game-config.js'
import { Event } from '../events/event.js'
import type { Vector2 } from '../math/vector2.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface ColliderOptions extends NodeOptions {
  /**
   * The **`size`** property of `Collider` is used to define the width and height of the collider. It is a `Vector2` object that contains the `x` and `y` values representing the width and height, respectively. The `size` property is essential for collision detection, as it determines the area that the collider occupies in the game world.
   *
   * @example
   * ```tsx
   * <collider size={new Vector2(10, 10)} ... />
   * ```
   */
  size: Vector2
  /**
   * The **`layer`** property of `Collider` is used to define the layers that the collider belongs to. It is an array of strings, where each string represents a layer name.
   *
   * @example
   * ```tsx
   * <collider size={...} layer={['player', 'character']} ... />
   * ```
   */
  layer: string[]
  /**
   * The **`mesh`** property of `Collider` is used to define the layers that the collider can interact with. It is an array of strings, where each string represents a layer name. The `mesh` property is essential for collision detection, as it determines which layers the collider can collide with.
   *
   * @example
   * ```tsx
   * <collider size={...} layer={...} mesh={['enemy', 'obstacle']} ... />
   * ```
   */
  mesh: string[]
}

/** Default **`id`** for `Node` and it is used for jsx tags */
export const colliderNodeName = 'collider'

export class Collider extends Node {
  size: Vector2
  layer: string[] = []
  mesh: string[] = []

  #lastLayer: Set<string> = new Set()

  constructor(options: ColliderOptions) {
    super(options)

    this.size = options.size
    this.layer = Array.from(new Set(options.layer))
    this.mesh = Array.from(new Set(options.mesh))
  }

  #colliders = new Set<Collider>()

  // Events
  colliderEntered = new Event('colliderEnter', (collider: Collider) => {})
  collided = new Event('collide', (collider: Collider) => {})
  colliderExited = new Event('colliderExit', (collider: Collider) => {})

  // Event functions
  onColliderEnter?(collider: Collider) {}
  onCollide?(collider: Collider) {}
  onColliderExit?(collider: Collider) {}

  #reloadCollider(forced?: string[]) {
    const currentLayer = new Set(forced ?? this.layer)
    if (
      [...currentLayer].every((layerStr) => this.#lastLayer.has(layerStr)) &&
      currentLayer.size === this.#lastLayer.size
    )
      return

    for (const layerStr of this.#lastLayer) {
      if (currentLayer.has(layerStr)) continue
      colliders.get(layerStr)?.delete(this)
    }

    for (const layerStr of currentLayer) {
      if (this.#lastLayer.has(layerStr)) continue
      const collidersByLayer = colliders.get(layerStr) ?? new Set()
      collidersByLayer.add(this)

      colliders.set(layerStr, collidersByLayer)
    }

    this.#lastLayer = currentLayer
  }

  start(): void {
    this.#reloadCollider()
    super.start()
  }

  draw(delta: number): void {
    GameConfig.ctx.fillStyle = '#85b2e25c'
    GameConfig.ctx.strokeStyle = '#3f73abb4'
    GameConfig.ctx.lineWidth = 1
    GameConfig.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
    )
    GameConfig.ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
    )

    super.draw(delta)
  }

  update(delta: number): void {
    this.#reloadCollider()

    const oldColliders = new Set(this.#colliders)
    const collidersByLayer = new Set(
      ...this.mesh.flatMap((n) => colliders.get(n) ?? []),
    )

    for (const collider of collidersByLayer) {
      if (collider === this) continue
      if (this.mesh.every((m) => !collider.layer.includes(m))) continue

      const from1 = this.globalPosition
      const to1 = from1.toAdded(this.size)
      const from2 = collider.globalPosition
      const to2 = from2.toAdded(collider.size)

      const isDetected = detectCollision(from1, to1, from2, to2)
      const wasDetected = oldColliders.has(collider)

      if (!wasDetected) {
        if (isDetected) {
          this.#colliders.add(collider)
          this.colliderEntered.emit(collider)
        }
        this.collided.emit(collider)
        continue
      }

      oldColliders.delete(collider)
      if (!isDetected) this.colliderExited.emit(collider)
    }

    super.update(delta)
  }

  destroy(): void {
    this.#reloadCollider([])
    super.destroy()
  }
}

Nodes.collider = Collider

export const colliders = new Map<string, Set<Collider>>()

export function detectCollision(
  from1: Vector2,
  to1: Vector2,
  from2: Vector2,
  to2: Vector2,
) {
  const from1X = Math.min(from1.x, to1.x)
  const from1Y = Math.min(from1.y, to1.y)
  const to1X = from1X === from1.x ? to1.x : from1.x
  const to1Y = from1Y === from1.y ? to1.y : from1.y
  const from2X = Math.min(from2.x, to2.x)
  const from2Y = Math.min(from2.y, to2.y)
  const to2X = from2X === from2.x ? to2.x : from2.x
  const to2Y = from2Y === from2.y ? to2.y : from2.y

  return from1X < to2X && to1X > from2X && from1Y < to2Y && to1Y > from2Y
}
