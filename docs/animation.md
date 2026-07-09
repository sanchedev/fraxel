# Animation

The animation module provides frame-based sprite animation and tweening (property interpolation over time).

```ts
import { tween, easeOutQuad, animationFromSheet } from 'fraxel'
```

## Sprite Sheets

### keyframesFromSheet

Generates raw keyframes from a sprite sheet:

```ts
import { keyframesFromSheet } from 'fraxel'

const allFrames = keyframesFromSheet(sprite, walkTexture, 4, 1)
const walkFrames = keyframesFromSheet(sprite, walkTexture, 4, 2, [0, 3])
const runFrames = keyframesFromSheet(sprite, walkTexture, 4, 2, [4, 7])
```

| Param       | Type               | Description                                                                      |
| ----------- | ------------------ | -------------------------------------------------------------------------------- |
| `sprite`    | `Sprite`           | The sprite instance to animate.                                                  |
| `textureId` | `symbol \| null`   | Texture symbol. If `null`, the sprite texture won't change.                      |
| `columns`   | `number`           | Number of columns in the sheet (default `1`).                                    |
| `rows`      | `number`           | Number of rows in the sheet (default `1`).                                       |
| `range`     | `[number, number]` | Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames. |

### kfFromProp & multiKF

```ts
import { kfFromProp, multiKF } from 'fraxel'

const frame1 = kfFromProp(sprite, 'textureId', frame1Texture)
const combined = multiKF([frame1, frame2, frame3])
```

- `kfFromProp(sprite, prop, value)` — sets a single property for a keyframe.
- `multiKF(frames)` — merges multiple keyframes into one.

## animationFromSheet

Creates a complete `Animation` object with automatic FPS calculation:

```ts
import { animationFromSheet } from 'fraxel'

const idle = animationFromSheet(sprite, IDLE_TEXTURE, {
  columns: 4,
  duration: 1,
  loop: true,
})

const walk = animationFromSheet(sprite, WALK_TEXTURE, {
  columns: 4,
  rows: 2,
  range: [0, 7],
  duration: 2,
  loop: true,
})
```

| Param       | Type                      | Description                                                           |
| ----------- | ------------------------- | --------------------------------------------------------------------- |
| `sprite`    | `Sprite \| NodeReference` | The sprite instance or node reference.                                |
| `textureId` | `symbol \| null`          | Texture symbol.                                                       |
| `columns`   | `number`                  | Number of columns in the sheet.                                       |
| `rows`      | `number`                  | Number of rows in the sheet.                                          |
| `range`     | `[number, number]`        | Optional `[from, to]` tuple (0-indexed, inclusive).                   |
| `duration`  | `number`                  | Total animation time in seconds. FPS = `(columns * rows) / duration`. |
| `loop`      | `boolean`                 | Whether the animation should loop.                                    |

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

- `animations` is a **function** that returns a record of animation definitions. It is called when the node starts (deferred), not at construction time.
- `currentAnim` accepts a static string or a reactive `SignalGetter<string>` for automatic animation switching.

### Reactive currentAnim

```tsx
import { useComputed } from 'fraxel/hooks'

const animName = useComputed(() => (isWalking() ? 'walk' : 'idle'))

return (
  <animation-player
    animations={() => ({ idle: idleFrames, walk: walkFrames })}
    currentAnim={animName}
  />
)
```

When `currentAnim` is a `SignalGetter`, the player tracks its dependencies and switches animations automatically when the signal value changes.

## Tweening

Interpolate numeric properties over time:

```tsx
import { useSprite, useMount } from 'fraxel/hooks'
import { tween, easeOutQuad } from 'fraxel'

function FadeIn() {
  const sprite = useSprite()

  useMount(() => {
    tween({
      target: sprite.node,
      prop: 'opacity',
      from: 0,
      to: 1,
      duration: 0.5,
      easing: easeOutQuad,
    })
  })

  return <sprite ref={sprite} textureId={TEX} />
}
```

### tween() Options

| Property     | Type              | Description                             |
| ------------ | ----------------- | --------------------------------------- |
| `target`     | `T`               | Object whose property will be animated. |
| `prop`       | `keyof T`         | Property name to interpolate.           |
| `from`       | `number`          | Start value.                            |
| `to`         | `number`          | End value.                              |
| `duration`   | `number`          | Duration in seconds.                    |
| `easing`     | `EasingFn`        | Easing function (default: `linear`).    |
| `onUpdate`   | `(value) => void` | Called every frame with current value.  |
| `onComplete` | `() => void`      | Called when the tween finishes.         |

### Controller

```tsx
const t = tween({ ... })
t.pause()      // Pause the tween
t.resume()     // Resume from current position
t.stop()       // Stop and reset to beginning
t.isPlaying    // boolean — is it playing?
t.progress     // number — 0 to 1
```

### tweenValue()

Animates a value without a target object:

```tsx
import { tweenValue } from 'fraxel'

tweenValue({
  from: 0,
  to: 100,
  duration: 1,
  onUpdate: (value) => console.log(value),
})
```

## Easing Functions

```tsx
import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeBackOut,
  easeBackInOut,
  easeOutBounce,
  easeInBounce,
  easeOutElastic,
} from 'fraxel'
```

| Function         | Description                    |
| ---------------- | ------------------------------ |
| `linear`         | No easing — constant speed.    |
| `easeInQuad`     | Slow start, accelerates.       |
| `easeOutQuad`    | Fast start, decelerates.       |
| `easeInOutQuad`  | Slow start and end.            |
| `easeInCubic`    | Cubic acceleration.            |
| `easeOutCubic`   | Cubic deceleration.            |
| `easeInOutCubic` | Cubic slow start and end.      |
| `easeBackOut`    | Overshoots then settles back.  |
| `easeBackInOut`  | Overshoots in both directions. |
| `easeOutBounce`  | Bounces at the end.            |
| `easeInBounce`   | Bounces at the start.          |
| `easeOutElastic` | Spring-like elastic overshoot. |

## Sequences

### sequence()

Runs tweens one after another:

```tsx
import { tween, sequence } from 'fraxel'

sequence([
  tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
  tween({ target: sprite, prop: 'position', from: 0, to: 100, duration: 1 }),
])
```

### parallel()

Runs tweens simultaneously:

```tsx
import { tween, parallel } from 'fraxel'

parallel([
  tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
  tween({ target: sprite, prop: 'scale', from: 0.5, to: 1, duration: 0.5 }),
])
```

## Using with Hooks

```tsx
import { useSprite, useMount } from 'fraxel/hooks'
import { tween, easeOutBounce } from 'fraxel'

function DropIn() {
  const sprite = useSprite()

  useMount(() => {
    tween({
      target: sprite.node,
      prop: 'position',
      from: -50,
      to: 50,
      duration: 0.8,
      easing: easeOutBounce,
    })
  })

  return <sprite ref={sprite} textureId={COIN} />
}
```

## See Also

- [Nodes](./nodes.md) — AnimationPlayer node reference
- [Hooks API](./hooks.md) — `useAnimation`, `useTimer`
