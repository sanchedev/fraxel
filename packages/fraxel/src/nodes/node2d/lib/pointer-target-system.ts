import { SceneManager } from '../../../core/scene-manager.js'
import { pointInShape } from '../../../collision/narrowphase/point-in-shape.js'
import type { Shape } from '../../../collision/narrowphase/shapes.js'
import { Trigger } from '../../../events/trigger.js'
import { Pointer } from '../../../input/pointer.js'
import type { Vector2 } from '../../../math/vector2.js'
import type { Node } from '../../_node.js'
import { Node2D } from '../_node2d.js'

export interface PointerTargetOptions {
  node: Node2D
  getShape: () => Shape
  isDisabled?: () => boolean
  captureAfterPress?: boolean
}

export class PointerTarget {
  readonly node: Node2D
  readonly captureAfterPress: boolean
  readonly #getShape: () => Shape
  readonly #isDisabled: () => boolean

  hovered = false
  pressed = false

  onPointerPress = new Trigger<[position: Vector2]>()
  onPointerUnpress = new Trigger<[position: Vector2]>()
  onPointerMove = new Trigger<[position: Vector2]>()
  onPointerOver = new Trigger<[position: Vector2]>()
  onPointerEnter = new Trigger<[]>()
  onPointerExit = new Trigger<[]>()
  onClick = new Trigger<[position: Vector2]>()

  constructor({ node, getShape, isDisabled, captureAfterPress }: PointerTargetOptions) {
    this.node = node
    this.#getShape = getShape
    this.#isDisabled = isDisabled ?? (() => false)
    this.captureAfterPress = captureAfterPress ?? false
    PointerTargetSystem.register(this)
  }

  contains(position: Readonly<Vector2>): boolean {
    if (this.#isDisabled() || this.node.isDestroyed) return false
    return pointInShape(
      position,
      this.node.globalPosition,
      this.node.globalRotation,
      this.#getShape(),
    )
  }

  localPosition(): Vector2 {
    return Pointer.pointerPosition.toSubtracted(this.node.globalPosition)
  }

  destroy() {
    PointerTargetSystem.unregister(this)
    this.onPointerPress.clear()
    this.onPointerUnpress.clear()
    this.onPointerMove.clear()
    this.onPointerOver.clear()
    this.onPointerEnter.clear()
    this.onPointerExit.clear()
    this.onClick.clear()
  }
}

export class PointerTargetSystem {
  static #targets = new Map<Node2D, PointerTarget>()
  static #hoveredTarget: PointerTarget | null = null
  static #pressedTarget: PointerTarget | null = null

  static register(target: PointerTarget) {
    this.#targets.set(target.node, target)
  }

  static unregister(target: PointerTarget) {
    this.#targets.delete(target.node)
    if (this.#hoveredTarget === target) this.#setHoveredTarget(null)
    if (this.#pressedTarget === target) this.#pressedTarget = null
  }

  static update() {
    const topTarget = this.#getTopTarget()
    this.#setHoveredTarget(topTarget)

    const capturedTarget =
      Pointer.isPointerPressed && this.#pressedTarget?.captureAfterPress
        ? this.#pressedTarget
        : null
    const moveTarget = capturedTarget ?? topTarget

    if (Pointer.justPointerPressed) {
      this.#pressedTarget = topTarget
      if (topTarget != null) {
        topTarget.pressed = true
        topTarget.onPointerPress.emit(topTarget.localPosition())
      }
    }

    if (Pointer.pointerMoved && moveTarget != null) {
      moveTarget.onPointerMove.emit(moveTarget.localPosition())
    }

    if (topTarget != null) {
      topTarget.onPointerOver.emit(topTarget.localPosition())
    }

    if (Pointer.justPointerUnpressed) {
      const unpressTarget = this.#pressedTarget?.captureAfterPress ? this.#pressedTarget : topTarget

      if (unpressTarget != null) {
        unpressTarget.onPointerUnpress.emit(unpressTarget.localPosition())
        if (topTarget === this.#pressedTarget) {
          unpressTarget.onClick.emit(unpressTarget.localPosition())
        }
      }

      if (this.#pressedTarget != null) this.#pressedTarget.pressed = false
      this.#pressedTarget = null
    }

    if (Pointer.pointerCanceled) {
      if (this.#pressedTarget != null) this.#pressedTarget.pressed = false
      this.#pressedTarget = null
    }
  }

  static clear() {
    this.#targets.clear()
    this.#hoveredTarget = null
    this.#pressedTarget = null
  }

  static #setHoveredTarget(target: PointerTarget | null) {
    if (target === this.#hoveredTarget) return

    if (this.#hoveredTarget != null) {
      this.#hoveredTarget.hovered = false
      this.#hoveredTarget.onPointerExit.emit()
    }

    this.#hoveredTarget = target

    if (this.#hoveredTarget != null) {
      this.#hoveredTarget.hovered = true
      this.#hoveredTarget.onPointerEnter.emit()
    }
  }

  static #getTopTarget(): PointerTarget | null {
    const root = SceneManager.currentNode
    if (root == null) return null

    let target: PointerTarget | null = null
    this.#visitInDrawOrder(root, (node) => {
      if (!(node instanceof Node2D)) return

      const candidate = this.#targets.get(node)
      if (candidate?.contains(Pointer.pointerPosition)) target = candidate
    })

    return target
  }

  static #visitInDrawOrder(node: Node, cb: (node: Node) => void) {
    cb(node)
    for (const child of node._children) {
      this.#visitInDrawOrder(child, cb)
    }
  }
}
