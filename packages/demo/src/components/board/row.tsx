import {
  RowCtx,
  RowPlantSpawnerCtx,
  RowProjectileSpawnerCtx,
  RowZombieSpawnerCtx,
} from '../../contexts/row.js'
import {
  NodeReference,
  useContext,
  useRefNode,
  useSpawn,
} from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine/nodes/enum.js'
import { NormalZombie } from '../entities/zombies/normal-zombie.js'
import { BoardCtx } from '../../contexts/board.js'
import type { InRowProps } from '../types.js'
import { WallNut } from '../entities/plants/wall-nut.js'

interface RowProps {
  registerSpawners: (
    plants: (
      colIndex: number,
      Comp: (props: InRowProps) => JSX.Element,
    ) => void,
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
      }}>
      <RowZombieSpawner
        registerSpawners={registerSpawners}
        rowIndex={rowIndex}
      />
    </RowCtx.Provider>
  )
}

function RowZombieSpawner(props: RowProps) {
  const zombies = useRefNode(PrimaryNode.Transform)
  const spawnZombie = useSpawn(zombies)

  return (
    <RowZombieSpawnerCtx.Provider value={spawnZombie}>
      <RowProjectileSpawner {...props} z={zombies} />
    </RowZombieSpawnerCtx.Provider>
  )
}
type node = NodeReference<PrimaryNode.Transform>
function RowProjectileSpawner(props: RowProps & { z: node }) {
  const projectiles = useRefNode(PrimaryNode.Transform)
  const spawnProjectile = useSpawn(projectiles)

  return (
    <RowProjectileSpawnerCtx.Provider value={spawnProjectile}>
      <RowPlantSpawner {...props} r={projectiles} />
    </RowProjectileSpawnerCtx.Provider>
  )
}

function RowPlantSpawner(props: RowProps & { z: node; r: node }) {
  const plants = useRefNode(PrimaryNode.Transform)
  const spawnPlant = useSpawn(plants)

  return (
    <RowPlantSpawnerCtx.Provider value={spawnPlant}>
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
}: RowProps & { z: node; r: node; p: node }) {
  const { cellSize } = useContext(BoardCtx)
  const spawnPlant = useContext(RowPlantSpawnerCtx)

  registerSpawners((colIndex, Component) =>
    spawnPlant(<Component position={[colIndex * cellSize.x, 0]} />),
  )

  return (
    <transform position={[0, rowIndex * cellSize.y]}>
      <transform ref={p} id='plants'>
        <WallNut position={[5 * cellSize.x, 0]} />
      </transform>
      <transform ref={r} id='projectiles' />
      <transform ref={z} id='zombies'>
        <NormalZombie position={[7 * cellSize.x, 0]} />
      </transform>
    </transform>
  )
}
