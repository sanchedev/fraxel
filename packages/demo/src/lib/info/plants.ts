import { Plant } from '../enums/plants'

export const plantsInfo: Record<Plant, PlantInfo> = {
  [Plant.Peashooter]: {
    name: 'Peashooter',
    price: 4,
    health: 100,
    seedCooldown: 7.5,
  },
  [Plant.WallNut]: {
    name: 'Wall-Nut',
    price: 2,
    health: 4000,
    seedCooldown: 30,
  },
}

interface PlantInfo {
  name: string
  price: number
  health: number
  seedCooldown: number
}
