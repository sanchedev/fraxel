import { Input } from 'fraxel'

// Main Menu
export const Start = Input.createAction({ key: 'Enter' })
export const Restart = Input.createAction({ key: 'r' })

// Player Movement
export const Left = Input.createAction({ key: 'a' })
export const Right = Input.createAction({ key: 'd' })
export const Up = Input.createAction({ key: 'w' })
export const Down = Input.createAction({ key: 's' })
