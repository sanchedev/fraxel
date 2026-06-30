# Sprite Filters

Sprites support CSS-like visual filters via props:

```tsx
<sprite
  textureId={TEX}
  brightness={1.2}       // 0=black, 1=base, 2=white
  grayscale={0.5}        // 0=color, 1=grayscale
  modulate={[1, 0.5, 0]} // RGB tint [r, g, b] 0-1
  contrast={1.5}         // 0=no contrast, 1=base
  saturate={0.8}         // 0=desaturated, 1=base
  hueRotate={90}         // degrees
  invert={0.5}           // 0=normal, 1=inverted
  opacity={0.8}          // 0=transparent, 1=opaque
/>
```

Filters are applied via `ctx.filter` in the canvas rendering pipeline. `modulate` uses `globalCompositeOperation: 'multiply'` with a fill color.

## Color Type

`Color` is `[number, number, number]` with channels in `0`–`1` range:

```ts
import type { Color } from 'tiny-engine'

const red: Color = [1, 0, 0]
const orange: Color = [1, 0.5, 0]
```

Used by `Sprite.modulate`.
