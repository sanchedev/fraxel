# Scripts

Separate game logic from rendering with `TinyScript`:

```tsx
import { TinyScript } from 'tiny-engine/scripts'
import { PrimaryNode } from 'tiny-engine'

class PlayerScript extends TinyScript<PrimaryNode.Transform> {
  health = 100

  setup() {
    this.connect('started', () => {
      console.log('Player spawned!')
    })

    this.connect('destroyed', () => {
      console.log('Player destroyed!')
    })
  }

  applyDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.me.destroy()
    }
  }
}

// Use in JSX
<transform script={new PlayerScript()} />
```

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

Call `game.destroy()` to clean up the game loop, input listeners, and child node listeners:

```ts
const game = new Game(canvas, config)
// ... later
game.destroy() // stops loop, removes all listeners
```
