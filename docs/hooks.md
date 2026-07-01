# Hooks

| Hook | Description |
|------|-------------|
| `useRefNode(type)` | Creates a typed reference to pass as `ref` |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup |
| `useEffect(fn)` | Runs effect on mount and when signals change |
| `useSignal(initial)` | Creates reactive state that triggers re-renders |
| `useComputed(fn)` | Creates a derived signal that recomputes when deps change |
| `useMount(fn)` | Runs once on mount, cleanup on destroy |
| `useSpawn(node)` | Returns a function to dynamically spawn children |
| `useGame()` | Access game controls (play, pause, changeScene) |
| `useChild(path, type)` | Gets a reference to a child node by path |
| `useScript(ref)` | Retrieves the TinyScript attached to a node |
| `createContext(default)` | Creates a context with `Provider` component |
| `useContext(context)` | Retrieves the current context value |
| `useRef(value)` | Mutable reference that persists across renders |

## useRefNode

```tsx
import { useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Player() {
  const sprite = useRefNode(PrimaryNode.Sprite)

  return (
    <transform>
      <sprite ref={sprite} textureId={playerTexture} />
    </transform>
  )
}
```

## useEvent

```tsx
import { useEvent, useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode, shapes } from 'tiny-engine'

function Enemy() {
  const collider = useRefNode(PrimaryNode.Collider)

  useEvent(collider, 'colliderEntered', (other) => {
    console.log('Hit:', other)
  })

  return (
    <collider
      ref={collider}
      shape={shapes.circle(8)}
      group={['enemy']}
      collidesWith={['projectile']}
    />
  )
}
```

## useSignal + useEffect

```tsx
import { useSignal, useEffect } from 'tiny-engine/hooks'

function HealthBar() {
  const [health, setHealth] = useSignal(100)

  useEffect(() => {
    console.log('Health changed:', health())
  })

  return (
    <transform>
      {/* health() triggers re-render when set */}
    </transform>
  )
}
```

## useComputed

```tsx
import { useSignal, useComputed } from 'tiny-engine/hooks'

function CooldownSprite() {
  const [time, setTime] = useSignal(0)
  const progress = useComputed(
    () => time() / 3 // 3 second cooldown
  )

  return (
    <transform>
      {/* progress() updates when time changes */}
    </transform>
  )
}
```

### refreshOnNodeStart

```tsx
const health = useComputed(() => script.current?.health.value ?? 4000, true)
```

The second parameter `refreshOnNodeStart` (default `false`) forces the computed to re-evaluate
when the node's `started` event fires. Useful when the computed depends on a value that is
only available after the node is initialized (e.g. a script reference).

## Signal

### clearSubs

```ts
import { Signal } from 'tiny-engine'

const health = new Signal(100)

health.sub((val) => {
  console.log('Health changed:', val)
})

health.value = 50 // logs: "Health changed: 50"

health.clearSubs() // removes all subscribers
```

The `clearSubs()` method removes all subscribers from a signal. Useful for cleanup when
a signal's owner is destroyed and no further notifications should be dispatched.

## createContext / useContext

```tsx
import { createContext, useContext } from 'tiny-engine/hooks'

const GameCtx = createContext({ score: 0 })

function Provider() {
  return (
    <GameCtx.Provider value={{ score: 0 }}>
      <Child />
    </GameCtx.Provider>
  )
}

function Child() {
  const { score } = useContext(GameCtx)
  return <transform />
}
```

## useSpawn

```tsx
import { useRefNode, useSpawn } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Spawner() {
  const container = useRefNode(PrimaryNode.Transform)
  const spawn = useSpawn(container)

  return (
    <transform ref={container}>
      <clickable onClick={() => spawn(<Enemy />)}>
        <sprite textureId={BUTTON} />
      </clickable>
    </transform>
  )
}
```

## List

Render reactive arrays with automatic keyed reconciliation:

```tsx
import { List } from 'tiny-engine/jsx'
import { useSignal } from 'tiny-engine/hooks'

function EnemyList() {
  const [enemies] = useSignal([
    { id: 1, x: 0 },
    { id: 2, x: 50 },
  ])

  return (
    <List array={enemies} itemKey={(e) => e.id}>
      {(enemy) => <transform position={[enemy.x, 0]}>
        <sprite textureId={ENEMY} />
      </transform>}
    </List>
  )
}
```

- `array`: reactive `SignalGetter<T[]>` — the data array
- `itemKey`: `(value, index, arr) => string | symbol` — unique key for each item
- `empty`: optional fallback when array is empty
- `children`: `(value, index, arr) => Node` — render function for each item
