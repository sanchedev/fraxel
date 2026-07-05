import type { SignalGetter, SignalSetter } from 'fraxel'
import { createContext } from 'fraxel/hooks'

export const SunCountCtx = createContext<[SignalGetter<number>, SignalSetter<number>]>([
  () => 0,
  () => {},
])
