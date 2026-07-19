import { NodeNotInitializedError, NodeTypeMismatchError } from '../../errors/index.js'
import { Trigger } from '../../events/trigger.js'
import type { TriggersFrom } from '../../events/types.js'
import { renderToNodes } from '../../jsx/index.js'
import type { Fraxel } from '../../jsx/types.js'
import { GameMode, type NodeInstances, type PrimaryNode } from '../../nodes/index.js'
import { Signal, type SignalsFrom } from '../../reactivity/index.js'
import { createSignalSetter } from '../../reactivity/signal.js'
import type { FraxelScript } from '../../scripts/script.js'
import { currentContext, type HookContext } from '../context.js'

type TriggerFn<T> = T extends Trigger ? Parameters<T['connect']>[0] : undefined

interface Linker<N extends PrimaryNode> {
  link(obj: NodeReference<N>, ...args: (keyof TriggersFrom<NodeInstances[N]>)[]): void
  on<K extends keyof TriggersFrom<NodeInstances[N]>>(
    key: K,
    fn: TriggerFn<TriggersFrom<NodeInstances[N]>[K]>,
  ): void
}
interface SignalReg {
  reg<T extends Record<keyof any, any>>(obj: T, ...args: (keyof SignalsFrom<T>)[]): void
}

export interface ReferenceOptions<T extends PrimaryNode> {
  type: T
  onEnter?: (node: NodeInstances[T]) => void
  onFrame?: (node: NodeInstances[T]) => void
  onExit?: () => void
  linkEvents?: (linker: Linker<T>, node: NodeInstances[T]) => void
  regSignal?: (register: SignalReg) => void
}

/**
 * The **`NodeReference`** class is the base reference for all node hooks.
 * It provides reactive access to the underlying node instance, lifecycle triggers,
 * and a type-safe script accessor.
 *
 * Created by native hooks like `useSprite()`, `useCollider()`, etc. — not instantiated directly.
 *
 * @typeParam T The `PrimaryNode` type this reference targets
 *
 * @example
 * ```tsx
 * import { useSprite } from 'fraxel'
 * import { useEffect } from 'fraxel'
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   useEffect(() => {
 *     sprite.onStart.connect(() => console.log('started'))
 *     sprite.onDestroy.connect(() => console.log('destroyed'))
 *   })
 *
 *   return <sprite ref={sprite} textureId={PLAYER} />
 * }
 * ```
 */
export class NodeReference<T extends PrimaryNode = PrimaryNode> {
  #type: T
  #node = new Signal<NodeInstances[T] | null>(null)
  #oldCtx: HookContext[]

  set node(node: NodeInstances[T]) {
    if (node.type !== this.#type) {
      throw new NodeTypeMismatchError(this.#type, node.type)
    }
    this.#node.value = node
  }
  /**
   * The underlying node instance. Throws `NodeNotInitializedError` if accessed before mount.
   */
  get node() {
    if (this.#node.value == null) {
      throw new NodeNotInitializedError(this.#type)
    }
    return this.#node.value
  }
  /**
   * Reactive getter for the node instance. Returns `null` before mount and after destroy.
   * Use inside `useComputed` or `useEffect` to track the node reactively.
   */
  get signal() {
    return this.#node.getter
  }

  /** Fires when the node starts (first frame). */
  onStart = new Trigger<[]>()
  /** Fires every frame during draw with the delta time. */
  onDraw = new Trigger<[delta: number]>()
  /** Fires every frame during update with the delta time. */
  onUpdate = new Trigger<[delta: number]>()
  /** Fires when the node is destroyed. */
  onDestroy = new Trigger<[]>()

  /** Reactive game mode getter. Updates every frame. */
  gameMode = new Signal(GameMode.INHERIT).getter
  /** Sets how this node updates relative to the game's pause state. */
  setGameMode = createSignalSetter(this.gameMode.signal, {
    value: () => this.node.gameMode,
    onChange: (v) => (this.node.gameMode = v),
  })
  /** Reactive `true` when this node participates in update, draw, and systems. */
  active = new Signal(true).getter
  /** Sets whether this node participates in update, draw, and systems. */
  setActive = createSignalSetter(this.active.signal, {
    value: () => this.node.active,
    onChange: (v) => (this.node.active = v),
  })
  /** Reactive `true` when this node is drawn. */
  visible = new Signal(true).getter
  /** Sets whether this node is drawn. */
  setVisible = createSignalSetter(this.visible.signal, {
    value: () => this.node.visible,
    onChange: (v) => (this.node.visible = v),
  })

  constructor({ type, onEnter, onFrame, onExit, linkEvents, regSignal }: ReferenceOptions<T>) {
    this.#type = type

    this.#oldCtx = currentContext.slice()

    const unsubs: (() => void)[] = []

    const frame = (node: NodeInstances[T]) => {
      this.gameMode.signal.setter(node.gameMode)
      this.active.signal.setter(node.active)
      this.visible.signal.setter(node.visible)
      onFrame?.(node)
    }
    const enter = (node: NodeInstances[T]) => {
      const linker: Linker<T> = {
        link(options, ...keys) {
          for (const key of new Set(keys)) {
            const trigger = options?.[key as keyof typeof options]
            if (trigger instanceof Trigger) {
              trigger.link(node[key] as Trigger)
              unsubs.push(() => trigger.unlink())
            }
          }
        },
        on(key, fn) {
          if (fn) {
            ;(node[key] as Trigger).connect(fn)
            unsubs.push(() => (node[key] as Trigger).disconnect(fn))
          }
        },
      }
      linkEvents?.(linker, node)
      linker.link(this, ...(['onStart', 'onDraw', 'onUpdate', 'onDestroy'] as never[]))
      onEnter?.(node)
      onFrame?.(node)
      const onUpdate = () => frame(node)
      node.onUpdate.connect(onUpdate)
      unsubs.push(() => node.onUpdate.disconnect(onUpdate))
    }
    const exit = () => {
      this.gameMode.signal.clearSubs()
      this.active.signal.clearSubs()
      this.visible.signal.clearSubs()

      const set = new Set<Signal<any>>()
      const register: SignalReg = {
        reg(obj, ...signals) {
          for (const key of new Set(signals)) {
            if (obj[key]?.signal instanceof Signal) {
              set.add(obj[key].signal)
            }
          }
        },
      }
      regSignal?.(register)
      register.reg(this, ...(['gameMode', 'active', 'visible'] as never[]))
      ;[...set].forEach((s) => s.clearSubs())
      ;[...unsubs].forEach((u) => u())
      unsubs.length = 0
      onExit?.()
    }

    this.signal.signal.sub((node) => {
      if (node != null) {
        enter(node)
      } else {
        exit()
      }
    })
  }

  /**
   * Returns the node's script if it matches the given class. Use to access script-specific methods.
   *
   * @param scriptClass The script class to check against
   * @param noTrack If `true`, accesses the node directly without reactive tracking
   * @returns The script instance if matched, otherwise `undefined`
   *
   * @example
   * ```tsx
   * const sprite = useSprite()
   *
   * useEffect(() => {
   *   const script = sprite.script(PlantScript)
   *   script?.applyDamage(50)
   * })
   * ```
   */
  script<K extends new (...args: any[]) => FraxelScript<T>>(
    scriptClass: K,
    noTrack = false,
  ): InstanceType<K> | undefined {
    const node = !noTrack ? this.signal() : this.node
    if (node?.script == null) return
    if (node.script instanceof scriptClass) return node.script as InstanceType<K>
  }

  /**
   * Spawns a JSX element as a child of the referenced node.
   *
   * @param jsx The JSX element to spawn as a child
   *
   * @example
   * ```tsx
   * import { useGroup, useTrigger } from 'fraxel'
   *
   * function Container() {
   *   const group = useGroup()
   *
   *   useTrigger(spawnEnemy, () => {
   *     group.spawn(<sprite textureId={ENEMY} position={[0, 0]} />)
   *   })
   *
   *   return <group ref={group} />
   * }
   * ```
   */
  spawn(jsx: Fraxel.Node) {
    const currentCtx = currentContext.slice()

    currentContext.length = 0
    currentContext.push(...this.#oldCtx)

    const nodes = renderToNodes(jsx)
    this.node.addChild(...nodes)

    currentContext.length = 0
    currentContext.push(...currentCtx)
  }

  /** Activates the referenced node and its subtree. */
  activate() {
    this.setActive(true)
  }

  /** Deactivates the referenced node and its subtree. */
  deactivate() {
    this.setActive(false)
  }

  /** Shows the referenced node and its subtree. */
  show() {
    this.setVisible(true)
  }

  /** Hides the referenced node and its subtree from drawing only. */
  hide() {
    this.setVisible(false)
  }
}
