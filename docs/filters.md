# Filters

The filters module provides CSS-like visual filter props for sprites and the `Color` class for RGBA color manipulation.

## Sprite Filter Props

Filters are applied via `ctx.filter` in the canvas rendering pipeline. All filter props accept reactive values.

```tsx
<sprite
  textureId={PLAYER}
  brightness={1.2}
  grayscale={0.5}
  modulate={[1, 0.5, 0, 1]}
  contrast={1.5}
  saturate={0.8}
  hueRotate={90}
  invert={0.5}
  opacity={0.8}
/>
```

### Filter Props

| Prop         | Type        | Range   | Description                                   |
| ------------ | ----------- | ------- | --------------------------------------------- |
| `brightness` | `number`    | `0`–`2` | `0`=black, `1`=base, `2`=white.               |
| `grayscale`  | `number`    | `0`–`1` | `0`=color, `1`=grayscale.                     |
| `modulate`   | `ColorLike` | `0`–`1` | RGBA tint multiplied with the texture.        |
| `contrast`   | `number`    | `0`–`2` | `0`=no contrast, `1`=base, `2`=high contrast. |
| `saturate`   | `number`    | `0`–`2` | `0`=desaturated, `1`=base, `2`=oversaturated. |
| `hueRotate`  | `number`    | degrees | Rotates the hue by the given degrees.         |
| `invert`     | `number`    | `0`–`1` | `0`=normal, `1`=inverted.                     |
| `opacity`    | `number`    | `0`–`1` | `0`=transparent, `1`=opaque.                  |

### Rendering Mechanism

- `brightness`, `grayscale`, `contrast`, `saturate`, `hueRotate`, `invert` — applied via `ctx.filter` (CSS filter string).
- `modulate` — uses `globalCompositeOperation: 'multiply'` with a fill color.
- `opacity` — uses `globalAlpha`.

## Color

RGBA color with channels in `0`–`1` range. Used by `Sprite.modulate` and `Geometry.fillColor`/`strokeColor`.

```ts
import { Color, color } from 'fraxel'

const red = new Color(1, 0, 0)
const transparent = new Color(1, 1, 1, 0)

// From tuple or object
const blue = new Color([0, 0, 1])
const orange = new Color({ r: 1, g: 0.5, b: 0 })

// Factory function
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

### Constructor

```ts
new Color(r: number, g: number, b: number, a?: number)
new Color(colorLike: ColorLike)
```

### Properties

| Property | Type     | Range   | Description    |
| -------- | -------- | ------- | -------------- |
| `r`      | `number` | `0`–`1` | Red channel.   |
| `g`      | `number` | `0`–`1` | Green channel. |
| `b`      | `number` | `0`–`1` | Blue channel.  |
| `a`      | `number` | `0`–`1` | Alpha channel. |

### Methods

| Method      | Returns   | Description                               |
| ----------- | --------- | ----------------------------------------- |
| `clone()`   | `Color`   | Returns a new Color with the same values. |
| `equals(c)` | `boolean` | Checks equality with another color.       |
| `toCSS()`   | `string`  | Converts to CSS `rgba()` string.          |
| `toJSON()`  | `object`  | Returns `{ r, g, b, a }` object.          |

### ColorLike

All accepted formats:

```ts
type ColorLike =
  | Color
  | [r: number, g: number, b: number]
  | [r: number, g: number, b: number, a: number]
  | { r: number; g: number; b: number }
  | { r: number; g: number; b: number; a: number }
```

### Example

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

## See Also

- [Math](./math.md) — Color class reference
- [Nodes](./nodes.md) — Sprite node filter props
