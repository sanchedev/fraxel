import { Vector2, loadSound, PrimaryNode, type VectorLike } from 'fraxel'
import { Row } from './row.js'
import { BoardCtx } from '../../contexts/board.js'
import { useRef, useSignal, useNode } from 'fraxel/hooks'
import type { InRowProps } from '../types.js'
import { SunCounter } from '../sun/sun-counter.js'
import { SunCountCtx } from '../../contexts/sun-count.js'
import { PlantSeed } from '../seeds/plant.js'
import { Plant } from '../../lib/enums/plants.js'
import { List } from 'fraxel/jsx'
import { Grid } from './grid.js'
import { SeedProvider } from '../../providers/seed.js'

const PLANT_SOUND = await loadSound('/assets/audios/plant.ogg')

interface BoardProps {
  position: VectorLike
  cellsCount: VectorLike
  cellSize: VectorLike
}

export function Board({ position, cellsCount, cellSize }: BoardProps) {
  const plantSpawners = useRef<
    ((colIndex: number, Comp: (props: InRowProps) => JSX.Element) => void)[]
  >([])

  const sunCounter = useSignal(1)
  const plantAudio = useNode(PrimaryNode.AudioPlayer)

  const cell = {
    size: Vector2.vectorize(cellSize),
    count: Vector2.vectorize(cellsCount),
  }

  return (
    <BoardCtx.Provider
      value={{
        cellSize: cell.size,
        cellsCount: cell.count,
        floorTypeOnCells: Array.from({ length: cell.count.y }, () =>
          Array.from({ length: cell.count.x }, () => 'grass'),
        ),
        spawnPlant(rowIndex, colIndex, Comp) {
          plantSpawners.current[rowIndex]?.(colIndex, Comp)
          plantAudio.node.play()
        },
      }}
    >
      <SunCountCtx.Provider value={sunCounter}>
        <SeedProvider>
          <Grid position={position} />
          <audio-player ref={plantAudio} soundId={PLANT_SOUND} />
          <SunCounter position={[12, 4]} />
          <transform position={[12, 16]}>
            <List
              array={[Plant.Peashooter, Plant.WallNut, Plant.Sunflower, Plant.Repeater]}
              itemKey={(p) => p.toString()}
            >
              {(plant, i) => <PlantSeed position={[0, i * 16]} plant={plant as Plant} />}
            </List>
          </transform>
          <transform position={position}>
            <List
              array={Array.from({ length: Vector2.vectorize(cellsCount).y }, (_, i) => i)}
              itemKey={(i) => `row-${i}`}
            >
              {(rowIndex) => (
                <Row
                  registerSpawners={(plants) => {
                    plantSpawners.current.push(plants)
                  }}
                  rowIndex={rowIndex}
                />
              )}
            </List>
          </transform>
        </SeedProvider>
      </SunCountCtx.Provider>
    </BoardCtx.Provider>
  )
}
