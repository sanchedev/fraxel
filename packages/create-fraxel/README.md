# create-fraxel

> Scaffold a new **Fraxel** project in seconds.

`create-fraxel` is the official project generator for **Fraxel**. It creates a ready-to-run game project with Vite, TypeScript and a starter template.

## Usage

Create a new project with your preferred package manager.

```bash
npm create fraxel@latest
```

or

```bash
pnpm create fraxel
```

or

```bash
yarn create fraxel
```

or

```bash
bun create fraxel
```

---

## Templates

Choose one of the available starter templates:

| Template       | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| **Empty**      | Minimal Fraxel project with a blank scene.                  |
| **Platformer** | Basic platformer with player movement, jumping and physics. |
| **Top-down**   | Top-down movement with collisions.                          |

---

## Interactive CLI

The CLI will guide you through the setup:

- Choose a project template
- Optionally install dependencies automatically

```text
┌  🎮 create-fraxel
│
◇  Choose a template
│  Empty
│
◇  Install dependencies?
│  No
│
◇  Creating project...
│
└  ✨ Project ready!

cd my-game
npm install
npm run dev
```

---

## Project Structure

The generated project looks like this:

```text
my-game/
├── src/
│   ├── main.tsx
│   ├── scenes/
│   │   └── main.tsx
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Next Steps

Start the development server:

```bash
cd my-game
npm install
npm run dev
```

Then open your browser and start building your game.

---

## Learn More

- 📖 Documentation: [https://fraxel.mintlify.app/](https://fraxel.mintlify.app/)
- 🎮 Fraxel: [https://github.com/sanchedev/fraxel](https://github.com/sanchedev/fraxel)

## License

MIT
