# Hooks

## Native Hooks

| Hook                              | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| `useNode(type)`                   | Creates a typed reference to pass as `ref`                  |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup              |
| `useEffect(fn)`                   | Runs effect on mount and when signals change (batched)      |
| `useSignal(initial)`              | Creates reactive state that triggers re-renders             |
| `useComputed(fn)`                 | Creates a derived signal that recomputes when deps change   |
| `useMount(fn)`                    | Runs once on mount, cleanup on destroy                      |
| `useSpawn(node)`                  | Returns a function to dynamically spawn children            |
| `useGame()`                       | Access game controls (play, pause, changeScene)             |
| `useChild(path, type)`            | Gets a reference to a child node by path                    |
| `useScript(ref)`                  | Retrieves the FraxelScript attached to a node               |
| `useAction(action)`               | Reactive action state (pressed, justPressed, justUnpressed) |
| `useActionAxis(neg, pos)`         | Reactive axis from two opposing actions (-1, 0, or 1)       |
| `useTrigger(trigger, callback)`   | Pub/sub for cross-component communication                   |
| `createContext(default)`          | Creates a context with `Provider` component                 |
| `useContext(context)`             | Retrieves the current context value                         |
| `useRef(value)`                   | Mutable reference that persists across renders              |

## Derived Hooks (Summary)

| Hook                           | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `useCondition(node, on, off)`  | Reactive boolean toggled by two opposing events  |
| `useMatch(signal, record)`     | Maps signal value to record (like switch)        |
| `useWhen(signal, true, false)` | Ternary expression for signals                   |
| `useClickable(ref?)`           | Clickable node with reactive `hovered` state     |
| `useTimer(ref?)`               | Timer node with `time`, `progress`, and controls |
| `useRayCast(ref?)`             | RayCast node with reactive `detected` state      |
| `useCollider(ref?)`            | Collider node with reactive `colliding` state    |
| `useAnimation(ref?)`           | AnimationPlayer with reactive frame state        |
| `useAudio(ref?)`               | AudioPlayer with reactive `playing` state        |

## useNode

```tsx
import { useNode } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

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
import { useEvent, useNode } from 'fraxel/hooks'
import { PrimaryNode, shapes } from 'fraxel'

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

## useAction

Reactive state for an input action. Returns `{ pressed, justPressed, justUnpressed }`:

```tsx
import { Input } from 'fraxel'
import { useAction } from 'fraxel/hooks'

const Jump = Input.createAction({ key: ' ' })

function Player() {
  const jump = useAction(Jump)

  useEffect(() => {
    if (jump.justPressed()) {
      body.applyImpulse([0, -400])
    }
  })

  return <rigid-body>...</rigid-body>
}
```

## useActionAxis

Reactive axis value from two opposing actions. Returns a `SignalGetter<number>` (-1, 0, or 1):

```tsx
import { Input } from 'fraxel'
import { useActionAxis, useEvent } from 'fraxel/hooks'

const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })

function Player() {
  const body = useNode(PrimaryNode.RigidBody)
  const direction = useActionAxis(Left, Right)

  useEvent(body, 'updated', () => {
    body.node.velocity.x = direction() * 120
  })

  return <rigid-body>...</rigid-body>
}
```

## useCondition

```tsx
import { useCondition, useComputed, useNode } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

function Enemy() {
  const raycast = useNode(PrimaryNode.RayCast)
  const isDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')

  const brightness = useComputed(() => (isDetected() ? 1.2 : 1))

  return <ray-cast ref={raycast} direction={[100, 0]} collidesWith={['enemy']} />
}
```

## useSignal + useEffect

```tsx
import { useSignal, useEffect } from 'fraxel/hooks'

function HealthBar() {
  const [health, setHealth] = useSignal(100)

  useEffect(() => {
    console.log('Health changed:', health())
  })

  return <transform>{/* health() triggers re-render when set */}</transform>
}
```

### Batching

`useEffect` batches multiple synchronous signal changes. If `x`, `y`, and `z` all change in the same synchronous block, the effect runs once (not three times):

```tsx
useEffect(() => {
  console.log(x(), y(), z())
})

// All three changes trigger a single effect execution
setX(1)
setY(2)
setZ(3)
```

Re-executions are deferred via `queueMicrotask` and run before the next frame.

## useComputed

```tsx
import { useSignal, useComputed } from 'fraxel/hooks'

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

### useCondition

`useCondition` creates a reactive boolean that toggles based on two opposing events on a node.

```tsx
const isDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')
```

It composes `useEvent` + `useSignal` internally. Use it when the raw `useNode` + `useEvent` + `useSignal` combination becomes verbose for toggle patterns.

### useClickable

`useClickable` is a node-specific derived hook for the `Clickable` node. It returns the node reference and a reactive `hovered` boolean.

```tsx
import { useClickable } from 'fraxel/hooks'

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
import { useTimer } from 'fraxel/hooks'

function Cooldown() {
  const { ref, time, progress, play, pause, stop } = useTimer()

  return (
    <transform>
      <timer ref={ref} duration={3} autoPlay />
      <geometry shape={shapes.rectangle(100, 10)} fillColor={[1 - progress(), progress(), 0, 1]} />
    </transform>
  )
}
```

- `time`: `SignalGetter<number>` — current elapsed time
- `progress`: `SignalGetter<number>` — 0 to 1 based on duration
- `play()`, `pause()`, `stop()`: control methods

### useRayCast

`useRayCast` is a node-specific derived hook for the `RayCast` node. It returns the node reference, a reactive `detected` boolean, and the currently detected collider.

```tsx
import { useRayCast, useComputed } from 'fraxel/hooks'

function EnemyDetector() {
  const { ref, detected, collider } = useRayCast()
  const name = useComputed(() => collider()?.node.name ?? 'none')

  return <ray-cast ref={ref} direction={[100, 0]} collidesWith={['enemy']} />
}
```

- `detected`: `SignalGetter<boolean>` — true while a collider is detected
- `collider`: `SignalGetter<Collider | null>` — the detected collider

### useCollider

`useCollider` is a node-specific derived hook for the `Collider` node. It returns the node reference, a reactive `colliding` boolean, and the other collider in the pair.

```tsx
import { useCollider, useComputed } from 'fraxel/hooks'

function Player() {
  const { ref, colliding, other } = useCollider()
  const tag = useComputed(() => other()?.node.tag ?? 'none')

  return (
    <collider ref={ref} shape={shapes.circle(16)} group={['player']} collidesWith={['enemy']} />
  )
}
```

- `colliding`: `SignalGetter<boolean>` — true while colliding with another collider
- `other`: `SignalGetter<Collider | null>` — the other collider in the pair

### useAnimation

`useAnimation` is a node-specific derived hook for the `AnimationPlayer` node. It returns the node reference, reactive animation state, and control methods.

```tsx
import { useAnimation, useComputed } from 'fraxel/hooks'

function Enemy() {
  const { ref, animName, frameIndex, ended, play, setNext } = useAnimation()

  const frameColor = useComputed(() => (ended() ? [1, 0, 0, 1] : [1, 1, 1, 1]))

  return (
    <animation-player
      ref={ref}
      animations={() => ({ idle: idleFrames, attack: attackFrames })}
      currentAnim="idle"
    />
  )
}
```

- `animName`: `SignalGetter<string>` — current animation name
- `frameIndex`: `SignalGetter<number>` — current frame index
- `ended`: `SignalGetter<boolean>` — true when the current animation ends
- `play(animName?)`, `setNext(animName?)`: control methods

### useAudio

`useAudio` is a node-specific derived hook for the `AudioPlayer` node. It returns the node reference, reactive `playing` state, and control methods.

```tsx
import { useAudio, useClickable } from 'fraxel/hooks'

function SoundEffect() {
  const { ref, playing, play, pause, stop } = useAudio()
  const { ref: btn } = useClickable()

  return (
    <sprite ref={btn}>
      <clickable size={[32, 32]} onClick={() => (playing() ? pause() : play())} />
      <audio-player ref={ref} soundId={SOUND} />
    </sprite>
  )
}
```

- `playing`: `SignalGetter<boolean>` — true while audio is playing
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
import { Signal } from 'fraxel'

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
import { createContext, useContext } from 'fraxel/hooks'

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
import { useNode, useSpawn } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

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
import { createTrigger, useTrigger } from 'fraxel/hooks'

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
import { List } from 'fraxel/jsx'
import { useSignal } from 'fraxel/hooks'

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
