import { TextAlign, shapes, useAction, useEffect, useScene, useSize } from 'fraxel'
import { Restart } from '../actions'

export default function Win() {
  const size = useSize()
  const scene = useScene()
  const restart = useAction(Restart)

  useEffect(() => {
    if (restart.justPressed()) {
      scene.change('game')
    }
  })

  return (
    <transform>
      <geometry
        position={[0, 0]}
        shape={shapes.rectangle(size.x, size.y)}
        fillColor={[0.08, 0.12, 0.16, 1]}
      />
      <text
        position={[size.x / 2, 180]}
        text="Congratulations!"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#f8fafc',
          fontSize: 44,
        }}
      />
      <text
        position={[size.x / 2, 240]}
        text="Press R to restart"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#a7b7c8',
          fontSize: 22,
        }}
      />
    </transform>
  )
}
