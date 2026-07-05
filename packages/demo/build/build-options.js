/** @type {import("esbuild").BuildOptions} */
export const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  sourcemap: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  jsxImportSource: 'diny',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
  jsx: 'automatic',
}
