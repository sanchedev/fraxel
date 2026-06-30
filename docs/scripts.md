# Scripts

Separate game logic from rendering with `TinyScript`:

```tsx
import { TinyScript } from 'tiny-engine/scripts'
import { PrimaryNode } from 'tiny-engine'

class PlayerScript extends TinyScript<PrimaryNode.Transform> {
  health = 100

  setup() {
    this.connect(this.me.started, () => {
      console.log('Player spawned!')
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

## Game.destroy

Call `game.destroy()` to clean up the game loop, input listeners, and child node listeners:

```ts
const game = new Game(canvas, config)
// ... later
game.destroy() // stops loop, removes all listeners
```
