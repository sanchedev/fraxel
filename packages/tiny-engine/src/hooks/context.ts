import { HookOutsideComponentError } from '../errors/hook.js'
import type { Node } from '../nodes/_node.js'
import type { Context } from './use-context.js'

export interface HookContext {
  node: Node[] | null
  effects: HookEffect[]
  context?: Context<any>
}

type HookEffect = (nodes: Node[], currentContext: HookContext[]) => void

export const currentContext: HookContext[] = []

export function startHooks() {
  currentContext.push({
    node: null,
    effects: [],
  })
}

export function finishHooks(node: Node[]) {
  if (!currentContext) return

  currentContext.at(-1)?.effects.forEach((fn) => fn(node, currentContext))
  currentContext.pop()
}

export function declareDerivedHook(hookName: string) {
  if (!currentContext) {
    throw new HookOutsideComponentError(hookName)
  }
}

export function pushEffect(hookName: string, effect: HookEffect) {
  if (!currentContext) {
    throw new HookOutsideComponentError(hookName)
  }

  currentContext.at(-1)?.effects.push(effect)
}
