# Camera

The `<camera>` node controls the viewport — what part of the game world is visible on screen.

## Basic Usage

Place the camera at the root of your scene:

```tsx
import { useNode } from 'diny/hooks'
import { PrimaryNode } from 'diny'

function GameScene() {
  const camera = useNode(PrimaryNode.Camera)

  return (
    <camera ref={camera}>
      <sprite textureId={BACKGROUND} />
      <sprite textureId={PLAYER} position={[80, 50]} />
    </camera>
  )
}
```

## Props

| Prop       | Type         | Default  | Description                     |
| ---------- | ------------ | -------- | ------------------------------- |
| `position` | `VectorLike` | `[0, 0]` | Camera position in world space  |
| `zoom`     | `number`     | `1`      | Zoom level (2 = twice as large) |

## Following a Target

Make the camera track a node's position:

```tsx
function GameScene() {
  const camera = useNode(PrimaryNode.Camera)
  const player = useNode(PrimaryNode.Sprite)

  useMount(() => {
    camera.follow(player)
  })

  return (
    <camera ref={camera} zoom={2}>
      <sprite ref={player} textureId={PLAYER} />
      <sprite textureId={BACKGROUND} />
    </camera>
  )
}
```

### Methods

| Method              | Description                                  |
| ------------------- | -------------------------------------------- |
| `follow(target)`    | Camera follows the target's `globalPosition` |
| `follow(undefined)` | Stops following                              |

## How It Works

The camera applies a viewport transform before drawing its children:

1. Translates to the center of the canvas (`width/2, height/2`)
2. Scales by `zoom`
3. Translates by `-position` (or `-target.globalPosition` if following)
4. Draws all children
5. Restores the canvas state

This means children are drawn relative to the camera's position. If the camera is at `[200, 100]`, a child at `[200, 100]` appears at the center of the screen.

## Example: Scrolling World

```tsx
import { useNode, useEvent } from 'diny/hooks'
import { PrimaryNode } from 'diny'

function SideScroller() {
  const camera = useNode(PrimaryNode.Camera)
  const player = useNode(PrimaryNode.Sprite)

  useMount(() => {
    camera.follow(player)
  })

  useEvent(player, 'updated', () => {
    // Clamp camera to world bounds
    const pos = player.node.globalPosition
    if (pos.x < 96) camera.node.position.x = 96
  })

  return (
    <camera ref={camera} zoom={1}>
      <sprite ref={player} textureId={PLAYER} position={[0, 80]} />
      <sprite textureId={LEVEL_BG} />
    </camera>
  )
}
```
