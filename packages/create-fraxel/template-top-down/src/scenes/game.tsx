import { TextAlign, shapes, useSize } from 'fraxel'
import { Player } from '../components/player'
import { Wall } from '../components/wall'
import { WinArea } from '../components/win-area'

export default function Game() {
  const size = useSize()

  return (
    <transform>
      <view>
        <geometry
          position={[0, 0]}
          shape={shapes.rectangle(size.x, size.y)}
          fillColor={[0.07, 0.1, 0.13, 1]}
        />
        <geometry
          position={[40, 40]}
          shape={shapes.rectangle(size.x - 80, size.y - 80)}
          fillColor={[0.1, 0.16, 0.18, 1]}
          strokeColor={[0.18, 0.3, 0.34, 1]}
          strokeWidth={3}
        />
      </view>

      <Wall position={[0, 0]} size={[size.x, 32]} />
      <Wall position={[0, size.y - 32]} size={[size.x, 32]} />
      <Wall position={[0, 0]} size={[32, size.y]} />
      <Wall position={[size.x - 32, 0]} size={[32, size.y]} />

      <Wall position={[150, 120]} size={[240, 26]} />
      <Wall position={[150, 120]} size={[26, 160]} />
      <Wall position={[430, 85]} size={[26, 190]} />
      <Wall position={[275, 320]} size={[270, 26]} />
      <Wall position={[600, 205]} size={[26, 140]} />

      <WinArea position={[690, 72]} size={[48, 48]} />
      <Player position={[88, size.y - 90]} />
      <text
        position={[size.x / 2, 52]}
        text="Top-down Scene"
        textAlign={TextAlign.Center}
        fillColor="#f8fafc"
        fontSize={28}
      />
      <text
        position={[size.x / 2, 86]}
        text="WASD move - reach the exit"
        textAlign={TextAlign.Center}
        fillColor="#a7b7c8"
        fontSize={16}
      />
    </transform>
  )
}
