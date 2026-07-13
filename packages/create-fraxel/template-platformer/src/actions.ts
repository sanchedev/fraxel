import { Input } from 'fraxel'

// Main Menu
export const Start = Input.createAction({ key: 'Enter' })
export const Restart = Input.createAction({ key: 'R' })

// Player Movement
export const Left = Input.createAction({ key: 'A' })
export const Right = Input.createAction({ key: 'D' })
export const Jump = Input.createAction({ key: ' ' })
