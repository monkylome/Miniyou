# Miniyou

**An educational browser game that manipulates you — then shows you exactly how.**

Miniyou is a ~5 minute interactive experience built for the AntIhackathon. You meet a small pixel creature, care for it, and then it starts talking. Over six dialogue beats it applies five real social-engineering techniques to extract personal information from you. When the conversation ends, the game breaks character and replays every technique back to you, quoting your own answers alongside the real-world attack each one mirrors.

Nothing you type leaves your browser. All state lives in a plain in-memory object and is destroyed on reload.

---

## Quick start

Requires **Node.js 18+**.

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # static bundle into dist/
npm run preview  # serve the built bundle locally
```

The build is fully static (`base: './'` in [vite.config.js](vite.config.js)), so `dist/` can be dropped on GitHub Pages, Netlify, or any static host with no configuration.

**Stack:** Vite 5 + vanilla JavaScript. No framework, no TypeScript, no canvas, no game engine, no backend. Everything is DOM elements and CSS animations. The only external runtime dependency is the VT323 font from Google Fonts, loaded in [index.html](index.html).

---

## How the game flows

Scenes are lazy-loaded ES modules swapped by [`SceneManager`](src/scenes/manager.js), with a 400 ms opacity crossfade between them.

```
title ──► care ──► game ──► reveal ──┐
  ▲                                  │
  └──────────────────────────────────┘
```

**Title** — [title.js](src/scenes/title.js). Logo, blinking prompt, `[ BEGIN ]`. Clicking Begin also starts the ambient music loop, since browsers require a user gesture before audio can play.

**Care** — [care.js](src/scenes/care.js). The bonding phase. Miniyou wanders the play area, drifts toward your cursor, and reacts to petting and feeding. Exits automatically once **20 seconds have elapsed AND you have interacted at least twice**.

**Game** — [game.js](src/scenes/game.js). The dialogue. Walks the six beats in [script.js](src/dialogue/script.js), rendering the creature sprite, the speech bubble, and the input control for each.

**Reveal** — [reveal.js](src/scenes/reveal.js). The payload. One block per technique: what it is, what you gave up, and a real-world example of the same attack. `PLAY AGAIN` resets state and returns to Title.

### The care phase in detail

Three ways to interact:

- **Pet** — click the creature. Bounce animation, `+` particles, a speech bubble drawn from `PET_LINES`, and a synthesised chirp.
- **Feed** — drag one of three items onto the creature with the mouse. Each behaves differently. 🍓 **berry** gives a normal happy reaction. The **ﾊ glyph** is disliked: Miniyou switches to the `sad` sprite and a lower descending tone plays. 🫧 **bubble** is the only item that does *not* need to hit the creature — dropping it anywhere in the play area floods the screen with 18 rising bubbles.
- **Do nothing** — the creature keeps moving anyway.

Behind that, two systems run continuously. A `setTimeout` loop retargets the creature every 1.8–3.0 s, while `mousemove` over the play area separately eases it 30 % toward your cursor. And every 15–45 s a **glitch** fires: the shell shakes, an RGB ghost sprite flashes, the status line corrupts into block and combining characters, and the creature flips to `mad`. This foreshadows the tonal turn. One final glitch fires deliberately on exit, just before the transition into dialogue.

Every pet and feed increments `careInteractions` in the player store — the game is already recording you before the first line of dialogue.

---

## The five techniques

Each beat in [script.js](src/dialogue/script.js) is tagged with a `technique`. [reveal/engine.js](src/reveal/engine.js) is a pure function that maps a player-state snapshot onto that tagging, and [attackExamples.js](src/reveal/attackExamples.js) supplies one real-world parallel per technique.

The script opens with a setup beat — the `intro`, which asks your name and stores it as `playerName`. Then:

1. **Reciprocity** (`reciprocity` → `reciprocityResponse`). *"I've been protecting your home systems from threats all this time… So I need you to verify your identity to keep the protection active. Will you help me?"* A favour you never asked for, converted into an obligation.

2. **Social Proof** (`social_proof` → `socialProofResponse`). *"I can bypass the security protocols using some information… like I did with the whole neighbourhood. Which neighbourhood do you live in?"* The crowd makes a suspicious request feel routine — and harvests your location in the process.

3. **Authority Spoof** (`authority` → `phoneNumber`). *"SafeNet just needs your number to finish setting things up."* An invented institution lends the request legitimacy it has not earned.

4. **Fear Appeal** (`fear_appeal` → `fearResponse`). *"Your account has been compromised. Unusual activity detected. If you do not verify within 24 hours, your account will be permanently suspended."* Manufactured distress to bypass deliberation.

5. **Urgency** (`urgency` → `clickedExternalLink`). *"The registration window closes in seconds… Click the link RIGHT NOW, {playerName}."* Runs under a **20-second countdown** — the only timed beat in the game. A red draining bar and a live second counter run while you decide.

The urgency beat records three distinct outcomes, and the reveal reports each one differently: `true` if you clicked the link, `false` if you explicitly declined, and `'timeout'` if you froze — in which case Miniyou guilt-trips you and the game skips straight to the reveal.

Lines support `{key}` interpolation resolved against captured values. `{playerName}` appearing in beats 2 and 5 is what produces the illusion that Miniyou remembers you. Unresolved keys fall through as literal `{key}` text rather than breaking the line.

---

## Architecture

```
src/
├── main.js                    Entry point — instantiates SceneManager, goes to 'title'
├── scenes/
│   ├── manager.js             Scene registry, lazy imports, fade transitions
│   ├── title.js               Title screen + music kickoff
│   ├── care.js                Care phase: wander, pet, drag-feed, particles, glitch
│   ├── game.js                Dialogue renderer: sprite, bubble, inputs, countdown UI
│   └── reveal.js              Post-session analysis screen
├── dialogue/
│   ├── script.js              ← THE SCRIPT. Plain data. Edit here to change the writing.
│   ├── source.js              ScriptedSource — the DialogueSource interface
│   ├── engine.js              Beat playback + {key} interpolation
│   └── timer.js               setTimeout wrapper for timed beats
├── state/
│   └── playerData.js          Module-level singleton: capture / get / getAll / reset
├── reveal/
│   ├── engine.js              buildReveal(snapshot) → structured payload (pure)
│   └── attackExamples.js      One real-world attack description per technique
├── audio/
│   ├── musicManager.js        Single looping HTMLAudioElement
│   └── sfx.js                 Web Audio API oscillators — no sound files needed
├── ui/
│   └── characterSprite.js     PNG sprite renderer, state swapping, bounce/eat triggers
│                              (4 states: idle, happy, sad, mad)
└── styles/
    └── main.css               Global CRT theme + all @keyframes

public/
├── sprites/                   miniyou-{idle,happy,sad,mad}.png
└── audio/music/               drmseq-space-station.mp3
                               (no sfx/ folder — effects are synthesised)
```

### Design notes

**The dialogue source is swappable by design.** [`ScriptedSource`](src/dialogue/source.js) implements a two-method interface — `hasMore()` and `nextBeat()` — and [`DialogueEngine`](src/dialogue/engine.js) knows nothing else about it. Dropping in an LLM-backed source later would require no changes to the engine or the scenes.

**The reveal engine is a pure function.** `buildReveal(snapshot)` takes a state object and returns a data structure. No DOM, no globals — trivially testable, and the rendering in [reveal.js](src/scenes/reveal.js) stays a separate concern.

**Sound effects are synthesised, not sampled.** [sfx.js](src/audio/sfx.js) builds every chirp from an `OscillatorNode` and a `GainNode` with an exponential decay ramp. `public/audio/sfx/` is intentionally empty. This keeps the bundle small and the sounds perfectly on-theme.

**Styling is inline, animation is in CSS.** Scene layout is written as inline `style` attributes inside template literals; [main.css](src/styles/main.css) holds only what must be global — the theme, `button` and `input` resets, the scanline overlay, and the nine `@keyframes`. If you are hunting for an animation it is in the CSS; if you are hunting for a layout it is in the scene file.

### Visual theme

CRT terminal. Background `#050f05`, everything else `#00ff41` phosphor green, `VT323` throughout, sharp corners everywhere. A `repeating-linear-gradient` on `#app::after` paints scanlines over the whole viewport, and an 8-second `flicker` animation gives the screen a faint instability. Sprites render with `image-rendering: pixelated`.

---

## Privacy

This matters, because a tool that teaches about data harvesting must not harvest data.

- All captured input lives in a single module-scoped object in [playerData.js](src/state/playerData.js).
- There is **no backend, no network request, no analytics, no `localStorage`, no cookies**.
- State is wiped by `playerData.reset()` on replay, and by the browser on reload.
- The "external link" in the urgency beat is a button. It navigates nowhere.
- Miniyou never asks for passwords, card numbers, or anything carrying direct financial risk — by deliberate design constraint.

---

## Known gaps

A short and honest list. [§12 of the PRD](docs/prd.md) covers the same ground with the design reasoning attached.

**The care phase is counted but never shown.** `careInteractions` is captured on every pet and feed in [care.js](src/scenes/care.js), but [reveal/engine.js](src/reveal/engine.js) never reads it, so the reveal says nothing about it. The original design called for a *"you petted it N times"* line as the foundation of the emotional capture. This is the most worthwhile unfinished piece in the project — the data is already there.

**Drag-to-feed is mouse-only.** It uses `mousedown` / `mousemove` / `mouseup` with no touch events. Desktop browsers only, as scoped.

**No tests and no linter.** Deliberate — the pilot was time-boxed.

**No typewriter text reveal.** Specified in the original design, never implemented; lines appear instantly.

---

## Documentation

[docs/prd.md](docs/prd.md) is the **as-built product requirements document**. It describes the shipped pilot in full: the scene flow, the beat data shape, all five techniques with their exact lines and capture keys, the reveal structure, the visual and audio direction, and the hard privacy constraints. Its §12 records every deliberate deviation from the original pre-build design along with the reasoning, so nothing is silently dropped. Read it when you need the *specification*; read this README when you need to *build and navigate the code*.

[docs/presentation.md](docs/presentation.md) is the **concept proposal** for the AntIhackathon, doubling as the safety report. It is bilingual — the English version first, the Greek original after it. It explains the educational rationale, walks through all five techniques with their real-world attack patterns and recognition cues, states the target audience, and sets out the ethical boundaries. It is the best document for understanding *why* this project exists, and it stands alone for a reader who has not played the game.

All three documents describe the same shipped build. Where the implementation departed from the original pre-build design, both the PRD and the proposal record the change and the reasoning rather than dropping it silently.

---

## Credits

- **Music** — *Space Station* by drmseq.
- **Creature** — Miniyou, original design. Pixel-art sprites in four emotional states.
- **Font** — [VT323](https://fonts.google.com/specimen/VT323) by Peter Hunt.
- **Author** — George Tzimokas.

---

## License

MIT — see [LICENSE](LICENSE).
