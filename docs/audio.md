# Audio

The audio module provides sound loading, playback, and the `<audio-player>` node for integrating audio into your game.

```ts
import { loadSound, getAudioContext } from 'fraxel'
```

## Loading Sounds

### loadSound

Loads an audio file and returns a symbol ID for referencing it.

```ts
const SHOOT = await loadSound('/assets/shoot.ogg')
const HIT = await loadSound('/assets/hit.ogg')
```

### getAudioContext

Returns the shared `AudioContext` instance (creates lazily). The context starts in `suspended` state and must be resumed after a user gesture.

```ts
const audioCtx = getAudioContext()
if (audioCtx.state === 'suspended') {
  await audioCtx.resume()
}
```

## AudioPlayer Node

The `<audio-player>` node plays audio buffers with full control over playback.

```tsx
import { useAudio, useTrigger, useClickable } from 'fraxel/hooks'

function SoundEffect() {
  const audio = useAudio()
  const clickable = useClickable()

  useTrigger(clickable.clicked, () => {
    audio.play()
  })

  useTrigger(audio.ended, () => {
    console.log('Sound finished')
  })

  return (
    <audio-player ref={audio} soundId={SHOOT}>
      <clickable ref={clickable} size={[64, 32]} />
    </audio-player>
  )
}
```

### Props

| Prop              | Type      | Default | Description                              |
| ----------------- | --------- | ------- | ---------------------------------------- |
| `soundId`         | `symbol`  | —       | The sound ID returned by `loadSound`.    |
| `loop`            | `boolean` | `false` | Whether the sound loops.                 |
| `volume`          | `number`  | `1`     | Playback volume (0–1).                   |
| `playbackRate`    | `number`  | `1`     | Playback speed multiplier.               |
| `persistUntilEnd` | `boolean` | `false` | Keep the node alive until playback ends. |

### Methods

| Method          | Description                                  |
| --------------- | -------------------------------------------- |
| `play(offset?)` | Starts playback. Optional offset in seconds. |
| `pause()`       | Pauses playback.                             |
| `stop()`        | Stops playback and resets to start.          |

### Getters

| Getter      | Returns   | Description                         |
| ----------- | --------- | ----------------------------------- |
| `isPlaying` | `boolean` | Whether audio is currently playing. |

### Setters

| Property       | Type     | Description              |
| -------------- | -------- | ------------------------ |
| `volume`       | `number` | Get/set playback volume. |
| `playbackRate` | `number` | Get/set playback speed.  |

### Events

| Event   | Callback                 | Description                          |
| ------- | ------------------------ | ------------------------------------ |
| `ended` | `() => void`             | Fires when playback reaches the end. |
| `error` | `(error: Error) => void` | Fires when an audio error occurs.    |

## Complete Example

```tsx
import { loadSound } from 'fraxel'
import { useAudio, useTrigger, useClickable, useEffect } from 'fraxel/hooks'

const SHOOT = await loadSound('/assets/shoot.ogg')

function Player() {
  const audio = useAudio()
  const clickable = useClickable()

  useTrigger(audio.ended, () => {
    console.log('Sound finished')
  })

  return (
    <audio-player ref={audio} soundId={SHOOT}>
      <clickable ref={clickable} size={[32, 32]} />
    </audio-player>
  )
}
```

## Browser Audio Context

Browsers require a user gesture before playing audio. The `AudioContext` starts in `suspended` state and must be resumed on user interaction:

```tsx
import { getAudioContext } from 'fraxel'
import { useClickable, useTrigger } from 'fraxel/hooks'

function ResumeAudio() {
  const clickable = useClickable()

  useTrigger(clickable.clicked, async () => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  })

  return (
    <sprite textureId={BTN}>
      <clickable ref={clickable} size={[64, 32]} />
    </sprite>
  )
}
```

## See Also

- [Assets](./assets.md) — Loading and managing assets
- [Nodes](./nodes.md) — AudioPlayer node reference
