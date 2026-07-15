import { SignalRegister } from '../reactivity/register.js'
import { scheduleEffect, schedulePostPhysicsEffect } from '../reactivity/effects.js'
import type { Signal } from '../reactivity/signal.js'
import { pushEffect } from './context.js'

type EffectScheduler = (fn: () => void) => void

/**
 * The **`useEffect`** hook runs an effect function when the node starts and whenever
 * any of the specified signals change. Effect re-executions are batched and run
 * after node updates, before collision, physics, and draw.
 * It also runs cleanup when the node is destroyed.
 *
 * @param fn The effect function. Can return a cleanup function.
 * @returns Nothing.
 *
 * @example
 * ```tsx
 * import { useSignal, useEffect } from 'fraxel'
 *
 * const [count, setCount] = useSignal(0)
 *
 * useEffect(() => {
 *   console.log('Count changed:', count())
 *   return () => {
 *     console.log('Cleanup')
 *   }
 * })
 *
 * return <transform />
 * ```
 */
export function useEffect(fn: () => void | (() => void)): void {
  createEffect('useEffect', scheduleEffect, fn)
}

/**
 * The **`usePostPhysicsEffect`** hook runs an effect function when the node starts and whenever
 * any of the specified signals change. Effect re-executions are batched and run
 * after collision and physics, before draw.
 * It also runs cleanup when the node is destroyed.
 *
 * @param fn The effect function. Can return a cleanup function.
 * @returns Nothing.
 *
 * @example
 * ```tsx
 * import { usePostPhysicsEffect } from 'fraxel'
 *
 * usePostPhysicsEffect(() => {
 *   console.log('Physics state is ready for rendering')
 * })
 *
 * return <transform />
 * ```
 */
export function usePostPhysicsEffect(fn: () => void | (() => void)): void {
  createEffect('usePostPhysicsEffect', schedulePostPhysicsEffect, fn)
}

function createEffect(hookName: string, schedule: EffectScheduler, fn: () => void | (() => void)) {
  pushEffect(hookName, (nodes) => {
    if (nodes.length === 0) return
    const node = nodes[0]!

    node.onStart.connect(() => {
      let unmountCurrentEffect = () => {}
      let scheduled = false
      let cancelled = false

      const refresh = () => {
        scheduled = false
        if (cancelled) return

        unmountCurrentEffect()

        let currentSignals: Signal<any>[] = []

        const unmountWatch = SignalRegister.watch(fn, (signals) => {
          currentSignals = signals
          currentSignals.forEach((signal) => signal.sub(scheduleRefresh))
        })

        unmountCurrentEffect = () => {
          unmountWatch?.()
          currentSignals.forEach((signal) => signal.unsub(scheduleRefresh))
        }
      }

      const scheduleRefresh = () => {
        if (scheduled) return
        scheduled = true
        schedule(refresh)
      }

      node.onDestroy.connect(() => {
        cancelled = true
        unmountCurrentEffect()
      })

      scheduleRefresh()
    })
  })
}
