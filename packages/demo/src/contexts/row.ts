import { createContext } from 'diny/hooks'

export interface RowContext {
  projectilesLayer: string
  plantsLayer: string
  zombiesLayer: string
  rowIndex: number
}

export const RowCtx = createContext<RowContext>({
  projectilesLayer: 'projectile-??',
  plantsLayer: 'plant-??',
  zombiesLayer: 'zombie-??',
  rowIndex: -1,
})

export type RowPlantSpawnerContext = (jsx: JSX.Element) => void

export const RowPlantSpawnerCtx = createContext<RowPlantSpawnerContext>(() => {})

export type RowZombieSpawnerContext = (jsx: JSX.Element) => void

export const RowZombieSpawnerCtx = createContext<RowZombieSpawnerContext>(() => {})

export type RowProjectileSpawnerContext = (jsx: JSX.Element) => void

export const RowProjectileSpawnerCtx = createContext<RowProjectileSpawnerContext>(() => {})
