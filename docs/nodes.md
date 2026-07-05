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
| `Rectangle`       | `<rectangle>`        | Renders a filled/stroked rectangle         |
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
- Used internally by the `<List>` component as an anchor for keyed reconciliation.

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
<sprite ref={sprite} textureId={btnTexture}>
  <clickable
    size={[64, 32]}
    onClick={() => console.log('clicked')}
    onMouseEnter={() => console.log('hover in')}
    onMouseExit={() => console.log('hover out')}
  />
</sprite>
```

- `size` is required (no default hit area). Accepts `VectorLike`.
- `disabled` prop disables all interaction.
- Events: `click`, `mouseEnter`, `mouseExit`, `mouseOver` (useEvent names: `clicked`, `mouseEntered`, `mouseExited`, `mouseOver`)
- `mouseOver` fires every frame while the pointer is inside the clickable area. Callback receives local position (`Vector2`) relative to the node.
- Set `gameConfig.testOptions.showClickables = true` to visualize areas

## Timer

```tsx
const timer = useNode(PrimaryNode.Timer)

useEvent(timer, 'timeout', () => {
  console.log('done')
})

useEvent(timer, 'timeChanged', (elapsed) => {
  console.log(elapsed) // current elapsed time in seconds
})

return <timer ref={timer} duration={3} autoPlay />
```

- `duration` is in seconds (reactive via `SignalGetter`)
- `autoPlay` starts the timer immediately
- Timer increments each frame by `delta` (seconds)
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
import { useNode, useEvent } from 'fraxel/hooks'
import { PrimaryNode, Vector2 } from 'fraxel'

function Detector() {
  const ray = useNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEntered', (collider) => {
    console.log('Detected:', collider)
  })

  return <ray-cast ref={ray} direction={new Vector2(100, 0)} collidesWith={['enemy']} />
}
```

## Rectangle

```tsx
<rectangle
  ref={bar}
  size={[128, 24]}
  fillColor={[0.2, 0.8, 0.2, 1]}
  strokeColor={[0, 0, 0, 1]}
  strokeWidth={2}
/>
```

- `size` — dimensions of the rectangle (required). Accepts `VectorLike`.
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
import { useNode, useSignal } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

function ScoreLabel() {
  const label = useNode(PrimaryNode.Text)
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
import { useNode, useEvent } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'
import { loadSound } from 'fraxel/assets'

const SHOOT = await loadSound('/assets/shoot.mp3')

function Gun() {
  const audio = useNode(PrimaryNode.AudioPlayer)
  const clickable = useNode(PrimaryNode.Clickable)

  useEvent(clickable, 'clicked', () => {
    audio.node.play()
  })

  return (
    <sprite ref={clickable} textureId={GUN}>
      <audio-player ref={audio} soundId={SHOOT} volume={0.8} />
    </sprite>
  )
}
```

- `soundId` — symbol from `loadSound()` (required).
- `loop`, `volume`, `playbackRate` — playback options.
- `persistUntilEnd` — defers node destruction until sound finishes (useful for one-shot sounds).
- Methods: `play(offset?)`, `pause()`, `stop()`.
- Events: `ended`, `error`.

See [Audio](audio.md) for full documentation.

## Camera

Controls the viewport — what part of the game world is visible:

```tsx
import { useNode, useMount } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

function GameScene() {
  const camera = useNode(PrimaryNode.Camera)
  const player = useNode(PrimaryNode.Sprite)

  useMount(() => {
    camera.follow(player)
  })

  return (
    <camera ref={camera} zoom={2}>
      <sprite ref={player} textureId={PLAYER} />
      <sprite textureId={BG} />
    </camera>
  )
}
```

- `zoom` — viewport scale (default `1`).
- `position` — camera position in world space.
- Methods: `follow(target)`, `follow(undefined)`.

See [Camera](camera.md) for full documentation.

## RigidBody

Adds physics simulation to a collider:

```tsx
import { shapes } from 'fraxel'

function FallingRock() {
  return (
    <transform position={[100, 0]}>
      <sprite textureId={ROCK} />
      <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
      <rigid-body mass={2} bounce={0.6} />
    </transform>
  )
}
```

- `mass`, `friction`, `bounce`, `isStatic`, `useGravity` — physics properties.
- Must be a sibling of a `<collider>`.
- Access `physicsBody` for `applyForce()` and `applyImpulse()`.

See [Physics](physics.md) for full documentation.
