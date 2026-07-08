import {
  RowCtx,
  RowPlantSpawnerCtx,
  RowProjectileSpawnerCtx,
  RowZombieSpawnerCtx,
} from '../../contexts/row.js'
import { useContext, useTransform } from 'fraxel/hooks'
import type { TransformReference } from 'fraxel/hooks'
import { NormalZombie } from '../entities/zombies/normal-zombie.js'
import { BoardCtx } from '../../contexts/board.js'
import type { InRowProps } from '../types.js'
import { WallNut } from '../entities/plants/wall-nut.js'
import { Sunflower } from '../entities/plants/sunflower.js'

interface RowProps {
  registerSpawners: (
    plants: (colIndex: number, Comp: (props: InRowProps) => JSX.Element) => void,
  ) => void
  rowIndex: number
}

export function Row({ rowIndex, registerSpawners }: RowProps) {
  return (
    <RowCtx.Provider
      value={{
        projectilesLayer: `projectile-${rowIndex}`,
        plantsLayer: `plant-${rowIndex}`,
        zombiesLayer: `zombie-${rowIndex}`,
        rowIndex,
      }}
    >
      <RowZombieSpawner registerSpawners={registerSpawners} rowIndex={rowIndex} />
    </RowCtx.Provider>
  )
}

function RowZombieSpawner(props: RowProps) {
  const zombies = useTransform()

  return (
    <RowZombieSpawnerCtx.Provider value={(jsx) => zombies.spawn(jsx)}>
      <RowProjectileSpawner {...props} z={zombies} />
    </RowZombieSpawnerCtx.Provider>
  )
}
function RowProjectileSpawner(props: RowProps & { z: TransformReference }) {
  const projectiles = useTransform()

  return (
    <RowProjectileSpawnerCtx.Provider value={(jsx) => projectiles.spawn(jsx)}>
      <RowPlantSpawner {...props} r={projectiles} />
    </RowProjectileSpawnerCtx.Provider>
  )
}

function RowPlantSpawner(props: RowProps & { z: TransformReference; r: TransformReference }) {
  const plants = useTransform()

  return (
    <RowPlantSpawnerCtx.Provider value={(jsx) => plants.spawn(jsx)}>
      <RowContainers {...props} p={plants} />
    </RowPlantSpawnerCtx.Provider>
  )
}

function RowContainers({
  rowIndex,
  registerSpawners,
  z,
  r,
  p,
}: RowProps & { z: TransformReference; r: TransformReference; p: TransformReference }) {
  const { cellSize } = useContext(BoardCtx)
  const spawnPlant = useContext(RowPlantSpawnerCtx)

  registerSpawners((colIndex, Component) =>
    spawnPlant(<Component position={[colIndex * cellSize.x, 0]} />),
  )

  return (
    <transform position={[0, rowIndex * cellSize.y]}>
      <transform ref={p} id="plants">
        <Sunflower position={[2 * cellSize.x, 0]} />
        <WallNut position={[5 * cellSize.x, 0]} />
      </transform>
      <transform ref={r} id="projectiles" />
      <transform ref={z} id="zombies">
        <NormalZombie position={[7 * cellSize.x, 0]} />
      </transform>
    </transform>
  )
}
