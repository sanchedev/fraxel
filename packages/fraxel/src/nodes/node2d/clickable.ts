import { GameConfig } from '../../core/game-config.js'
import { type Vector2, type VectorLike } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal, signalVector } from '../../utils/ternaries.js'
import { Input } from '../../input/input.js'
import { Trigger } from '../../events/trigger.js'

/**
 * The **`ClickableOptions`** interface defines the configuration for a `Clickable` node.
 */
export interface ClickableOptions extends Node2DOptions<PrimaryNode.Clickable> {
  /**
   * The **`size`** property defines the clickable area dimensions.
   *
   * @example
   * ```tsx
   * <clickable size={[64, 32]} />
   * <clickable size={64} />
   * ```
   */
  size: Reactive<VectorLike>
  /**
   * The **`disabled`** property disables all pointer interactions.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <clickable size={[64, 32]} disabled onClick={() => console.log('never')} />
   * ```
   */
  disabled?: Reactive<boolean>
}

/**
 * The **`Clickable`** node detects pointer interactions within its rectangular area.
 * Emits events when the pointer enters, exits, hovers, or completes a click inside the area.
 * The `onClick` trigger includes the local position relative to the node's top-left corner.
 *
 * @example
 * ```tsx
 * import { useClickable, useTrigger } from 'fraxel'
 *
 * function Button() {
 *   const clickable = useClickable()
 *
 *   useTrigger(clickable.onClick, (pos) => {
 *     console.log('Clicked at', pos.x, pos.y)
 *   })
 *
 *   return (
 *     <clickable ref={clickable} size={[64, 32]}>
 *       <sprite textureId={BUTTON} />
 *     </clickable>
 *   )
 * }
 * ```
 */
export class Clickable extends Node2D<PrimaryNode.Clickable> {
  size: Vector2
  disabled: boolean = false
  #isHovered = false
  #wasPressed = false

  // Trigger
  onClick = new Trigger<[position: Vector2]>()
  onMouseEnter = new Trigger<[]>()
  onMouseExit = new Trigger<[]>()
  onMouseOver = new Trigger<[position: Vector2]>()

  constructor(options: ClickableOptions) {
    super(PrimaryNode.Clickable, options)
    this.size = propSignal(this, 'size', signalVector(options.size))
    this.disabled = propSignal(this, 'disabled', options.disabled)
  }

  #isPointerInside(): boolean {
    const pointer = Input.pointerPosition
    const pos = this.globalPosition
    return (
      pointer.x >= pos.x &&
      pointer.x <= pos.x + this.size.x &&
      pointer.y >= pos.y &&
      pointer.y <= pos.y + this.size.y
    )
  }

  /** @internal Handles hit-testing for pointer interactions. */
  update(delta: number): void {
    const isInside = this.#isPointerInside()

    if (!this.disabled) {
      if (isInside && !this.#isHovered) {
        this.#isHovered = true
        this.onMouseEnter.emit()
      } else if (!isInside && this.#isHovered) {
        this.#isHovered = false
        this.onMouseExit.emit()
      }

      const isPressed = Input.isPointerPressed
      if (this.#wasPressed && !isPressed && isInside) {
        const local = Input.pointerPosition.toSubtracted(this.globalPosition)
        this.onClick.emit(local)
      }
      this.#wasPressed = isPressed

      if (isInside) {
        const local = Input.pointerPosition.toSubtracted(this.globalPosition)
        this.onMouseOver.emit(local)
      }
    }

    super.update(delta)
  }

  /** @internal Draws the clickable area for debugging when showClickables is enabled. */
  draw(delta: number): void {
    if (GameConfig.testOptions.showClickables) {
      GameConfig.ctx.fillStyle = this.disabled ? '#cbc2ac5c' : '#e2c8855c'
      GameConfig.ctx.strokeStyle = this.disabled ? '#9ca082b4' : '#abb37ab4'
      GameConfig.ctx.lineWidth = 1

      GameConfig.ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
      GameConfig.ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y)
    }

    super.draw(delta)
  }

  /** @internal Cleans up all event listeners. */
  cleanEvents(): void {
    this.onClick.clear()
    this.onMouseEnter.clear()
    this.onMouseExit.clear()
    this.onMouseOver.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Clickable, Clickable)
