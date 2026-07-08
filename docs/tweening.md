# Tweening & Easing

## tween()

Creates a tween that interpolates a numeric property over time:

```tsx
import { tween, easeOutQuad } from 'fraxel'

const controller = tween({
  target: sprite,
  prop: 'opacity',
  from: 0,
  to: 1,
  duration: 0.5,
  easing: easeOutQuad,
  onUpdate: (value) => console.log('opacity:', value),
  onComplete: () => console.log('fade in done'),
})
```

### Options

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

t.pause()      // Pause the tween
t.resume()     // Resume from current position
t.stop()       // Stop and reset to beginning
t.isPlaying    // boolean — is it playing?
t.progress     // number — 0 to 1
```

## tweenValue()

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

All easing functions map `t` (0 to 1) to an eased value:

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
