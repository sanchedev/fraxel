import { loadTexture, type SignalGetter, type VectorLike } from 'tiny-engine'
import { useComputed } from 'tiny-engine/hooks'
import { List } from 'tiny-engine/jsx'

const CHARS = await loadTexture('/assets/sprites/ui/characters.png')

const textSizes = ['0123456789()¡!¿?.,;:', 'abcdefghijklmnopqrstuvwxyz']
const largers = '¿?mnw'

const calcPos = (char: string): [number, number] => {
  const row = textSizes.findIndex((r) => r.includes(char))
  if (row < 0) return [0, 0]
  const textRow = textSizes[row]!
  const index = textRow.indexOf(char)
  const maxW = largers
    .split('')
    .reduce(
      (p, c) => (textRow.slice(0, index).includes(c) ? p + 2 : p),
      index * 3,
    )

  return [maxW, 5 * row]
}

export function Text({
  text,
  position,
}: {
  text: SignalGetter<string>
  position: VectorLike
}) {
  const marks = useComputed(() => {
    const ps: number[] = [0]
    const ws: number[] = []
    const chars = text().split('')
    let acc = 0
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]!
      const w = largers.includes(char) ? 5 : 3
      ps.push(acc + w + 1)
      ws.push(w)
      acc += w + 1
    }
    return { positions: ps, widths: ws }
  })

  return (
    <transform position={position}>
      <List array={() => text().split('')} itemKey={(val, i) => `${val}-${i}`}>
        {(c, i) => {
          return (
            <sprite
              textureId={CHARS}
              position={[marks().positions[i]!, 0]}
              sourceSize={[marks().widths[i]!, 5]}
              margin={calcPos(c)}
            />
          )
        }}
      </List>
    </transform>
  )
}
