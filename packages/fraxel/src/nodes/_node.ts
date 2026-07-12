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
import { GameMode, PrimaryNode } from './lib/enum.js'
import type { FraxelScript } from '../scripts/script.js'
import type { Reactive } from '../reactivity/index.js'
import { propSignal } from '../utils/ternaries.js'
import { paused } from '../core/game-state.js'

export interface NodeOptions<T extends PrimaryNode> {
  /**
   * The **`id`** property of a node represents the node's identifier.
   * It can be used to retrieve this node via `child()`.
   * IDs can be non-unique and must match `([a-zA-Z][a-zA-Z0-9-_]*)`.
   *
   * @example
   * ```tsx
   * const transform = useTransform()
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
  /**
   * The **`gameMode`** property controls how the node behaves relative to the game's pause state.
   * Accepts a static `GameMode` value or a reactive getter.
   *
   * @example
   * ```tsx
   * import { GameMode } from 'fraxel'
   *
   * // Static
   * <transform gameMode={GameMode.ALWAYS}>
   *   <PauseMenu />
   * </transform>
   *
   * // Reactive
   * const [mode, setMode] = useSignal(GameMode.PLAYING)
   * <transform gameMode={mode}>
   *   <Enemy />
   * </transform>
   * ```
   */
  gameMode?: Reactive<GameMode>
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
   * A value of `0.5` halves speed; `2` doubles it.
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
  /**
   * The **`gameMode`** property controls how the node behaves relative to the game's pause state.
   * Defaults to `GameMode.INHERIT`, which follows the parent's effective game mode.
   *
   * @example
   * ```tsx
   * import { GameMode } from 'fraxel'
   *
   * // This node always updates, even when the game is paused
   * <transform gameMode={GameMode.ALWAYS}>
   *   <PauseMenu />
   * </transform>
   * ```
   */
  gameMode: GameMode = GameMode.INHERIT
  // States
  /**
   * The **`isStarted`** property indicates whether the node has completed its `start()` lifecycle.
   * Returns `true` after `start()` has been called and event callbacks are attached.
   */
  isStarted: boolean = false
  /**
   * The **`isDestroyed`** property indicates whether the node has been destroyed.
   * Returns `true` after `destroy()` has been called.
   */
  isDestroyed: boolean = false

  constructor(type: T, { id, zIndex, deltaIncrease, gameMode, script, children }: NodeOptions<T>) {
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

    this.gameMode = propSignal(this, 'gameMode', gameMode)

    this.addChild(...(children ?? []))
  }

  /**
   * The read-only **`id`** property returns the node's unique identifier.
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
   * const transform = useTransform()
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
   * const transform = useTransform()
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
   * The **`zIndex`** property gets or sets the Z-order of the node within its parent.
   * Higher values are drawn on top. Changing this value re-sorts the parent's children.
   *
   * @example
   * ```ts
   * node.zIndex = 10
   * console.log(node.zIndex) // 10
   * ```
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
   * The **`globalZIndex`** property gets or sets the cumulative Z-order across the entire parent chain.
   * Setting this value adjusts the local `zIndex` so the node's global Z-order matches.
   *
   * @example
   * ```ts
   * const globalZ = node.globalZIndex
   * node.globalZIndex = 5
   * ```
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
   * The **`globalDeltaIncrease`** property gets or sets the cumulative speed multiplier across the entire parent chain.
   * Setting this value adjusts the local `deltaIncrease` so the node's global speed matches.
   *
   * @example
   * ```ts
   * const globalSpeed = node.globalDeltaIncrease
   * node.globalDeltaIncrease = 2
   * ```
   */
  set globalDeltaIncrease(value) {
    if (this._parent == null) this.deltaIncrease = value
    else this.deltaIncrease = value / this._parent.globalDeltaIncrease
  }
  get globalDeltaIncrease(): number {
    if (this._parent == null) return this.deltaIncrease
    return this.deltaIncrease * this._parent.globalDeltaIncrease
  }

  /**
   * Returns the effective game mode by resolving the `INHERIT` chain up to the root.
   * If all ancestors are `INHERIT`, defaults to `PLAYING`.
   *
   * @returns The resolved `GameMode`
   *
   * @example
   * ```ts
   * const mode = node.getEffectiveGameMode()
   * if (mode === GameMode.ALWAYS) {
   *   // This node always runs
   * }
   * ```
   */
  getEffectiveGameMode(): GameMode {
    if (this.gameMode !== GameMode.INHERIT) return this.gameMode
    return this._parent?.getEffectiveGameMode() ?? GameMode.PLAYING
  }

  /**
   * Determines whether this node should update based on its effective game mode
   * and the current game pause state.
   *
   * @returns `true` if the node should run its update logic
   *
   * @example
   * ```ts
   * if (node.shouldUpdate()) {
   *   // Node will update this frame
   * }
   * ```
   */
  shouldUpdate(): boolean {
    const mode = this.getEffectiveGameMode()
    const gamePaused = paused.value()

    if (mode === GameMode.NEVER) return false
    if (mode === GameMode.ALWAYS) return true
    if (mode === GameMode.PLAYING) return !gamePaused
    if (mode === GameMode.PAUSED) return gamePaused
    return !gamePaused
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
   * const transform = useTransform()
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
   * The **`addChild`** method adds child nodes to this node.
   * If a child is already attached, it is re-ordered. If the parent is started,
   * the child's `start()` is called immediately.
   *
   * @param children Nodes to add as children
   *
   * @example
   * ```tsx
   * const transform = useTransform()
   *
   * useMount(() => {
   *   const child = transform.node.addChild(getNode(PrimaryNode.Transform, {}))
   * })
   *
   * return <transform ref={transform} />
   * ```
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
   * The callback receives the new `zIndex` value.
   */
  zIndexChanged = new Event('zIndexChange', (_zIndex: number) => {})

  /**
   * The **`started`** event fires when the node finishes its `start()` lifecycle.
   */
  started = new Event('start', () => {})

  /**
   * The **`drawed`** event fires each frame when the node is being drawn.
   * The callback receives the frame `delta` in seconds.
   */
  drawed = new Event('draw', (_delta: number) => {})

  /**
   * The **`updated`** event fires each frame during the node's update cycle.
   * The callback receives the frame `delta` in seconds.
   */
  updated = new Event('update', (_delta: number) => {})

  /**
   * The **`destroyed`** event fires when the node is destroyed.
   */
  destroyed = new Event('destroy', () => {})

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
   * Respects the node's effective game mode — skips if the node should not update.
   *
   * @param delta The time elapsed since the last frame in seconds.
   */
  update(delta: number): void {
    if (this.isDestroyed || !this.shouldUpdate()) return

    this.updated.emit(delta)
    for (const node of this._children) {
      node.update(delta * node.deltaIncrease)
    }
  }
  /**
   * The **`draw`** method is called each frame to render the node and its children.
   * Only skips drawing if the effective game mode is `NEVER`.
   *
   * @param delta The time elapsed since the last frame in seconds.
   */
  draw(delta: number): void {
    if (this.isDestroyed) return

    for (const node of this._children) {
      node.draw(delta * node.deltaIncrease)
    }
    this.drawed.emit(delta)
  }

  /**
   * The **`destroy`** method destroys this node and all its children.
   * Removes the node from its parent and emits the `destroyed` event.
   */
  destroy() {
    if (this.isDestroyed) return

    if (this._parent != null) {
      const q = this._parent._children
      const index = q.indexOf(this)
      if (index >= 0) q.splice(index, 1)
    }

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
   * const transform = useTransform()
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
