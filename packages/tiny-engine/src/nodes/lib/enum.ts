/**
 * The **`PrimaryNode`** enum defines all built-in node types available in the engine.
 * Use these values when creating nodes with `useRefNode` or `useChild`.
 *
 * @example
 * ```tsx
 * import { useRefNode } from 'tiny-engine/hooks'
 * import { PrimaryNode } from 'tiny-engine/nodes/enum'
 *
 * const sprite = useRefNode(PrimaryNode.Sprite)
 * return <sprite ref={sprite} textureId={PLAYER} />
 * ```
 */
export enum PrimaryNode {
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
  /** A node that renders a filled/stroked rectangle. */
  Rectangle = 'rectangle',
}
