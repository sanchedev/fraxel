# Nodes

Every game object is built from **nodes** — JSX elements that map to engine classes.

| Node              | JSX Tag              | Description                                |
| ----------------- | -------------------- | ------------------------------------------ |
| `Transform`       | `<transform>`        | Positioning container for child nodes      |
| `Group`           | `<group>`            | Logical container (no spatial positioning) |
| `Sprite`          | `<sprite>`           | Displays a texture with optional filters   |
| `AnimationPlayer` | `<animation-player>` | Plays frame-based animations               |
| `Collider`        | `<collider>`         | Detects overlaps with other colliders      |
| `RayCast`         | `<ray-cast>`         | Projects a ray to detect colliders         |
| `Clickable`       | `<clickable>`        | Detects click/hover pointer events         |
| `Geometry`        | `<geometry>`         | Renders rectangles, circles, or capsules   |
| `Timer`           | `<timer>`            | Counts up and fires events                 |
| `Text`            | `<text>`             | Renders text on the canvas                 |
| `AudioPlayer`     | `<audio-player>`     | Plays audio buffers                        |
| `Camera`          | `<camera>`           | Controls the viewport                      |
| `RigidBody`       | `<rigid-body>`       | Adds physics simulation                    |

## Transform

```tsx
<transform position={[100, 50]}>
  <sprite textureId={playerTexture} />
</transform>
```

## Group

```tsx
<group>
  <sprite textureId={playerTexture} />
  <sprite textureId={bgTexture} />
</group>
```

- Logical container without spatial positioning (unlike `<transform>` which has a `position`).
- Used internally by the `<List>` component as a hidden `<transform>` anchor for keyed reconciliation.

## Sprite

```tsx
<sprite
  textureId={playerTexture}
  sourceSize={[16, 16]}
  displaySize={[32, 32]}
  brightness={1.2}
  modulate={[1, 0.5, 0, 1]}
/>
```

See [Sprite Filters](filters.md) for all available filter props.

## Clickable

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
    <sprite textureId={btnTexture}>
      <clickable ref={clickable} size={[64, 32]} />
    </sprite>
  )
}
```

- `size` is required (no default hit area). Accepts `VectorLike`.
- `disabled` prop disables all interaction.
- Triggers: `clicked`, `mouseEntered`, `mouseExited`.
- The node also has a `mouseOver` event (fires every frame while the pointer is inside the clickable area), but it is not exposed via the `useClickable` reference to avoid noise.
- `clicked` trigger fires with local position (`Vector2`) relative to the node.
- Set `GameConfig.testOptions.showClickables = true` to visualize areas

## Timer

```tsx
import { useTimer, useTrigger, useEffect } from 'fraxel/hooks'

function Cooldown() {
  const timer = useTimer()

  useTrigger(timer.timeout, () => {
    console.log('done')
  })

  useEffect(() => {
    console.log(timer.time()) // current elapsed time in seconds
  })

  return <timer ref={timer} duration={3} autoPlay />
}
```

- `duration` is in seconds (reactive via `SignalGetter`)
- `autoPlay` starts the timer immediately
- Timer increments each frame by `delta` (seconds)
- Triggers: `timeout`, `timeChanged`
- Methods: `play(from?)`, `pause()`, `stop()`

## Collider

```tsx
import { shapes } from 'fraxel'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
```

See [Collision System](collision.md) for shapes, groups, and events.

## RayCast

```tsx
import { useRayCast, useTrigger } from 'fraxel/hooks'

function Detector() {
  const raycast = useRayCast()

  useTrigger(raycast.colliderEntered, (collider) => {
    console.log('Detected:', collider)
  })

  return <ray-cast ref={raycast} direction={[100, 0]} collidesWith={['enemy']} />
}
```

## Geometry

Renders rectangles, circles, or capsules using the same `shapes` factory as colliders:

```tsx
import { shapes } from 'fraxel'

// Rectangle
<geometry shape={shapes.rectangle(128, 24)} fillColor={[0.2, 0.8, 0.2, 1]} />

// Circle
<geometry shape={shapes.circle(16)} fillColor={[1, 0, 0, 1]} />

// Capsule
<geometry shape={shapes.capsule(60, 20)} fillColor={[0.5, 0.5, 1, 1]} />
```

- `shape` — collision shape from `shapes` factory (required).
- `fillColor` — RGBA fill color (optional).
- `strokeColor` — RGBA border color (optional).
- `strokeWidth` — border width in pixels (optional).

## AnimationPlayer

```tsx
<animation-player
  ref={anim}
  animations={() => ({
    idle: idleFrames,
    walk: walkFrames,
  })}
  currentAnim="idle"
/>
```

- `animations` is a function called when the node starts (deferred). This allows referencing
  sprite nodes that may not be available at construction time.
- `currentAnim` accepts a static string or a reactive `SignalGetter<string>` for automatic
  animation switching.
- `destroyOnEnd` destroys the node when the animation ends (after `animationEnded` fires and no next animation is queued).

See [Animation](animation.md) for sprite sheet keyframes and reactive animation examples.

## Text

Renders text on the canvas using `ctx.fillText()`:

```tsx
import { useText, useSignal } from 'fraxel/hooks'

function ScoreLabel() {
  const label = useText()
  const [score] = useSignal(0)

  return (
    <text
      ref={label}
      position={[10, 20]}
      text={() => `Score: ${score()}`}
      style={{ fontSize: 16, foregroundColor: '#ffffff', fontFamily: 'monospace' }}
    />
  )
}
```

- `text` — string to render (reactive via `SignalGetter`).
- `style` — partial `TextStyle` with `foregroundColor`, `fontSize`, `fontFamily`, `fontWeight`, `textAlign`.

See `TextStyle` in `src/core/theme.ts` for available style properties.

## AudioPlayer

Plays audio buffers loaded with `loadSound()`:

```tsx
import { useAudio, useClickable, useTrigger } from 'fraxel/hooks'
import { loadSound } from 'fraxel'

const SHOOT = await loadSound('/assets/shoot.mp3')

function Gun() {
  const audio = useAudio()
  const clickable = useClickable()

  useTrigger(clickable.clicked, () => {
    audio.play()
  })

  return (
    <sprite textureId={GUN}>
      <clickable ref={clickable} size={[32, 32]} />
      <audio-player ref={audio} soundId={SHOOT} volume={0.8} />
    </sprite>
  )
}
```

- `soundId` — symbol from `loadSound()` (required).
- `loop`, `volume`, `playbackRate` — playback options.
- `persistUntilEnd` — defers node destruction until sound finishes (useful for one-shot sounds).
- Methods: `play(offset?)`, `pause()`, `stop()`.
- Triggers: `ended`, `error`.

See [Audio](audio.md) for full documentation.

## Camera

Controls the viewport — what part of the game world is visible:

```tsx
import { useCamera } from 'fraxel/hooks'

function GameScene() {
  const camera = useCamera()

  return (
    <transform>
      <camera ref={camera} current smoothing={5} offset={[0, -30]} />
      <sprite textureId={PLAYER} position={[100, 200]} />
      <sprite textureId={BG} />
    </transform>
  )
}
```

- `current` — marks this camera as the active one.
- `smoothing` — view position easing (0 = instant, higher = smoother).
- `offset` — screen-space offset.
- `limit` — world-space bounds.
- Methods: `shake()`, `screenToWorld()`, `worldToScreen()`.

See [Camera](camera.md) for full documentation.

## RigidBody

Adds physics simulation to your game:

```tsx
import { shapes } from 'fraxel'

function FallingRock() {
  return (
    <rigid-body position={[100, 0]} mass={2} bounce={0.6}>
      <sprite textureId={ROCK} />
      <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

- `mass`, `friction`, `bounce`, `isStatic`, `useGravity` — physics properties.
- Must be parent of a `<collider>`.
- Access `physicsBody` for `applyForce()` and `applyImpulse()`.

See [Physics](physics.md) for full documentation.
