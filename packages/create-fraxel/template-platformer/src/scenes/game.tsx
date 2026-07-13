import { TextAlign, shapes, useSize } from 'fraxel'
import { Player } from '../components/player'
import { Platform } from '../components/platform'
import { WinArea } from '../components/win-area'

export default function Game() {
  const size = useSize()

  return (
    <transform>
      {/* Background */}
      <view>
        <geometry
          position={[0, 0]}
          shape={shapes.rectangle(size.x, size.y)}
          fillColor={[0.09, 0.13, 0.2, 1]}
        />
      </view>
      {/* Bounds Limit */}
      <body isStatic friction={0}>
        <collider
          position={[-100, -100]}
          shape={shapes.rectangle(100, size.y + 200)}
          group="platform"
          collidesWith="player"
        />
        <collider
          position={[size.x, -100]}
          shape={shapes.rectangle(100, size.y + 200)}
          group="platform"
          collidesWith="player"
        />
        <collider
          position={[-100, -100]}
          shape={shapes.rectangle(size.x + 200, 100)}
          group="platform"
          collidesWith="player"
        />
        <collider
          position={[-100, size.y]}
          shape={shapes.rectangle(size.x + 200, 100)}
          group="platform"
          collidesWith="player"
        />
      </body>
      <Platform position={[0, size.y - 64]} size={[size.x, 64]} fillColor={[0.22, 0.32, 0.28, 1]} />
      <Platform position={[110, 310]} size={[160, 18]} />
      <Platform position={[350, 245]} size={[160, 18]} />
      <Platform position={[610, 185]} size={[110, 18]} />
      <Player position={[80, size.y - 200]} />
      <WinArea position={[708, 137]} size={[26, 48]} />
      <text
        position={[size.x / 2, 52]}
        text="Game Scene"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#f8fafc',
          fontSize: 28,
        }}
      />
      <text
        position={[size.x / 2, 86]}
        text="A/D move - Space jump"
        style={{
          textAlign: TextAlign.Center,
          foregroundColor: '#a7b7c8',
          fontSize: 16,
        }}
      />
    </transform>
  )
}
