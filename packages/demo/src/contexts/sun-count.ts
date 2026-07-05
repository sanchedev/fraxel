import type { SignalGetter, SignalSetter } from 'tiny-engine'
import { createContext } from 'tiny-engine/hooks'

export const SunCountCtx = createContext<[SignalGetter<number>, SignalSetter<number>]>([
  () => 0,
  () => {},
])
