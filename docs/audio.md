# Audio System

## Loading Sounds

```tsx
import { loadSound } from 'fraxel/assets'

const shootSound = await loadSound('/assets/sounds/shoot.mp3')
const bgMusic = await loadSound('/assets/sounds/music.mp3')
```

`loadSound()` fetches the audio file, decodes it with `AudioContext`, and returns a `symbol` ID. Duplicate URLs are cached automatically.

## AudioPlayer Node

```tsx
import { useNode, useEvent } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'
import { loadSound } from 'fraxel/assets'

const SHOOT = await loadSound('/assets/shoot.mp3')

function Gun() {
  const audio = useNode(PrimaryNode.AudioPlayer)
  const clickable = useNode(PrimaryNode.Clickable)

  useEvent(clickable, 'clicked', () => {
    audio.node.play()
  })

  return (
    <sprite ref={clickable} textureId={GUN_TEX}>
      <audio-player ref={audio} soundId={SHOOT} volume={0.8} />
    </sprite>
  )
}
```

### Props

| Prop           | Type      | Default | Description                            |
| -------------- | --------- | ------- | -------------------------------------- |
| `soundId`      | `symbol`  | —       | Sound ID from `loadSound()` (required) |
| `loop`         | `boolean` | `false` | Loop the sound                         |
| `volume`       | `number`  | `1`     | Playback volume (0 to 1)               |
| `playbackRate` | `number`  | `1`     | Playback speed                         |

### Methods

| Method          | Description                                               |
| --------------- | --------------------------------------------------------- |
| `play(offset?)` | Start or resume playback (optional start time in seconds) |
| `pause()`       | Pause without resetting position                          |
| `stop()`        | Stop and reset position to 0                              |

### Getters/Setters

| Property       | Access  | Description                  |
| -------------- | ------- | ---------------------------- |
| `isPlaying`    | get     | Whether the sound is playing |
| `volume`       | get/set | Current volume (0–1)         |
| `playbackRate` | get/set | Current playback speed       |

### Events

| Event   | Callback      | Description                                            |
| ------- | ------------- | ------------------------------------------------------ |
| `ended` | `() => {}`    | Fires when playback reaches the end (non-looping only) |
| `error` | `(err) => {}` | Fires if playback fails                                |

## AudioContext

The `AudioContext` is created lazily on first use. Browsers require a user gesture before audio can play:

```tsx
import { getAudioContext } from 'fraxel/audio'

// Call this after a click/tap to resume the context
function onFirstClick() {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}
```

## Complete Example

```tsx
import { useNode, useEvent, useMount } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'
import { loadSound } from 'fraxel/assets'
import { getAudioContext } from 'fraxel/audio'

const BG_MUSIC = await loadSound('/assets/music.mp3')
const SHOOT = await loadSound('/assets/shoot.mp3')

function GameAudio() {
  const music = useNode(PrimaryNode.AudioPlayer)
  const sfx = useNode(PrimaryNode.AudioPlayer)

  useMount(() => {
    // Resume audio context after first interaction
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    music.node.play()
  })

  return (
    <transform>
      <audio-player ref={music} soundId={BG_MUSIC} loop volume={0.3} />
      <audio-player ref={sfx} soundId={SHOOT} />
    </transform>
  )
}
```
