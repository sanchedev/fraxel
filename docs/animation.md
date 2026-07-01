# Animation

## Sprite Sheets

Generate keyframes from a sprite sheet:

```tsx
import { kfFromSpriteSheet, kfFromProp, multiKF } from 'tiny-engine'

// Full sprite sheet (all frames)
const allFrames = kfFromSpriteSheet(spriteNode, walkTexture, 4, 1)

// Subset of frames using range [from, to] (0-indexed, inclusive)
const walkFrames = kfFromSpriteSheet(spriteNode, walkTexture, 4, 2, [0, 3])
const runFrames = kfFromSpriteSheet(spriteNode, walkTexture, 4, 2, [4, 7])

// Set a property for a frame
const frame1 = kfFromProp(spriteNode, 'textureId', frame1Texture)

// Combine multiple keyframes
const combined = multiKF([frame1, frame2, frame3])
```

### kfFromSpriteSheet Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sprite` | `Sprite` | The sprite instance to animate |
| `textureId` | `symbol \| null` | Texture symbol. If `null`, the sprite texture won't change |
| `spritesCountX` | `number` | Number of columns in the sheet (default `1`) |
| `spritesCounty` | `number` | Number of rows in the sheet (default `1`) |
| `range` | `[number, number]` | Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames |

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
import { useComputed } from 'tiny-engine/hooks'

const animName = useComputed(() => isWalking() ? 'walk' : 'idle')

return (
  <animation-player
    animations={() => ({ idle: idleFrames, walk: walkFrames })}
    currentAnim={animName}
  />
)
```

When `currentAnim` is a `SignalGetter`, the player tracks its dependencies and
switches animations automatically when the signal value changes.
