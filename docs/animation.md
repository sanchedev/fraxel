# Animation

## Sprite Sheets

Generate keyframes from a sprite sheet:

```tsx
import { keyframesFromSheet, kfFromProp, multiKF } from 'fraxel'

// Full sprite sheet (all frames)
const allFrames = keyframesFromSheet(spriteNode, walkTexture, 4, 1)

// Subset of frames using range [from, to] (0-indexed, inclusive)
const walkFrames = keyframesFromSheet(spriteNode, walkTexture, 4, 2, [0, 3])
const runFrames = keyframesFromSheet(spriteNode, walkTexture, 4, 2, [4, 7])

// Set a property for a frame
const frame1 = kfFromProp(spriteNode, 'textureId', frame1Texture)

// Combine multiple keyframes
const combined = multiKF([frame1, frame2, frame3])
```

### keyframesFromSheet Parameters

| Parameter   | Type               | Description                                                                     |
| ----------- | ------------------ | ------------------------------------------------------------------------------- |
| `sprite`    | `Sprite`           | The sprite instance to animate                                                  |
| `textureId` | `symbol \| null`   | Texture symbol. If `null`, the sprite texture won't change                      |
| `columns`   | `number`           | Number of columns in the sheet (default `1`)                                    |
| `rows`      | `number`           | Number of rows in the sheet (default `1`)                                       |
| `range`     | `[number, number]` | Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames |

## animationFromSheet

Creates a complete `Animation` object with automatic FPS calculation:

```tsx
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

### animationFromSheet Parameters

| Parameter   | Type                      | Description                                                                     |
| ----------- | ------------------------- | ------------------------------------------------------------------------------- |
| `sprite`    | `Sprite \| NodeReference` | The sprite instance or node reference                                           |
| `textureId` | `symbol \| null`          | Texture symbol. If `null`, the sprite texture won't change                      |
| `columns`   | `number`                  | Number of columns in the sheet (default `1`)                                    |
| `rows`      | `number`                  | Number of rows in the sheet (default `1`)                                       |
| `range`     | `[number, number]`        | Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames |
| `duration`  | `number`                  | Total animation time in seconds. FPS = `(columns * rows) / duration`            |
| `loop`      | `boolean`                 | Whether the animation should loop                                               |

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

When `currentAnim` is a `SignalGetter`, the player tracks its dependencies and
switches animations automatically when the signal value changes.

## Tweening

Interpolate numeric properties over time:

```tsx
import { useNode, useMount } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'
import { tween, easeOutQuad } from 'fraxel'

function FadeIn() {
  const sprite = useNode(PrimaryNode.Sprite)

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

| Property     | Type            | Description                            |
| ------------ | --------------- | -------------------------------------- |
| `target`     | `T`             | Object whose property will be animated |
| `prop`       | `keyof T`       | Property name to interpolate           |
| `from`       | `number`        | Start value                            |
| `to`         | `number`        | End value                              |
| `duration`   | `number`        | Duration in seconds                    |
| `easing`     | `EasingFn`      | Easing function (default: `linear`)    |
| `onUpdate`   | `(value) => {}` | Called every frame with current value  |
| `onComplete` | `() => {}`      | Called when the tween finishes         |

### Controller

```tsx
const t = tween({ ... })
t.pause()      // Pause
t.resume()     // Resume
t.stop()       // Stop and reset
t.isPlaying    // boolean
t.progress     // 0 to 1
```

### tweenValue()

Animates a value without a target object:

```tsx
tweenValue({
  from: 0,
  to: 100,
  duration: 1,
  onUpdate: (value) => console.log(value),
})
```

## Easing Functions

```tsx
import { linear, easeOutQuad, easeOutBounce, easeOutElastic } from 'fraxel'
```

| Function         | Description                   |
| ---------------- | ----------------------------- |
| `linear`         | No easing — constant speed    |
| `easeInQuad`     | Slow start, accelerates       |
| `easeOutQuad`    | Fast start, decelerates       |
| `easeInOutQuad`  | Slow start and end            |
| `easeInCubic`    | Cubic acceleration            |
| `easeOutCubic`   | Cubic deceleration            |
| `easeInOutCubic` | Cubic slow start and end      |
| `easeBackOut`    | Overshoots then settles back  |
| `easeBackInOut`  | Overshoots in both directions |
| `easeOutBounce`  | Bounces at the end            |
| `easeInBounce`   | Bounces at the start          |
| `easeOutElastic` | Spring-like elastic overshoot |

See [Tweening](tweening.md) for full documentation.

## Sequences

Run tweens in sequence or parallel:

```tsx
import { tween, sequence, parallel } from 'fraxel'

// One after another
sequence([
  tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
  tween({ target: sprite, prop: 'position', from: 0, to: 100, duration: 1 }),
])

// At the same time
parallel([
  tween({ target: sprite, prop: 'opacity', from: 0, to: 1, duration: 0.5 }),
  tween({ target: sprite, prop: 'scale', from: 0.5, to: 1, duration: 0.5 }),
])
```
