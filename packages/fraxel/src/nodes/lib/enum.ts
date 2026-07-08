/**
 * The **`GameMode`** enum controls how a node behaves relative to the game's pause state.
 *
 * - **`INHERIT`** — follows the parent node's effective game mode (defaults to `PLAYING` at root)
 * - **`PLAYING`** — updates when the game is playing, pauses when the game is paused
 * - **`PAUSED`** — pauses when the game is playing, updates when the game is paused
 * - **`ALWAYS`** — updates regardless of the game's pause state
 * - **`NEVER`** — never updates, but always draws
 *
 * All modes draw the node every frame except `NEVER`.
 *
 * @example
 * ```tsx
 * import { GameMode } from 'fraxel'
 *
 * // Pause menu that animates when the game is paused
 * <transform gameMode={GameMode.PAUSED}>
 *   <PauseMenu />
 * </transform>
 *
 * // UI that always updates
 * <transform gameMode={GameMode.ALWAYS}>
 *   <FPSCounter />
 * </transform>
 * ```
 */
export enum GameMode {
  /** Follows the parent's effective game mode. Defaults to `PLAYING` at root. */
  INHERIT = 'inherit',
  /** Updates when the game is playing, pauses when the game is paused. */
  PLAYING = 'playing',
  /** Pauses when the game is playing, updates when the game is paused. */
  PAUSED = 'paused',
  /** Updates regardless of the game's pause state. */
  ALWAYS = 'always',
  /** Never updates, but always draws. */
  NEVER = 'never',
}

/**
 * The **`PrimaryNode`** enum defines all built-in node types available in the engine.
 * Use these values for scripts or external packages that add new node types.
 *
 * @example
 * ```tsx
 * import { PrimaryNode } from 'fraxel'
 *
 * // Used internally by native hooks like useSprite(), useCollider(), etc.
 * // Also used for custom scripts that need to reference node types.
 * ```
 */
export enum PrimaryNode {
  /** A container node organizing child nodes without position management. */
  Group = 'group',
  /** A container node for positioning and organizing child nodes. */
  Transform = 'transform',
  /** A node that displays a texture or sprite. */
  Sprite = 'sprite',
  /** A node that plays frame-based animations. */
  AnimationPlayer = 'animation-player',
  /** A node that detects collisions with other colliders. */
  Collider = 'collider',
  /** A node that projects a ray to detect colliders along a direction. */
  RayCast = 'ray-cast',
  /** A node that detects click events. */
  Clickable = 'clickable',
  /** A node for use time functions. */
  Timer = 'timer',
  /** A node that renders a shape (rectangle, circle, or capsule). */
  Geometry = 'geometry',
  /** A node that renders text on the canvas. */
  Text = 'text',
  /** A node that plays audio buffers. */
  AudioPlayer = 'audio-player',
  /** A node that controls the viewport. */
  Camera = 'camera',
  /** A node that adds physics simulation to a collider. */
  RigidBody = 'rigid-body',
}
