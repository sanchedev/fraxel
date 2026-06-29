import { RowCtx, RowSpawnersCtx } from '../../contexts/row.js'
import { useContext, useRefNode, useSpawn } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine/nodes/enum.js'
import { Peashooter } from '../plants/peashooter.js'
import { NormalZombie } from '../zombies/normal-zombie.js'
import { BoardCtx } from '../../contexts/board.js'

interface RowProps {
  rowIndex: number
}

export function Row({ rowIndex }: RowProps) {
  return (
    <RowCtx.Provider
      value={{
        projectilesLayer: `projectile-${rowIndex}`,
        plantsLayer: `plant-${rowIndex}`,
        zombiesLayer: `zombie-${rowIndex}`,
        rowIndex,
      }}>
      <RowContainers />
    </RowCtx.Provider>
  )
}

function RowContainers() {
  const { cellSize } = useContext(BoardCtx)

  const plants = useRefNode(PrimaryNode.Transform)
  const spawnPlant = useSpawn(plants)
  const projectiles = useRefNode(PrimaryNode.Transform)
  const spawnProjectile = useSpawn(projectiles)
  const zombies = useRefNode(PrimaryNode.Transform)
  const spawnZombie = useSpawn(zombies)

  return (
    <RowSpawnersCtx.Provider
      value={{
        spawnPlant,
        spawnProjectile,
        spawnZombie,
      }}>
      <transform>
        <transform ref={plants} id='plants'>
          <Peashooter position={[0, 0]} />
        </transform>
        <transform ref={projectiles} id='projectiles'></transform>
        <transform ref={zombies} id='zombies'>
          <NormalZombie position={[3 * cellSize.x, 0]} />
        </transform>
      </transform>
    </RowSpawnersCtx.Provider>
  )
}
