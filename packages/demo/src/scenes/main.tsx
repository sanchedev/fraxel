import { shapes } from 'fraxel'
import { useRigidBody } from 'fraxel/hooks'

function Player() {
  const body = useRigidBody()

  return (
    <rigid-body ref={body.ref} position={[220, 0]} mass={2}>
      <collider shape={shapes.rectangle(40, 40)} group={['player']} collidesWith={['ground']} />
      <rectangle size={[40, 40]} />
    </rigid-body>
  )
}

export default function Main() {
  return (
    <transform>
      <Player />
      <transform position={[40, 400]}>
        <rigid-body isStatic>
          <collider
            shape={shapes.rectangle(400, 20)}
            group={['ground']}
            collidesWith={['player']}
          />
          <rectangle size={[400, 20]} />
        </rigid-body>
      </transform>
    </transform>
  )
}
