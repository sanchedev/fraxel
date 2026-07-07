# Asset Pipeline

## Loading Textures

```tsx
import { loadTexture } from 'fraxel'

const playerTex = await loadTexture('/assets/sprites/player.png')
const bgTex = await loadTexture('/assets/background.png')
```

`loadTexture()` loads an image and returns a `symbol` ID. Duplicate URLs are deduped automatically.

## Loading Sounds

```tsx
import { loadSound } from 'fraxel'

const shootSound = await loadSound('/assets/sounds/shoot.mp3')
```

See [Audio](audio.md) for playback with `<audio-player>`.

## Batch Loading

`loadBatch` loads multiple assets in parallel with progress tracking:

```tsx
import { loadBatch, loadTexture, loadSound } from 'fraxel'

const [bg, player, shoot] = await loadBatch(
  [
    () => loadTexture('/assets/bg.png'),
    () => loadTexture('/assets/player.png'),
    () => loadSound('/assets/shoot.ogg'),
  ],
  {
    onProgress: (loaded, total) => console.log(`${loaded}/${total}`),
  },
)
```

### loadBatchAsset

`loadBatchAsset` is a typed variant for loading multiple assets of the same type:

```tsx
import { loadBatchAsset } from 'fraxel'

const [bg, player, enemy] = await loadBatchAsset('texture', [
  '/assets/bg.png',
  '/assets/player.png',
  '/assets/enemy.png',
])
```

### API

| Function                               | Description                                |
| -------------------------------------- | ------------------------------------------ |
| `loadTexture(url)`                     | Loads an image, returns a symbol ID        |
| `loadSound(url)`                       | Loads an audio buffer, returns a symbol ID |
| `loadBatch(loaders, options?)`         | Loads multiple assets in parallel          |
| `loadBatchAsset(type, urls, options?)` | Typed variant for same-type assets         |
| `unloadTexture(id)`                    | Frees texture memory                       |
| `unloadSound(id)`                      | Frees sound memory                         |

### Options

| Property     | Type                                      | Description                |
| ------------ | ----------------------------------------- | -------------------------- |
| `onProgress` | `(loaded: number, total: number) => void` | Called as each asset loads |

## Unloading Assets

Free memory when assets are no longer needed:

```tsx
import { unloadTexture, unloadSound } from 'fraxel'

unloadTexture(PLAYER)
unloadSound(SHOOT)
```

## Usage Patterns

### Individual Loading

Load assets as needed, typically at module top level:

```tsx
const PLAYER = await loadTexture('/assets/player.png')
const ENEMY = await loadTexture('/assets/enemy.png')
```

### Batch Loading with Progress

Load all assets before starting the game:

```tsx
import { loadBatch, loadTexture, loadSound } from 'fraxel'

async function preload() {
  await loadBatch(
    [
      () => loadTexture('/assets/bg.png'),
      () => loadTexture('/assets/player.png'),
      () => loadTexture('/assets/enemy.png'),
      () => loadSound('/assets/shoot.ogg'),
    ],
    {
      onProgress: (loaded, total) => {
        const bar = document.querySelector('#loading-bar')
        if (bar) bar.style.width = `${(loaded / total) * 100}%`
      },
    },
  )
}

await preload()
// Now start the game
```

### Per-Scene Loading

Load scene-specific assets when the scene loads:

```tsx
import { loadBatchAsset } from 'fraxel'

async function level1() {
  const [bg, enemies] = await loadBatchAsset('texture', [
    '/assets/level1-bg.png',
    '/assets/enemies.png',
  ])

  return (
    <transform>
      <sprite textureId={bg} />
      {/* ... */}
    </transform>
  )
}
```
