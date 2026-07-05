import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { Nodes } from '../lib/registry.js'

/**
 * The **`TransformOptions`** interface defines the options for a `Transform` node.
 * Extends `Node2DOptions` with no additional properties.
 */
export interface TransformOptions extends Node2DOptions<PrimaryNode.Transform> {}

/**
 * The **`Transform`** node is a container for positioning and organizing child nodes.
 * It has no visual representation but provides a coordinate system for its children.
 *
 * @example
 * ```tsx
 * import { useNode } from 'diny/hooks'
 * import { PrimaryNode } from 'diny/nodes/enum'
 *
 * function Player() {
 *   const body = useNode(PrimaryNode.Transform)
 *
 *   return (
 *     <transform ref={body} position={new Vector2(100, 200)}>
 *       <sprite textureId={PLAYER} />
 *     </transform>
 *   )
 * }
 * ```
 */
export class Transform extends Node2D<PrimaryNode.Transform> {
  constructor(options: TransformOptions) {
    super(PrimaryNode.Transform, options)
  }
}

Nodes.transform = Transform
