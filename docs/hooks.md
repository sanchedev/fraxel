# Hooks

## Native Hooks

| Hook                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `useNode(type)`                   | Creates a typed reference to pass as `ref`                |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup            |
| `useEffect(fn)`                   | Runs effect on mount and when signals change              |
| `useSignal(initial)`              | Creates reactive state that triggers re-renders           |
| `useComputed(fn)`                 | Creates a derived signal that recomputes when deps change |
| `useMount(fn)`                    | Runs once on mount, cleanup on destroy                    |
| `useSpawn(node)`                  | Returns a function to dynamically spawn children          |
| `useGame()`                       | Access game controls (play, pause, changeScene)           |
| `useChild(path, type)`            | Gets a reference to a child node by path                  |
| `useScript(ref)`                  | Retrieves the TinyScript attached to a node               |
| `useTrigger(trigger, callback)`   | Pub/sub for cross-component communication                 |
| `createContext(default)`          | Creates a context with `Provider` component               |
| `useContext(context)`             | Retrieves the current context value                       |
| `useRef(value)`                   | Mutable reference that persists across renders            |

## Derived Hooks (Summary)

| Hook                           | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `useCondition(node, on, off)`  | Reactive boolean toggled by two opposing events  |
| `useMatch(signal, record)`     | Maps signal value to record (like switch)        |
| `useWhen(signal, true, false)` | Ternary expression for signals                   |
| `useClickable(ref?)`           | Clickable node with reactive `hovered` state     |
| `useTimer(ref?)`               | Timer node with `time`, `progress`, and controls |

## useNode

```tsx
import { useNode } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Player() {
  const sprite = useNode(PrimaryNode.Sprite)

  return (
    <transform>
      <sprite ref={sprite} textureId={playerTexture} />
    </transform>
  )
}
```

## useEvent

```tsx
import { useEvent, useNode } from 'tiny-engine/hooks'
import { PrimaryNode, shapes } from 'tiny-engine'

function Enemy() {
  const collider = useNode(PrimaryNode.Collider)

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

## useCondition

```tsx
import { useCondition, useComputed, useNode } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Enemy() {
  const raycast = useNode(PrimaryNode.RayCast)
  const isDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')

  const brightness = useComputed(() => (isDetected() ? 1.2 : 1))

  return <ray-cast ref={raycast} direction={[100, 0]} collidesWith={['enemy']} />
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

  return <transform>{/* health() triggers re-render when set */}</transform>
}
```

## useComputed

```tsx
import { useSignal, useComputed } from 'tiny-engine/hooks'

function CooldownSprite() {
  const [time, setTime] = useSignal(0)
  const progress = useComputed(
    () => time() / 3, // 3 second cooldown
  )

  return <transform>{/* progress() updates when time changes */}</transform>
}
```

## Derived Hooks

Derived hooks are composed from native hooks to provide domain-specific abstractions. They don't introduce unique functionality — they simplify common patterns.

### usePartialNode

Helper that accepts an optional `NodeReference`. If provided, returns it; otherwise creates a new one via `useNode`:

```tsx
const ref = usePartialNode(PrimaryNode.Clickable, existingRef)
```

### useCondition

`useCondition` creates a reactive boolean that toggles based on two opposing events on a node.

```tsx
const isDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')
```

It composes `useEvent` + `useSignal` internally. Use it when the raw `useNode` + `useEvent` + `useSignal` combination becomes verbose for toggle patterns.

### useClickable

`useClickable` is a node-specific derived hook for the `Clickable` node. It returns the node reference and a reactive `hovered` boolean.

```tsx
import { useClickable } from 'tiny-engine/hooks'

function Button() {
  const { ref, hovered } = useClickable()
  const brightness = useComputed(() => (hovered() ? 1.1 : 1))

  return (
    <sprite ref={ref} textureId={BTN} brightness={brightness}>
      <clickable size={[64, 32]} onClick={handleClick} />
    </sprite>
  )
}
```

### useTimer

`useTimer` is a node-specific derived hook for the `Timer` node. It returns the node reference, reactive time/progress, and control methods.

```tsx
import { useTimer } from 'tiny-engine/hooks'

function Cooldown() {
  const { ref, time, progress, play, pause, stop } = useTimer()

  return (
    <transform>
      <timer ref={ref} duration={3} autoPlay />
      <rectangle size={[100, 10]} fillColor={[1 - progress(), progress(), 0, 1]} />
    </transform>
  )
}
```

- `time`: `SignalGetter<number>` — current elapsed time
- `progress`: `SignalGetter<number>` — 0 to 1 based on duration
- `play()`, `pause()`, `stop()`: control methods

### useMatch

`useMatch` creates a computed value based on a signal's current value, similar to a `switch` expression.

```tsx
const [state, setState] = useSignal<'idle' | 'walking' | 'jumping'>('idle')

const animation = useMatch(state, {
  idle: 'idle-anim',
  walking: 'walk-anim',
  jumping: 'jump-anim',
})

return <animation-player currentAnim={animation} />
```

### useWhen

`useWhen` creates a computed value that toggles between two values based on a boolean signal.

```tsx
const isHovered = useCondition(clickable, 'mouseEntered', 'mouseExited')
const brightness = useWhen(isHovered, 1.2, 1.0)

return <sprite brightness={brightness} />
```

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
import { useNode, useSpawn } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Spawner() {
  const container = useNode(PrimaryNode.Transform)
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

## useTrigger

`useTrigger` provides a pub/sub pattern for cross-component communication without node events.

```tsx
import { createTrigger, useTrigger } from 'tiny-engine/hooks'

// Create a trigger (shared between components)
const planted = createTrigger<[Plant]>()

// In parent — listen to the trigger
useTrigger(planted, (plant) => {
  console.log('Planted:', plant)
})

// In child — emit the trigger
planted.emit(Plant.Peashooter)
```

- `createTrigger<T>()` creates a new `Trigger` instance
- `useTrigger(trigger, callback)` subscribes to the trigger with auto-cleanup on destroy
- `trigger.emit(...args)` fires all connected callbacks
- Useful for parent-child communication without prop drilling

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
      {(enemy) => (
        <transform position={[enemy.x, 0]}>
          <sprite textureId={ENEMY} />
        </transform>
      )}
    </List>
  )
}
```

- `array`: reactive `SignalGetter<T[]>` — the data array
- `itemKey`: `(value, index, arr) => string | symbol` — unique key for each item
- `empty`: optional fallback when array is empty
- `children`: `(value, index, arr) => Node` — render function for each item
