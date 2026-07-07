import { HookOutsideComponentError } from '../errors/hook.js'
import type { Node } from '../nodes/_node.js'
import type { Context } from './use-context.js'

/**
 * The **`HookContext`** interface represents the internal state of the hook system during a component render.
 */
export interface HookContext {
  node: Node[] | null
  effects: HookEffect[]
  context?: Context<any>
}

type HookEffect = (nodes: Node[], currentContext: HookContext[]) => void

/** @internal */
export const currentContext: HookContext[] = []

/**
 * The **`startHooks`** function initializes a new hook context for a component render.
 */
export function startHooks() {
  currentContext.push({
    node: null,
    effects: [],
  })
}

/**
 * The **`finishHooks`** function finalizes the hook context, executing all queued effects with the resolved nodes.
 * @param nodes The resolved node instances
 */
export function finishHooks(node: Node[]) {
  if (!currentContext) return

  currentContext.at(-1)?.effects.forEach((fn) => fn(node, currentContext))
  currentContext.pop()
}

/**
 * The **`declareDerivedHook`** function validates that a derived hook is called inside a component.
 * @param hookName The name of the hook (for error reporting)
 */
export function declareDerivedHook(hookName: string) {
  if (!currentContext) {
    throw new HookOutsideComponentError(hookName)
  }
}

/**
 * The **`pushEffect`** function queues an effect to be executed after hooks finish.
 * @param hookName The name of the hook (for error reporting)
 * @param effect The effect function to queue
 */
export function pushEffect(hookName: string, effect: HookEffect) {
  if (!currentContext) {
    throw new HookOutsideComponentError(hookName)
  }

  currentContext.at(-1)?.effects.push(effect)
}
