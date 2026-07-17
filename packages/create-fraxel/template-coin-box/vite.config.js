import { defineConfig } from 'vite'
import { fraxel } from '@fraxel/vite-plugin'

export default defineConfig({
  plugins: [fraxel()],
})
