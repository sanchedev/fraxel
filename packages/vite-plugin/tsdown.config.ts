import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'commonjs',
  clean: true,
  dts: true,
  sourcemap: false,
  minify: true,
})
