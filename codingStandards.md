# Coding standards

Ruleset for **SVANDA Web**: a pnpm workspace with a React 19 + Vite + React Router 7
(prerendered) marketing site with canvas animation and an R3F jukebox (`apps/site`), a small Hono
contact API (`apps/contact-api`) and shared zod schemas (`packages/shared`). Based on SVANDA
Manager's [`codingStandards.md`](../svanda-manager/codingStandards.md), same house style,
adjusted for a public, animation-heavy, SEO-facing site. Where a rule here conflicts with
existing code, **the rule wins: fix the code when you touch it.**

## General

- **DRY** (_don't repeat yourself_) and **KISS** (_keep it stupid simple_).
- Prefer many small files over one big file. A component wires state to JSX. Non-trivial
  logic (scroll math, glyph layout, form validation, three.js scene setup) lives in a hook,
  a helper or `lib/`, never inline in a component body.
- Split code into small single-responsibility functions.
- Logic shared by two or more files moves to `utils/`, `lib/`, or a feature-level
  `*Helpers.ts`. Never copy a helper between siblings.
- Name files after the job they do (`pixelGlyphs.ts`, `scrollProgress.ts`,
  `contactSubmit.ts`).
- Clean code is self-commenting. Comments explain a non-obvious **why** (a browser quirk, a
  timing constraint, a three.js lifecycle gotcha), not what the next line says. No ticket
  numbers in source.
- **Delete dead code.** An export whose only consumer is its own `index.ts` barrel is dead.
  No "might need it later". This includes design-tool leftovers: placeholder copy
  ("options land here once the UI is ready"), debug toggles, unused accent variants.
- **No em-dashes or en-dashes** anywhere: copy, comments, commit messages, docs. Use a
  colon, comma, parentheses or a plain hyphen.

## Lint & TypeScript are the baseline

- ESLint (flat config) + Prettier, the same rule set as SVANDA Manager's `@svanda/config`.
  Editor autofix is day-to-day enforcement; **CI is authoritative** (`eslint` with 0 errors,
  `tsc --noEmit`, unit tests, e2e).
- `strict: true`. **No implicit `any`, no `any` cast to dodge a type error.** Use `unknown`
  plus a narrow for `postMessage` payloads, `JSON.parse`, and form-service responses.
- Don't hand-write a type a library already exports (three.js, i18next): import it.

| Rule | Level | Notes |
| --- | --- | --- |
| `no-console` | **error** | The site ships to the public. No debug logging left in. |
| `@typescript-eslint/no-unused-vars` | error | No unused imports, vars, params. |
| `@typescript-eslint/no-floating-promises` | error | Await or explicitly `void` with a comment. |
| `@typescript-eslint/no-misused-promises` | error | |
| `no-magic-numbers` | warn (allow 0, 1, -1) | Name it. Constants live in `src/constants/`. Scroll thresholds and animation timings are constants too. |
| `eqeqeq` | error | |
| `prefer-const` | error | |
| `consistent-return` | error | |
| `no-else-return` | error | Early-return. |
| `no-use-before-define` | error | |
| `complexity` | warn > 15 | Split the function. |
| `simple-import-sort/imports` + `exports` | error | Let the editor sort. |
| `react-hooks/rules-of-hooks` + `exhaustive-deps` | error / warn | See **Hooks**. |
| `jsx-a11y` (recommended) | error | Public site; accessibility is not optional. |

## Naming

### Folders

- **Folders are `camelCase`**, always, including a folder holding a component
  (`features/venues/venueCard/`, not `VenueCard/`).
- **Feature-first.** Each page section is a feature in `src/features/<feature>/` owning its
  components, hooks, helpers and `<feature>.css`. Cross-cutting code sits at `src/` top level
  (`ui/`, `hooks/`, `lib/`, `constants/`, `types/`, `utils/`, `i18n/`, `styles/`).
- A sub-feature with more than one file gets its own `camelCase` folder.

### Extensions

- `.ts` for files with no JSX, `.tsx` **only** for files containing JSX.

### Reference naming

- `PascalCase` for components and classes. `camelCase` for hooks (`useScrollProgress`),
  utils, constants objects, instances, variables. `SCREAMING_SNAKE_CASE` for primitive
  module-level constants (`INTRO_DURATION_MS`).
- Booleans read as predicates: `isMenuOpen`, `hasConfigAttached`, `canSubmit`.
- Units in names: `*_MS`, `*_PX`, `*Ratio` (0..1), `*Progress` (0..1).
- No throwaway names (`a`, `d`, `tmp`, `res`). Loop `i` and `{x, y}` are fine. The design
  export is full of single-letter names (`c`, `t`, `s`, `g`); rename them when porting.

### `useState` pairs

```ts
const [isMenuOpen, setIsMenuOpen] = useState(false);   // yes
const [isMenuOpen, setShowMenu]   = useState(false);   // no
```

### Exports

- One `index.ts` barrel per folder re-exporting its public surface.
- **Named exports only**, no `export default`. The only exceptions are files a tool requires
  to default-export: React Router route modules in `apps/site/app/` and config files. A route
  module stays thin: it exports `meta` / the component and renders a feature component.

## Prerender safety (site)

Every route is prerendered to static HTML at build time, so all modules are evaluated in Node.

- No `window`, `document`, `navigator`, `localStorage`, `matchMedia` or `ResizeObserver` at
  module scope or during render. Read them in effects, event handlers or client-only lazy
  components.
- Canvas, WebGL (R3F) and anything that measures layout are client-only: lazy-load them and
  render a static placeholder in the prerendered HTML with the same dimensions (no layout
  shift).
- Real headings and copy are in the prerendered HTML; a canvas never carries content alone.
- Hydration must match: anything that depends on the client (theme, stored choices, viewport)
  is applied after mount or via the pre-paint theme script, never by rendering different markup
  on the first client render.

## React components

- Function components only, both forms **named**:

  ```tsx
  export const VenueCard = memo(({ venue }: VenueCardProps) => { ... });
  export function ContactForm() { ... }
  ```

  No `React.FC`.
- Props type named after the component: `VenueCardProps`. **Never a bare `Props`.**
- `memo` for list items and leaves that re-render on scroll.
- `displayName` on `memo` / `forwardRef` components where the name is lost.
- Component body is state wiring + JSX. Keep components under ~150 lines, functions under
  ~40. One component per file.
- Handlers are `handleX`; the props that carry them are `onX`.
- `PascalCase` for props holding a component/element, `camelCase` otherwise.
- Semantic HTML first: `<header>`, `<nav>`, `<main>`, `<section aria-labelledby>`,
  `<footer>`, real `<button>` and `<a href>`. No clickable `<div>`.

## Hooks

- Rules of Hooks: top level only.
- **Honest dependency arrays.** Never disable `exhaustive-deps` to hide a dep; restructure. If
  a dep must be excluded, comment why on that line.
- No `useEffect` where a derived value, `useMemo` or an event handler would do.
- Extract non-trivial effect bodies (scene setup, scroll math, glyph layout) into named pure
  functions so they can be unit-tested without a DOM or WebGL.
- Every effect that subscribes (scroll, resize, `IntersectionObserver`, `message`,
  `matchMedia`, rAF) cleans up in its return.

## Styling

- **CSS Modules**: each component imports its co-located `camelCase.module.css`
  (`import styles from './venueCard.module.css'`). Global rules live only in
  `src/styles/` (`theme.css`, `global.css`, `fonts.css`). Class names are `camelCase`.
- **Every colour, space, font size, radius, shadow, duration, easing and z-index is a token
  in `src/styles/theme.css`.** A raw `#rrggbb` / `rgba()` outside that file fails the
  `colorLiterals.spec.ts` guard. Glyph colour tables in `lib/` read from tokens too.
- **Theming:** dark is the default. `data-theme="light|dark"` and `data-accent="<name>"` on
  `<html>` swap token values; components never branch on theme in JS. The initial theme is
  set by a tiny external blocking script in `<head>` before first paint (no flash) and follows
  `prefers-color-scheme` until the visitor chooses.
- Each accent defines a dark-theme value and a light-theme value that meets WCAG AA contrast
  on its background (the design already provides both).
- **No `style={{}}` with static values.** Inline style is only for values computed at render
  (a transform, a progress-driven opacity). Prefer setting a CSS custom property
  (`style={{ '--progress': p }}`) and doing the math in CSS.
- **Fonts are self-hosted** (`src/styles/fonts.css`, `woff2`, `font-display: swap`): Silkscreen
  for pixel UI, system UI stack for body. No Google Fonts CDN (EU privacy + CSP).
- Responsive: mobile first, breakpoints are tokens/constants, layouts work at 320px wide with
  no horizontal scroll.
- Dead CSS to avoid: `will-change` on elements that don't animate, `gap: 0`, responsive
  overrides that restate the base value, vendor prefixes Vite/Lightning CSS already adds.

### `src/ui/`: primitives

Generic, feature-agnostic building blocks (`Button`, `IconButton`, `Field`, `Input`,
`Textarea`, `Switch`, `SegmentedControl`, `Dialog`, `Toast`, `VisuallyHidden`, `PixelText`,
`PixelLogo`, `PixelIcon`), imported as `import { Button } from 'ui'`.

- Interactive primitives wrap **Radix UI** for behaviour and accessibility and add the pixel
  skin on top; never re-implement focus trapping, roving focus or dialog semantics by hand.
- One `camelCase` folder per primitive: `PascalCase.tsx`, `<camelCase>.module.css`,
  `index.ts`, `PascalCase.spec.tsx`.
- No feature vocabulary (venues, jukebox) inside `ui/`.
- Every interactive primitive has a visible `:focus-visible` ring and a 44px minimum hit area
  on touch.
- Every primitive takes an optional `testId` defaulting to its kebab-case name.
- Features compose primitives, never restyle them. Missing variant: add it to the primitive.

## Animation, canvas & three.js

The hero stage and configurator are the riskiest code for performance and battery. Rules:

- **One `requestAnimationFrame` loop per scene**, owned by a hook. No `setInterval` animation.
- **Pause when not visible:** `IntersectionObserver` for off-screen, `visibilitychange` for
  background tabs. A scene that isn't on screen draws nothing.
- **Scroll is read, not reacted to per element.** One passive scroll listener (or
  `useScrollProgress`) computes progress once per frame and publishes it as CSS custom
  properties (`--sv-hero`, `--sv-nav`, ...). CSS does the per-element work. Never read layout
  (`getBoundingClientRect`) inside a loop over many elements; cache on resize.
- **`prefers-reduced-motion: reduce`**: skip the intro swarm, show the final wordmark and a
  static jukebox render, disable parallax. Handled in one place (`useReducedMotion`), plus a
  global CSS rule clamping transitions.
- **2D canvases** (intro, swarm, hero grid, venue band, lava lamp) are plain Canvas 2D owned
  by a hook; drawing functions are pure (`draw(ctx, state, t)`) and unit-testable.
- **3D is React Three Fiber + drei**, lazy-loaded as one chunk after first paint. Never a
  vendored `three.min.js`; versions pinned.
  - `frameloop="demand"`: call `invalidate()` when store state changes or while an animation
    runs; an idle scene renders nothing.
  - `useFrame` mutates refs only; **never `setState` inside `useFrame`**. Read store state with
    `useStageStore.getState()` inside the frame callback, subscribe with selectors elsewhere.
  - Cap dpr (`dpr={[1, 1.5]}`); reuse geometries and materials (`useMemo`); textures created in
    effects are disposed in their cleanup. R3F disposes what it owns on unmount; anything created
    manually is disposed manually.
  - Models are GLB (meshopt) in `public/models/`, loaded with `useGLTF` and preloaded when the
    stage mounts; size recorded in the ticket.
  - Light intensities are physical units (current three); never copy r128 values unadjusted.
- **Stage state lives in the zustand `stageStore`**: `vp`, page, intro phase, pointer, grid,
  screen quad. Components and canvases read it; nothing communicates through `window` events,
  DOM queries on other features, or `postMessage`.
- The configurator is a React feature, **not an iframe**. The design's `postMessage` bridge
  (`svLang`, `svAttach`, `svMode`, `svPause`) becomes plain props/state.
- Canvas content that carries meaning (the wordmark, pixel headings) has a text equivalent
  (`aria-label` or visually hidden heading).

## Imports

- Absolute imports from the `src` baseUrl: `import { Button } from 'ui'`,
  `import { useScrollProgress } from 'hooks'`. Relative only between siblings in a feature.
- `import type { ... }` for type-only imports.
- A new alias goes into `tsconfig.json`, `tsconfig.spec.json`, `vite.config.ts` and the Vitest
  config **together**.

## Constants & content data

- Named values in `src/constants/` (`TIMINGS`, `BREAKPOINTS`, `SCROLL_STAGES`). `*_MS` / `*_PX`
  suffixes.
- Content that changes without a code change in mind (venues list, social links) lives in a
  typed data file in `constants/` with translatable fields keyed by locale or by i18n key.
  It is not inlined in JSX.
- Dates are stored as ISO `YYYY-MM-DD` and formatted with `Intl.DateTimeFormat` in the active
  locale. Never store a pre-formatted `"20. 9. 2026"`.

## Strings & i18n

- **Every user-facing string goes through `react-i18next`** with a stable, feature-namespaced
  English key (`contact.form.email`, `venues.title`). No hard-coded literals in components,
  including `aria-label`, `alt`, `title` and `<meta>` content.
- **Locales: `cs` (default), `en`, `sk`.** A key must exist in all three catalogs with a real
  translation; CI fails on a missing, empty or orphaned key.
- **The locale comes from the URL** (`/` cs, `/en`, `/sk`, and localized legal slugs), so each
  locale prerenders to its own HTML. An explicit choice in the switcher is remembered and
  applied on a later visit to `/`; the browser language is never used to redirect a crawler.
  `<html lang>` always matches the active locale.
- No sentence built from concatenated fragments; use one key with placeholders / plurals.
- Numbers and dates via `Intl` in the active locale.
- Brand words that aren't translated (SVANDA, KARAOKE JUKEBOX) still go through a key so
  the catalogs stay the single source of copy.
- Legal pages are per-locale Markdown files, not catalog keys; all three locales exist for every
  page.

## Contact API (`apps/contact-api`)

- Hono app built by `createApp(deps)` (mail transport, clock, limiter injected) so tests call
  `app.request()` with fakes; `index.ts` only wires real deps and listens.
- Folders by concern: `routes/` (thin: validate, call, respond), `mail/` (transport +
  templates), `captcha/`, `rateLimit/`, `config/` (zod-parsed env, crash on invalid).
- **Every request is validated** with the schemas from `packages/shared`; unknown fields
  rejected; body size capped.
- Errors: `{ error: { code } }` with stable codes (`contact.invalid`, `contact.rate_limited`,
  `contact.captcha_failed`, `contact.send_failed`). Never return stack traces or SMTP errors.
- **No PII in logs** (no names, e-mails, messages, IPs in plain text). Log request id, route,
  status, duration, error code.
- Mail templates escape every interpolated value; the visitor's address goes only in
  `Reply-To` and the confirmation's `To`, never in `From`.
- The client never decides who receives mail: `MAIL_TO` is server config.

## Accessibility

- Target **WCAG 2.2 AA**. Colour contrast checked for both themes and every shipped accent.
- Full keyboard path: skip link, nav, menu, configurator controls, carousel, lightbox, form.
  Focus is trapped in the open mobile menu and lightbox and restored on close; Escape closes.
- The pixel cursor is decorative and desktop-only (`pointer: fine`); it never hides the
  native focus ring or text cursor behaviour.
- Form fields have real `<label>`s, errors are announced (`aria-live`), and submit state is
  conveyed in text, not only colour.

## SEO & performance

- Per-locale `<title>`, meta description, canonical, `hreflang` alternates, Open Graph +
  Twitter card image, `robots.txt`, `sitemap.xml`. Structured data (`Organization`,
  `LocalBusiness` or `Product`) where the ticket says so.
- Real HTML content in the initial document for crawlers: headings and copy are not only on a
  canvas. Prerendering is decided in the setup ticket.
- Budgets (checked in CI or by Lighthouse in the PR): LCP < 2.5s and CLS < 0.1 on mid-range
  mobile, initial JS (without three.js) kept small and stated in the ticket.
- Images: modern formats (AVIF/WebP) with explicit `width`/`height`, `loading="lazy"` below
  the fold, responsive `srcset`.
- No third-party trackers or analytics without a consent decision recorded in a ticket.

## Security & privacy

- **No secrets in source.** Only `.env.example` is tracked. Anything `VITE_*` is public by
  definition.
- Strict CSP set at the host (no `unsafe-inline` / `unsafe-eval`), all assets self-hosted, so
  the policy can be tight. No inline scripts in `index.html`.
- External links that open a new tab use `rel="noopener noreferrer"`.
- **Contact form:** client validation for UX, never trusted. Honeypot or equivalent bot
  protection, rate-limited by the receiving service. Collect only the fields the design shows.
  A privacy notice link sits next to the submit button (GDPR: SVANDA is the controller).
- The attached jukebox configuration is serialised as plain data (colour values), never
  HTML.

## Testing: required, not optional

Every helper, hook, and non-trivial component ships with a test in the same PR.

| Scope | Stack | Command |
| --- | --- | --- |
| Unit | **Vitest** + jsdom + **React Testing Library** | `pnpm test` |
| e2e | **Playwright** (Chromium + WebKit mobile viewport), form backend mocked via `page.route` | `pnpm test:e2e` |
| Types | `tsc --noEmit` (src + `tsconfig.spec.json`) | `pnpm typecheck` |

- Co-locate specs: `pixelGlyphs.spec.ts` beside `pixelGlyphs.ts`, `VenueCard.spec.tsx` beside
  `VenueCard.tsx`.
- Query by `data-testid`, not visible text (copy changes per locale).
- Mock `fetch` with `vi.stubGlobal`. Fake timers for timing logic. No MSW.
- WebGL and canvas aren't tested by pixels in unit tests: test the pure math (glyph layout,
  scroll-stage mapping, colour serialisation) and that scenes mount and dispose without error.

**What must have tests:**

- Pixel-glyph layout (wrapping, narrow fallback, diacritics mapping).
- Scroll progress to stage mapping (boundaries, reduced motion path).
- Theme + accent + locale resolution and persistence (including `localStorage` throwing).
- i18n catalog parity guard and the colour-literal guard.
- Contact form: validation, submit success, submit failure, config attachment on/off.
- Configurator state to serialised config round-trip.
- **e2e:** page loads in both locales with no console errors; nav links scroll to sections;
  language switch updates copy and `<html lang>`; theme toggle persists; mobile menu opens,
  traps focus, closes on Escape; venues carousel and lightbox by keyboard; contact form
  happy path and error path; reduced-motion run shows the static hero.

**Not tested:** exact animation frames, three.js internals, third-party libraries.

No coverage threshold; review judgement instead.

## Test IDs

- **Root element** gets the kebab-case component name: `VenueCard` → `data-testid="venue-card"`.
- **Interactive children** are prefixed: `contact-form-submit`. Use a `childTestId(parent,
  suffix)` helper.
- **List items** append a stable id, never an array index: `` `venue-card-${venue.id}` ``.
- Cover the root, every button / input / toggle, menus, the lightbox, and empty / error /
  loading / sent states.
- **Never rename or remove an existing `data-testid`**; specs reference the literal. Flag it
  instead.

## Git workflow

Short-lived branch per Jira ticket off `main` (`feat/<KEY>-short-description`), Conventional
Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `style:`, `perf:`), PR with the Jira key,
squash-merge, tag releases. `main` is always deployable.
