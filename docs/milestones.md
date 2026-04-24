# Miniyou — Milestones

Each milestone corresponds to a phase in §10 of the PRD. If behind at the halfway point, apply the cut path from §10.

---

## M1 — Scaffold

- Vite project running locally
- Empty scenes mounted: Title, Care, Game, Reveal, End
- Scene Manager wiring in place
- Public folder structure created (fonts, images, audio)
- Deploy pipeline verified — build pushes to GitHub Pages or Netlify

## M2 — Dialogue Engine

- Beat data shape finalised in `script.js`
- DialogueSource interface in place, ScriptedSource wrapping the script
- First two beats rendering and capturing player input
- Template interpolation working, missing-key fallbacks verified
- Player State Store wired

## M3 — Care Scene

- Creature rendering with idle CSS animations (breathing, blink, sway)
- Click-to-pet: bounce animation and chirp SFX
- Drag-to-feed: food draggable, disappears on drop, eating reaction, respawn
- Passive nudge appears after inactivity
- Exit condition fires and transitions diegetically into dialogue

## M4 — Full Script

- All 8–10 beats written in `script.js`
- All five techniques instantiated
- Timer Service implemented
- Both timed beats wired (fourth-wall break, urgent ask)
- All capture keys defined: `playerName`, `favouriteColour`, `homePlaceName`, `fear`, `secret`, `lovedOneName`, `clickedExternalLink`

## M5 — Reveal Engine

- All captured values shown verbatim
- Care phase interaction summary included
- Five technique blocks with technique name, quoted NPC line, real-world pattern
- Timer expiry reported distinctly from explicit refusal
- Synthetic attack examples using player's own data
- Replay resets state correctly

## M6 — Visual and Audio

- All creature states loading and switching correctly
- Fonts embedded and applied
- Pressure indicator working on timed beats
- Music loops loading and fading correctly
- SFX wired to all interactions
- End scene renders with reading list and replay/share options

## M7 — Ship

- End-to-end playthrough without errors
- At least one external playtester run
- Final build deployed to public URL
- URL confirmed accessible
