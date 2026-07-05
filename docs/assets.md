# Asset Pipeline

## Loading Textures

```tsx
import { loadTexture } from 'tiny-engine/assets'

const playerTex = await loadTexture('/assets/sprites/player.png')
const bgTex = await loadTexture('/assets/background.png')
```

`loadTexture()` loads an image and returns a `symbol` ID. Duplicate URLs are deduped automatically.

## AssetManager

The `AssetManager` provides batch loading with progress tracking:

```tsx
import { AssetManager } from 'tiny-engine/assets'

const manager = new AssetManager()

const [bg, player, enemy] = await manager.loadTextures(
  ['/assets/background.png', '/assets/player.png', '/assets/enemy.png'],
  {
    onProgress: (loaded, total) => {
      console.log(`Loading: ${loaded}/${total}`)
    },
  },
)

console.log('All assets loaded!')
```

### API

| Property/Method                | Description                         |
| ------------------------------ | ----------------------------------- |
| `new AssetManager()`           | Creates a new manager instance      |
| `loadTextures(urls, options?)` | Loads multiple images in parallel   |
| `unload(id)`                   | Removes an asset from memory        |
| `loaded`                       | Number of assets loaded (get)       |
| `total`                        | Total assets in current batch (get) |
| `progress`                     | Progress ratio 0–1 (get)            |

### loadTextures options

| Property     | Type                                      | Description                |
| ------------ | ----------------------------------------- | -------------------------- |
| `onProgress` | `(loaded: number, total: number) => void` | Called as each asset loads |

## Loading Sounds

```tsx
import { loadSound } from 'tiny-engine/audio'

const shootSound = await loadSound('/assets/sounds/shoot.mp3')
```

See [Audio](audio.md) for playback with `<audio-player>`.

## Unloading Assets

Free memory when assets are no longer needed:

```tsx
const manager = new AssetManager()
const [tex] = await manager.loadTextures(['/assets/temp.png'])

// Later...
manager.unload(tex)
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
import { AssetManager } from 'tiny-engine/assets'

async function preload() {
  const manager = new AssetManager()

  await manager.loadTextures(
    ['/assets/bg.png', '/assets/player.png', '/assets/enemy.png', '/assets/ui.png'],
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
async function level1() {
  const manager = new AssetManager()
  const [bg, enemies] = await manager.loadTextures(['/assets/level1-bg.png', '/assets/enemies.png'])

  return (
    <transform>
      <sprite textureId={bg} />
      {/* ... */}
    </transform>
  )
}
```
