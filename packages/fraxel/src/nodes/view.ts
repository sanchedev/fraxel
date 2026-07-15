import { PrimaryNode, GameMode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { registerNode } from './lib/registry.js'
import { GameConfig } from '../core/game-config.js'

/**
 * The **`ViewOptions`** interface defines the configuration for a `View` node.
 * Extends `NodeOptions` with no additional properties.
 */
export interface ViewOptions extends NodeOptions<PrimaryNode.View> {}

/**
 * The **`View`** node is a UI container that renders its children in screen space.
 * It resets the canvas transform to identity, undoing any camera offset or zoom,
 * so that children are drawn at absolute screen coordinates starting from `(0, 0)`.
 *
 * @example
 * ```tsx
 * function HUD() {
 *   return (
 *     <view>
 *       <text position={[10, 10]} text="Score: 100" />
 *       <text position={[10, 30]} text="Vidas: 3" />
 *     </view>
 *   )
 * }
 * ```
 */
export class View extends Node<PrimaryNode.View> {
  constructor(options: ViewOptions) {
    super(PrimaryNode.View, options)
  }

  draw(delta: number): void {
    const mode = this.getEffectiveGameMode()
    if (mode === GameMode.NEVER) return

    const ctx = GameConfig.ctx
    ctx.save()
    ctx.setTransform(GameConfig.dprRatio, 0, 0, GameConfig.dprRatio, 0, 0)

    for (const node of this._children) {
      node.draw(delta * node.deltaIncrease)
    }
    this.onDraw.emit(delta)

    ctx.restore()
  }
}

registerNode(PrimaryNode.View, View)
