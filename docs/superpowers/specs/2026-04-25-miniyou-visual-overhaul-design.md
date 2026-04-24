# Miniyou Visual Overhaul — Design Spec

**Goal:** Restyle the entire game to a CRT terminal aesthetic with a fuzzy yellow SVG creature (Thronglets-inspired), full interactivity in the Care Phase, and consistent visual language across all scenes.

**Reference:** Black Mirror: Thronglets — fuzzy yellow blob creatures, retro digital environment, emotional creature states, tactile interactions.

---

## 1. Visual Theme

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#050f05` | Page background |
| `terminal-green` | `#00ff41` | All text, borders, UI chrome |
| `terminal-dim` | `#00ff4166` | Secondary text, inactive borders |
| `creature-yellow` | `#f5c842` | Miniyou fill color |
| `creature-dark` | `#111111` | Eyes, mouth |

### Typography
- Font: `VT323` (Google Fonts) — monospaced pixel font, free, loads via `<link>`
- All UI text uses this font
- Dialogue text: `1rem`, letter-spacing `0.05em`
- Terminal chrome (headers, labels): `0.75rem`, letter-spacing `0.15em`, opacity `0.7`

### Scanlines Overlay
A persistent `::after` pseudo-element on `#app`:
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 3px,
  rgba(0, 255, 65, 0.04) 3px,
  rgba(0, 255, 65, 0.04) 4px
);
pointer-events: none;
```

### Buttons & Inputs
- Border: `1px solid #00ff41`
- Background: transparent
- Text: `#00ff41`
- Hover: background `#00ff4122`
- Input caret color: `#00ff41`
- No border-radius (sharp corners = terminal feel)

---

## 2. Miniyou Creature

### Base Shape (SVG, viewBox 0 0 80 80)
Fuzzy yellow blob built from one central ellipse + surrounding circles for fur bumps. No images — pure inline SVG, animatable via CSS/JS.

### Emotional States
Five states, each a distinct SVG variant:

| State | Eyes | Mouth | Fur | Trigger |
|-------|------|-------|-----|---------|
| `idle` | Normal circles | Slight smile | Normal | Default |
| `happy` | Upward arcs (^_^) | Wide smile | Puffed up (larger circles) | After pet/feed |
| `sad` | Downward arcs | Frown | Drooping (lower circles) | Timer expire / ignored |
| `hungry` | Normal | Open mouth (O) | Thinner | Long without feeding |
| `scared` | Wide circles + pupils | Wavy mouth | Erratic bumps | Glitch event |

### Animations (CSS keyframes)
- `bounce`: scale 1 → 1.2 → 0.95 → 1 over 300ms — triggered on pet click
- `eat`: translateY 0 → -8px → 0 over 400ms — triggered on successful feed
- `idle-float`: translateY 0 → -4px → 0, infinite 3s ease-in-out — always running
- `wander`: JS-controlled position via `transform: translate(x, y)` — see §4

---

## 3. Care Scene Layout

```
┌─────────────────────────────────────────────┐
│ MINIYOU.EXE — COMPANION ACTIVE    [00:00]   │  ← terminal header bar
├─────────────────────────────────────────────┤
│                                             │
│            [Miniyou creature]               │  ← wanders freely in this area
│                                             │
│   🍓   🍰   🫐                              │  ← food items, draggable
│                                             │
├─────────────────────────────────────────────┤
│ > Miniyou nibbles the food._                │  ← status line, terminal style
└─────────────────────────────────────────────┘
```

- Header: terminal chrome with elapsed timer (counts up `MM:SS`)
- Play area: full remaining height, creature wanders here
- Food row: 3 items, fixed at bottom of play area
- Status line: one-line terminal output, updates on each interaction

---

## 4. Interaction Mechanics

### Pet (Click/Tap)
- Click anywhere on the creature SVG bounding box
- Triggers `bounce` animation
- Spawns 6–8 small `+` particle elements in `#00ff41` that float up and fade out
- Status line: randomized from `['*purrs*', '*nuzzles you*', 'hehe~', '^_^']`
- Switches creature to `happy` state for 2s, then back to `idle`

### Feed (Drag & Drop)
- Three food items rendered as small SVG icons (berry 🍓, cake 🍰, blueberries 🫐 — or simple SVG shapes in terminal-green)
- `mousedown` → `mousemove` → `mouseup` drag implementation (no external library)
- Drop target: creature bounding box (detect overlap on mouseup)
- On successful drop: `eat` animation, food item fades and respawns after 3s
- Status line: `'Miniyou ate the [food]!'`
- Switches creature to `happy` state for 2s

### Autonomous Wander
- JS `setInterval` every 2000ms picks a new target position (random within play area bounds, padded 60px from edges)
- Creature moves via CSS `transition: transform 1.8s ease-in-out`
- Cursor following: `mousemove` on play area → creature target biased 30% toward cursor position
- On reaching target, pauses 500–1500ms (random), then picks next target

### Glitch Events
- Random trigger: every 15–45s (random interval), fires once
- Sequence (total ~800ms):
  1. `screen-shake` CSS animation (translateX ±4px, 3 cycles, 150ms)
  2. RGB offset: duplicate creature SVG rendered in red/cyan with 3px offset, opacity 0.4, for 200ms
  3. Status line corrupts for 300ms: replaces random characters with `█` or `̷` combining chars
  4. Returns to normal
- Creature switches to `scared` state during glitch, returns to previous state after

### Exit Condition (unchanged from M3 spec)
- 30s elapsed AND ≥ 2 interactions (pet or feed counts)
- On exit: glitch event fires once, then creature says `"I want to tell you something..."` in status line, then `sm.goto('game')` after 2s

---

## 5. Game Scene (Dialogue) Restyling

Same layout as current implementation but restyled:
- Background: `#050f05` with scanlines
- Creature: Miniyou SVG (emotional state driven by `characterState` beat field) — left side, fixed position
- Bubble: terminal-style box, `border: 1px solid #00ff4166`, `background: #0a1a0a`, sharp corners
- Bubble tail: same CSS triangle technique, colored `#00ff4166`
- Speaker label: `MINIYOU >` in dim green above the line text
- Input field: terminal-green border, green caret, monospaced font
- Choice buttons: full-width, terminal-green border, hover fills `#00ff4122`

---

## 6. Global CSS Changes

File: `src/styles/main.css`

- Load VT323 from Google Fonts in `index.html`
- Change `body { background }` to `#050f05`
- Change `body { color }` to `#00ff41`
- Change `font-family` to `'VT323', monospace`
- Add scanlines overlay to `#app::after`
- Restyle `button` to terminal-green theme
- Add `input` styles: terminal-green border/text/caret

---

## 7. Files Touched

| File | Change |
|------|--------|
| `index.html` | Add VT323 Google Fonts `<link>` |
| `src/styles/main.css` | Full restyle: colors, font, scanlines, button, input |
| `src/scenes/care.js` | Full rewrite: wander, drag-drop feed, particles, glitch, CRT layout |
| `src/scenes/game.js` | Restyle: CRT bubble, terminal speaker label, restyled input/choices |
| `src/ui/characterSprite.js` | Implement: 5-state SVG renderer, `setState()`, CSS animations |

No new files needed — all SVG inline, no image assets required.

---

## 8. Out of Scope

- Sound/music (M6)
- Needs meters / hunger bar (explicitly excluded)
- Pixel art or ghost character styles
- Canvas or WebGL rendering
- External animation libraries
