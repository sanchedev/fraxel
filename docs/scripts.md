# Scripts

Separate game logic from rendering with `FraxelScript`:

```tsx
import { FraxelScript } from 'fraxel/scripts'
import { PrimaryNode } from 'fraxel'
import { createSignal, signalSetterFrom } from 'fraxel/hooks'

class PlayerScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(100)
  setHealth = signalSetterFrom(this.health)

  setup() {
    this.connect('started', () => {
      console.log('Player spawned!')
    })

    this.connect('destroyed', () => {
      this.health.signal.clearSubs()
    })
  }

  applyDamage(amount: number) {
    const newHealth = this.health() - amount
    this.setHealth(newHealth)
    if (newHealth <= 0) {
      this.me.destroy()
    }
  }
}

// Use in JSX
;<transform script={new PlayerScript()} />
```

## Reactive State with Signals

Scripts use `createSignal` and `signalSetterFrom` for reactive state:

```ts
import { createSignal, signalSetterFrom } from 'fraxel/hooks'

class EnemyScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(100)
  setHealth = signalSetterFrom(this.health)
  isAlive = createSignal(true)

  applyDamage(amount: number) {
    this.setHealth(this.health() - amount)
    if (this.health() <= 0) {
      this.isAlive.setter(false)
      this.me.destroy()
    }
  }
}
```

- `createSignal(value)` — Creates a `SignalGetter<T>` (read with `signal()`)
- `signalSetterFrom(getter)` — Extracts a `SignalSetter<T>` (write with `setter(value)`)
- Clean up with `signal.clearSubs()` in `destroyed` event

## API

### `me`

Read-only property that returns the node this script is attached to.
Throws `NodeNotInitializedError` if accessed before initialization.

### `connect(eventName, callback)`

Type-safe event subscription. Accepts the event name as a string
(e.g. `'started'`, `'destroyed'`, `'updated'`).

### `setup()`

Called once when the script is initialized. Override to register event
listeners, initialize state, or set up subscriptions.

## Game.destroy

Call `Game.destroy()` to clean up the game loop, input listeners, and child node listeners:

```ts
Game.setup({ width: 160, height: 90, root })
// ... later
Game.destroy() // stops loop, removes all listeners
```
