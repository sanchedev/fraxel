import { TextAlign, shapes, useAction, useEffect, useScene, useSize } from 'fraxel'
import { Start } from '../actions'

export default function Main() {
  const size = useSize()
  const scene = useScene()
  const start = useAction(Start)

  useEffect(() => {
    if (start.justPressed()) {
      scene.change('game')
    }
  })

  return (
    <transform>
      <geometry position={[0, 0]} shape={shapes.rectangle(size.x, size.y)} fillColor="#141a2e" />
      <geometry
        position={[0, size.y - 84]}
        shape={shapes.rectangle(size.x, 84)}
        fillColor="#1f2e3d"
      />
      <geometry
        position={[120, size.y - 150]}
        shape={shapes.rectangle(140, 18)}
        fillColor="#3b617a"
      />
      <geometry
        position={[500, size.y - 210]}
        shape={shapes.rectangle(170, 18)}
        fillColor="#3b617a"
      />
      <text
        position={[size.x / 2, 120]}
        text="Coin Box"
        textAlign={TextAlign.Center}
        fillColor="#f8fafc"
        fontSize={52}
      />
      <text
        position={[size.x / 2, 170]}
        text="Drag every coin into the box"
        textAlign={TextAlign.Center}
        fillColor="#9fb3c8"
        fontSize={18}
      />
      <text
        position={[size.x / 2, 270]}
        text="Press Enter or click the coin"
        textAlign={TextAlign.Center}
        fillColor="#dbeafe"
        fontSize={24}
      />
      <geometry position={[size.x / 2, 340]} shape={shapes.circle(28)} fillColor="#facc15" />
      <clickable
        position={[size.x / 2, 340]}
        shape={shapes.circle(28)}
        onClick={() => void scene.change('game')}
      />
    </transform>
  )
}
