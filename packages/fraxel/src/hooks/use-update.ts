import { HookRequiresNodeRootError } from '../errors/hook.js'
import { pushEffect } from './context.js'

export function useUpdate(fn: (delta: number) => void) {
  pushEffect('useUpdate', ([node]) => {
    if (node == null) throw new HookRequiresNodeRootError('useUpdate')
    node.updated.on(fn)
  })
}
