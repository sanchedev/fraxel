import { PrimaryNode } from './enum.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

/**
 * The **`TransformOptions`** interface defines the options for a `Transform` node.
 * Extends `NodeOptions` with no additional properties.
 */
export interface TransformOptions extends NodeOptions<PrimaryNode.Transform> {}

/**
 * The **`Transform`** node is a container for positioning and organizing child nodes.
 * It has no visual representation but provides a coordinate system for its children.
 *
 * @example
 * ```tsx
 * import { useRefNode } from 'tiny-engine/hooks'
 * import { PrimaryNode } from 'tiny-engine/nodes/enum'
 *
 * function Player() {
 *   const body = useRefNode(PrimaryNode.Transform)
 *
 *   return (
 *     <transform ref={body} position={new Vector2(100, 200)}>
 *       <sprite textureId={PLAYER} />
 *     </transform>
 *   )
 * }
 * ```
 */
export class Transform extends Node<PrimaryNode.Transform> {
  constructor(options: TransformOptions) {
    super(PrimaryNode.Transform, options)
  }
}

Nodes.transform = Transform
