import { GameConfig } from '../../core/game-config.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Nodes } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Reactive } from '../../reactivity/types.js'

/**
 * Options for the `Camera` node.
 */
export interface CameraOptions extends Node2DOptions<PrimaryNode.Camera> {
  /**
   * The **`zoom`** property scales the viewport.
   * A value of `2` means everything appears twice as large.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <camera zoom={2} />
   * ```
   */
  zoom?: Reactive<number>
}

/**
 * The **`Camera`** node controls the viewport by applying a transform
 * to all its children. It supports position, zoom, and target following.
 *
 * Place the Camera at the root of your scene to control what is visible.
 *
 * @example
 * ```tsx
 * import { useNode, useEffect } from 'fraxel/hooks'
 * import { PrimaryNode } from 'fraxel/nodes/enum'
 *
 * function GameScene() {
 *   const camera = useNode(PrimaryNode.Camera)
 *   const player = useNode(PrimaryNode.Sprite)
 *
 *   useEffect(() => {
 *     camera.follow(player)
 *   })
 *
 *   return (
 *     <camera ref={camera} zoom={2}>
 *       <sprite ref={player} textureId={PLAYER} />
 *       <sprite textureId={BG} />
 *     </camera>
 *   )
 * }
 * ```
 */
export class Camera extends Node2D<PrimaryNode.Camera> {
  #zoom: number
  #target: Node2D | null = null

  constructor(options: CameraOptions) {
    super(PrimaryNode.Camera, options)
    this.#zoom = propSignal(this, 'zoom', options.zoom) ?? 1
  }

  /**
   * Makes the camera follow a target node's position.
   * Pass `undefined` to stop following.
   */
  follow(target: Node2D | undefined): void {
    this.#target = target ?? null
  }

  /** Gets the current zoom level. */
  get zoom() {
    return this.#zoom
  }

  /** Sets the zoom level. */
  set zoom(value: number) {
    this.#zoom = value
  }

  /** @internal Applies viewport transform and draws children. */
  draw(delta: number): void {
    const ctx = GameConfig.ctx
    const halfW = GameConfig.width / 2
    const halfH = GameConfig.height / 2

    const offsetX = this.#target != null ? this.#target.globalPosition.x : this.position.x
    const offsetY = this.#target != null ? this.#target.globalPosition.y : this.position.y

    ctx.save()
    ctx.translate(halfW, halfH)
    ctx.scale(this.#zoom, this.#zoom)
    ctx.translate(-offsetX, -offsetY)

    super.draw(delta)

    ctx.restore()
  }
}

Nodes['camera'] = Camera
