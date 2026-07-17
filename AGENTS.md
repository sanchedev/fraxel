# AGENTS.md

Compact operational notes for OpenCode sessions in the Fraxel monorepo.

## Repo Shape

- pnpm workspace, package manager pinned to `pnpm@10.29.3`; workspace globs are `packages/*` and `playground/*`.
- Root `package.json` only has `lint`, `lint:fix`, `format`, `format:check`, and `prepare`; package builds must use `pnpm --filter ...`.
- Packages: `packages/fraxel` (`fraxel`, engine/runtime, Node `>=18`), `packages/create-fraxel` (`create-fraxel`, scaffolder CLI, Node `>=20.0.0`), and `packages/vite-plugin` (`@fraxel/vite-plugin`, Node `>=18`, peer `vite@^8.0.0`).
- Do not edit `dist/` unless explicitly asked for build artifacts; tsdown cleans and regenerates package outputs.

## Commands

- Run repo-wide checks from the workspace root: `pnpm lint`, `pnpm format:check`; use `pnpm format` or `pnpm lint:fix` only when intentionally rewriting files.
- Build packages with exact filters: `pnpm --filter fraxel build`, `pnpm --filter create-fraxel build`, `pnpm --filter @fraxel/vite-plugin build`.
- Watch builds use the same filters with `dev`, for example `pnpm --filter fraxel dev`.
- Pre-commit runs `pnpm lint-staged`; lint-staged applies `eslint --fix` and Prettier to `packages/**/*.{ts,tsx}` and Prettier to root config/docs files.
- `.github/workflows/ci.yml` currently references stale root scripts `pnpm engine:build` and `pnpm demo:build`; do not treat those as valid local commands unless the manifest is updated.

## TypeScript And Style

- Workspace is ESM (`"type": "module"`) with strict TS, `verbatimModuleSyntax`, `isolatedModules`, and `noUncheckedIndexedAccess`.
- `packages/create-fraxel` uses its own NodeNext TS config and `exactOptionalPropertyTypes: true`; the other packages extend the root bundler TS config.
- ESLint only targets `packages/**/*.ts(x)` for repo-specific rules. Unused vars/args are errors unless prefixed with `_`; `prefer-const` is a warning; `any`, empty object types, and namespaces are allowed.
- Prettier settings are semicolon-free, single quotes, trailing commas, print width 100, two spaces.

## Public Entrypoints

- Browser-facing imports should use only `fraxel`, `fraxel/jsx-runtime`, `fraxel/jsx-dev-runtime`, `@fraxel/vite-plugin`, and `@fraxel/vite-plugin/client` types.
- Avoid documenting or adding examples with deep imports such as `fraxel/assets`, `fraxel/hooks`, `fraxel/reactivity`, or `fraxel/nodes/...`; `packages/fraxel/src/index.ts` is the public barrel.
- `@fraxel/vite-plugin` builds CommonJS and exports a named `fraxel()` function from source, while package README/examples may show default-import style; verify export shape before changing docs.

## Runtime Architecture Gotchas

- Fraxel has its own JSX runtime, not React or a DOM/Virtual DOM layer.
- `createGame(jsx, root)` requires a `<GameRoot>` with `<SceneRoot>` children and returns only `{ play, pause, destroy }`.
- Public input examples should use `Input.createAction({ key: 'a' })`, `useAction()`, and `useActionAxis()`; `createAction()` returns an `ActionString`, not a `symbol`, and there is no `InputKey` helper.
- Area-based pointer interactions should use the shared `PointerTargetSystem`; public event names should use `Pointer` (`onPointerPress`, `onPointerEnter`, etc.), not `Mouse`, because they support mouse, touch, and pen. Public clickable examples use `shape={shapes.rectangle(...)}`, not `size`.
- Use `<draggable>`/`useDraggable()` for pointer-driven drag interactions; drag examples should use `shape={shapes.rectangle(...)}`, optional `axis`/`bounds`/`snap`, and `onDragStart`/`onDrag`/`onDragEnd`, not mouse-only terminology.
- Use `<droparea>`/`useDropArea()` for drag-and-drop targets; match with `Draggable.dropKey`, pass payloads through `dropData`, and remember overlapping drop areas resolve to the topmost area in draw order.
- Native hooks return reference instances, not `{ ref }` objects: `const sprite = useSprite(); return <sprite ref={sprite} />`.
- Node hooks should expose setters for public writable node properties mirrored as `SignalGetter`s; do not add setters for derived/read-only state such as collision detection results or pointer hover state.
- Every node supports reactive `active` and `visible` props. `active={false}` removes the node subtree from update, draw, collision, physics, pointer, and drop systems; `visible={false}` only skips drawing.
- `TileMap` is render-only: do not add or document `layer`, `mask`, `chunkSize`, or collision options on `<tilemap>`.
- Tilemap collisions should be authored manually with `<body>`/`<detector>` and direct child `<collider>` nodes; do not use `List` inside a body when colliders must remain direct rigid-body children.
- Tilesets use `tileset(textureId, tileSize, tiles)` with declarative `tile(source, options)` entries; do not document `collisionShape` on `tile()`.
- `TileMap` supports the same visual filters as `Sprite` (`displaySize`, `tint`, `opacity`, `brightness`, `grayscale`, `contrast`, `saturate`, `hueRotate`, `invert`), but `flipX`/`flipY` are sprite-only.
- Text styling uses direct reactive props (`fillColor`, `fontSize`, `fontFamily`, `fontWeight`, `textAlign`), not a `style` object; `TextStyle` uses `fillColor`, not `foregroundColor`.
- Signals are getters: call `getter()` to track dependencies and `getter.value()` to read without tracking; effects infer dependencies, not React-style dependency arrays.
- `Game.setup()`, `SceneManager`, direct node construction, and `GameConfig` are low-level APIs; docs/templates for users should generally prefer `createGame`, JSX components, hooks, signals, `List`, and `useScene()`.

## JSX And Asset Names To Avoid Getting Wrong

- Current built-in JSX tags come from `PrimaryNode`: `group`, `transform`, `sprite`, `tilemap`, `animator`, `collider`, `raycast`, `clickable`, `draggable`, `droparea`, `timer`, `geometry`, `text`, `audio`, `camera`, `body`, `view`.
- Stale docs/JSDoc still mention `<animation-player>`, `<audio-player>`, `<rigid-body>`, and `<ray-cast>`; do not copy those into new examples unless documenting migration/old code.
- Vite asset imports with `?texture` or `?sound` are transformed to Fraxel `symbol` IDs via top-level `await loadTexture/loadSound`; normal asset imports remain Vite URL imports.
- For Vite projects, include `@fraxel/vite-plugin/client` types when using `?texture` or `?sound` declarations.

## create-fraxel

- Templates are exactly `empty`, `platformer`, `top-down`, and `coin-box`; generated apps use Vite, `#app`, `vite.config.js`, `tsc && vite build`, `fraxel@^0.1.0-alpha.7`, and `@fraxel/vite-plugin@^0.1.0-alpha.3`.
- CLI flags are `--template/-t`, `--install`, `--overwrite`, and `--help`; `--install` can also prompt to run the dev server.

## Docs Guidance

- Prefer executable sources over README prose; the root README and some source JSDoc contain stale package commands and old JSX tag names.
- Treat public JSDoc as user-facing docs: keep it in sync when changing exported APIs, options, JSX props, hooks, or examples.
- JSDoc examples for public engine APIs should import from `fraxel`; Vite-plugin docs should import from `@fraxel/vite-plugin`.
- Public JSDoc examples should be conceptually executable and avoid internal constructors, deep imports, stale JSX tag names, and removed options.
