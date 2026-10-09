# SVANDA Web

Public website for the **SVANDA karaoke jukebox** at `https://svanda.fun`: a scroll-paged
single page (pixel intro, 3D jukebox, karaoke and jukebox panels, a colour configurator for the
jukebox app UI, venues, contact) plus legal pages, in **Czech (default), English and Slovak**.

**Naming:** *SVANDA* is the company and code namespace (`@svanda/*`). *SVANDA Web* is this repo.
*SVANDA Manager* is the separate cloud platform in [`../svanda-manager`](../svanda-manager)
(`manager.svanda.fun`). The `jukebox` repo is the machine software. This site never talks to a
jukebox or to the Manager API.

- Coding standards: [`codingStandards.md`](codingStandards.md), authoritative.
- Tickets: [`docs/prompt-plan.md`](docs/prompt-plan.md), the master list Jira is derived from.
- Design: [`docs/design-reference.md`](docs/design-reference.md) describes the prototype in
  [`design/reference/`](design/reference/) with line refs, including known design bugs to fix.

## Status

Greenfield. Repo wiped on 2026-10-09 (older history is an unrelated landing page). Nothing is
scaffolded until ticket **W0-1**; the commands and layout below are the target it creates.

## Stack

| Concern | Choice |
| --- | --- |
| Workspace | pnpm (Node 22), `apps/site`, `apps/contact-api`, `packages/shared` |
| Site | React 19, Vite, TypeScript strict, **React Router 7** framework mode (`ssr: false` + `prerender` per locale and legal route) |
| 3D | three + **@react-three/fiber 9** + **@react-three/drei**; model converted OBJ to GLB with `@gltf-transform` |
| 2D effects | Canvas 2D in hooks (intro, swarm, hero grid, torch, venue band, lava lamp) |
| State | zustand (`stageStore`, configurator store with `persist`) |
| UI | Radix UI primitives, `motion` for presence animations, `@use-gesture/react` |
| Forms | react-hook-form + zod (schema shared with the API from `packages/shared`) |
| Bot protection | ALTCHA (self-hosted proof of work), honeypot, rate limit |
| i18n | i18next + react-i18next, locale from the URL (`/`, `/en`, `/sk`) |
| Consent | vanilla-cookieconsent v3 (necessary / analytics / marketing) |
| Analytics | self-hosted **Umami** at `stats.svanda.fun` + web-vitals |
| Contact API | Hono on Node, nodemailer via Google Workspace SMTP to **business@svanda.fun**, pino |
| Tests | Vitest + React Testing Library, Playwright + axe, Lighthouse CI |
| Hosting | same Hetzner box as SVANDA Manager, behind its Caddy; GitHub Actions deploy |

Versions are pinned exactly in `package.json`.

## Layout (target)

```
apps/
  site/
    app/                 React Router routes (home per locale, legal pages, 404), root.tsx
    src/
      features/          one camelCase folder per section or concern
        stage/           stageStore, StageShell, PageLayer, paging input
        intro/           intro canvas + swarm + timeline
        hero/            hero background + overlay
        jukebox3d/       R3F scene, choreography, screen textures, ProjectedScreen
        products/        karaoke + jukebox panels
        jukeboxUi/       pixel + glass jukebox app UI, lava lamp, display compare
        configurator/    config model/store + UI
        venues/          frame, carousel, band, lightbox
        contact/         form
        consent/         cookie consent wrapper
        legal/           legal page rendering
        shell/           header, mobile menu, footer
      ui/                generic primitives (Button, Field, Dialog, PixelText, ...)
      lib/               pixel glyphs, homography, PRNG/easing, analytics
      hooks/  constants/  i18n/  styles/  types/  utils/
    public/              models/, cursors/, fonts/, images/
  contact-api/src/       routes/, mail/, captcha/, rateLimit/, config/
packages/shared/src/     zod schemas (contact request, jukebox config)
infra/                   compose, Caddy snippet, RUNBOOK.md
design/reference/        the design prototype (read-only reference)
docs/                    prompt-plan.md, design-reference.md
```

Site imports use the `src` baseUrl (`import { Button } from 'ui'`); relative only between
siblings in one feature. Shared schemas: `import { contactRequestSchema } from '@svanda/shared'`.

## Commands (target, from W0-1)

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Site dev server | `pnpm dev` (port **5174**, proxies `/api` to the contact API) |
| Contact API dev | `pnpm --filter contact-api dev` (port **8787**) |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Unit tests | `pnpm test` |
| e2e | `pnpm test:e2e` |
| i18n check | `pnpm i18n:check` |
| Build | `pnpm build` |
| Preview | `pnpm preview` |
| Convert 3D model | `pnpm --filter site model:convert` |

## Workflow

- **Jira:** site `https://svanda.atlassian.net`, account `svagerko@svanda.fun`, space
  **SVANDA Web**. The project key and epic keys are in the "Jira keys" table of
  [`docs/prompt-plan.md`](docs/prompt-plan.md). Never touch project `SM` (SVANDA Manager) from
  here.
- MCP server `atlassian-svanda` is defined in [`.mcp.json`](.mcp.json); authorize once with
  `/mcp` as `svagerko@svanda.fun`. The global chyron `atlassian` server is denied in
  [`.claude/settings.json`](.claude/settings.json).
- Repo skills:
  - `jira-connection-bootstrap`
  - `jira-ticket-planning`
  - `svanda-auto-implement`: unattended plan, implement, review, commit, push, Jira update.
    Never merges to `main`; ticket branches stack.
  - `react-code-review`
  - `commit-message`
- One ticket at a time on `feat/<KEY>-<n>-short-description`. Done = code + co-located tests,
  `typecheck` + `lint` + `test` (+ `test:e2e` for UI flows) green, AC met.
- **Commits: Conventional Commits subject line only. Never add Claude attribution
  (`Co-Authored-By: Claude`) to commits or PRs in this repo.**

## Rules that bite most

Full list in [`codingStandards.md`](codingStandards.md).

- Folders `camelCase`, component files `PascalCase.tsx`, `.tsx` only with JSX.
- Named exports via `index.ts`; no `export default` except where a tool requires it (React
  Router route modules, config files). No `React.FC`; props type named after the component.
- **SSR-safe modules:** routes are prerendered, so no `window` / `document` / storage at module
  scope or during render. Canvas, WebGL and storage live in effects or client-only lazy
  components.
- **No hard-coded user-facing strings**; every key exists in `cs`, `en` and `sk`.
- **No raw colours outside `theme.css`**; no static inline styles.
- **Animation is cheap and optional:** one rAF loop per scene, paused off-screen and in hidden
  tabs, reduced-motion path, three.js resources disposed.
- **Never use em-dashes or en-dashes** in copy, comments, commit messages or docs.

## Configuration & secrets

Only `.env.example` files are tracked.

| File | Holds |
| --- | --- |
| `apps/site/.env` | `VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_SRC`, `VITE_CONTACT_API_URL` (dev only). Everything `VITE_*` is **public** |
| `apps/contact-api/.env` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`, `ALTCHA_HMAC_KEY`, `ALLOWED_ORIGINS` |
| `infra/.env` (server only) | Umami DB password, `APP_SECRET`, contact-api secrets |

## Legal identity

Operator: sole trader (foreign natural person, podnikatel), IČO 24020923, seat Nové sady 988/2,
602 00 Brno - Staré Brno. Legal name and DIČ are still to be supplied; they live only in
`apps/site/src/constants/legalIdentity.ts` and block launch (W11-1).

## Git

Short-lived branch per ticket, Conventional Commits, PR with the Jira key, squash-merge, `main`
always deployable (it deploys on push).
