import { GameConfig } from '../../core/game-config.js'
import { Vector2, vectorize, type VectorLike } from '../../math/vector2.js'
import { applySignal, ns, propSignal } from '../../utils/ternaries.js'
import type { PrimaryNode } from '../lib/enum.js'
import { Node, type NodeOptions } from '../_node.js'
import { getGlobalPosition } from './lib/utils.js'
import type { SignalGetter } from '../../reactivity/types.js'

export interface Node2DOptions<T extends PrimaryNode> extends NodeOptions<T> {
  /**
   * The **`position`** property of a node.
   * It represents the position in the plane.
   *
   * @example
   * ```tsx
   * useEvent(transform, 'updated', (delta) => {
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
  position?: VectorLike | SignalGetter<VectorLike>
}

export abstract class Node2D<
  T extends PrimaryNode = PrimaryNode,
> extends Node<T> {
  /**
   * The **`position`** property of a node.
   * It represents the position in the plane.
   *
   * @example
   * ```tsx
   * const transform = useRefNode(PrimaryNode.Transform)
   *
   * useEvent(transform, 'updated', (delta) => {
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

  constructor(type: T, options: Node2DOptions<T>) {
    super(type, options)
    this.position = ns(
      options.position,
      (vector) => propSignal(this, 'position', applySignal(vector, vectorize)),
      this.position,
    )
  }

  /**
   * Gets or sets the **`globalPosition`** of the node.
   */
  set globalPosition(value) {
    const gp = getGlobalPosition(this).add(this.position).subtract(value)

    this.position = gp.multiply(-1)
  }
  get globalPosition(): Vector2 {
    return getGlobalPosition(this)
  }

  /**
   * The **`draw`** method is called each frame to render the node and its children.
   * It applies position translation for proper rendering hierarchy.
   * @param delta The time elapsed since the last frame in seconds.
   */
  draw(delta: number): void {
    for (const node of this._children) {
      GameConfig.ctx.translate(this.position.x, this.position.y)
      GameConfig.translate.add(this.position)
      node.draw(delta * node.deltaIncrease)
      GameConfig.translate.subtract(this.position)
      GameConfig.ctx.translate(-this.position.x, -this.position.y)
    }
    this.drawed.emit(delta)
  }
}
