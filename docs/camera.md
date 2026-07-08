# Camera

The `<camera>` node controls the viewport — what part of the game world is visible on screen.

## Basic Usage

Place the camera at the root of your scene and mark it as `current`:

```tsx
import { useCamera } from 'fraxel/hooks'

function GameScene() {
  const camera = useCamera()

  return (
    <transform>
      <camera ref={camera} current />
      <sprite textureId={BACKGROUND} />
      <sprite textureId={PLAYER} position={[80, 50]} />
    </transform>
  )
}
```

Only one camera should be `current` at a time.

## Props

| Prop        | Type                   | Default  | Description                                           |
| ----------- | ---------------------- | -------- | ----------------------------------------------------- |
| `current`   | `boolean`              | `false`  | Whether this camera controls the viewport             |
| `zoom`      | `Reactive<VectorLike>` | `1`      | Viewport scale (2 = twice as large)                   |
| `offset`    | `Reactive<VectorLike>` | `[0, 0]` | Screen-space offset added to the view                 |
| `smoothing` | `Reactive<number>`     | `0`      | View position easing (0 = instant, higher = smoother) |
| `limit`     | `Bounds`               | `null`   | World-space bounds the camera cannot exceed           |
| `position`  | `VectorLike`           | `[0, 0]` | Camera position in world space                        |

## Smoothing

The `smoothing` property controls how fast the view position catches up to the camera's actual `globalPosition`. This is useful when the camera is a child of a moving node — the view eases into position instead of snapping.

```tsx
<camera current smoothing={8} />
```

- `0` = instant (no interpolation)
- Higher values = smoother easing (e.g., `5`–`10` for cinematic feel)

Uses exponential interpolation: `factor = 1 - Math.exp(-smoothing * delta)`.

## Screen-Space Offset

The `offset` property shifts the view in screen space without modifying the camera's world position. Useful for UI elements like health bars at the top of the screen:

```tsx
<camera current offset={[0, -40]} />
```

## World Limits

The `limit` property defines world-space bounds the camera cannot exceed. The viewport is adjusted by zoom when checking limits:

```tsx
import { bounds } from 'fraxel'

;<camera current limit={bounds(0, 0, 800, 600)} />
```

Limits are enforced on the smoothed view position, not the raw global position.

## Screen Shake

Trigger a screen shake effect with `shake()`:

```tsx
const camera = useCamera()

// Shake for 0.3 seconds with 8px strength
camera.shake({ duration: 0.3, strength: 8 })
```

The shake applies a random offset on top of the view position with linear decay.

## Coordinate Conversion

Convert between screen-space and world-space coordinates:

```tsx
const camera = useCamera()

// Screen to world (e.g., click position to world position)
const worldPos = camera.screenToWorld(pointerPosition)

// World to screen (e.g., enemy position to UI position)
const screenPos = camera.worldToScreen(enemyPosition)
```

Both methods account for zoom, offset, and the smoothed view position.

## How It Works

The camera applies a viewport transform before drawing:

1. Translates to the center of the canvas (`width/2, height/2`)
2. Adds screen-space `offset` and shake offset
3. Scales by `zoom`
4. Translates by `-viewPosition` (smoothed global position)
5. Draws all children
6. Restores the canvas state

The `viewPosition` is a smoothed version of `globalPosition`. When the camera or its parent moves, the view eases into the new position based on `smoothing`.

## Example: Platformer Camera

```tsx
import { useRigidBody } from 'fraxel/hooks'
import { bounds, shapes } from 'fraxel'

function Platformer() {
  const body = useRigidBody()

  return (
    <transform>
      <rigid-body ref={body} position={[100, 200]}>
        <camera current smoothing={5} offset={[0, -30]} limit={bounds(0, 0, 1600, 480)} />
        <sprite textureId={PLAYER} />
        <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
      </rigid-body>
    </transform>
  )
}
```

The camera follows the player via the parent `rigid-body`, with smooth easing, a vertical offset to see more sky, and world limits to prevent scrolling past the level edges.
