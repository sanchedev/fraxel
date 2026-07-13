import {
  shapes,
  useAction,
  useActionAxis,
  useEffect,
  useRayCast,
  useRigidBody,
  useUpdate,
  type VectorLike,
} from 'fraxel'
import { Jump, Left, Right } from '../actions'

interface PlayerProps {
  position: VectorLike
}

const PLAYER_SPEED = 150
const JUMP_FORCE = -500

export function Player({ position }: PlayerProps) {
  const player = useRigidBody()
  const direction = useActionAxis(Left, Right)
  const jump = useAction(Jump)
  const raycast = useRayCast()

  useEffect(() => {
    if (jump.justPressed() && raycast.detected()) {
      console.log('jump')
      player.applyImpulse([0, JUMP_FORCE])
    }
  })

  useUpdate(() => {
    player.setVelocity([direction() * PLAYER_SPEED, player.velocity().y])
  })

  return (
    <body ref={player} position={position}>
      <geometry
        shape={shapes.rectangle(34, 48)}
        fillColor={[0.82, 0.36, 0.3, 1]}
        strokeColor={[0.98, 0.76, 0.68, 1]}
        strokeWidth={2}
      />
      <collider
        shape={shapes.rectangle(34, 48)}
        group="player"
        collidesWith={['platform', 'winArea']}
      />
      <raycast ref={raycast} position={[17, 40]} direction={[0, 20]} collidesWith="platform" />
    </body>
  )
}
