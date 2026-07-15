import { Trigger } from '../events/trigger.js'
import { pushEffect } from './context.js'

/**
 * The **`createTrigger`** function creates a new `Trigger` instance for pub/sub
 * communication between components without node events.
 *
 * @typeParam T The argument types for the trigger callbacks
 * @returns A new `Trigger` instance
 *
 * @example
 * ```ts
 * import { createTrigger } from 'fraxel'
 *
 * const planted = createTrigger<[Plant]>()
 * ```
 */
export function createTrigger<T extends any[] = any[]>() {
  return new Trigger<T>()
}

/**
 * The **`useTrigger`** hook subscribes to a `Trigger` with auto-cleanup on node destroy.
 *
 * @param trigger The `Trigger` instance to subscribe to
 * @param fn The callback function to invoke when the trigger emits
 *
 * @example
 * ```tsx
 * import { createTrigger, useTrigger } from 'fraxel'
 *
 * const planted = createTrigger<[Plant]>()
 *
 * useTrigger(planted, (plant) => {
 *   console.log('Planted:', plant)
 * })
 * ```
 */
export function useTrigger<T extends Trigger<any[]>>(trigger: T, fn: Parameters<T['connect']>[0]) {
  pushEffect('useTrigger', ([node]) => {
    if (node == null) return

    trigger.connect(fn)
    node.onDestroy.connect(() => trigger.disconnect(fn))
  })
}
