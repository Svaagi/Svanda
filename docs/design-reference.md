# Design reference

What the Claude Design export in [`design/reference/`](../design/reference/) does, with line
references, so each ticket can port behaviour without reverse-engineering the prototype. The
prototype is a **reference, not code to copy**: it runs on a design-tool template runtime
(`{{ }}` bindings, `<sc-for>`, `<x-import>`, `support.js`, not included) and on three.js r128.

Line refs: `web:` = `Svanda Web.dc.html`, `stage:` = `svanda-stage.js`,
`konf:` = `jukebox-konfigurator.html`.

## Files

| File | LOC | Role |
| --- | --- | --- |
| `Svanda Web.dc.html` | 620 (template 1-235, script 236-617) | The page |
| `svanda-stage.js` | 408 | `<svanda-stage>`: intro, swarm, hero grid, 3D jukebox, page paging |
| `jukebox-konfigurator.html` | 809 | 2D colour configurator for the **jukebox app UI** + display mode |
| `Svanda Logo Manual.dc.html` | 231 | 7-page logo manual (construction, clear zone, colours, misuse) |
| `Svanda Mobile.dc.html` | 41 | Phone mockup iframing the page; not a separate design |
| `jukebox.obj` | 763 KB | The only 3D model |
| `cursor-*.png` | | Pixel cursors (arrow/hand/text, default + magenta) |
| `screen-jukebox.png`, `screen-karaoke.png` | | Unreferenced screen renders |
| `uploads/jukebox-design/` | | Original app palette, CSS, JetBrains Mono woff2, logo, images |
| `screenshots/` | | Iteration screenshots |

Design-tool props (`web:236`) collapse to production values: theme dark default + light kept;
accent **orange** (magenta forced on page 2, `web:538`); pixel cursor on (`pointer: fine` only);
locales cs/en in the design, **cs/en/sk** in production; hero background **variant A** only;
intro mode **session**.

## Global behaviour

- `html{scroll-snap-type:y proximity}` (`web:13`). CSS var defaults on `:root` (`web:15`).
- Pixel cursor: `html[data-cursor="on"|"magenta"]`, PNG cursors with hotspots arrow `1 1`,
  hand `9 1` (a, button, [role=button], label), text `7 13` (input, textarea) (`web:22-29`).
  `applyBg()` (`web:505`) sets magenta on page 2.
- Theme tokens `DARK` / `LIGHT` (`web:313-314`): bg `#050507` / `#f5f5f2`, fg, muted, dim,
  border, border2, input, tile, dotOff, capFg, capBg, menuBg, navRgb, borderRgb, accent, accent2,
  onAccent.
- `ACCENTS` (`web:346-364`): each accent has dark `d`/`d2` and contrast-safe light `l`/`l2`.
  Ship orange (`#ff9a3c`/`#ffb46e`, light `#b5520a`/`#8d3f06`) and magenta only.
- Wordmark letter colours `#b6ff4d #3ee6ff #ff9a3c #ff4fd8 #7a5cff #5ff5e0`; light variants
  `web:245`.
- Breakpoints: `mobile = innerWidth < 1040`, `portrait = innerHeight > innerWidth` (`web:393`).
- Persistence in the design: `svanda-lang`, `svanda-theme`, `svanda-cfg-attach`,
  `svanda-jukebox-barvy-v1` (localStorage), `svanda-intro-seen` (sessionStorage).
- `go(p)` (`web:526-533`): scroll to `p * wrapHeight / 5`, smooth, close menu.

## Nav (`web:35-65`)

- Fixed, 64px, grid `minmax(0,1fr) auto minmax(0,1fr)`. Slides in with
  `translateY((1 - var(--sv-nav)) * -64px)`. Background `rgb(navRgb / 0.92 * --sv-logo)`, border
  alpha `--sv-logo`.
- Left: theme toggle (30x28, 5x5 SUN/MOON pixel icon in 3px cells, `web:243, 613`) and items
  Karaoke, Jukebox, Custom. Centre: DOM pixel logo 36x5 cells, opacity `--sv-logo`, links to top
  (`web:44-48, 541-542`). Right: Venues, Contact, CS/EN segmented switch (active = accent bg,
  `web:56-59`), MENU/CLOSE button on mobile (`web:60-62`).
- Staggered centre-out reveal: opacity `clamp(0, (--sv-menu - d) / 0.35, 1)` with
  `d = [0.225, 0.075, 0, 0.075, 0.225]`. Silkscreen 16px uppercase.
- Mobile (<1040): side items hidden; full-screen menu `inset:64px 0 0`, `menuBg`, 32px/600 links
  (`web:67-73`).

## Scroll stage (`web:75-189`, `stage:224-254`)

- `#top` is `height:500svh` with a sticky `100svh` viewport and 5 snap anchors at
  0/100/200/300/400svh (`web:184-188`). Contact follows as a normal section.
- **Pages are discrete.** `onScroll` targets `round(scrollY / pageHeight)` and tweens `vp` over
  **1100 ms easeInOut** (`stage:250`); dispatches `{type:'page', page}` (page 5 = contact).
- Wheel paging (`stage:onWheel`, non-passive): blocked until intro ready; native inside contact;
  one gesture = one page, requires >= 500 ms wheel silence before and >= 1500 ms since last turn.
  Touch relies on scroll-snap.
- Layer visibility: opacity `clamp(0, 1 - |vp - k| * 2.2, 1)` (venues x1.8); pages 1 and 2 also
  `translateX((vp - k) * -/+90px)`. `pointer-events` only on the active page (`web:549`).

| # | Page | Layout |
| --- | --- | --- |
| 0 | Hero (`web:77-83`) | Stage fills viewport. Overlay bottom-centre (`bottom: clamp(40px,8vh,72px)`, max 560px): tag "KARAOKE JUKEBOX" (accent 15px) + CTA (40px, 2px accent border, hover fill, goes to page 1). Opacity `--sv-hero * (1 - vp * 2.5)`. No h1 in the design: add a visually hidden one. |
| 1 | Karaoke | Landscape (`web:107-115`): left half, `pixelWord("KARAOKE")` orange scaled .6, title `clamp(40px,4.4vw,84px)`/700/-0.035em max 13ch, body muted `clamp(17px,1.3vw,24px)`; model right. Portrait (`web:86-93`): heading top, body bottom, model between, title hidden. |
| 2 | Jukebox | Mirror of Karaoke (text right, model left), heading magenta; portrait `web:95-104`. |
| 3 | Custom `#custom` (`web:127-129`) | Configurator full-bleed below nav; model face-on; configurator places the live screen over the model's display. |
| 4 | Venues (`web:133-182`) | See Venues. |

Copy for pages 1 and 2: `COPY` (`web:323-344`): p1Tag/p1Title/p1Body, p2Tag/p2Title/p2Body.
Unused design keys (heroTitle, heroSub, p1Cta, p2Cta, p3*, venTitle) are dropped unless a ticket
says otherwise.

## Stage timeline (`stage:39`, times in seconds)

| t | Phase | Ref |
| --- | --- | --- |
| 0-3.2 | **Intro pixels.** Grid `CELL = clamp(8..24, (W-40)/36)`; palette noise quantised to block size 3, then 2 (1.0s), then 1 (1.7s); colours re-roll at 7 Hz; density drops after 1.3s; each cell locks at 1.35-2.45s (non-logo +0.15s); logo cells flash white 0.12s then take letter colour; non-logo cells fade 0.25s | `stage:260-272` |
| 3.2-3.5 | Noise remnant without logo | `stage:386` |
| 3.2-4.92 | **Swarm.** Each logo cell flies a quadratic Bezier (random arc, control point above) to the nav logo slot; delay by column + seed; 0.85s easeInOut; 3 ghost trails at alpha 0.25/k; size lerps CELL to nav cell size | `stage:273-284` |
| 3.8-4.3 | `--sv-nav` 0 to 1 | `stage:391` |
| 4.4-5.2 | `--sv-menu` 0 to 1 | |
| 4.6-5.5 | Solid overlay fades, hero grid fades in | `stage:381-384` |
| 4.75-6.05 | **3D jukebox rises** from y -900, easeOutBack, spin-in yaw +1.4 rad decaying, tilt | `stage:340-369` |
| >= 4.92 | `--sv-logo = 1` (DOM logo replaces swarm) | |
| 5.6-6.3 | `--sv-hero` 0 to 1 | |
| 6.5 | Ready: scroll unlocks, `{type:'ready'}` | `stage:398` |

Intro modes (`stage:55-59`): `skip` (t0 shifted by 6.7s), `session` (skip when
`sessionStorage['svanda-intro-seen']`), `always` (locks `html{overflow:hidden}` until ready).
Production uses **session**; reduced motion jumps to the final state.

CSS vars written only on change (`stage:390-394`): `--sv-vp` (page layers), `--sv-hero` (hero
overlay), `--sv-nav` (nav translate), `--sv-menu` (nav items), `--sv-logo` (nav bg/border/logo).

## Hero background (`stage:286-332`, variant A `stage:33-37`)

- Grid of cells size `BGC`. **Variant A twinkle:** 34% of cells blink on a random 2.5-7.5s
  period, 0.08s attack, about 1s quadratic decay.
- Ghost wordmark: logo at 2 x BGC per module (1x portrait), grey left-to-right gradient,
  brightened by twinkle, fades with `vp * 1.6`.
- **Pixel torch:** radius 240px around pointer/finger, alpha quantised to 4 steps with hashed
  dither, alpha .22 dark / .16 light.
- **Pixel floor shadow:** convex hull (monotone chain) of the cabinet base footprint plus a copy
  offset toward a 135 degree light, projected to screen, filled cell by cell (point in polygon)
  (`stage:318-330, 352-367`).
- Light theme inverts greys. Idle redraw about 20 fps (`stage:383`); nothing drawn when scrolled
  past the stage.

## 3D (`stage:153-222`)

- Loading: three r128 + legacy OBJLoader by script tag, then `jukebox.obj` (`stage:41-43, 73`).
  Production: GLB via `@gltf-transform`, loaded with drei `useGLTF`.
- Renderer: antialias, alpha, `powerPreference:'high-performance'`, **pixelRatio 1**, sRGB
  output, ACESFilmic, exposure 1.15.
- Camera: `PerspectiveCamera(28, near 50, far 8000)`, z = `max(1560, ...)`, looking at origin
  (`stage:111-114`).
- Environment: procedural PMREM softbox from 5 emissive planes, `pmrem.fromScene(es, 0.04)`.
  Production: drei `Environment` with `Lightformer`s.
- Materials (`computeVertexNormals` on all meshes):
  - `shell` `MeshPhysicalMaterial` `#030304`, metalness .25, roughness .45, clearcoat 1,
    clearcoatRoughness .12, envMapIntensity .55 (all non-display meshes);
  - `glass` metalness .7, roughness .12, clearcoat 1, envMapIntensity 1.2 (names starting
    `Display`).
- Screen planes: two `CanvasTexture` quads with `polygonOffset -4`, z+1. Main display rect
  x -101.5..99, y -120.5..226.3, z 44.9. Chin rect x -34.6..34.2, y -203.7..-133.7.
  - `drawScreen`: fill `#08080b`; on hero a pixel "S" (30px cells) colour-cycles per cell and
    fades as vp 0 to 0.6. **`stage:206-215` is dead code** (old mock UI) - do not port.
  - `drawChin`: 10-bar VU meter animated with sines.
  - Offscreen canvases: screen 380x657 (`stage:169`), chin 200x204 (`stage:175`).
- Lights: hemisphere .15; key directional .55 at (400,700,600); rim left `#d8ffe0` .7, rim right
  `#ffd0f0` .5; cyan fill .12; two cursor `PointLight`s (2.6 and .7, decay 1.6/2) following the
  smoothed pointer on hero only, plus cursor parallax tilt (`stage:333-339`). **Retune for
  physical light units** in current three.
- Motion: idle sway (sin .9 Hz); `calm` to 1 on Custom removes wobble/tilt.
- `pageState(vp)` interpolates per page: `JX`/`JY` (hero (0,20); Karaoke `visW/4`; Jukebox
  `-visW/4`; Custom centred; Venues y -1100), `YAW` [-0.45, -0.45, 0.45, 0, 0], `SCALE_L` /
  `SCALE_P`, `SPIN` [1, 0, 1, 0] (full 360 on 0 to 1 and 2 to 3).
- `fitCustom()` (`stage:120-152`): Custom fits the whole model with room above the display;
  desktop Karaoke/Jukebox scale so the display fills its half (`ss * 1.15`), cabinet off the
  bottom; portrait centres the model between the DOM heading and body (measured).
- No shadows, no postprocessing, no orbit controls.
- Perf: render capped about 30 fps while nothing moves (`stage:403`).
- Screen quad event `{type:'screen', x, y, w, h, calm, vp, pts:[tl,tr,br,bl]}` in client px,
  deduplicated (`stage:370-377`). Production: write to the stage store.

## Projected display (`web:131, 508-524`)

A 540x960 element with `transform-origin:0 0` is warped onto the 3D screen quad by a
**`matrix3d` homography** (`placeDisp`). Visible for vp 0.8 to 2.2 (pages 1-2); mode `sing`
when vp < 1.5 else `listen`; paused when hidden; clickable only when visibility > 0.9.
Production: an in-tree React component (`ProjectedScreen`), not an iframe.

## Display content and jukebox app UI (`konf:223-236, 491-519, 771-785`)

The screen shows the **jukebox app's song-queue UI**, not lyrics, in two designs:

- **Pixel** (`pixelMarkup`, `konf:491-503`): pixel S logo, credit box with CSS-grid pixel digits
  (120 / 40 Kc), queue button, KARAOKE/NORMAL toggle, search, song list (7 songs per mode,
  `SONGS` `konf:391-394`, VIP badge), now playing bar, payment modal ("Add for 10 CZK / VIP for
  20 CZK").
- **Glass** ("Puvodni", `glassMarkup`, `konf:505-519`): pill glass equivalents with initials
  thumbnails.
- Sizing via `--u = width / 540` px.
- Display mode: both designs stacked, glass clipped with `clip-path: inset(0 0 0 var(--split))`;
  draggable vertical split handle labelled PIXEL / PUVODNI (before/after compare).

### Lava lamp (`konf:556-653`)

40 radial-gradient blobs in 3 tiers on 8-keyframe paths, 2-pass separable box blur, alpha
threshold `a * 60 - 22`. Pixel design: low-res canvas (about 45x80) upscaled with
`image-rendering:pixelated`, 20-step posterize, glitch tearing (row shifts + accent strips every
2.2-5.7s for 220-400 ms), scanlines + 4px checker overlay (`.px-fx`, `konf:128`). Glass design:
canvas about 90x160 with CSS `blur()` (inset -20px). 12/24 fps.

## Configurator (`konf:305-805`)

- Config shape: 2 designs (`pixel`, `glass`) x 2 sections (`sing` = Karaoke, `listen` =
  Normal); defaults `konf:310-323`.
- `GROUPS` schema (`konf:332-389`), rendered as accordions (first 3 open, `konf:425-471`):

| Design | Group | Controls |
| --- | --- | --- |
| Pixel | Background | `base`, `blob1`, `blob2`, `blob3` (colour), `blobAlpha` (0-1) |
| Pixel | Effects | `animate` (switch), `speed` (0.2-3x), `pixel` (6-30px), `glitch`, `scan` (switches) |
| Pixel | Buttons & accent | `acc`, `accInk`, `btnLine`, `vip` |
| Pixel | Song list | `panelA`, `rowA`, `rowLine`, `txt`, `now`, `modalA` (0.3-1) |
| Glass | Background | as pixel |
| Glass | Effects | `animate`, `speed`, `blur` (0-30px) |
| Glass | Buttons & accent | `acc`, `glassA` (0-0.5), `vip` |
| Glass | Song list | `panelA`, `rowA` (0-0.5), `txt`, `now`, `modalA` |

- Colour = native picker + hex field (`/^#?[0-9a-f]{6}$/i`, invalid reverts + toast). Swatches
  for `acc` and `now` (`SWATCHES`, 10 colours, `konf:325`).
- Top switches (`konf:272-287`): section Karaoke/Normal, design Pixel/Original. Extras: "show
  payment window" switch; actions: attach to e-mail (primary), reset current design+section,
  copy JSON, copy CSS variables (`cssFor`, `konf:709-732`: `:root` and `.mode-sing` blocks),
  import pasted JSON. Toasts clear after 3.2s.
- Desktop layout: 3 columns `340 | screen | 340`, the screen positioned over the model's display.
  <=900px: bottom sheet (max-height 58%, slide .28s) opened by "Edit colours", sticky "Done".
- Attachment payload (`web:379`):

```
{ pixel: { sing:   {base,blob1,blob2,blob3,blobAlpha,animate,speed,pixel,glitch,scan,
                    acc,accInk,btnLine,vip,now,txt,panelA,rowA,rowLine,modalA},
           listen: {...} },
  glass: { sing:   {base,blob1,blob2,blob3,blobAlpha,animate,speed,blur,
                    acc,vip,now,txt,glassA,panelA,rowA,modalA},
           listen: {...} } }
```

- i18n in the design: `EN` dictionary keyed by Czech source strings (`konf:329-331`).

## Venues (`web:133-182, 370-378, 407-491, 585-601`)

- Data `VENUES` (`web:316-322`, 6 demo venues: name, city, date, cs/en note) and `VEN_COLORS`
  (`web:315`). Dates become ISO in production.
- Heading: `pixelHead(venTag, BGC/2, cols*2, activeColor)` (`web:268-289`), 4-wide `GLYPH`
  (`web:247-264`), falls back to 3x5 `NARROW_G` and wraps; diacritics via `DIA`; cells transition
  colour .4s; snapped to the stage grid (`web:424-429`).
- Frame: landscape 16/9, width `min(100%, (100svh-64px-2vh-190px-70px)*16/9*1.25, 1750px)`;
  portrait 4/5 edge to edge (`web:583`). Resized to whole background cells and translated onto
  the stage pixel grid (`web:407-423`), publishing `--bg`, `--ax`, `--fw`, `--fh`.
- Track: vertical `translateY(-active * 100%)`, `.7s cubic-bezier(.7,0,.25,1)` (`web:143`).
- Slide (`web:145-164`): tint gradient fallback; strip of 5 photos `translateX(-photo*100% +
  dragX)`, `.5s cubic-bezier(.65,0,.35,1)`; two dark gradient overlays; band canvas; note/city
  label; 5 square photo dots top right.
- Prev/next venue: 5-square pixel chevrons on top/bottom edges with enlarged hit areas
  (`web:167-168`). Tabs: 6 buttons (4px colour bar, number, 11px name) (`web:170-180`).
- `activate(i)` (`web:370-378`): reset photo, run scramble (`scr += 2` every 70 ms).
- Swipe (`web:585-601`): `touch-action:pan-y`, drag after >6px x, pointer capture, rAF throttled,
  rubber band x0.3 at ends, commit threshold `min(60px, 15% width)`, tap (<8px) opens lightbox.
- Band canvas (`web:432-491`): diagonal pixel band in venue colour with twinkle, venue name as
  pixel text with **scramble** from `GLYPHS = '#%&@0123456789XZKW'` resolving left to right,
  torch tint; 30 fps, only on page 4; DOM arrows/dots torch-tinted via inset box-shadow
  `color-mix` (`web:493-501`).
- Lightbox (`web:230-235`): fixed `rgba(5,5,8,.94)`, contain-fit image, X button, click closes.
- 30 photo slots `venue-{1..6}-{1..5}`, all empty in the design: placeholders until real photos.

## Contact (`web:191-228, 380-384, 607`)

- `min-height:100svh`, snap start, grid `repeat(auto-fit, minmax(min(100%,340px),1fr))`.
- Left: tag, h2 `clamp(30px,3.4vw,42px)`, body. Fields: name (required), venue + city
  (required), e-mail (required, full width), message (4 rows, optional), hidden config.
- Config attach: dashed "+ Add configuration to e-mail" button; when attached, an accent row
  "Jukebox colour configuration attached" + "Remove".
- Sent state: 2px accent box "Thanks, we'll be in touch." The design posts nowhere.
- Footer: "(c) 2026 SVANDA · Karaoke jukebox", Instagram, YouTube (both `#` in the design).

## Pixel typography (`web:237-310`)

`BITMAP` 36x5 wordmark; `GLYPH` 4-wide (V, N, M, W, Y 5-wide) letters, digits, `.`, `&`;
`NARROW_G` 3x5; `DIA` diacritic map; `pixelWord` (per-letter colours), `pixelHead` (wrapping,
narrow fallback), `pixelCq` (container-query units); `SUN` / `MOON` 5x5 icons. Logo manual:
clear zone 3 modules, minimum size 25 mm / 108 px.

## OBJ structure

No `mtllib`, no UVs, triangles `f v//vn`. Totals v 7741, vn 4006, f 15520.

| Object | v | f |
| --- | --- | --- |
| `Jukebox_Case` | 7549 | 15324 |
| `Display_Main` | 96 | 98 |
| `Display_Chin` | 96 | 98 |

Bounding box x +/-122, y +/-241.6, z +/-45.2 (front face z about 44.9). Materials assigned by
mesh name.

## Known design bugs (fix, don't port)

1. Nav logo cell size uses the 1040px breakpoint while the swarm uses `W < 720`, so between 720
   and 1039px the swarm lands at the wrong size (`web:540` vs `stage:88`). Use one breakpoint.
2. Anchors `#karaoke`, `#jukebox`, `#pobocky` have no targets; only `#top`, `#custom`,
   `#kontakt` exist. Give every page a real id.
3. Lightbox: no ESC, no focus trap, no focus restore. Mobile menu: same.
4. The configurator doesn't switch language live (`konf:781-800`).
5. Dead code in `drawScreen` (`stage:206-215`) and unused copy keys.
6. Contact form posts nowhere.
7. No h1; meaningful canvas text has no text equivalent.
8. `--head-h` is never set in the Custom layout (`konf:744-754`).

## Effects index

| Effect | Ref |
| --- | --- |
| Intro pixel resolve + lock + white flash | `stage:257-272` |
| Wordmark swarm with ghost trails | `stage:273-284` |
| Hero twinkle grid + ghost wordmark | `stage:286-306` |
| Pixel torch | `stage:307-317`, `web:446-464, 493-501` |
| Pixel floor shadow | `stage:318-330, 352-367` |
| 3D rise, spin-in, page spins, sway, cursor tilt, cursor lights | `stage:340-351` |
| Colour-cycling pixel S, VU meter chin | `stage:190-222` |
| Page crossfade + horizontal parallax | `web:86-133` |
| Staggered nav reveal | `web:35-55` |
| `matrix3d` projection onto the 3D screen | `web:508-524` |
| Pixel text, scramble | `web:268-310, 370-378, 465-486` |
| Venue pixel band + grid snapping | `web:407-457` |
| Lava lamp, posterize, glitch, scanlines, glass blur | `konf:127-163, 556-653` |
| Pixel bevels, offset shadows, `steps(2)` switch knob | `konf:47-158` |
| Split compare | `konf:228-236` |
