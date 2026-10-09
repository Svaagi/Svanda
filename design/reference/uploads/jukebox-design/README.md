# Jukebox – Design Export

Design-only extract from the jukebox app (UI), for reuse in another configurator/tool. No app code, no song media.

## Contents

- `styles/` — all CSS files from the app (global styles + per-feature: control panel, numeric keypad, lava lamp background, search bar, player, start screen).
- `images/` — logo, decorative images (disco, lemon), favicon, app icons (192/512).
- `fonts/` — JetBrains Mono (weights 400/700/800) as local `.woff2` files + `fonts.css` with ready-to-use `@font-face` rules. The app also pulls Google's Material Icons font from a CDN (see `styles/index.css`), not included as local files here.
- `palette.css` — hex colors collected from all the CSS files above, named and grouped as CSS custom properties for quick reuse.

## Notes

- Body text uses `'JetBrains Mono', monospace`.
- Primary accent color is pink `#e068b2` (used for input caret and highlights); secondary accents are orange/gold and purple.
- CSS files reference class names from the original React components — treat them as a style reference rather than drop-in, since component markup won't match 1:1 in a different project.
