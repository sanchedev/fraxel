import { pushEffect } from './context.js'

/**
 * The **`useMount`** hook runs a function when the node starts.
 * If the function returns a cleanup function, it runs when the node is destroyed.
 * Does not re-run on signal changes — only on mount and unmount.
 *
 * @param fn The function to run on mount. Can return a cleanup function that runs on destroy.
 *
 * @example
 * ```tsx
 * import { useMount } from 'fraxel'
 *
 * useMount(() => {
 *   console.log('Node mounted')
 *   return () => {
 *     console.log('Node destroyed')
 *   }
 * })
 *
 * return <transform />
 * ```
 */
export function useMount(fn: () => void | (() => void)): void {
  pushEffect('useMount', (nodes) => {
    if (nodes.length < 0) return
    const node = nodes[0]!

    node.onStart.connect(() => {
      const unmount = fn()
      if (unmount) node.onDestroy.connect(() => unmount())
    })
  })
}
