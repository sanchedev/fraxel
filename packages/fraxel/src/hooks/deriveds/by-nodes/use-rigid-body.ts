import { PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { usePartialNode } from '../use-partial-node.js'
import { useComputed } from '../../use-computed.js'
import { vector2, type VectorLike } from '../../../math/vector2.js'

/**
 * The **`useRigidBody`** derived hook provides a declarative API for the `RigidBody` node.
 * Returns the node reference, reactive velocity/grounded state, and force/impulse methods.
 *
 * @param body An optional existing `NodeReference` to the RigidBody node
 * @returns An object with `ref`, `velocity`, `isGrounded`, `applyForce`, `applyImpulse`, `setVelocity`
 *
 * @example
 * ```tsx
 * import { useRigidBody } from 'fraxel/hooks'
 *
 * function Player() {
 *   const { ref, velocity, isGrounded, applyImpulse } = useRigidBody()
 *
 *   const jump = () => {
 *     if (isGrounded()) {
 *       applyImpulse([0, -400])
 *     }
 *   }
 *
 *   return (
 *     <rigid-body ref={ref}>
 *       <sprite textureId={PLAYER} />
 *       <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
 *     </rigid-body>
 *   )
 * }
 * ```
 */
export function useRigidBody(body?: NodeReference<PrimaryNode.RigidBody>) {
  declareDerivedHook('useRigidBody')
  const ref = usePartialNode(PrimaryNode.RigidBody, body)

  const [velX, setVelX] = useSignal(0)
  const [velY, setVelY] = useSignal(0)
  const [grounded, setGrounded] = useSignal(false)

  useEvent(ref, 'updated', () => {
    const node = ref.node
    setVelX(node.velocity.x)
    setVelY(node.velocity.y)
    setGrounded(node.isGrounded)
  })

  const velocity = useComputed(() => vector2(velX(), velY()))

  const applyForce = (force: VectorLike) => {
    ref.node.applyForce(vector2(force))
  }

  const applyImpulse = (impulse: VectorLike) => {
    ref.node.applyImpulse(vector2(impulse))
  }

  const setVelocity = (v: VectorLike) => {
    ref.node.setVelocity(vector2(v))
  }

  return {
    ref,
    velocity,
    isGrounded: grounded,
    applyForce,
    applyImpulse,
    setVelocity,
  }
}
