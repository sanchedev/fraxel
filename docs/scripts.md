# Scripts

The `FraxelScript` class separates game logic from rendering. Attach a script to a node via the `script` prop to run logic independently of the JSX component tree.

```ts
import { FraxelScript, PrimaryNode } from 'fraxel'
import { createSignal, signalSetterFrom } from 'fraxel/hooks'
```

## Creating a Script

Extend `FraxelScript` and implement the `setup()` method:

```ts
class PlayerScript extends FraxelScript<PrimaryNode.Transform> {
  health = 100

  setup() {
    this.connect('started', () => {
      console.log('Player spawned!')
    })

    this.connect('updated', (delta) => {
      // game logic here
    })
  }

  applyDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) this.me.destroy()
  }
}
```

## API

### me

Read-only property that returns the node this script is attached to. Throws `NodeNotInitializedError` if accessed before the node is initialized.

```ts
this.me.position // Vector2
this.me.destroy() // destroy the node
```

### connect

Subscribes to a node event by name. Provides type-safe event subscription.

```ts
this.connect('started', () => {
  console.log('Node started!')
})

this.connect('updated', (delta) => {
  console.log('Delta:', delta)
})

this.connect('destroyed', () => {
  console.log('Node destroyed!')
})
```

### setup

Called once when the script is initialized. Override this to register event listeners and initialize state.

## Reactive State in Scripts

Scripts can use `createSignal` and `signalSetterFrom` for reactive state outside of hooks:

```ts
class EnemyScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(100)
  setHealth = signalSetterFrom(this.health)

  setup() {
    this.connect('updated', () => {
      if (this.health() <= 0) {
        this.me.destroy()
      }
    })
  }

  applyDamage(amount: number) {
    this.setHealth(this.health() - amount)
  }
}
```

### createSignal

Creates a reactive signal outside of hooks:

```ts
import { createSignal } from 'fraxel/hooks'

const health = createSignal(100) // [getter, setter]
```

### signalSetterFrom

Extracts a setter function from a signal getter:

```ts
import { signalSetterFrom } from 'fraxel/hooks'

const [getHealth, setHealth] = createSignal(100)
const setter = signalSetterFrom(getHealth) // equivalent to setHealth
```

## Attaching a Script

Attach a script to a node using the `script` prop:

```tsx
function Player() {
  return (
    <transform script={new PlayerScript()}>
      <sprite textureId={PLAYER} />
    </transform>
  )
}
```

## Complete Example

```tsx
import { FraxelScript, PrimaryNode } from 'fraxel'
import { createSignal, signalSetterFrom } from 'fraxel/hooks'

class PlayerScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(100)
  setHealth = signalSetterFrom(this.health)

  setup() {
    this.connect('started', () => {
      console.log('Player spawned with health:', this.health())
    })

    this.connect('updated', (delta) => {
      // gravity, movement, etc.
    })
  }

  applyDamage(amount: number) {
    this.setHealth(this.health() - amount)
    if (this.health() <= 0) {
      this.me.destroy()
    }
  }
}

function Player() {
  return (
    <transform script={new PlayerScript()}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
    </transform>
  )
}
```

## See Also

- [Hooks API](./hooks.md) — `createSignal`, `signalSetterFrom`
- [Nodes](./nodes.md) — Node lifecycle
