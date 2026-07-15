import { NodeNotInitializedError } from '../errors'
import type { NodeInstances } from '../nodes'
import type { PrimaryNode } from '../nodes/lib/enum'

/**
 * The **`FraxelScript`** abstract class separates game logic from rendering.
 * Attach a script to a node via the `script` prop to run logic independently
 * of the JSX component tree. Scripts have access to the node instance, can
 * subscribe to events, and maintain their own state.
 *
 * @typeParam T The `PrimaryNode` type this script is attached to.
 *
 * @example
 * ```ts
 * import { FraxelScript } from 'fraxel'
 * import type { PrimaryNode } from 'fraxel'
 *
 * class PlayerScript extends FraxelScript<PrimaryNode.Transform> {
 *   health = 100
 *
 *   setup() {
 *     this.me.onStart.connect(() => {
 *       console.log('Player spawned!')
 *     })
 *   }
 *
 *   applyDamage(amount: number) {
 *     this.health -= amount
 *     if (this.health <= 0) this.me.destroy()
 *   }
 * }
 * ```
 */
export abstract class FraxelScript<T extends PrimaryNode> {
  #me: NodeInstances[T] | undefined

  /**
   * The read-only **`me`** property returns the node this script is attached to.
   * Throws `NodeNotInitializedError` if accessed before the node is initialized.
   *
   * @example
   * ```ts
   * setup() {
   *   this.me.onUpdate.connect(() => {
   *     const pos = this.me.position
   *     console.log('Position:', pos.x, pos.y)
   *   })
   * }
   * ```
   */
  get me() {
    if (this.#me == null) throw new NodeNotInitializedError('fraxel-script-unknown')
    return this.#me
  }

  /**
   * Initializes the script by binding it to a node.
   * Called automatically by the `Node` constructor when a `script` option is provided.
   *
   * @param node The node instance to attach this script to.
   */
  init(node: NodeInstances[T]) {
    this.#me = node
  }

  /**
   * The **`setup`** method is called once when the script is initialized.
   * Override this to register event listeners, initialize state, or set up
   * subscriptions that should persist for the node's lifetime.
   */
  abstract setup(): void
}
