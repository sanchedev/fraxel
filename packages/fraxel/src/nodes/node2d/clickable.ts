import { GameConfig } from '../../core/game-config.js'
import type { Shape } from '../../collision/narrowphase/shapes.js'
import type { Vector2 } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { Trigger } from '../../events/trigger.js'
import { PointerTarget } from './lib/pointer-target-system.js'

/**
 * The **`ClickableOptions`** interface defines the configuration for a `Clickable` node.
 */
export interface ClickableOptions extends Node2DOptions<PrimaryNode.Clickable> {
  /**
   * The **`shape`** property defines the clickable area.
   * Uses the `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <clickable shape={shapes.rectangle(64, 32)} />
   * <clickable shape={shapes.circle(16)} />
   * ```
   */
  shape: Reactive<Shape>
  /**
   * The **`disabled`** property disables all pointer interactions.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <clickable shape={shapes.rectangle(64, 32)} disabled onClick={() => console.log('never')} />
   * ```
   */
  disabled?: Reactive<boolean>
}

/**
 * The **`Clickable`** node detects pointer interactions within its shape.
 * Emits events when the pointer enters, exits, moves, presses, releases, or completes a click inside the area.
 * The `onClick` trigger includes the local position relative to the node's top-left corner.
 * If multiple pointer targets overlap, only the topmost target in draw order receives pointer events.
 *
 * @example
 * ```tsx
 * import { shapes, useClickable, useTrigger } from 'fraxel'
 *
 * function Button() {
 *   const clickable = useClickable()
 *
 *   useTrigger(clickable.onClick, (pos) => {
 *     console.log('Clicked at', pos.x, pos.y)
 *   })
 *
 *   return (
 *     <clickable ref={clickable} shape={shapes.rectangle(64, 32)}>
 *       <sprite textureId={BUTTON} />
 *     </clickable>
 *   )
 * }
 * ```
 */
export class Clickable extends Node2D<PrimaryNode.Clickable> {
  shape: Shape
  disabled: boolean = false
  #target: PointerTarget

  // Trigger
  /** Fires when the active pointer presses inside this clickable area. */
  onPointerPress: Trigger<[position: Vector2]>
  /** Fires when the active pointer releases inside this clickable area. */
  onPointerUnpress: Trigger<[position: Vector2]>
  /** Fires when the active pointer moves while this clickable is the topmost target. */
  onPointerMove: Trigger<[position: Vector2]>
  /** Fires every frame while this clickable is the topmost target under the pointer. */
  onPointerOver: Trigger<[position: Vector2]>
  /** Fires when this clickable becomes the topmost target under the pointer. */
  onPointerEnter: Trigger<[]>
  /** Fires when this clickable stops being the topmost target under the pointer. */
  onPointerExit: Trigger<[]>
  /** Fires when pointer press and release both happen inside this clickable area. */
  onClick: Trigger<[position: Vector2]>

  constructor(options: ClickableOptions) {
    super(PrimaryNode.Clickable, options)
    this.shape = propSignal(this, 'shape', options.shape) as Shape
    this.disabled = propSignal(this, 'disabled', options.disabled)
    this.#target = new PointerTarget({
      node: this,
      getShape: () => this.shape,
      isDisabled: () => this.disabled,
    })
    this.onPointerPress = this.#target.onPointerPress
    this.onPointerUnpress = this.#target.onPointerUnpress
    this.onPointerMove = this.#target.onPointerMove
    this.onPointerOver = this.#target.onPointerOver
    this.onPointerEnter = this.#target.onPointerEnter
    this.onPointerExit = this.#target.onPointerExit
    this.onClick = this.#target.onClick
  }

  get hovered() {
    return this.#target.hovered
  }

  get pressed() {
    return this.#target.pressed
  }

  /** @internal Draws the clickable area for debugging when showClickables is enabled. */
  draw(delta: number): void {
    if (GameConfig.testOptions.showClickables) {
      GameConfig.ctx.fillStyle = this.disabled ? '#cbc2ac5c' : '#e2c8855c'
      GameConfig.ctx.strokeStyle = this.disabled ? '#9ca082b4' : '#abb37ab4'
      GameConfig.ctx.lineWidth = 1

      this.#drawDebugShape()
    }

    super.draw(delta)
  }

  #drawDebugShape() {
    const ctx = GameConfig.ctx
    const px = this.position.x
    const py = this.position.y

    if (this.shape.type === 'rectangle') {
      ctx.fillRect(px, py, this.shape.size.x, this.shape.size.y)
      ctx.strokeRect(px, py, this.shape.size.x, this.shape.size.y)
      return
    }

    ctx.beginPath()

    if (this.shape.type === 'circle') {
      ctx.arc(px, py, this.shape.radius, 0, Math.PI * 2)
    } else if (this.shape.direction === 'vertical') {
      const { length, radius } = this.shape
      const cx = px + radius
      const topY = py + radius
      const botY = py + length - radius
      ctx.arc(cx, topY, radius, Math.PI, 0)
      ctx.lineTo(cx + radius, botY)
      ctx.arc(cx, botY, radius, 0, Math.PI)
      ctx.lineTo(cx - radius, topY)
      ctx.closePath()
    } else {
      const { length, radius } = this.shape
      const cy = py + radius
      const leftX = px + radius
      const rightX = px + length - radius
      ctx.arc(leftX, cy, radius, Math.PI * 0.5, Math.PI * 1.5)
      ctx.lineTo(rightX, cy - radius)
      ctx.arc(rightX, cy, radius, -Math.PI * 0.5, Math.PI * 0.5)
      ctx.lineTo(leftX, cy + radius)
      ctx.closePath()
    }

    ctx.fill()
    ctx.stroke()
  }

  /** @internal Cleans up all event listeners. */
  cleanEvents(): void {
    this.#target.destroy()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Clickable, Clickable)
