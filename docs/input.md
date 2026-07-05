# Input System

Unified pointer and keyboard event system.

## Pointer

| Property                 | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `input.pointerPosition`  | Current pointer position in game coords (read-only `Vector2`) |
| `input.isPointerPressed` | Whether the pointer is currently pressed                      |

**Pointer Events (baseNames):** `pointerPress`, `pointerUnpress`, `pointerMove`

All pointer events emit `position` (game coords `Vector2`).

## Keyboard

| Method                                               | Description                            |
| ---------------------------------------------------- | -------------------------------------- |
| `input.isKeyPressed(key, ctrl?, shift?, alt?)`       | Whether key is currently held          |
| `input.isJustKeyPressed(key, ctrl?, shift?, alt?)`   | Whether key was pressed this frame     |
| `input.isJustKeyUnpressed(key, ctrl?, shift?, alt?)` | Whether key was released this frame    |
| `input.getKeyAxis(positiveKey, negativeKey)`         | Returns -1, 0, or 1 based on key state |

## Options

```ts
const input = new Input(canvas, size, { preventKeyDefaults: true })
```

- `preventKeyDefaults` (default `true`): calls `preventDefault()` on keyboard events to block browser shortcuts.

```ts
input.on('pointerPress', (position) => {
  console.log(position) // Vector2 in game coords
})
input.destroy() // removes all event listeners
```

**Important:** Always call `input.destroy()` when the game/scene is destroyed to prevent memory leaks.
