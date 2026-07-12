import { HookRequiresNodeRootError } from '../errors/hook.js'
import { pushEffect } from './context.js'

/**
 * The **`useUpdate`** hook registers a callback that runs every frame with the delta time.
 * Requires a node root — must be called inside a component that creates a node.
 *
 * @param fn The update callback receiving the delta time in seconds
 *
 * @example
 * ```tsx
 * import { useUpdate } from 'fraxel'
 *
 * function Rotator() {
 *   useUpdate((delta) => {
 *     console.log('Frame delta:', delta)
 *   })
 *
 *   return <sprite textureId={TEX} />
 * }
 * ```
 */
export function useUpdate(fn: (delta: number) => void) {
  pushEffect('useUpdate', ([node]) => {
    if (node == null) throw new HookRequiresNodeRootError('useUpdate')
    node.updated.on(fn)
  })
}
