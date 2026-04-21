# ARCADE CABINET

> Where every frame is a universe. A monorepo of browser games built with React Three Fiber.

[![CI](https://github.com/jbcom/arcade-cabinet/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/arcade-cabinet/actions/workflows/ci.yml)

---

## Stack

| Tool | Purpose |
|---|---|
| [pnpm Workspaces](https://pnpm.io/workspaces) | Monorepo package management |
| [Astro 5](https://astro.build) | Docs site & islands architecture |
| [React 19](https://react.dev) | UI components & game islands |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 3D game rendering |
| [Vite](https://vite.dev) | Build tooling |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Biome](https://biomejs.dev) | Linting & formatting |
| [Vitest](https://vitest.dev) | Unit & browser tests |
| [Playwright](https://playwright.dev) | E2E tests |

## Structure

```text
arcade-cabinet/
├── apps/
│   └── docs/          # Astro landing page (GitHub Pages)
│       └── public/
│           └── hero.png   ← drop your hero image here
├── packages/          # Game packages (future)
├── .github/
│   └── workflows/
│       ├── ci.yml         # Lint · typecheck · build
│       ├── release.yml    # Release Please automation
│       └── cd.yml         # Deploy to GitHub Pages
├── biome.json
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Hero Image

The landing page hero supports a custom image. Place your image at:

```text
apps/docs/public/hero.png
```

It will automatically display in a two-column layout with a rainbow glow effect. If the file is absent, the page gracefully falls back to a centred single-column layout.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start docs dev server
pnpm --filter @arcade-cabinet/docs dev

# Build everything
pnpm build

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## GitHub Actions Setup

Add a `CI_GITHUB_TOKEN` secret to the repository for Release Please to open release PRs. The recommended approach is to use a **fine-grained Personal Access Token** with only `contents: write` and `pull-requests: write` permissions (not a classic PAT with broad `repo`/`workflow` scopes). See the [Release Please credentials docs](https://github.com/googleapis/release-please-action#credentials) for details. This token is referenced as `CI_GITHUB_TOKEN` in `.github/workflows/cd.yml`.

GitHub Pages must be enabled with **Source: GitHub Actions** in repository Settings → Pages.

## License

MIT
