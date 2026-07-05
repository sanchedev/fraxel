import { Event, getEventName } from '../events/event.js'
import { type NodeInstances } from './lib/types.js'
import {
  InvalidNodeIdError,
  NodeChildNotFoundError,
  NodeTypeMismatchError,
  UnknownNodeTypeError,
} from '../errors/node.js'
import { getNodeName } from './lib/utils.js'
import { Nodes } from './lib/registry.js'
import type { Fun } from '../events/types.js'
import { PrimaryNode } from './lib/enum.js'
import type { FraxelScript } from '../scripts/script.js'

export interface NodeOptions<T extends PrimaryNode> {
  /**
   * The **`id`** property of a node represents the node's identifier.
   * It can be used to retrieve this node via `child()`.
   * IDs can be non-unique and must match `([a-zA-Z][a-zA-Z0-9-_]*)`.
   *
   * @example
   * ```tsx
   * const transform = useNode(PrimaryNode.Transform)
   * const container = useChild(['container'], PrimaryNode.Transform)
   *
   * return (
   *   <transform ref={transform}>
   *     <transform id='container' />
   *   </transform>
   * )
   * ```
   *
   * **`id`** can be used as path to find nested nodes.
   *
   * @example
   * ```tsx
   * const child2 = useChild(['child1', 'child2'], PrimaryNode.Transform)
   *
   * return (
   *   <transform>
   *     <transform id='child1'>
   *       <transform id='child2' />
   *     </transform>
   *   </transform>
   * )
   * ```
   */
  id?: string | symbol
  /**
   * The **`zIndex`** property of a node.
   * It represents the position in Z in the plane.
   *
   * @example
   * ```tsx
   * <transform>
   *   <sprite textureId={BALL_TEXTURE} zIndex={0} />
   *   <sprite textureId={BALL_2_TEXTURE} zIndex={1} />
   * </transform>
   * ```
   */
  zIndex?: number
  /**
   * The **`deltaIncrease`** property changes the speed of the node and its children.
   *
   * @example
   * ```tsx
   * // Speed x0.5
   * <transform deltaIncrease={0.5}>
   *   <Ball />
   * </transform>
   * ```
   */
  deltaIncrease?: number
  /** Optional script to attach to this node */
  script?: FraxelScript<T>
  /** Child nodes to add */
  children?: Node[]
}

const idRegEx = /([a-zA-Z][a-zA-Z0-9-_]*)/g

export abstract class Node<T extends PrimaryNode = PrimaryNode> {
  type: T
  #id: string | symbol
  #zIndex: number = 0
  _parent?: Node
  _children: Node[] = []
  /**
   * The **`deltaIncrease`** property changes the speed of the node and its children.
   *
   * @example
   * ```tsx
   * // Speed x0.5
   * <transform deltaIncrease={0.5}>
   *   <Ball />
   * </transform>
   * ```
   */
  deltaIncrease: number = 1
  script?: FraxelScript<T>
  // States
  /**
   * The **`isStarted`** property of the node indicates whether the node is started.
   */
  isStarted: boolean = false
  /**
   * The **`isDestroyed`** property of the node indicates whether the node is destroyed.
   */
  isDestroyed: boolean = false

  constructor(type: T, { id, zIndex, deltaIncrease, script, children }: NodeOptions<T>) {
    this.type = type

    if (typeof id === 'string') {
      const matches = id.match(idRegEx)
      if (matches == null || matches.length !== 1 || matches[0] !== id) {
        throw new InvalidNodeIdError(
          'The id ' + id + ' does not matches with `([a-zA-Z][a-zA-Z0-9-_]*)`',
        )
      }
    }

    this.#id = id ?? Symbol(type)

    if (script) {
      this.script = script
      this.script.init(this as NodeInstances[T])
    }

    this.#zIndex = zIndex ?? this.#zIndex
    this.deltaIncrease = deltaIncrease ?? this.deltaIncrease

    this.addChild(...(children ?? []))
  }

  /**
   * The read-only **`id`** property of a node represents the node's identifier.
   * It can be used to retrieve this node via `child()`.
   * IDs can be non-unique and must match `([a-zA-Z][a-zA-Z0-9-_]*)`.
   *
   * @example
   * ```tsx
   * const container = useChild(['container'], PrimaryNode.Transform)
   *
   * return (
   *   <transform>
   *     <transform id='container' />
   *   </transform>
   * )
   * ```
   *
   * **`id`** can be used as path to find nested nodes.
   *
   * @example
   * ```tsx
   * const child2 = useChild(['child1', 'child2'], PrimaryNode.Transform)
   *
   * return (
   *   <transform>
   *     <transform id='child1'>
   *       <transform id='child2' />
   *     </transform>
   *   </transform>
   * )
   * ```
   */
  get id() {
    return this.#id
  }

  /**
   * The read-only **`parent`** property returns the parent of this node.
   *
   * @example
   * ```tsx
   * const transform = useNode(PrimaryNode.Transform)
   *
   * useMount(() => {
   *   const parent = transform.node.parent
   *   parent?.destroy()
   * })
   *
   * return (
   *   <transform ref={transform}>
   *     <transform id='container' />
   *   </transform>
   * )
   * ```
   */
  get parent() {
    return this._parent
  }

  /**
   * The read-only **`children`** property returns the child nodes.
   *
   * @example
   * ```tsx
   * const transform = useNode(PrimaryNode.Transform)
   *
   * useMount(() => {
   *   const children = transform.node.children
   *   console.log(children) // [Node]
   * })
   *
   * return (
   *   <transform ref={transform}>
   *     <transform id='container' />
   *   </transform>
   * )
   * ```
   */
  get children() {
    return this._children
  }

  /**
   * Gets or sets the **`zIndex`** of the node.
   */
  set zIndex(value: number) {
    if (value === this.#zIndex) return
    this.zIndexChanged.emit(value)
    this.#zIndex = value
  }
  get zIndex(): number {
    return this.#zIndex
  }
  /**
   * Gets or sets the **`globalZIndex`** of the node.
   */
  set globalZIndex(value) {
    if (this._parent == null) this.zIndex = value
    else this.zIndex = value - this._parent.globalZIndex
  }
  get globalZIndex(): number {
    if (this._parent == null) return this.zIndex
    return this.zIndex + this._parent.globalZIndex
  }
  /**
   * Gets or sets the **`globalDeltaIncrease`** of the node.
   */
  set globalDeltaIncrease(value) {
    if (this._parent == null) this.deltaIncrease = value
    else this.deltaIncrease = value / this._parent.globalDeltaIncrease
  }
  get globalDeltaIncrease(): number {
    if (this._parent == null) return this.deltaIncrease
    return this.deltaIncrease * this._parent.globalDeltaIncrease
  }

  // Methods
  /**
   * Returns the first descendant node that matches the given path and type.
   *
   * @param options Options to filter nodes
   * @returns The matching node, or throws if not found
   *
   * @example
   * ```tsx
   * const transform = useNode(PrimaryNode.Transform)
   *
   * useMount(() => {
   *   const sprite = transform.node.child({
   *     path: ['sprite'],
   *     type: PrimaryNode.Sprite
   *   })
   * })
   *
   * return (
   *   <transform ref={transform}>
   *     <sprite id='sprite' />
   *   </transform>
   * )
   * ```
   */
  child<T extends PrimaryNode>(options: { path: (string | symbol)[]; type: T }): NodeInstances[T] {
    const { type, path } = options

    if (!(type in Nodes)) {
      throw new UnknownNodeTypeError(type)
    }

    let node: Node | undefined

    for (let i = 0; i < path.length; i++) {
      if (node == null) break
      const n = path[i]
      if (n === '' && i === path.length - 1) break
      node = node._children.find((node) => node.id === n)
    }

    if (node == null) {
      throw new NodeChildNotFoundError(path.join('/'))
    }

    if (!(node instanceof Nodes[type])) {
      throw new NodeTypeMismatchError(type, getNodeName(node as NodeInstances[PrimaryNode]))
    }

    return node as NodeInstances[T]
  }

  /**
   * Add child nodes to this node.
   * @param children Nodes to add as children
   */
  addChild(...children: Node[]) {
    for (const child of children) {
      if (this._children.includes(child)) {
        const index = this._children.indexOf(child)
        this._children.splice(index, 1)
      }
      this.#attachChild(child)
      this._children.push(child)
      if (this.isStarted) {
        child.start()
      }
    }
    this.#sortChildren()
  }
  removeChild(child: Node) {
    const index = this._children.indexOf(child)
    if (index === -1) return
    child._parent = undefined
    child.zIndexChanged.off(this.#reorder)
    this._children.splice(index, 1)
  }

  #attachChild(child: Node) {
    child._parent = this
    child.zIndexChanged.on(this.#reorder)
  }
  #reorder = () => {
    this.#sortChildren()
  }
  #sortChildren() {
    this._children.sort((a, b) => a.globalZIndex - b.globalZIndex)
  }

  // Events
  /**
   * The **`zIndexChanged`** event fires when the node's `zIndex` value changes.
   */
  zIndexChanged = new Event('zIndexChange', (_zIndex: number) => {})

  /**
   * The **`started`** event fires when the node finishes its `start()` lifecycle.
   */
  started = new Event('start', () => {})

  /**
   * The **`drawed`** event fires each frame when the node is being drawn.
   */
  drawed = new Event('draw', (_delta: number) => {})

  /**
   * The **`updated`** event fires each frame during the node's update cycle.
   */
  updated = new Event('update', (_delta: number) => {})

  /**
   * The **`destroyed`** event fires when the node is destroyed.
   */
  destroyed = new Event('destroy', () => {})

  // Event functions
  onZIndexChange?(_zIndex: number) {}
  onStart?() {}
  onDraw?(_delta: number) {}
  onUpdate?(_delta: number) {}
  onDestroy?() {}

  // Lifecycle methods
  /**
   * The **`start`** method initializes the node and starts its lifecycle.
   * It attaches event callbacks and starts all child nodes.
   * Called automatically when the node is added to the scene.
   */
  start(): void {
    if (this.isStarted) return

    // Attach events
    const events = Object.keys(this)
      .filter((key) => this[key as keyof this] instanceof Event)
      .map((key) => this[key as keyof this]) as Event<any, string>[]

    for (const event of events) {
      const key = getEventName(event.baseName)
      if (this[key as keyof this] == null) continue
      const cb = this[key as keyof this] as Fun<any[]>
      event.on(cb.bind(this))
    }

    this.isStarted = true

    for (const node of this._children) {
      node.start()
    }
    this.started.emit()
  }
  /**
   * The **`update`** method is called each frame to update the node and its children.
   * @param delta The time elapsed since the last frame in seconds.
   */
  update(delta: number): void {
    this.updated.emit(delta)
    for (const node of this._children) {
      node.update(delta * node.deltaIncrease)
    }
  }
  /**
   * The **`draw`** method is called each frame to render the node and its children.
   * It applies position translation for proper rendering hierarchy.
   * @param delta The time elapsed since the last frame in seconds.
   */
  draw(delta: number): void {
    for (const node of this._children) {
      node.draw(delta * node.deltaIncrease)
    }
    this.drawed.emit(delta)
  }

  /**
   * The **`destroy`** method destroys this node and all its children.
   */
  destroy() {
    if (this.isDestroyed) return

    const q = this._parent != null ? this._parent._children : []

    const index = q.indexOf(this)
    if (index < 0) return
    q.splice(index, 1)

    this.isDestroyed = true
    this.destroyed.emit()

    this.cleanEvents()

    for (const node of [...this._children]) {
      node.destroy()
    }
  }

  /**
   * The **`cleanEvents`** method removes all event listeners from this node.
   * It is called automatically when the node is destroyed.
   *
   * @example
   * ```tsx
   * const transform = useNode(PrimaryNode.Transform)
   *
   * useMount(() => {
   *   transform.node.started.on(() => {
   *     console.log('Node started')
   *   })
   *
   *   transform.node.cleanEvents()
   *   // No listeners will fire
   * })
   * ```
   */
  cleanEvents() {
    this.started.clean()
    this.drawed.clean()
    this.updated.clean()
    this.destroyed.clean()
  }
}
