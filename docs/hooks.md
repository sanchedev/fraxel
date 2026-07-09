# Hooks

Hooks bridge declarative JSX and imperative game logic. They run during the render phase and auto-cleanup on node destroy.

```ts
import { useEffect, useSignal, useComputed } from 'fraxel/hooks'
```

## Core Hooks

| Hook                            | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `useEffect(fn)`                 | Runs effect on mount and when signals change (batched)      |
| `useSignal(initial)`            | Creates reactive state that triggers re-renders             |
| `useComputed(fn)`               | Creates a derived signal that recomputes when deps change   |
| `useMount(fn)`                  | Runs once on mount, cleanup on destroy                      |
| `useAction(action)`             | Reactive action state (pressed, justPressed, justUnpressed) |
| `useActionAxis(neg, pos)`       | Reactive axis from two opposing actions (-1, 0, or 1)       |
| `useTrigger(trigger, callback)` | Pub/sub for cross-component communication                   |
| `createContext(default)`        | Creates a context with `Provider` component                 |
| `useContext(context)`           | Retrieves the current context value                         |
| `useRef(value)`                 | **@deprecated** — use a plain `let` variable instead        |

### Deprecation: useRef

`useRef` is deprecated. Since component functions in fraxel execute only once (no re-render cycle), a plain `let` variable has the same behavior:

```tsx
// Before (deprecated)
const count = useRef(0)
count.current++
console.log(count.current)

// After — use a plain let
let count = 0
count++
console.log(count)
```

All internal engine code has been migrated to use `let` variables.

## Script Utilities

| Function                   | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `createSignal(initial)`    | Creates a reactive signal outside of hooks (for scripts) |
| `signalSetterFrom(getter)` | Extracts a setter from a signal getter                   |

```ts
import { FraxelScript, PrimaryNode } from 'fraxel'
import { createSignal, signalSetterFrom } from 'fraxel/hooks'

class PlayerScript extends FraxelScript<PrimaryNode.Transform> {
  health = createSignal(100)
  setHealth = signalSetterFrom(this.health)

  applyDamage(amount: number) {
    this.setHealth(this.health() - amount)
  }
}
```

## Native Hooks (Node References)

| Hook             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `useSprite()`    | Sprite with flip, filter, modulate, opacity    |
| `useCollider()`  | Collider with collision state and events       |
| `useRayCast()`   | RayCast with detection state and events        |
| `useClickable()` | Clickable with hover state and click events    |
| `useAnimation()` | AnimationPlayer with frame state and playback  |
| `useAudio()`     | AudioPlayer with playback state and control    |
| `useTimer()`     | Timer with time tracking and control           |
| `useRigidBody()` | RigidBody with physics state and forces        |
| `useCamera()`    | Camera with zoom, offset, and viewport control |
| `useGeometry()`  | Geometry with shape, color, and size           |
| `useText()`      | Text with reactive content                     |
| `useTransform()` | Transform with position                        |
| `useGroup()`     | Group container reference                      |

## Derived Hooks

| Hook                           | Description                                |
| ------------------------------ | ------------------------------------------ |
| `useCondition(on, off)`        | Reactive boolean toggled by two Triggers   |
| `useMatch(signal, record)`     | Maps signal value to record (like switch)  |
| `useWhen(signal, true, false)` | Ternary expression for signals             |
| `usePaused()`                  | Reactive pause state + play/pause controls |
| `useSize()`                    | Game canvas dimensions as Vector2          |
| `useScene()`                   | Scene manager access                       |

## useAction

Reactive state for an input action. Returns `{ pressed, justPressed, justUnpressed }`:

```tsx
import { Input } from 'fraxel'
import { useAction, useEffect } from 'fraxel/hooks'

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
import { useActionAxis, useRigidBody, useEffect } from 'fraxel/hooks'

const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })

function Player() {
  const body = useRigidBody()
  const direction = useActionAxis(Left, Right)

  useEffect(() => {
    body.setVelocity([direction() * 120, body.velocity().y])
  })

  return <rigid-body ref={body}>...</rigid-body>
}
```

## useCondition

Creates a reactive boolean that toggles based on two `Trigger` instances:

```tsx
import { useCondition, useComputed, useRayCast, useEffect } from 'fraxel/hooks'

function Enemy() {
  const raycast = useRayCast()
  const isDetected = useCondition(raycast.colliderEntered, raycast.colliderExited)

  useEffect(() => {
    console.log('Detected:', isDetected())
  })

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

## Native Hooks

### useSprite

Creates a reference to a `Sprite` node with reactive access to all visual properties.

```tsx
import { useSprite, useEffect } from 'fraxel/hooks'

function Player() {
  const sprite = useSprite()

  useEffect(() => {
    sprite.setModulate([1, 0.5, 0.5, 1]) // tint red
    sprite.setOpacity(0.8)
  })

  return <sprite ref={sprite} textureId={PLAYER} />
}
```

- Reactive properties: `flipX`, `flipY`, `brightness`, `grayscale`, `modulate`, `contrast`, `saturate`, `hueRotate`, `invert`, `opacity`
- Setters: `setFlipX()`, `setFlipY()`, `setBrightness()`, `setGrayscale()`, `setModulate()`, etc.

### useCollider

Creates a reference to a `Collider` node with reactive collision state and event triggers.

```tsx
import { useCollider, useTrigger, useEffect } from 'fraxel/hooks'

function Enemy() {
  const collider = useCollider()

  useTrigger(collider.colliderEntered, (other) => {
    console.log('Hit by:', other)
  })

  useEffect(() => {
    if (collider.colliding()) {
      console.log('Colliding with', collider.detectedColliders().size, 'objects')
    }
  })

  return (
    <collider
      ref={collider}
      shape={shapes.rectangle(32, 32)}
      group={['enemy']}
      collidesWith={['player', 'projectile']}
    />
  )
}
```

- Reactive properties: `colliding` (boolean), `detectedColliders` (Set)
- Triggers: `colliderEntered`, `colliderExited`

### useRayCast

Creates a reference to a `RayCast` node with reactive detection state and event triggers.

```tsx
import { useRayCast, useTrigger, useEffect } from 'fraxel/hooks'

function Peashooter() {
  const raycast = useRayCast()

  useTrigger(raycast.colliderEntered, (collider) => {
    console.log('Detected:', collider)
  })

  useEffect(() => {
    if (raycast.detected()) {
      console.log('Zombie ahead:', raycast.collider())
    }
  })

  return <ray-cast ref={raycast} direction={[100, 0]} collidesWith={['zombie']} />
}
```

- Reactive properties: `direction`, `collider` (Collider | null), `detected` (boolean)
- Triggers: `colliderEntered`, `colliderExited`
- Method: `getCollider()` — returns the currently detected collider or null

### useClickable

Creates a reference to a `Clickable` node with reactive hover state and click event triggers.

```tsx
import { useClickable, useTrigger, useEffect } from 'fraxel/hooks'

function Button() {
  const clickable = useClickable()

  useTrigger(clickable.clicked, (pos) => {
    console.log('Clicked at:', pos)
  })

  useEffect(() => {
    if (clickable.hovered()) {
      console.log('Hovering')
    }
  })

  return (
    <sprite textureId={BTN}>
      <clickable ref={clickable} size={[64, 32]} />
    </sprite>
  )
}
```

- Reactive properties: `hovered` (boolean), `disabled` (boolean), `mousePosition` (Vector2)
- Triggers: `clicked`, `mouseEntered`, `mouseExited`
- Note: The underlying node also has a `mouseOver` event (fires every frame while pointer is inside), but it is not exposed via the reference to avoid noise.

### useAnimation

Creates a reference to an `AnimationPlayer` node with reactive animation state and imperative control.

```tsx
import { useAnimation, useTrigger, useEffect } from 'fraxel/hooks'

function Character() {
  const anim = useAnimation()

  useTrigger(anim.animationEnded, (name) => {
    console.log('Animation finished:', name)
  })

  useEffect(() => {
    anim.play('walk')
  })

  return (
    <animation-player
      ref={anim}
      animations={() => ({
        idle: { keyframes: idleFrames, fps: 8 },
        walk: { keyframes: walkFrames, fps: 8, loop: true },
      })}
    />
  )
}
```

- Reactive properties: `animName` (string | null), `frameIndex` (number), `ended` (boolean)
- Triggers: `animationChanged`, `animationStopped`, `animationIndexChanged`, `animationEnded`
- Methods: `play(name, index?)`, `stop()`, `setNext(name)`

### useAudio

Creates a reference to an `AudioPlayer` node with reactive playback state and imperative control.

```tsx
import { useAudio, useTrigger, useClickable } from 'fraxel/hooks'

function SoundEffect() {
  const audio = useAudio()
  const clickable = useClickable()

  useTrigger(audio.ended, () => {
    console.log('Sound finished')
  })

  return (
    <audio-player ref={audio} soundId={SFX}>
      <clickable ref={clickable} size={[64, 32]} />
    </audio-player>
  )
}
```

- Reactive properties: `playing` (boolean)
- Triggers: `ended`, `error`
- Methods: `play(offset?)`, `pause()`, `stop()`

### useTimer

Creates a reference to a `Timer` node with reactive time tracking and imperative control.

```tsx
import { useTimer, useTrigger, useEffect } from 'fraxel/hooks'

function Cooldown() {
  const timer = useTimer()

  useTrigger(timer.timeout, () => {
    console.log('Cooldown finished!')
  })

  useEffect(() => {
    console.log(`Progress: ${(timer.progress() * 100).toFixed(0)}%`)
  })

  return <timer ref={timer} duration={3} autoPlay />
}
```

- Reactive properties: `time` (number), `duration` (number), `progress` (0–1)
- Triggers: `timeout`, `timeChanged`
- Methods: `play(from?)`, `pause()`, `stop()`

### useRigidBody

Creates a reference to a `RigidBody` node with reactive physics state and imperative force/impulse methods.

```tsx
import { useRigidBody, useEffect, useAction } from 'fraxel/hooks'
import { Input } from 'fraxel'

const Jump = Input.createAction({ key: ' ' })

function Player() {
  const rb = useRigidBody()

  useEffect(() => {
    if (Input.isActionPressed(Jump) && rb.isGrounded()) {
      rb.applyImpulse([0, -400])
    }
  })

  return (
    <rigid-body ref={rb} mass={1}>
      <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

- Reactive properties: `velocity`, `isGrounded`, `mass`, `friction`, `bounce`, `isStatic`, `useGravity`
- Methods: `applyForce(VectorLike)`, `applyImpulse(VectorLike)`, `setVelocity(VectorLike)`

### useCamera

Creates a reference to a `Camera` node with reactive zoom, offset, and smoothing properties.

```tsx
import { useCamera, useEffect } from 'fraxel/hooks'

function MainCamera() {
  const camera = useCamera()

  useEffect(() => {
    camera.makeCurrent()
    camera.shake({ duration: 0.5, strength: 10 })
  })

  return <camera ref={camera} />
}
```

- Reactive properties: `zoom` (Vector2), `offset` (Vector2), `smoothing` (number), `limit` (Bounds | null)
- Methods: `makeCurrent()`, `shake({ duration, strength })`, `screenToWorld(pos)`, `worldToScreen(pos)`

### useGeometry

Creates a reference to a `Geometry` node with reactive shape, color, and size properties.

```tsx
import { useGeometry, useEffect } from 'fraxel/hooks'

function Hitbox() {
  const geo = useGeometry()

  useEffect(() => {
    geo.setFillColor([1, 0, 0, 0.5]) // semi-transparent red
  })

  return <geometry ref={geo} shape={shapes.rectangle(32, 32)} />
}
```

- Reactive properties: `shape`, `fillColor`, `strokeColor`, `strokeWidth`, `size`

### useText

Creates a reference to a `Text` node with reactive text content.

```tsx
import { useText, useEffect } from 'fraxel/hooks'

function ScoreDisplay() {
  const text = useText()

  useEffect(() => {
    text.setText(`Score: ${score()}`)
  })

  return <text ref={text} text="Score: 0" />
}
```

- Reactive properties: `text` (string)

### useTransform

Creates a reference to a `Transform` node. Use to access position and lifecycle events.

```tsx
import { useTransform, useEffect } from 'fraxel/hooks'

function Platform() {
  const transform = useTransform()

  useEffect(() => {
    console.log('Position:', transform.position())
  })

  return (
    <transform ref={transform} position={[100, 200]}>
      <sprite textureId={PLATFORM} />
    </transform>
  )
}
```

- Reactive properties: `position` (Vector2)
- Setter: `setPosition(VectorLike)`

### useGroup

Creates a reference to a `Group` node. Groups are containers for organizing child nodes.

```tsx
import { useGroup, useTrigger } from 'fraxel/hooks'

function Container() {
  const group = useGroup()

  return (
    <group ref={group}>
      <timer duration={2} autoPlay onTimeout={() => group.spawn(<Enemy />)} />
    </group>
  )
}
```

## Derived Hooks

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
const isHovered = useCondition(clickable.mouseEntered, clickable.mouseExited)
const brightness = useWhen(isHovered, 1.2, 1.0)

return <sprite brightness={brightness} />
```

### usePaused

Provides reactive access to the game's pause state and imperative controls to play or pause.

```tsx
import { usePaused, useEffect } from 'fraxel/hooks'
import { Input } from 'fraxel'

const Pause = Input.createAction({ key: 'p' })

function PauseManager() {
  const { paused, play, pause } = usePaused()

  useEffect(() => {
    if (Input.justActionPressed(Pause)) {
      paused() ? play() : pause()
    }
  })

  return null
}
```

- `paused`: `SignalGetter<boolean>` — reactive pause state (read with `paused()`)
- `play()`: unpauses the game
- `pause()`: pauses the game

### useSize

Returns the game's canvas dimensions as a `Vector2`.

```tsx
import { useSize, useEffect } from 'fraxel/hooks'

const size = useSize()

useEffect(() => {
  console.log(`Game size: ${size.x}x${size.y}`)
})
```

- Returns `Vector2` with `x` (width) and `y` (height)

### useScene

Provides imperative access to the scene manager.

```tsx
import { useScene, useEffect } from 'fraxel/hooks'
import { Input } from 'fraxel'

const Restart = Input.createAction({ key: 'r' })

function GameOver() {
  const scene = useScene()

  useEffect(() => {
    if (Input.justActionPressed(Restart)) {
      scene.change('game')
    }
  })

  return <text text="Game Over" />
}
```

- `current`: `string` — the current scene name
- `change(name)`: switches to a different scene (pass `null` to unload)
- `preload(name)`: preloads a scene, returns a cleanup function

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

The `clearSubs()` method removes all subscribers from a signal. Useful for cleanup when a signal's owner is destroyed and no further notifications should be dispatched.

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

- `array`: `Reactive<T[]>` — reactive array signal or static array.
- `itemKey`: `(value, index, arr) => string | symbol` — unique key for each item
- `empty`: optional fallback when array is empty
- `children`: `(value, index, arr) => Node` — render function for each item

## See Also

- [Core](core.md) — `Game`, `SceneManager`, theming
- [JSX](jsx.md) — `List`, `Fragment`, `Game`, `Scene` components
- [Reactivity](reactivity.md) — `Signal`, `SignalRegister` internals
- [Scripts](scripts.md) — `FraxelScript` and `createSignal` in scripts
