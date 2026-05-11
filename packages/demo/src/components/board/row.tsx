import { Vector2 } from 'tiny-engine'
import { Peashooter } from '../../nodes/peashooter.js'
import { RowCtx, RowSpawnersCtx } from '../../contexts/row.js'
import { useNode, useSpawn } from 'tiny-engine/hooks'

interface RowProps {
  rowIndex: number
}

export function Row({ rowIndex }: RowProps) {
  const plants = useNode('node')
  const spawnPlant = useSpawn(plants)
  const projectiles = useNode('node')
  const spawnProjectile = useSpawn(projectiles)
  const zombies = useNode('node')
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
        <node>
          <node id='plants' use={plants}>
            <Peashooter
              position={new Vector2(0, 0)}
              cell={new Vector2(0, rowIndex)}
            />
          </node>
          <node id='projectiles' use={projectiles}></node>
          <node id='zombies' use={zombies}></node>
        </node>
      </RowSpawnersCtx.Provider>
    </RowCtx.Provider>
  )
}
