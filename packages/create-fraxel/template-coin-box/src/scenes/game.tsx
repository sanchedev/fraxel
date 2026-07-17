import { TextAlign, shapes, useSize } from 'fraxel'
import { Coin } from '../components/coin'
import { CoinBox } from '../components/coin-box'

const coins: { id: string; position: [number, number] }[] = [
  { id: 'coin-1', position: [90, 130] },
  { id: 'coin-2', position: [180, 270] },
  { id: 'coin-3', position: [300, 155] },
  { id: 'coin-4', position: [390, 330] },
  { id: 'coin-5', position: [520, 230] },
]

export default function Game() {
  const size = useSize()

  return (
    <transform>
      <view>
        <geometry position={[0, 0]} shape={shapes.rectangle(size.x, size.y)} fillColor="#172133" />
      </view>
      <geometry
        position={[0, size.y - 84]}
        shape={shapes.rectangle(size.x, 84)}
        fillColor="#1f2f42"
      />
      <geometry position={[64, 328]} shape={shapes.rectangle(520, 18)} fillColor="#29425a" />
      <text
        position={[size.x / 2, 52]}
        text="Collect the Coins"
        textAlign={TextAlign.Center}
        fillColor="#f8fafc"
        fontSize={28}
      />
      <text
        position={[size.x / 2, 86]}
        text="Drag all five coins into the box"
        textAlign={TextAlign.Center}
        fillColor="#a7b7c8"
        fontSize={16}
      />
      {coins.map((coin) => (
        <Coin id={coin.id} position={coin.position} screenSize={size} />
      ))}
      <CoinBox />
    </transform>
  )
}
