# Nodes

Every game object is built from **nodes** — JSX elements that map to engine classes.

| Node              | JSX Tag              | Description                              |
| ----------------- | -------------------- | ---------------------------------------- |
| `Transform`       | `<transform>`        | Positioning container for child nodes    |
| `Sprite`          | `<sprite>`           | Displays a texture with optional filters |
| `AnimationPlayer` | `<animation-player>` | Plays frame-based animations             |
| `Collider`        | `<collider>`         | Detects overlaps with other colliders    |
| `RayCast`         | `<ray-cast>`         | Projects a ray to detect colliders       |
| `Clickable`       | `<clickable>`        | Detects click/hover pointer events       |
| `Timer`           | `<timer>`            | Counts up and fires events               |

## Transform

```tsx
<transform position={[100, 50]}>
  <sprite textureId={playerTexture} />
</transform>
```

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
- Events: `click`, `mouseEnter`, `mouseExit` (useEvent names: `clicked`, `mouseEntered`, `mouseExited`)
- Set `gameConfig.testOptions.showClickables = true` to visualize areas

## Timer

```tsx
const timer = useRefNode(PrimaryNode.Timer)

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
import { shapes } from 'tiny-engine'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
```

See [Collision System](collision.md) for shapes, groups, and events.

## RayCast

```tsx
import { useRefNode, useEvent } from 'tiny-engine/hooks'
import { PrimaryNode, Vector2 } from 'tiny-engine'

function Detector() {
  const ray = useRefNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEntered', (collider) => {
    console.log('Detected:', collider)
  })

  return (
    <ray-cast
      ref={ray}
      direction={new Vector2(100, 0)}
      collidesWith={['enemy']}
    />
  )
}
```

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

See [Animation](animation.md) for sprite sheet keyframes and reactive animation examples.
