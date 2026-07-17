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
      <geometry
        position={[0, 0]}
        shape={shapes.rectangle(size.x, size.y)}
        fillColor={[0.08, 0.1, 0.18, 1]}
      />
      <geometry
        position={[0, size.y - 84]}
        shape={shapes.rectangle(size.x, 84)}
        fillColor={[0.12, 0.18, 0.24, 1]}
      />
      <geometry
        position={[120, size.y - 150]}
        shape={shapes.rectangle(140, 18)}
        fillColor={[0.23, 0.38, 0.48, 1]}
      />
      <geometry
        position={[500, size.y - 210]}
        shape={shapes.rectangle(170, 18)}
        fillColor={[0.23, 0.38, 0.48, 1]}
      />
      <text
        position={[size.x / 2, 120]}
        text="Platformer"
        textAlign={TextAlign.Center}
        fillColor="#f8fafc"
        fontSize={52}
      />
      <text
        position={[size.x / 2, 170]}
        text="A simple Fraxel template"
        textAlign={TextAlign.Center}
        fillColor="#9fb3c8"
        fontSize={18}
      />
      <text
        position={[size.x / 2, 270]}
        text="Press Enter to start"
        textAlign={TextAlign.Center}
        fillColor="#dbeafe"
        fontSize={24}
      />
    </transform>
  )
}
