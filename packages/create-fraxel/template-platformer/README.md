# Fraxel — Platformer Template

A simple platformer template for Fraxel. It includes a start screen, a playable game scene, reusable platform/player components, and a win screen.

## Getting Started

```bash
npm install # or pnpm install or yarn install
npm run dev # or pnpm dev or yarn dev
```

## Controls

- `Enter` — start the game
- `A` / `D` — move
- `Space` — jump
- `R` — restart from the win screen

## Project Structure

```
src/
├── actions.ts         # Shared input actions
├── components/
│   ├── platform.tsx   # Static platform component
│   ├── player.tsx     # Player movement and jump logic
│   └── win-area.tsx   # Goal area that changes to the win scene
├── main.tsx          # Entry point — creates the game instance
├── scenes/
│   ├── main.tsx      # Start screen
│   ├── game.tsx      # Platformer level
│   └── win.tsx       # Congratulations screen
└── style.css         # Base styles
```

## Scenes

- `main` — title screen. Press `Enter` to load the game.
- `game` — platformer scene with the player, platforms, and win area.
- `win` — final screen. Press `R` to restart the game scene.

## Resources

- [Fraxel Documentation](https://fraxel.mintlify.app/)
- [GitHub](https://github.com/sanchedev/fraxel)
