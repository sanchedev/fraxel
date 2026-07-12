export const logger = {
  info(message: string) {
    console.log(`\x1b[36m[Fraxel]\x1b[0m ${message}`)
  },

  warn(message: string) {
    console.warn(`\x1b[33m[Fraxel]\x1b[0m ${message}`)
  },

  error(message: string) {
    console.error(`\x1b[31m[Fraxel]\x1b[0m ${message}`)
  },
}
