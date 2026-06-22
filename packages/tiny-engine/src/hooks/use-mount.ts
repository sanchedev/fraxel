import { pushEffect } from './context.js'

/**
 * The **`useMount`** hook runs a function when the node starts and when it is destroyed.
 * It does not re-run on signal changes, only on mount and unmount.
 *
 * @param fn The function to run. Can return a cleanup function.
 *
 * @example
 * ```tsx
 * useMount(() => {
 *   console.log('Node mounted')
 *   return () => {
 *     console.log('Node unmounted')
 *   }
 * })
 *
 * return <transform />
 * ```
 */
export function useMount(fn: () => void | (() => void)): void {
  pushEffect('useEffect', (nodes) => {
    if (nodes.length < 0) return
    const node = nodes[0]!

    let unmount: (() => void) | void
    let started = false

    const refresh = () => {
      if (typeof unmount === 'function') unmount()
      unmount = fn()
    }

    const onStart = () => {
      if (!started) started = true
      refresh()
      node.started.off(onStart)
    }
    node.started.on(onStart)

    const onDestroy = () => {
      if (started) started = false
      refresh()
      node.destroyed.off(onDestroy)
    }
    node.destroyed.on(onDestroy)
  })
}
