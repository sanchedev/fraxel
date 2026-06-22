import { Vector2 } from 'tiny-engine'
import { RowCtx, RowSpawnersCtx } from '../../contexts/row.js'
import { useRefNode, useSpawn } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine/nodes/enum.js'
import { Peashooter } from '../plants/peashooter.js'

interface RowProps {
  rowIndex: number
}

export function Row({ rowIndex }: RowProps) {
  const plants = useRefNode(PrimaryNode.Transform)
  const spawnPlant = useSpawn(plants)
  const projectiles = useRefNode(PrimaryNode.Transform)
  const spawnProjectile = useSpawn(projectiles)
  const zombies = useRefNode(PrimaryNode.Transform)
  const spawnZombie = useSpawn(zombies)

  return (
    <RowCtx.Provider
      value={{
        projectilesLayer: `projectile-${rowIndex}`,
        plantsLayer: `plant-${rowIndex}`,
        zombiesLayer: `zombie-${rowIndex}`,
      }}>
      <RowSpawnersCtx.Provider
        value={{
          spawnPlant,
          spawnProjectile,
          spawnZombie,
        }}>
        <transform>
          <transform ref={plants} id='plants'>
            <Peashooter
              position={new Vector2(0, 0)}
              cell={new Vector2(0, rowIndex)}
            />
          </transform>
          <transform ref={projectiles} id='projectiles'></transform>
          <transform ref={zombies} id='zombies'></transform>
        </transform>
      </RowSpawnersCtx.Provider>
    </RowCtx.Provider>
  )
}
