<!-- .github/copilot-instructions.md - Project-specific instructions for AI coding agents -->
# Timbua MVP — Copilot instructions (concise)

Purpose: short, actionable guidance so an AI coding agent can be immediately productive in this repo.

- Project type: Angular 20 application with optional server-side rendering (SSR) using @angular/ssr and an Express server.
- Key entry points:
  - Client bootstrap: `src/main.ts` (uses `bootstrapApplication(App, appConfig)`)
  - Server bootstrap for SSR: `src/main.server.ts` (exports default bootstrap)
  - Express SSR entry: `src/server.ts` (serves static browser files and uses `AngularNodeAppEngine` to render)
  - Root component/template: `src/app/app.ts` and `src/app/app.html` (standalone component)

Quick commands (from `package.json`)
- Start dev server (local hot-reload): `npm start`  -> runs `ng serve` (opens http://localhost:4200)
- Build production: `npm run build` -> `ng build` (output to `dist/`)
- Unit tests: `npm test` -> `ng test`
- Run previously-built SSR server: `npm run serve:ssr:timbua-mvp` -> runs `node dist/timbua-mvp/server/server.mjs`

Architecture & conventions (what matters for edits)
- Standalone component model: the app uses the new Angular standalone APIs (see `bootstrapApplication` in `src/main.ts` and the `App` component in `src/app/app.ts`). Prefer creating standalone components and providing them via `imports`.
- Centralized app config: common providers live in `src/app/app.config.ts` (e.g. router via `provideRouter(routes)`, client hydration with `provideClientHydration(withEventReplay())`). For SSR-specific providers merging, see `src/app/app.config.server.ts` which merges server rendering providers.
- Routing split: client routes are defined in `src/app/app.routes.ts` (currently `[]`). Server-side render behavior is configured in `src/app/app.routes.server.ts` (uses `RenderMode.Prerender` for `**`). Modify the appropriate file depending on whether a route is client-only or needs server rendering behavior.
- SSR flow: `angular.json` contains `server: src/main.server.ts` and `ssr.entry: src/server.ts`. `src/server.ts` is the Express entry for serving static assets and invoking the Angular SSR engine. If adding server REST endpoints, add them to `src/server.ts` (there is an example comment inside the file).
- Static assets & third-party libs: global assets come from `public/` (configured in `angular.json`) and styles/scripts include Bootstrap and Leaflet (see `angular.json` -> `styles` and `scripts`). When adding maps or UI code, import Leaflet features carefully and ensure the script/style entries match.

Editing patterns & examples (do this in this repo)
- Add a new route (client): update `src/app/app.routes.ts` with a `Routes` entry, then add a standalone component file under `src/app/` and register it in the route `loadComponent` or `component` field.
- Add a server API endpoint: open `src/server.ts` and add an Express handler before the Angular handler (static serving and SSR come later). Example (copy-paste location):

  // inside src/server.ts, before `app.use((req,res,next)=>...)`
  // app.get('/api/hello', (req, res) => res.json({ hello: 'world' }));

- Build + run SSR locally:
  1. Run `npm run build` (produces `dist/timbua-mvp`)
  2. Run `npm run serve:ssr:timbua-mvp` to execute the server at `dist/timbua-mvp/server/server.mjs`.

Project-specific gotchas
- No .github agent files currently exist — this file is authoritative for AI agents.
- Routing file split (client vs server) is intentional. Be sure to update the matching file depending on runtime.
- The root `App` is a minimal placeholder (see `src/app/app.html`). Tests and components will expect the standalone pattern and SCSS conventions.
- Third-party globals: Leaflet is added as a global script in the build config; code that imports Leaflet should assume the library is available via the script include or import the module directly if possible.

Where to look for context when editing
- `angular.json` — build, serve, server and SSR config
- `package.json` — NPM scripts (start/build/test/serve:ssr:timbua-mvp)
- `src/server.ts` — Express SSR server and place to add REST endpoints
- `src/main.ts` and `src/main.server.ts` — client and server bootstraps
- `src/app/*` — app component, routes, configs

Behavior expectations for PRs
- Keep changes minimal and focused: update routes, components, or server endpoints in separate commits.
- If adding SSR behavior, ensure you merge server providers in `app.config.server.ts` (already demonstrates merging via `mergeApplicationConfig`).
- If adding new dependencies that require global scripts/styles (e.g., Leaflet plugins), update `angular.json` accordingly and mention the change in the PR description.

If something's missing or unclear
- Ask the human maintainer which runtime they use for SSR CI (the repository contains `serve:ssr:timbua-mvp`, but no full build script chain for SSR automation). If you need to change build pipelines, show an incremental change and explain risk.

Ready for review — request feedback if you want more examples (e.g., how to add a new standalone component, how to wire in Leaflet routing, or a sample server API). 
