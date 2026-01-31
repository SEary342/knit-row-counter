<!-- Copilot / AI agent guidance for knit-row-counter -->

Purpose: Help code-assistants become productive quickly in this repo.

Big picture

- Frontend single-page app written in React + TypeScript, built with Vite.
- State is managed with Redux Toolkit. Main slices: `projects`, `progress`, `ui` (see `src/app/store.ts`).
- App persists selected slices to localStorage using a simple middleware (`src/app/persistenceMiddleware.ts`).
- Build artifacts are emitted to `docs/` for GitHub Pages; `vite-plugin-singlefile` is used to produce a single HTML bundle.

Key developer workflows & commands

- Start dev server (hot reload): `npm run dev` (Vite, host exposed).
- Build production bundle: `npm run build` (runs `tsc -b` then `vite build`). Output targets `docs/` per README.
- Preview production build: `npm run preview`.
- Tests: `npm run test` (Vitest). Setup file: `src/tests/setup.js`.
- Coverage: `npm run test:coverage`.
- Release helper: `npm run release:start` and `npm run release:finish` — these call `scripts/update-and-build.mjs` and expect branch rules (start from `main`, finish on `release/*`).

Project-specific patterns and conventions

- Persisted state keys: stored as `knit_slice_<slice>` in localStorage. See `src/utils/localStorage.ts` for load/save and migration helpers.
- When changing a persisted slice shape, add a migration in `src/utils/localStorage.ts` (functions like `migrateProjectsState` and `migrateProgressState`).
- Redux toolchain: middlewares are composed in `src/app/store.ts`. To add middleware, append to the `.concat(...)` array.
- Feature layout: each domain lives under `src/features/<domain>/` and exposes a `slice` (e.g., `projectsSlice`, `progressSlice`). Follow existing slice patterns.
- Components live in `src/components/` with co-located tests (`*.test.tsx`) and snapshots in `__snapshots__/`.
- Hooks: typed hooks `useAppDispatch` and `useAppSelector` live in `src/app/hooks.ts`. Use these instead of raw `useDispatch`/`useSelector`.

Integration points & external deps

- UI: Material-UI (MUI) throughout — styles and components follow MUI patterns (`@mui/material`, `@mui/icons-material`).
- Routing: `react-router-dom` for page navigation.
- Release and repo scripts: see `scripts/update-and-build.mjs` (non-interactive versioning logic and interactive git commands) and `scripts/update-favicon.mjs`.

Practical instructions for code agents

- If modifying persisted state: update `src/utils/localStorage.ts` to migrate existing localStorage entries, and bump tests or add migration unit tests.
- To debug runtime state issues: inspect `src/app/store.ts`, confirm `preloadedState` comes from `loadStateFromStorage`, and check keys in browser devtools `localStorage` (prefix `knit_slice_`).
- To add a new feature slice: mirror `src/features/projects/` structure, export the reducer, and add it to `rootReducer` in `src/app/store.ts` and to `PERSISTED_SLICES` in `persistenceMiddleware.ts` if it should persist.
- To run the release flow locally: use `npm run release:start` on `main` to create a `release/vX` branch, and `npm run release:finish` on the release branch to build, commit, and tag.

Useful files to read first

- `src/app/store.ts` — store setup and middleware composition
- `src/app/persistenceMiddleware.ts` — what is persisted and how
- `src/utils/localStorage.ts` — load, save, and migrations for persisted state
- `src/features/` — feature slices and reducers
- `scripts/update-and-build.mjs` — release workflow and expectations about branches
- `README.md` — development quickstart and deployment notes

If anything here is unclear or you'd like more examples (e.g., a migration template or a new slice scaffold), ask and I'll expand this file with that snippet.
