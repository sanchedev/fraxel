import { GameConfig } from '../../core/game-config.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { ns, propSignal, signalVector } from '../../utils/ternaries.js'
import type { PrimaryNode } from '../lib/enum.js'
import { Node, type NodeOptions } from '../_node.js'
import { getGlobalPosition, getGlobalRotation } from './lib/utils.js'
import type { Reactive } from '../../reactivity/index.js'

export interface Node2DOptions<T extends PrimaryNode> extends NodeOptions<T> {
  /**
   * The **`position`** property of a node.
   * It represents the position in the plane.
   *
   * @example
   * ```tsx
   * const transform = useTransform()
   *
   * useUpdate((delta) => {
   *   transform.node.position.x += delta * 20
   * })
   *
   * return (
   *   <transform ref={transform}>
   *     <sprite textureId={BALL_TEXTURE} />
   *   </transform>
   * )
   * ```
   */
  position?: Reactive<VectorLike>
  /**
   * The **`rotation`** property of a node.
   * It represents the rotation in the plane.
   *
   * @example
   * ```tsx
   * const transform = useTransform()
   *
   * useUpdate((delta) => {
   *   transform.node.rotation += delta * 180
   * })
   *
   * return (
   *   <transform ref={transform} origin={[-8, -8]}>
   *     <sprite textureId={ROTATOR_TEXTURE} />
   *   </transform>
   * )
   * ```
   */
  rotation?: Reactive<number>
}

export abstract class Node2D<T extends PrimaryNode = PrimaryNode> extends Node<T> {
  /**
   * The **`position`** property of a node.
   * It represents the position in the plane.
   *
   * @example
   * ```tsx
   * const transform = useTransform()
   *
   * useUpdate((delta) => {
   *   transform.node.position.x += delta * 20
   * })
   *
   * return (
   *   <transform ref={transform}>
   *     <sprite textureId={BALL_TEXTURE} />
   *   </transform>
   * )
   * ```
   */
  position: Vector2 = Vector2.ZERO
  /**
   * The **`rotation`** property of a node.
   * It represents the rotation in the plane.
   *
   * @example
   * ```tsx
   * const transform = useTransform()
   *
   * useUpdate((delta) => {
   *   transform.node.rotation += delta * 90
   * })
   *
   * return (
   *   <transform ref={transform} origin={[-8, -8]}>
   *     <sprite textureId={ROTATOR_TEXTURE} />
   *   </transform>
   * )
   * ```
   */
  rotation: number = 0

  constructor(type: T, options: Node2DOptions<T>) {
    super(type, options)
    this.position = ns(
      options.position,
      (vector) => propSignal(this, 'position', signalVector(vector)),
      this.position,
    )
    this.rotation = propSignal(this, 'rotation', options.rotation)
  }

  /**
   * The **`globalPosition`** property gets or sets the cumulative position across the entire parent chain.
   * Setting this value adjusts the local `position` so the node's world-space position matches.
   *
   * @example
   * ```ts
   * const worldPos = node.globalPosition
   * node.globalPosition = new Vector2(100, 200)
   * ```
   */
  set globalPosition(value) {
    const gp = getGlobalPosition(this).add(this.position)

    this.position = value.toSubtracted(gp)
  }
  get globalPosition(): Vector2 {
    return getGlobalPosition(this)
  }

  /**
   * The **`globalRotation`** property gets or sets the cumulative rotation across the entire parent chain.
   * Setting this value adjusts the local `rotation` so the node's world-space rotation matches.
   *
   * @example
   * ```ts
   * const worldPos = node.globalRotation
   * node.globalRotation = 180
   * ```
   */
  set globalRotation(value) {
    const gr = getGlobalRotation(this) + this.rotation

    this.rotation = value - gr
  }
  get globalRotation(): number {
    return getGlobalRotation(this)
  }

  /**
   * The **`lookAt`** method calculates the rotation of the node from an external position.
   *
   * @param position The position as `VectorLike` to look at.
   */
  lookAt(position: VectorLike): void {
    const diff = new Vector2(position).subtract(this.globalPosition)
    const angleRad = Math.atan2(diff.y, diff.x)
    this.rotation = (angleRad / Math.PI) * 180
  }

  /**
   * The **`draw`** method is called each frame to render the node and its children.
   * It applies canvas translation by `position` for each child, implementing spatial hierarchy.
   *
   * @param delta The time elapsed since the last frame in seconds.
   */
  draw(delta: number): void {
    for (const node of this._children) {
      GameConfig.ctx.save()
      GameConfig.ctx.translate(this.position.x, this.position.y)
      GameConfig.ctx.rotate((this.rotation * Math.PI) / 180)
      node.draw(delta * node.deltaIncrease)
      GameConfig.ctx.restore()
    }
    this.drawed.emit(delta)
  }
}
