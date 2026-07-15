type EffectCallback = () => void

const FLUSH_LIMIT = 1000

const effects = new Set<EffectCallback>()
const postPhysicsEffects = new Set<EffectCallback>()

function schedule(queue: Set<EffectCallback>, fn: EffectCallback) {
  queue.add(fn)
}

function flush(queue: Set<EffectCallback>) {
  let iterations = 0

  while (queue.size > 0) {
    if (iterations++ > FLUSH_LIMIT) {
      throw new Error('Effect flush limit exceeded')
    }

    const pending = Array.from(queue)
    queue.clear()
    pending.forEach((fn) => fn())
  }
}

/** @internal */
export function scheduleEffect(fn: EffectCallback) {
  schedule(effects, fn)
}

/** @internal */
export function flushEffects() {
  flush(effects)
}

/** @internal */
export function schedulePostPhysicsEffect(fn: EffectCallback) {
  schedule(postPhysicsEffects, fn)
}

/** @internal */
export function flushPostPhysicsEffects() {
  flush(postPhysicsEffects)
}
