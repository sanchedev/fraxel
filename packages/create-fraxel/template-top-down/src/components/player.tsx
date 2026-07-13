import { shapes, useActionAxis, useRigidBody, useUpdate, type VectorLike } from 'fraxel'
import { Down, Left, Right, Up } from '../actions'

interface PlayerProps {
  position: VectorLike
}

const PLAYER_SPEED = 170

export function Player({ position }: PlayerProps) {
  const player = useRigidBody()
  const horizontal = useActionAxis(Left, Right)
  const vertical = useActionAxis(Up, Down)

  useUpdate(() => {
    const x = horizontal()
    const y = vertical()
    const length = Math.hypot(x, y) || 1

    player.setVelocity([(x / length) * PLAYER_SPEED, (y / length) * PLAYER_SPEED])
  })

  return (
    <body ref={player} position={position} useGravity={false} friction={0}>
      <geometry
        shape={shapes.circle(16)}
        fillColor={[0.42, 0.74, 0.95, 1]}
        strokeColor={[0.82, 0.94, 1, 1]}
        strokeWidth={2}
      />
      <collider shape={shapes.circle(16)} group="player" collidesWith={['wall', 'winArea']} />
    </body>
  )
}
