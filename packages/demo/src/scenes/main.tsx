import { Input, shapes, type Shape, type VectorLike } from 'fraxel'
import { useAction, useActionAxis, useEffect, useRigidBody, useUpdate } from 'fraxel/hooks'

const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })
const Jump = Input.createAction({ key: ' ' })

function Player() {
  const body = useRigidBody()
  const direction = useActionAxis(Left, Right)
  const jump = useAction(Jump)

  useEffect(() => {
    if (!jump.pressed() || !body.isGrounded()) return
    body.applyImpulse([0, -400])
  })

  useUpdate(() => {
    body.setVelocity([direction() * 240, body.velocity().y])
  })

  return (
    <rigid-body ref={body} position={[220, 0]} mass={2}>
      <camera current smoothing={5} offset={[-20, -30]} />
      <geometry shape={shapes.capsule(60, 20)} fillColor={[1, 0.1, 0.4, 1]} />
      <collider shape={shapes.capsule(60, 20)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}

function Platform({ position, shape }: { position: VectorLike; shape: Shape }) {
  return (
    <rigid-body isStatic position={position} friction={0}>
      <geometry shape={shape} fillColor={[0.2, 0.3, 1, 1]} />
      <collider shape={shape} group={['ground']} collidesWith={['player']} />
    </rigid-body>
  )
}

export default function Main() {
  return (
    <transform>
      <Platform position={[-60, 460]} shape={shapes.rectangle(600, 20)} />
      <Platform position={[50, 380]} shape={shapes.rectangle(100, 20)} />
      <Platform position={[300, 300]} shape={shapes.rectangle(100, 20)} />
      <Platform position={[80, 220]} shape={shapes.rectangle(100, 20)} />
      <Platform position={[320, 140]} shape={shapes.rectangle(100, 20)} />
      <Player />
    </transform>
  )
}
