import { PrimaryNode } from '../../../nodes/index.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useTransform`** hook creates a reference to a `Transform` node.
 * Use this to access position and lifecycle events of a transform node.
 *
 * @returns A `TransformReference` that will be populated when the node is mounted
 *
 * @example
 * ```tsx
 * import { useTransform, useEffect } from 'fraxel/hooks'
 *
 * function Platform() {
 *   const transform = useTransform()
 *
 *   useEffect(() => {
 *     console.log('Position:', transform.position())
 *   })
 *
 *   return (
 *     <transform ref={transform} position={[100, 200]}>
 *       <sprite textureId={PLATFORM} />
 *     </transform>
 *   )
 * }
 * ```
 */
export function useTransform() {
  pushEffect('useTransform', () => {})
  return new TransformReference()
}

export class TransformReference extends Node2DReference<PrimaryNode.Transform> {
  constructor() {
    super(PrimaryNode.Transform)
  }
}
