# @fraxel/vite-plugin

> Official Vite plugin for [Fraxel](https://github.com/sanchedev/fraxel) — JSX config, asset pipeline, and diagnostics out of the box.

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.1-blue)](https://www.npmjs.com/package/@fraxel/vite-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

- **JSX Configuration** — Automatically configures Vite's OXC transform to use Fraxel's custom JSX runtime.
- **Asset Pipeline** — Import textures (`.png`, `.jpg`, `.webp`) and sounds (`.ogg`, `.mp3`, `.wav`) directly — the plugin wraps them in `loadTexture()` / `loadSound()` calls and returns ready-to-use `symbol` IDs.
- **Virtual Module** — `virtual:fraxel` exposes `version`, `mode`, and `debug` constants at runtime.
- **Diagnostics** — Startup checks catch common misconfigurations: conflicting React plugins, wrong JSX settings, missing tsconfig, missing fraxel installation.

## Install

```bash
# pnpm
pnpm add -D @fraxel/vite-plugin

# npm
npm install -D @fraxel/vite-plugin

# yarn
yarn add -D @fraxel/vite-plugin
```

Requires [fraxel](https://www.npmjs.com/package/fraxel) as a peer dependency.

## Setup

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { fraxel } from '@fraxel/vite-plugin'

export default defineConfig({
  plugins: [fraxel()],
})
```

Make sure your `tsconfig.json` includes the Fraxel JSX settings:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "fraxel"
  }
}
```

That's it — the plugin takes care of the rest.

## Asset Pipeline

Import game assets directly and use them as `symbol` IDs:

```tsx
import PLAYER from './assets/player.png'
import SHOOT from './assets/shoot.ogg'

// PLAYER and SHOOT are `symbol` IDs — pass them straight to nodes
<sprite textureId={PLAYER} />
<audio soundId={SHOOT} />
```

### Auto-detected formats

| Type    | Extensions                              |
| ------- | --------------------------------------- |
| Texture | `.png`, `.jpg`, `.jpeg`, `.webp`        |
| Sound   | `.ogg`, `.mp3`, `.wav`, `.opus`, `.m4a` |

You can also force detection with query params:

```ts
import sound from './background.png?souns'
import texture from './music.ogg?texture'
```

Under the hood, the plugin rewrites these imports to call `loadTexture()` or `loadSound()` from `fraxel` automatically — no manual loading needed.

## Virtual Module

The plugin provides a `virtual:fraxel` module with runtime constants:

```ts
import { version, mode, debug } from 'virtual:fraxel'

console.log(`Fraxel v${version} running in ${mode} mode`)
if (debug) {
  // extra debug logic
}
```

| Export    | Type      | Description                                            |
| --------- | --------- | ------------------------------------------------------ |
| `version` | `string`  | The installed fraxel version (from `package.json`)     |
| `mode`    | `string`  | Vite's current mode (`'development'` / `'production'`) |
| `debug`   | `boolean` | Controlled by the plugin's `debug` option              |

## Options

```ts
fraxel({
  debug: true,
  diagnostics: 'error',
})
```

| Option        | Type                           | Default  | Description                                                             |
| ------------- | ------------------------------ | -------- | ----------------------------------------------------------------------- |
| `debug`       | `boolean`                      | `false`  | Sets the `debug` flag in `virtual:fraxel`.                              |
| `diagnostics` | `boolean \| 'warn' \| 'error'` | `'warn'` | `false` = silent, `'warn'` = log warnings, `'error'` = throw on errors. |

## Client Types

For TypeScript support on Vite asset imports (CSS modules, images, workers, etc.), add the client declarations to your project:

```ts
// ambient.d.ts
/// <reference types="@fraxel/vite-plugin/client" />
```

This provides type definitions for standard Vite import patterns like `*.module.css`, `*.worker.ts`, `?raw`, `?url`, etc.

## Requirements

- **Vite** `^8.0.0`
- **fraxel** `^0.1.0-alpha.5`

## License

MIT
