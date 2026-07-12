import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'

/**
 * The **`TransformOptions`** interface defines the configuration for a `Transform` node.
 * Extends `Node2DOptions` with no additional properties.
 */
export interface TransformOptions extends Node2DOptions<PrimaryNode.Transform> {}

/**
 * The **`Transform`** node is a container for positioning, rotationing, and organizing child nodes.
 * It has no visual representation but provides a coordinate system for its children.
 * It is recommended to use this node over nodes that draw like a sprite if you want easier rotation.
 *
 * @example
 * ```tsx
 * import { useTransform } from 'fraxel'
 *
 * function Player() {
 *   const body = useTransform()
 *
 *   return (
 *     <transform ref={body} position={[100, 200]}>
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

registerNode(PrimaryNode.Transform, Transform)
