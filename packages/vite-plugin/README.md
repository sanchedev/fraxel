# @fraxel/vite-plugin

> Official Vite plugin for [Fraxel](https://github.com/sanchedev/fraxel) — JSX config, asset pipeline, and diagnostics out of the box.

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.1-blue)](https://www.npmjs.com/package/@fraxel/vite-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

- **JSX Configuration** — Automatically configures Vite's OXC transform to use Fraxel's custom JSX runtime.
- **Asset Pipeline** — Import textures and sounds with `?texture` / `?sound` query params — the plugin wraps them in `loadTexture()` / `loadSound()` calls and returns ready-to-use `symbol` IDs. Plain imports pass through to Vite's default handling.
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

### Default imports (URL)

By default, image and sound imports behave like standard Vite — they return a URL string:

```tsx
import playerUrl from './assets/player.png'
// playerUrl is a string: "/assets/player.png"
```

### Fraxel imports (texture / sound)

Add `?texture` or `?sound` to get a loaded `symbol` ID ready for use in nodes:

```tsx
import PLAYER from './assets/player.png?texture'
import SHOOT from './assets/shoot.ogg?sound'

// PLAYER and SHOOT are `symbol` IDs — pass them straight to nodes
<sprite textureId={PLAYER} />
<audio soundId={SHOOT} />
```

### Supported formats

| Query      | Extensions                               |
| ---------- | ---------------------------------------- |
| `?texture` | `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` |
| `?sound`   | `.ogg`, `.mp3`, `.wav`, `.opus`, `.m4a`  |

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
- **fraxel** `^0.1.0-alpha.6c`

## License

MIT
