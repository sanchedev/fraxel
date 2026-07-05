import { Fragment } from '../jsx/components/fragment.js'
import type { Fraxel } from '../jsx/types.js'
import { currentContext, pushEffect } from './context.js'

/**
 * The **`createContext`** hook creates a context with a default value.
 * Use the returned context's `Provider` to provide values to descendant nodes.
 *
 * @param defaultValue The default value for the context
 * @returns A `ContextCreated` object with a `Provider` component
 *
 * @example
 * ```tsx
 * const ThemeCtx = createContext('light')
 *
 * function App() {
 *   return (
 *     <ThemeCtx.Provider value='dark'>
 *       <Child />
 *     </ThemeCtx.Provider>
 *   )
 * }
 *
 * function Child() {
 *   const theme = useContext(ThemeCtx)
 *   return <text text={theme} />
 * }
 * ```
 */
export function createContext<T>(defaultValue: T) {
  return new ContextCreated<T>(defaultValue)
}

/**
 * The **`useContext`** hook retrieves the value of a context.
 *
 * @param contextCreated The context created with `createContext`
 * @returns The current value of the context, or the default value if no Provider is found
 *
 * @example
 * ```tsx
 * const ThemeCtx = createContext('light')
 *
 * function Child() {
 *   const theme = useContext(ThemeCtx)
 *   return <text text={theme} />
 * }
 * ```
 */
export function useContext<T>(contextCreated: ContextCreated<T>): T {
  pushEffect('useContext', () => {})

  let context: T | undefined

  for (let i = currentContext.length - 1; i >= 0; i--) {
    const ctx = currentContext[i]!

    if (ctx.context?.id !== contextCreated.__id) continue
    context = ctx.context.value
  }

  return context ?? contextCreated.defaultValue
}

class ContextCreated<T> {
  __id: number
  defaultValue: T

  constructor(defaultValue: T) {
    this.defaultValue = defaultValue
    this.__id = genContextId()
  }

  Provider = (props: Fraxel.WithChildren<{ value: T }>) => {
    const ctx = currentContext.at(-1)
    if (ctx) {
      ctx.context = { id: this.__id, value: props.value }
    }
    return Fragment(props)
  }
}

export interface Context<T> {
  id: number
  value: T
}

let counter = 0
function genContextId() {
  return ++counter
}
