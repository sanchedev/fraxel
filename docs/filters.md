# Sprite Filters

Sprites support CSS-like visual filters via props:

```tsx
<sprite
  textureId={TEX}
  brightness={1.2} // 0=black, 1=base, 2=white
  grayscale={0.5} // 0=color, 1=grayscale
  modulate={[1, 0.5, 0, 1]} // RGBA tint [r, g, b, a] 0-1
  contrast={1.5} // 0=no contrast, 1=base
  saturate={0.8} // 0=desaturated, 1=base
  hueRotate={90} // degrees
  invert={0.5} // 0=normal, 1=inverted
  opacity={0.8} // 0=transparent, 1=opaque
/>
```

Filters are applied via `ctx.filter` in the canvas rendering pipeline. `modulate` uses `globalCompositeOperation: 'multiply'` with a fill color.

## Color

`Color` is an RGBA color class with channels in `0`–`1` range. All values are clamped on construction.

```ts
import { Color, color } from 'fraxel'

// From components
const red = new Color(1, 0, 0)
const transparent = new Color(1, 1, 1, 0)

// From tuple
const blue = new Color([0, 0, 1])
const green = new Color([0, 1, 0, 0.5])

// From object
const orange = new Color({ r: 1, g: 0.5, b: 0 })

// Factory function (same overloads)
const fromFactory = color(1, 0, 0)
```

### Static Presets

| Preset              | Value          |
| ------------------- | -------------- |
| `Color.WHITE`       | `(1, 1, 1, 1)` |
| `Color.BLACK`       | `(0, 0, 0, 1)` |
| `Color.RED`         | `(1, 0, 0, 1)` |
| `Color.GREEN`       | `(0, 1, 0, 1)` |
| `Color.BLUE`        | `(0, 0, 1, 1)` |
| `Color.TRANSPARENT` | `(1, 1, 1, 0)` |

### Methods

- `clone()` — returns a copy of the color
- `equals(colorLike)` — checks equality with another color
- `toCSS()` — converts to CSS `rgba()` string
- `toJSON()` — serializes to `{ r, g, b, a }` object

### ColorLike

`ColorLike` is a union type accepted wherever a `Color` is expected:

```ts
import type { ColorLike } from 'fraxel'

const a: ColorLike = new Color(1, 0, 0) // Color instance
const b: ColorLike = [1, 0.5, 0] // RGB tuple
const c: ColorLike = [0, 1, 0, 0.5] // RGBA tuple
const d: ColorLike = { r: 0, g: 0, b: 1 } // RGB object
const e: ColorLike = { r: 1, g: 0, b: 0, a: 0.5 } // RGBA object
```

### Reactive Colors

Use `signalColor` to convert a reactive `ColorLike` to a reactive `Color`:

```ts
import { signalColor } from 'fraxel'

const modulate = signalColor(colorProp) // Reactive<Color>
```

Used by `Sprite.modulate` and `Geometry.fillColor`/`strokeColor`.
