import type { SignalGetter, SignalSetter } from 'diny'
import { createContext } from 'diny/hooks'

export const SunCountCtx = createContext<[SignalGetter<number>, SignalSetter<number>]>([
  () => 0,
  () => {},
])
