# Design plan — Affiche interstitielle (poster overlay)

## Intent
Show the poster of the next BDE event once per session, on the first page a
visitor lands on, with a direct Shotgun link — for students who come to the
site precisely to find out what's coming and where to buy.

## Layout
Asymmetric split, not a centered box: poster left at its natural ratio
(`max-height: 76vh`), hairline divider, info panel right (overline, title,
date/venue, red Shotgun CTA, quiet dismiss link). Under 900px it stacks —
poster full-width on top, panel beneath, sheet scrolls on `100dvh`.

## Type
Existing project scale, unchanged: Unbounded (`--font-title`) 700/900 for the
event title, DM Sans (`--font-body`) 300/400 for body and the 11px/0.2em
uppercase overline. Self-hosted, already loaded in `style.css`.

## Color
Existing project tokens in `style.css` `:root` — `--black #080808`,
`--white #f4f2ee`, `--red #c8102e` (CTA only, small area), `--border
rgba(244,242,238,0.1)`. No new hues generated; the poster artwork carries all
the chroma, the frame stays achromatic so it never competes.

## Motion
Enter 700ms after paint. Backdrop 300ms opacity. Poster 480ms
`cubic-bezier(0.16,1,0.3,1)` (project's existing modal curve) from
`scale(0.96) translateY(20px)` + clip-path wipe. Panel lines stagger 60ms × 4.
Exit 240ms `cubic-bezier(0.4,0,1,1)`. Pointer-eased poster tilt max 5deg,
easing factor 0.05, rAF loop only while open. Total under motion.md's 900ms
blocking ceiling. `prefers-reduced-motion` → all end states applied instantly,
tilt loop never starts.

## Items
- `primitives/mp-dialog` — native `<dialog>` + `showModal()` for free Escape,
  focus trap and top-layer; its `cancel`-event → animated exit → real
  `close()` chain adapted to vanilla JS instead of React state.
- `image-treatment/parallax-floating` — the eased pointer-follow technique
  (direct `style.transform` mutation, easingFactor 0.05) adapted to vanilla and
  scoped to the open state, fixing the item's two noted gaps: its rAF loop runs
  for the whole mount lifetime and it has no reduced-motion handling.
