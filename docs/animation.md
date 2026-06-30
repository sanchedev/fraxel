# Animation

## Sprite Sheets

Generate keyframes from a sprite sheet:

```tsx
import { kfFromSpriteSheet, kfFromProp, multiKF } from 'tiny-engine'

const walkFrames = kfFromSpriteSheet(
  spriteNode,
  walkTexture,
  4, // columns
  1, // rows
)

// Set a property for a frame
const frame1 = kfFromProp(spriteNode, 'textureId', frame1Texture)

// Combine multiple keyframes
const combined = multiKF([frame1, frame2, frame3])
```

## AnimationPlayer

```tsx
<animation-player
  ref={anim}
  animations={{
    idle: idleFrames,
    walk: walkFrames,
  }}
  currentAnim="idle"
/>
```
