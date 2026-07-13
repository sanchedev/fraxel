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
        fillColor={[0.1, 0.16, 0.18, 1]}
      />
      <geometry
        position={[130, 285]}
        shape={shapes.rectangle(190, 24)}
        fillColor={[0.2, 0.3, 0.36, 1]}
      />
      <geometry
        position={[480, 190]}
        shape={shapes.rectangle(24, 150)}
        fillColor={[0.2, 0.3, 0.36, 1]}
      />
      <text
        position={[size.x / 2, 120]}
        text="Top-down"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#f8fafc',
          fontSize: 52,
        }}
      />
      <text
        position={[size.x / 2, 170]}
        text="A simple Fraxel template"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#9fb3c8',
          fontSize: 18,
        }}
      />
      <text
        position={[size.x / 2, 270]}
        text="Press Enter to start"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#dbeafe',
          fontSize: 24,
        }}
      />
    </transform>
  )
}
