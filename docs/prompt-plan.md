# Prompt plan

Master list of epics and tickets for SVANDA Web. Jira (svanda.atlassian.net, space SVANDA Web)
is derived from this file; keep the two in sync when scope changes.

Each ticket is one focused prompt and one branch: **about 800 LOC including co-located tests**
(split past about 1200). "Refs" point into [`design-reference.md`](design-reference.md) and the
prototype in [`design/reference/`](../design/reference/). "AC" = acceptance criteria. "Deps" =
tickets that must be done first. Every ticket ships specs, `data-testid`s, i18n keys in cs/en/sk,
and leaves `pnpm typecheck && pnpm lint && pnpm test` green.

## Jira keys

Single source for the project key and the epic keys that `svanda-auto-implement` chain mode
walks. Fill in when the issues are created.

| Item | Key |
| --- | --- |
| Project | `TBD` |
| E0 Foundation | `TBD` |
| E1 Brand & UI primitives | `TBD` |
| E2 App shell & hero stage | `TBD` |
| E3 3D jukebox | `TBD` |
| E4 Product sections & jukebox UI | `TBD` |
| E5 Configurator | `TBD` |
| E6 Venues | `TBD` |
| E7 Contact | `TBD` |
| E8 Legal & consent | `TBD` |
| E9 Analytics & metrics | `TBD` |
| E10 SEO, quality, infra | `TBD` |
| E11 Launch (manual, **not** in the chain) | `TBD` |

Auto-implement epics: E0 to E10.

## Fixed decisions

- Contact: own Hono service (`apps/contact-api`), Google Workspace SMTP, to
  **business@svanda.fun**, Reply-To visitor, config JSON attached, localized visitor
  confirmation.
- Domain: `svanda.fun` apex (www 301 to apex), Umami at `stats.svanda.fun`, Manager stays at
  `manager.svanda.fun`.
- Hosting: the same Hetzner box as SVANDA Manager, behind its Caddy; GitHub Actions deploy.
- Analytics: self-hosted Umami (cookieless). Consent manager with necessary / analytics /
  marketing.
- Locales: cs (default, `/`), en (`/en`), sk (`/sk`).
- Legal identity: sole trader (zahraniční fyzická osoba, podnikatel), IČO 24020923,
  Nové sady 988/2, 602 00 Brno - Staré Brno. Legal name and DIČ: to supply (launch gate).
- Production defaults: accent orange (magenta on page 2), hero variant A, intro mode session,
  pixel cursor on `pointer: fine` only, dark default + light theme.

---

## E0: Foundation

### W0-1 · Workspace scaffold
**Prompt:** Create the pnpm workspace: `apps/site` (Vite + React 19 + TypeScript strict + React
Router 7 framework mode, `ssr: false`, `prerender` for `/`, `/en`, `/sk`), `apps/contact-api`
(empty Hono app with `/health`), `packages/shared` (empty, built with `tsc`). Root scripts `dev`,
`build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`, `format`. ESLint flat config with
the rule table from `codingStandards.md` (incl. `jsx-a11y`, `simple-import-sort`,
`react-hooks`), Prettier, Vitest (jsdom for site, node for API), Playwright skeleton (one smoke
spec), `baseUrl: src` aliases mirrored in tsconfig, tsconfig.spec, Vite and Vitest.
`.env.example`, `.nvmrc`, `packageManager`. Site dev port 5174. Placeholder home route per
locale.
**AC:** `pnpm install && pnpm build` produces prerendered `index.html` for `/`, `/en`, `/sk`;
`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` pass; `CLAUDE.md` commands table
matches reality.
**Tests:** smoke unit test per package; Playwright opens `/` and `/en`.
**Deps:** none.

### W0-2 · Tokens, theme, fonts, cursor
**Prompt:**
- Tokens in `src/styles/theme.css`: dark + light colour sets from `DARK`/`LIGHT`, accents orange
  + magenta with light-theme contrast values, wordmark letter colours, space / type / radius /
  shadow / duration / easing / z-index tokens.
- `global.css` (reset, reduced-motion clamp, focus ring) and `fonts.css` with self-hosted
  Silkscreen 400/700 + JetBrains Mono 400/700/800 woff2, `font-display: swap`.
- Theme: a no-flash external theme script in `<head>`; `useTheme` (dark default, follows
  `prefers-color-scheme` until chosen, persisted with try/catch); `useReducedMotion`.
- Pixel cursor CSS driven by `html[data-cursor]` (`on` / `magenta`), `pointer: fine` only, PNGs
  from `design/reference/cursor-*.png` moved to `public/cursors/`.
- `colorLiterals.spec.ts` guard failing on raw colours outside `theme.css`.

**Refs:** design-reference "Global behaviour".
**AC:** theme toggling swaps tokens via `data-theme`; no flash on reload in either theme;
reduced motion clamps transitions; cursor appears only on fine pointers; guard spec catches a
planted literal.
**Tests:** `useTheme` (default, system, persisted, storage throws), `useReducedMotion`, guard.
**Deps:** W0-1.

### W0-3 · i18n + locale routing
**Prompt:**
- i18next + react-i18next setup with the locale taken from the route (`/` cs, `/en`, `/sk`),
  prerender-safe (resources bundled per locale, no fetch).
- `cs.json`, `en.json`, `sk.json` containing all design copy (`COPY` in `web:323-344`, venue
  notes, configurator labels from `konf:329`, contact form, footer). Slovak translated from
  Czech and marked for native review in a `_meta` note.
- `<html lang>` follows the locale.
- `LanguageSwitch` (CS / EN / SK segmented, active = accent fill) navigates to the same section
  in the other locale; remembers an explicit choice and redirects `/` to it on a later visit
  only when the visitor chose it explicitly.
- `scripts/checkI18n.mjs` fails on missing, empty or orphaned keys.

**Refs:** design-reference "Nav", "Global behaviour".
**AC:** all three locales prerender with translated copy; switching locale keeps the hash;
`pnpm i18n:check` passes and fails when a key is removed from one catalog.
**Tests:** locale resolution, switch component, parity script.
**Deps:** W0-1.

### W0-4 · CI pipeline
**Prompt:** `.github/workflows/ci.yml` on push and PR: install with pnpm cache, `lint`,
`typecheck`, `test`, `i18n:check`, `build`, Playwright e2e (Chromium + WebKit mobile viewport)
against `preview`, gitleaks, `pnpm audit` (non-blocking report), `.env` guard (fails if any real
`.env` is tracked). Concurrency cancel. Upload Playwright report on failure.
**AC:** a PR shows all jobs; a planted `.env` file or failing test turns CI red.
**Tests:** the workflow itself; guard script unit test.
**Deps:** W0-2, W0-3.

---

## E1: Brand & UI primitives

### W1-1 · Pixel glyph engine
**Prompt:**
- Port the pixel typography to pure TS in `src/lib/pixel/`: `BITMAP`, `GLYPH`, `NARROW_G`,
  `DIA`, `SUN`, `MOON`, `pixelWord`, `pixelHead` (wrapping, narrow fallback), `pixelCq`. Rename
  one-letter variables.
- Components in `src/ui/`:
  - `PixelText`: SVG `rect`s with an accessible text equivalent, colours from tokens.
  - `PixelLogo`: 36x5 wordmark, per-letter colours, cell size prop.
  - `PixelIcon`: sun/moon.
  - `PixelChevron`.

**Refs:** design-reference "Pixel typography".
**AC:** rendering "SVANDA", "POBOCKY & AKCE" (diacritics), a long heading that wraps and falls
back to narrow glyphs all match the prototype; screen readers get the text.
**Tests:** glyph widths, wrap and narrow fallback, diacritic mapping, component snapshots of
cell counts.
**Deps:** W0-2.

### W1-2 · UI primitives
**Prompt:**
- Primitives in `src/ui/`, each with its own folder, CSS, spec and `testId`:
  - `Button`: pixel outline / fill / ghost variants matching the hero CTA (2px accent border,
    hover fill).
  - `IconButton`: required label.
  - `Field` + `Input` + `Textarea`: label, hint, error wiring with `aria-describedby`.
  - `Switch`: Radix, pixel knob with `steps(2)`.
  - `SegmentedControl`: Radix ToggleGroup.
  - `Dialog`: Radix wrapper with motion presence, focus trap, ESC.
  - `Toast`: queue, 3.2s auto-dismiss, `aria-live`.
  - `VisuallyHidden`.
- `childTestId` helper.

**Refs:** design-reference "Configurator" (control styling), "Contact".
**AC:** all primitives keyboard operable with visible focus, 44px touch targets, both themes.
**Tests:** one spec per primitive (behaviour + a11y attributes).
**Deps:** W0-2.

---

## E2: App shell & hero stage

### W2-1 · Stage store + paging shell
**Prompt:**
- A zustand `stageStore` holds `vp`, `page`, `introPhase`, `isReady`, `pointer`, grid
  (`cell`, `originX`, `originY`), `screenQuad`, `viewport` (w, h, isMobile < 1040, isPortrait).
- `useVpTween`: 1100 ms easeInOut toward the target page.
- `StageShell`: 500svh sticky viewport with 5 snap anchors and real ids (`top`, `karaoke`,
  `jukebox`, `custom`, `venues`); contact after it.
- `PageLayer`: opacity `clamp(0, 1 - |vp - k| * 2.2, 1)`, optional parallax, pointer events
  only on the active page.
- Paging input:
  - wheel per design rules (blocked until ready, native in contact, 500 ms silence, 1500 ms
    between turns);
  - keyboard PgUp/PgDn/arrows/Home/End/Space;
  - touch via snap.
- One scroll listener publishes `--sv-vp`. `goToPage(n)` is used by nav links. Reduced motion:
  instant page changes.

**Refs:** design-reference "Scroll stage".
**AC:** wheel, keyboard and nav links move exactly one page; deep link `/#venues` lands on page
4; contact scrolls natively; no layout read inside the rAF loop.
**Tests:** tween maths, page targeting, wheel gating with fake timers, keyboard handler, opacity
function.
**Deps:** W0-2.

### W2-2 · Header, mobile menu, footer
**Prompt:**
- `Header`: grid layout and reveal through `--sv-nav` / `--sv-menu` / `--sv-logo` (stagger `d`
  values); theme toggle with `PixelIcon`; `LanguageSwitch`; `PixelLogo` linking to top. Fix the
  breakpoint mismatch: one constant decides the nav cell size and the swarm target.
- Mobile menu (< 1040): `Dialog` full screen below the nav, focus trap, ESC, closes on
  navigation.
- Skip link to `main`.
- `Footer`: copyright, Instagram / YouTube from `constants/social.ts` (placeholder URLs flagged),
  legal links (routes stubbed until W8-1), a "Cookie settings" button slot (wired in W8-2).

**Refs:** design-reference "Nav", "Contact" (footer), bug 1 and 3.
**AC:** desktop and mobile nav match the design; all items keyboard reachable; menu traps and
restores focus.
**Tests:** reveal maths, menu open/close/ESC, active item, footer links.
**Deps:** W1-1, W1-2, W2-1.

### W2-3 · Intro + wordmark swarm
**Prompt:**
- `IntroCanvas` (client-only canvas hook):
  - intro pixel resolve: block sizes 3/2/1, 7 Hz colour re-roll, cell lock windows, white flash;
  - swarm along quadratic Beziers with 3 ghost trails into the nav logo slot measured from the
    header.
- `useIntroTimeline` drives `introPhase` and the `--sv-nav` / `--sv-menu` / `--sv-logo` /
  `--sv-hero` vars per the timeline table.
- Intro modes: session by default (`sessionStorage`, try/catch). Scroll locked until ready.
  Reduced motion and repeat visits jump to the final state. Seeded PRNG (`mulberry32`) and easing
  in `src/lib/`.

**Refs:** design-reference "Stage timeline".
**AC:** first visit plays the full intro (about 6.5s) and unlocks scroll; reload in the same
session skips it; reduced motion shows the final state immediately; the logo lands pixel-exact
on the nav logo at 375, 800 and 1440 widths.
**Tests:** timeline phase function, swarm path maths, intro-mode resolution, PRNG determinism.
**Deps:** W2-2.

### W2-4 · Hero background + overlay
**Prompt:**
- `HeroBackground` canvas:
  - variant A twinkle grid, ghost wordmark fading with `vp`;
  - pixel torch around pointer/finger (4-step quantised alpha with hashed dither, theme-aware);
  - publishes grid cell and origin to the store for venues snapping;
  - idle 20 fps cap, paused off-screen and in hidden tabs.
- `HeroOverlay`: tag, CTA (goes to page 1), opacity `--sv-hero * (1 - vp * 2.5)`, visually
  hidden h1 with the brand line.
- Floor shadow is drawn here from a footprint polygon the 3D scene publishes (empty until W3-2).

**Refs:** design-reference "Hero background".
**AC:** matches the design in both themes; torch follows pointer and touch; CPU idle when the
tab is hidden (verified with a frame counter in a spec).
**Tests:** twinkle alpha function, torch quantisation, point-in-polygon + hull helpers,
visibility pause.
**Deps:** W2-3.

---

## E3: 3D jukebox

### W3-1 · Model pipeline + scene
**Prompt:**
- Model: `scripts/convertModel.mjs` with `@gltf-transform` converts
  `design/reference/jukebox.obj` to `apps/site/public/models/jukebox.glb` (normals, weld,
  meshopt). Commit the GLB and record its size.
- Scene: `JukeboxScene` lazy-loaded client-only R3F `Canvas` (`frameloop="demand"`, dpr
  `[1, 1.5]`, ACES, exposure 1.15, sRGB), camera fov 28 near 50 far 8000. drei `useGLTF`.
  Materials `shell` and `glass` assigned by mesh name.
- Lighting: drei `Environment` built from `Lightformer`s approximating the softbox; hemisphere,
  key, rim and fill lights retuned for physical units.
- Lifecycle: invalidates on store changes; paused off-screen; disposes on unmount.
- Fallback: a static poster image (rendered once and committed) when WebGL is unavailable or
  while loading.

**Refs:** design-reference "3D".
**AC:** model renders sharp with clearcoat reflections close to the prototype; initial JS
excluding the 3D chunk unchanged; the 3D chunk loads after first paint; no WebGL context leaks
when navigating to a legal page and back.
**Tests:** material assignment by name, WebGL-unavailable fallback, mount/unmount dispose spy.
**Deps:** W2-1.

### W3-2 · Choreography + floor shadow
**Prompt:**
- Port `pageState(vp)` (JX, JY, YAW, SCALE_L/P, SPIN) and `fitCustom` (landscape/portrait
  fitting, measuring the DOM heading/body via refs published to the store) to pure functions.
- Motion: intro rise (easeOutBack from y -900) + spin-in yaw, idle sway, `calm` on Custom,
  cursor parallax tilt and two cursor point lights on the hero only.
- Floor shadow: compute the base footprint hull, project to screen, publish to the store for
  `HeroBackground`.
- Reduced motion: no sway, spins or cursor tilt.

**Refs:** design-reference "3D" (`pageState`, `fitCustom`), "Hero background" (floor shadow).
**AC:** model positions per page match the prototype at 1440x900, 1024x768 and 390x844; spins
happen on 0 to 1 and 2 to 3; Custom shows the model face-on with room above the display.
**Tests:** `pageState` interpolation at boundaries, `fitCustom` for landscape and portrait, hull
projection.
**Deps:** W3-1, W2-4.

### W3-3 · Screen textures + projected display
**Prompt:**
- Display and chin `CanvasTexture`s: colour-cycling pixel S fading with `vp`; 10-bar VU meter.
  Do not port the dead mock UI.
- Each frame, project the display rect corners to client px and write `screenQuad` to the store
  (deduplicated).
- `homography.ts` computes the `matrix3d` mapping a 540x960 box onto 4 points.
- `ProjectedScreen` renders children inside a 540x960 box warped onto the quad, visible for vp
  0.8 to 2.2, interactive above 0.9 visibility, exposes `mode` (`sing` if vp < 1.5 else
  `listen`) and `isPaused`.

**Refs:** design-reference "3D" (screen planes), "Projected display".
**AC:** content placed in `ProjectedScreen` sits exactly on the 3D display through page
transitions and resizes.
**Tests:** homography against known point sets, quad dedupe, visibility and mode thresholds.
**Deps:** W3-2.

---

## E4: Product sections & jukebox UI

### W4-1 · Karaoke + Jukebox panels
**Prompt:**
- `ProductPanel` used for pages 1 and 2: landscape (text in the half opposite the model) and
  portrait layouts; `PixelText` heading (orange / magenta), title, body; parallax through
  `PageLayer`.
- Page 2 switches the accent to magenta and the cursor to the magenta set (via the store, not
  per element).
- Publishes heading/body rects for `fitCustom` portrait.

**Refs:** design-reference "Scroll stage" pages 1-2.
**AC:** layouts match the design in landscape and portrait, both themes, all locales (long
Slovak/Czech titles wrap cleanly).
**Tests:** layout mode selection, accent switching, rect publishing.
**Deps:** W3-2.

### W4-2 · Jukebox app UI previews
**Prompt:**
- `src/features/jukeboxUi/`: `PixelJukeboxUi` and `GlassJukeboxUi`, driven by a typed design
  config for one section:
  - header with logo, credit box with pixel digits, queue button;
  - KARAOKE/NORMAL toggle, search field, song list with VIP badge, now playing bar;
  - payment modal (prices formatted with `Intl` in CZK).
- Sizing via `--u`. Songs data localized in `constants/songs.ts`. Purely presentational (no
  canvas yet; a slot for the background).

**Refs:** design-reference "Display content and jukebox app UI".
**AC:** both designs render at 540x960 and scale down cleanly; colours follow the config
object.
**Tests:** config to CSS variable mapping, modal visibility, digits rendering.
**Deps:** W1-2.

### W4-3 · Lava lamp + display compare
**Prompt:**
- `useLavaLamp` canvas renderer (40 blobs, 3 tiers, keyframe paths, separable box blur, alpha
  threshold); pixel mode (low-res + pixelated upscale, 20-step posterize, glitch tearing,
  scanline/checker overlay) and glass mode (CSS blur). Fps caps 12/24, paused when `isPaused`.
- `DisplayCompare`: both designs stacked with a draggable split handle (use-gesture, keyboard
  arrows) labelled PIXEL / ORIGINAL.
- Mounted inside `ProjectedScreen` on pages 1-2, section from `mode`.

**Refs:** design-reference "Lava lamp", "Display content".
**AC:** the projected display shows animated backgrounds behind both designs with a working
split; nothing animates when off-screen.
**Tests:** blob path sampling, posterize, glitch scheduling with fake timers, split clamp +
keyboard.
**Deps:** W4-2, W3-3.

---

## E5: Configurator

### W5-1 · Config store + schema
**Prompt:**
- `src/features/configurator/model/`: typed `GROUPS` schema (designs x sections, control kinds
  colour/range/switch with min/max/step) and defaults.
- zod `JukeboxConfig` schema in `packages/shared` (used by the contact API to validate the
  attachment).
- zustand store with `persist` (versioned key, migration, try/catch storage): current design,
  section, payment-modal flag, `setValue`, `resetCurrent`, `importJson` (validated, typed
  errors), `exportJson`, `exportCss` (`:root` + `.mode-sing` blocks), `isAttached` /
  `setAttached`, `toAttachment()`.

**Refs:** design-reference "Configurator".
**AC:** JSON export/import round-trips; invalid JSON yields a translated error; CSS export
matches the prototype format.
**Tests:** schema validation, round-trip, migration, CSS generator, storage failure.
**Deps:** W0-1.

### W5-2 · Configurator UI
**Prompt:**
- `ConfiguratorSection` for page 3:
  - Radix accordions per group (first 3 open);
  - controls: `ColorControl` (native picker + hex field with revert + toast), swatches, range
    via Radix Slider, switch;
  - top section/design toggles, payment-modal switch;
  - actions: attach to e-mail, reset, copy JSON, copy CSS, import JSON panel; toasts.
- Desktop: 3 columns around the projected screen (the live `PixelJukeboxUi` / `GlassJukeboxUi`
  inside `ProjectedScreen` with `calm`). <= 900px: bottom sheet (`Dialog` variant, slide up,
  sticky Done).
- All labels translated live; "attach" scrolls to contact.

**Refs:** design-reference "Configurator", bugs 4 and 8.
**AC:** every control updates the projected screen live; attach state is reflected in the
contact form; language switches live; fully keyboard operable.
**Tests:** each control, hex validation, actions + clipboard fallback, bottom sheet.
**Deps:** W5-1, W4-3.

---

## E6: Venues

### W6-1 · Venues frame + carousel
**Prompt:**
- `constants/venues.ts`: typed data with ISO dates, i18n notes, colours, `photos[]` through
  vite-imagetools (AVIF/WebP `srcset`), generated tinted placeholder images until real photos
  arrive.
- `VenuesSection`: pixel heading snapped to the stage grid; frame sized to whole grid cells
  (landscape 16/9, portrait 4/5).
- Navigation:
  - vertical venue track (.7s easing);
  - horizontal photo strip with use-gesture swipe (6px start, rubber band x0.3, commit
    `min(60px, 15%)`);
  - photo dots, pixel chevrons, tabs.
- Keyboard: arrows switch photos and venues; tabs are a proper tablist. Dates formatted with
  `Intl`.

**Refs:** design-reference "Venues".
**AC:** swipe, dots, chevrons, tabs and keyboard all navigate; the frame snaps to the grid at
any viewport; images lazy-load with explicit dimensions.
**Tests:** grid snapping maths, swipe commit/rubber band, keyboard map, date formatting per
locale.
**Deps:** W2-4, W1-1.

### W6-2 · Venue band, scramble, lightbox
**Prompt:**
- `VenueBand` canvas: diagonal pixel band in the venue colour with twinkle; venue name as pixel
  text with scramble from `#%&@0123456789XZKW` (2 chars per 70 ms); torch tint. 30 fps, active
  only on page 4.
- `Lightbox` on `Dialog`: open on tap (not after drag), arrows, swipe, ESC, focus restore,
  counter, alt text.

**Refs:** design-reference "Venues", bug 3.
**AC:** switching venue replays the scramble; the lightbox is fully keyboard and screen-reader
usable.
**Tests:** scramble sequence with fake timers, band geometry, lightbox navigation + ESC + focus
restore.
**Deps:** W6-1.

---

## E7: Contact

### W7-1 · Contact API service
**Prompt:**
- `packages/shared`: `ContactRequest` zod schema (name, venue, email, message optional, locale,
  `config` optional `JukeboxConfig`, honeypot, `startedAt`).
- `apps/contact-api` (Hono + `@hono/node-server`):
  - routes: `GET /api/contact/challenge` (ALTCHA via `altcha-lib`, HMAC key from env),
    `POST /api/contact` (verify ALTCHA, schema, honeypot, min fill time 3s, body cap 32 KB,
    per-IP token bucket), `GET /health`;
  - nodemailer SMTP transport from env (`SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`,
    `MAIL_TO=business@svanda.fun`);
  - mails: an internal mail with Reply-To the visitor and `config.json` attached; a localized
    confirmation mail to the visitor (cs/en/sk templates, plain text + simple HTML, all values
    escaped);
  - stable error codes (`contact.invalid`, `contact.rate_limited`, `contact.captcha_failed`,
    `contact.send_failed`); pino logs without PII; zod-parsed env (crash on invalid).
- Non-root multi-stage Dockerfile.

**Refs:** design-reference "Contact", "Configurator" (payload).
**AC:** a valid request sends both mails (verified with a fake transport); bots (honeypot, too
fast, bad captcha) and floods get the right error codes; no PII in logs.
**Tests:** route tests via `app.request` covering every error code, rate limiter, templates
(escaping), env parsing.
**Deps:** W0-1.

### W7-2 · Contact form UI
**Prompt:**
- `ContactSection` per design: react-hook-form + the shared schema; fields with `Field`; ALTCHA
  widget (self-hosted script, solved on submit).
- Config attachment row bound to the configurator store (attach/remove, "attached" state).
- Privacy notice link next to submit. States idle / submitting / sent / error with `aria-live`
  and translated error codes.
- `VITE_CONTACT_API_URL` defaults to same-origin `/api`. Dev proxy to the local contact-api.

**Refs:** design-reference "Contact".
**AC:** happy path shows the sent state; server errors show a translated message and keep input;
works without the configurator ever being opened.
**Tests:** validation messages per locale, submit success/failure with mocked fetch, attachment
toggle; Playwright happy + error path with `page.route`.
**Deps:** W7-1, W5-1, W1-2.

---

## E8: Legal & consent

### W8-1 · Legal identity + legal pages
**Prompt:**
- `constants/legalIdentity.ts`: trade name SVANDA, operator legal name (`TODO`), status
  "foreign natural person, sole trader", IČO 24020923, registered seat Nové sady 988/2,
  602 00 Brno - Staré Brno, DIČ (`TODO` or "not a VAT payer"), contact business@svanda.fun,
  privacy contact.
- Prerendered routes per locale:
  - imprint (`/pravni-informace`, `/en/legal`, `/sk/pravne-informacie`);
  - privacy policy (GDPR art. 13: controller, contact form purpose and legal basis, retention,
    analytics (Umami, cookieless, legitimate interest, opt-out), processors Hetzner + Google
    Workspace, transfers, rights, ÚOOÚ complaint);
  - cookie policy (categories, the consent cookie, future marketing).
- Content in per-locale Markdown rendered by a small component, all marked for lawyer review.
  Footer links wired. A build-time check warns while any `TODO` remains.

**AC:** all legal pages prerender in cs/en/sk and are reachable from the footer; identity shows
from one constants file.
**Tests:** routes render, footer links, TODO detector.
**Deps:** W0-3, W2-2.

### W8-2 · Consent manager
**Prompt:**
- `vanilla-cookieconsent` v3 wrapped in `src/features/consent/`: categories necessary
  (read-only), analytics (Umami opt-out, default on as cookieless legitimate interest, disclosed),
  marketing (default off); cs/en/sk texts; consent revision number; banner + preferences modal
  styled with tokens.
- Footer "Cookie settings" reopens preferences.
- `whenConsented(category, load)` loader for future marketing scripts; `useConsent` hook.
- Changing the locale updates banner language.

**AC:** first visit shows the banner; reject-all keeps marketing off and records the choice;
preferences reopen from the footer; no marketing script can load without consent.
**Tests:** gate helper, hook, banner flows in Playwright (accept, reject, reopen).
**Deps:** W8-1.

---

## E9: Analytics & metrics

### W9-1 · Analytics client
**Prompt:**
- `src/lib/analytics/`: typed event catalogue and `track(event, props)` over the Umami tracker
  (self-hosted script from `stats.svanda.fun`, `data-website-id` from env, loaded only in
  production builds); disabled when analytics consent is withdrawn or DNT is set.
- Page views per route + locale; section views from stage page changes.
- Events: `cta_click`, `language_change`, `theme_change`, `configurator_open`,
  `configurator_change` (debounced), `configurator_export`, `configurator_attach`,
  `venue_view`, `lightbox_open`, `contact_submit_success`, `contact_submit_error` (error code
  only).
- Web vitals (LCP, INP, CLS) via `web-vitals`, and client error counts (message hash only, no
  PII).

**AC:** in a production preview with a mocked tracker, each interaction emits exactly one typed
event; withdrawing consent stops all calls.
**Tests:** catalogue typing, consent/DNT gating, debounce, vitals reporter, error hashing.
**Deps:** W8-2, W7-2, W5-2.

---

## E10: SEO, quality, infra

### W10-1 · SEO
**Prompt:**
- Per-route `meta` exports: title, description, canonical, `hreflang` alternates (cs/en/sk +
  x-default), Open Graph + Twitter card with a pixel-brand OG image (1200x630, generated once and
  committed per locale).
- JSON-LD `Organization` + `Product` (jukebox).
- `sitemap.xml` + `robots.txt` generated at build from the route list.
- Favicons + web manifest from `uploads/jukebox-design/images/`.
- 404 route. `noscript` content with headings and copy.

**AC:** Lighthouse SEO 100 on all locale pages; sitemap lists all prerendered routes; validators
accept JSON-LD.
**Tests:** meta builder, sitemap generator, hreflang completeness.
**Deps:** W8-1.

### W10-2 · Performance + accessibility hardening
**Prompt:**
- Lighthouse CI in the workflow with budgets: LCP < 2.5s, CLS < 0.1, TBT budget, initial JS
  (without the 3D chunk) under a stated size on mobile.
- Review chunking (3D, configurator, venues lazy), image weights, font preloads.
- `@axe-core/playwright` on every route in both themes.
- Full keyboard e2e through the whole page; reduced-motion e2e (static hero, instant paging);
  contrast check for both themes and both accents.
- Fix what fails.

**AC:** CI enforces the budgets and axe; all specs green.
**Tests:** the new e2e suites and Lighthouse assertions.
**Deps:** W2-1 to W9-1 (all of E2 to E9).

### W10-3 · Infra + deploy
**Prompt:**
- `infra/docker-compose.web.yml`: `contact-api` (built image), `umami` (pinned) + `umami-db`
  (Postgres, volume, not host-exposed), on an external network shared with the Manager Caddy.
- `infra/caddy/svanda-web.caddy`:
  - `svanda.fun` serves `/var/www/svanda-web` with `try_files` for prerendered routes,
    `/api/*` proxied to contact-api;
  - `www.svanda.fun` 301 to the apex; `stats.svanda.fun` proxies to umami;
  - security headers: HSTS, CSP allowing only self + stats, no inline scripts, frame-ancestors
    none, Referrer-Policy, Permissions-Policy;
  - caching: immutable for hashed assets, no-cache for HTML.
- `.github/workflows/deploy.yml` on push to `main` after CI: build, rsync `dist` (atomic
  release dir + symlink), compose pull/up, health checks, rollback step documented.
- `infra/RUNBOOK.md`:
  - Manager prerequisites: Caddyfile `import /etc/caddy/sites/*.caddy`, shared docker network.
  - DNS at WEDOS: apex A/AAAA, www, stats.
  - Mail: SPF/DKIM/DMARC; Google Workspace SMTP relay or app password for the sender mailbox.
  - Operations: Umami admin setup, an uptime monitor for `/` and `/api/health`, backup of
    `umami-db`.

**AC:** a dry-run deploy to the box (or a local compose with Caddy) serves all locales, the
contact endpoint and stats; headers pass securityheaders.com grade A.
**Tests:** compose and Caddy config validation in CI (`docker compose config`, `caddy validate`).
**Deps:** W7-1, W9-1.

---

## E11: Launch (manual, not in the auto-implement chain)

### W11-1 · Launch checklist
- Supply the operator legal name and DIČ in `legalIdentity.ts`.
- Real venue list, photos (with consent of people pictured) and social links.
- Native Slovak review of `sk.json` and legal pages; lawyer review of the legal texts.
- Merge the Manager Caddy prerequisite; create DNS records; SPF/DKIM/DMARC live.
- Live SMTP test to business@svanda.fun incl. visitor confirmation; Umami admin password and
  website id set; uptime monitor on.
- First production deploy verified in all locales and both themes.
