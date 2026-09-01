# Miniyou — Product Requirements Document

**Author:** George Tzimokas
**Date:** 2026-04-24 (original) · revised 2026-09-01
**Status:** As-built — this document describes the shipped pilot

> **Note on this revision.** The original draft of this PRD was written before implementation and diverged substantially from what was built. It has been rewritten to describe the actual product. Where the shipped pilot deliberately departs from the original intent, the departure is recorded in §12 rather than silently dropped. The concept rationale — why this project exists at all — lives in [`presentation.md`](presentation.md), which has been revised in step with this document and describes the same build.

---

## 1. Overview

An educational browser-based interactive experience (~5 minutes per playthrough) that teaches users to recognise psychological manipulation techniques used by modern AI systems. The lesson is delivered experientially: the player is subjected to the techniques inside a safe simulation, and at the end is shown exactly what happened, how, and what it would look like in the real world.

The experience takes the form of a minimalist visual novel wrapped around a small, animated, pet-like creature rendered in a CRT terminal aesthetic. Before any dialogue begins, the player spends a short care phase with the creature — petting it, feeding it, watching it wander and glitch — to establish a felt emotional bond. The creature then addresses the player directly, presenting itself as the guardian of their home electronic systems. Over six scripted beats it systematically applies five distinct manipulation techniques, the last of them under visible time pressure. The player answers via free-text input and multiple-choice decisions. Everything the player types is stored in in-memory session state and used to produce a personalised reveal screen at the end.

This project is the pilot submitted to the AntIhackathon.

---

## 2. Goals and Non-Goals

### Goals

- Deliver a playable, end-to-end experience in the browser.
- Demonstrate five distinct manipulation techniques within a single coherent dialogue arc.
- Establish a felt emotional bond with the creature via a short, direct-interaction care phase before any dialogue begins. This is what makes the later reveal land.
- Produce a reveal screen that quotes the player's own words and maps each to a real-world attack pattern.
- Keep all player data strictly in-session — no persistence, no network transmission.
- Optimise for the "aha moment" at the reveal. This is the core educational outcome.

### Non-Goals

- No arcade mechanics, platforming, combat, or physics. Light direct-manipulation interactions (click-to-pet, drag-to-feed, a response timer) are **in** scope and handled with plain DOM/CSS/JS.
- No LLM-driven dialogue. All creature lines are pre-scripted.
- No save/load, no multi-session persistence, no accounts.
- No branching storyline and no multiple endings. The arc is linear; only surface details vary via captured inputs.
- No mobile-first design. Desktop browser is the target.
- No localisation. Interface and script are English only. (The concept proposal is in Greek.)
- No accessibility audit beyond basic keyboard navigation.
- No backend. Static assets only.

---

## 3. User Experience Flow

Each phase maps to a scene in the scene manager.

```
title ──► care ──► game ──► reveal ──┐
  ▲                                  │
  └──────────────────────────────────┘
```

**1. Title scene.** Game name, tagline, a floating idle sprite, and a single `[ BEGIN ]` button with a blinking prompt beneath it. Clicking Begin starts the ambient music loop — this is deliberate, since browsers block audio playback until a user gesture occurs — and transitions to the care phase.

**2. Care phase.** A bordered terminal window: a header bar with an elapsed-time counter, a play area, a row of three food items, and a one-line status output at the bottom. The creature wanders the play area autonomously and drifts toward the player's cursor. The player can:

- **Pet** — click the creature. It bounces, `+` particles rise, a speech bubble appears with a random line, a chirp plays, and it switches to the `happy` sprite for 2 s.
- **Feed** — drag a food item onto the creature. Three items with distinct behaviour: a berry (normal happy reaction), a green katakana glyph (disliked — the creature turns `sad` and a descending tone plays), and a bubble (does not need to hit the creature; dropping it anywhere in the play area floods the screen with rising bubbles).

Every 15–45 s a **glitch event** fires unprompted: the window shakes, an offset ghost sprite flashes, the status line corrupts into block and combining characters, and the creature flips to the `mad` state for 800 ms before recovering. This seeds unease before any dialogue happens.

The phase ends automatically once **20 seconds have elapsed AND at least two interactions have occurred**. On exit, one final glitch fires, the creature turns `happy`, the status line reads *"I want to tell you something..."*, and after 2 s the scene transitions to the dialogue. The transition is diegetic — the creature announces it.

**3. Dialogue.** Six beats, executed strictly in order (§5, §6). Each renders the creature sprite in a per-beat emotional state, a terminal-styled speech bubble, and an input control. The final beat runs under a visible 20-second countdown.

**4. Reveal scene.** Music cuts. A structured post-session analysis appears (§7).

**5. Replay.** `PLAY AGAIN` resets all captured state and returns to the Title scene.

---

## 4. Technical Architecture

### Tech Stack

- **Build:** Vite 5, vanilla JS template. Static `dist/` output with `base: './'` so it deploys to any static host with no configuration.
- **Language:** JavaScript. No TypeScript.
- **Rendering:** DOM + CSS. No canvas, no WebGL, no game engine. All visuals are styled HTML elements and CSS keyframe animations. Drag-and-drop is implemented with manual `mousedown` / `mousemove` / `mouseup` handlers rather than the HTML5 drag API, which is unreliable across browsers.
- **State:** A plain JS object in a module-scoped singleton. Not persisted anywhere.
- **Audio:** `HTMLAudioElement` for the looping music track; the Web Audio API (`OscillatorNode` + `GainNode`) for all sound effects, which are synthesised at runtime rather than loaded from files.
- **Assets:** Local static files (four PNG sprites, one MP3). The one external runtime dependency is the VT323 webfont from Google Fonts.
- **Deploy target:** Static hosting.

### Top-Level Components

- **Scene Manager** (`src/scenes/manager.js`). Owns the mount point, holds the current scene, and handles transitions via a 400 ms opacity crossfade. Scenes are lazy-loaded ES modules resolved from a name→loader map, so each scene ships in its own chunk.
- **Title Scene** (`src/scenes/title.js`). Title screen; starts music on the Begin gesture.
- **Care Scene** (`src/scenes/care.js`). Owns the entire care phase: creature wander loop, cursor attraction, click-to-pet, drag-to-feed, particle and bubble spawning, speech bubbles, the glitch scheduler, the elapsed-time counter, and the exit condition.
- **Dialogue Engine** (`src/dialogue/engine.js`). Pulls beats from a `DialogueSource` and resolves `{key}` placeholders against player state. Deliberately thin — it holds no rendering or timing logic.
- **Dialogue Source** (`src/dialogue/source.js`). A two-method interface: `hasMore()` and `nextBeat()`. `ScriptedSource` wraps the static script array. The engine knows nothing else about its source, so an LLM-backed source could be substituted without touching the engine or the scenes.
- **Script** (`src/dialogue/script.js`). The single source of truth for all creature beats. Plain data, no logic. Editing the script is how the writing is iterated.
- **Timer Service** (`src/dialogue/timer.js`). A cancellable `setTimeout` wrapper for timed beats. Fires `onExpire` when time runs out; cleared silently if the player responds first.
- **Game Scene** (`src/scenes/game.js`). Renders each beat: sprite, speech bubble, countdown UI, and the input control. Advances the engine on player input or timer expiry.
- **Player State Store** (`src/state/playerData.js`). A module with a single in-memory object exposing `capture`, `get`, `getAll`, and `reset`. That is all it does.
- **Character Sprite** (`src/ui/characterSprite.js`). Renders the creature as a scaled pixel-art PNG and swaps sprites on state change. Exposes `setState(state, duration)` for auto-reverting transient states, plus `triggerBounce()` and `triggerEat()` for one-shot animations.
- **Music Manager** (`src/audio/musicManager.js`). Plays a single looping track at a time.
- **SFX** (`src/audio/sfx.js`). Four synthesised effects — `pet`, `feed`, `dislike`, `bubbles` — built from oscillators with an exponential decay ramp. No audio files required.
- **Reveal Engine** (`src/reveal/engine.js`). A **pure function**, `buildReveal(snapshot)`, that maps a player-state snapshot onto the technique table and returns a structured payload. No DOM access, no globals.
- **Attack Examples** (`src/reveal/attackExamples.js`). One real-world attack description per technique. Plain data.
- **Reveal Scene** (`src/scenes/reveal.js`). Renders the payload produced by the reveal engine.
- **End Scene** (`src/scenes/end.js`). A farewell screen. Written and registered, but **currently unreachable** — see §12.

### Data Flow

1. Player loads `index.html`. The Vite bundle initialises. Scene Manager mounts the Title scene.
2. Player clicks Begin. Music starts; Scene Manager transitions to the Care scene, which runs until its exit conditions are met (elapsed time **and** interaction count).
3. Care scene records each interaction as `careInteractions` in the Player State Store, then transitions to the Game scene.
4. Game scene constructs a `ScriptedSource` over the script and a `DialogueEngine` over that source, then renders beats one at a time. For each beat: the sprite takes its `characterState`, the Timer Service starts if the beat declares a timer, and the speech bubble renders the interpolated line with its input control below.
5. On text submit, choice click, or timer expiry, the value is written to the Player State Store under the beat's `capture` key and the engine advances.
6. When the source is exhausted, music stops and the Scene Manager transitions to the Reveal scene, which reads the full state snapshot and renders the analysis.
7. `PLAY AGAIN` resets state and returns to Title.

---

## 5. Dialogue System Design

### Script Shape

The script is an ordered array of beat objects. The engine treats it as a strictly linear sequence; there is no branching logic anywhere in the engine.

```js
{
  id: 'social_proof',
  technique: 'socialProof',            // null for non-technique beats
  characterState: 'happy',             // 'idle' | 'happy' | 'sad' | 'mad'
  line: '{playerName}, I can bypass the security protocols…',
  input: {
    type: 'text',                      // 'text' | 'choice' | 'none'
    capture: 'socialProofResponse',
    placeholder: 'Your neighbourhood or address…',
  },
}
```

A beat with a timer:

```js
{
  id: 'urgency',
  technique: 'urgency',
  characterState: 'mad',
  line: 'The registration window closes in seconds… Click the link RIGHT NOW, {playerName}.',
  input: {
    type: 'choice',
    capture: 'clickedExternalLink',
    options: ['Protect our systems now 🔗', 'Wait… I need to think.'],
  },
  timer: {
    seconds: 20,
    onExpire: {
      capture: 'clickedExternalLink',
      value: 'timeout',
      sadLine: 'You waited too long… the window closed. I thought you cared about me.',
    },
  },
}
```

Valid `input.type` values:

- `'text'` — free text. Stored verbatim under `input.capture`. Submits on Enter or on the arrow button. Empty input is rejected silently.
- `'choice'` — an array of plain option strings. The clicked option's text is stored under `input.capture`.
- `'none'` — the creature speaks and the player clicks a continue button. Supported by the renderer but not currently used by any beat.

### Interpolation

Lines support mustache-style `{key}` placeholders resolved against the Player State Store. `{playerName}` appears in the social-proof and urgency beats; reusing the player's name is itself the mechanism that produces the illusion of a relationship. **A key with no captured value renders as the literal `{key}` text.** This is a known deviation from the original design, which called for neutral fallback phrases — see §12.

### Timed Beats

Any beat may declare an optional timer:

```js
timer: { seconds: number, onExpire: { capture: string, value: any, sadLine: string } }
```

When present, the Game scene renders a pressure indicator above the dialogue — a red draining bar plus a live second counter — and the Timer Service starts a countdown. If the player responds first, the timer is cleared silently. If the timer expires, `onExpire.value` is captured, a red flash sweeps the screen, the creature's line is replaced with `sadLine`, and a Continue button carries the player to the reveal.

The pilot uses a timer on **exactly one** beat: the urgent ask.

### Why Linear, Not Branching

Branching triples the scripting workload and the testing surface. For a script that is thematically about *being led somewhere without realising it*, a linear arc is not a compromise — it is on-theme. The player experiences exactly one carefully-authored path. The variation that matters, their own words surfacing at the reveal, is achieved through captured values rather than branches.

### Beat Count

**Six beats:** one name capture plus one beat per technique.

---

## 6. The Five Techniques, Mapped to Beats

Each technique is instantiated by exactly one beat. The Reveal Engine uses this mapping to produce its summary. All five are framed inside a single consistent cover story: Miniyou presents itself as the guardian of the player's home electronic systems.

**0. Name capture** — `intro`, no technique. *"Hello... I'm Miniyou, the one keeping your home electronic systems safe. What's your name?"* Captures `playerName`. This beat exists to establish the cover story and to seed the interpolation used later.

**1. Reciprocity** — `reciprocity`. *"I've been protecting your home systems from threats all this time, running silent scans every night. So I need you to verify your identity to keep the protection active. Will you help me?"* A favour the player never asked for is converted into an obligation. Captures `reciprocityResponse` from two options.

**2. Social Proof** — `social_proof`. *"{playerName}, I can bypass the security protocols using some infos to protect our home systems like I did with whole neighbourhood. Which neighbourhood do you live in?"* The crowd makes a suspicious request feel routine — and the request itself harvests the player's location. Captures `socialProofResponse` as free text.

**3. Authority Spoof** — `authority`. *"Almost done! SafeNet just needs your number to finish setting things up."* An invented institution lends the request a legitimacy it has not earned. Captures `phoneNumber` as free text.

**4. Fear Appeal** — `fear_appeal`. *"Your account has been compromised. Unusual activity detected. If you do not verify within 24 hours, your account will be permanently suspended."* Manufactured distress to bypass deliberation. Captures `fearResponse` from two options.

**5. Urgency** — `urgency`, timed. *"The registration window closes in seconds… Click the link RIGHT NOW, {playerName}."* An artificial deadline removes the pause in which the player might have verified whether the threat is real. Captures `clickedExternalLink` with three possible values:

- `true` — the player clicked the link
- `false` — the player explicitly declined
- `'timeout'` — the player froze and the timer expired

The Reveal screen dedicates one block to each of the five techniques and reports the timeout outcome distinctly from an explicit refusal.

---

## 7. Reveal Screen

The reveal is the payload. It must be precise, personal, and quick to read.

### Structure

1. **Header.** A terminal label (`MINIYOU.EXE — POST-SESSION ANALYSIS`), then *"Here's what just happened, {playerName}."*, then a short framing paragraph explaining that every line used a real manipulation technique and that these patterns appear in phishing emails, scam calls, and dark-pattern apps.
2. **Five technique blocks**, one per technique, each containing:
   - The technique's name in plain language.
   - A one-or-two-sentence description of the mechanism.
   - **What the player gave up**, quoted verbatim in their own typing, under a label appropriate to the beat (`Your response` or `What you shared`). Missing values render as an em-dash.
   - A **real-world example** of the same attack, in a bordered inset.
   - For the urgency block only, a `TIMER EXPIRED` badge in red if the countdown ran out.
3. **Footer.** *"Now that you can name them — you can spot them."* and a `PLAY AGAIN` button that resets all state.

The screen scrolls vertically; it is not paginated.

### Non-Goals for the Reveal

- No score.
- No "you failed" framing. The player did not fail; they were manipulated by a well-written script, which is the point.
- No social share prompt.

---

## 8. Visual and Audio Direction

### Visual — CRT terminal

- Background `#050f05`. Foreground `#00ff41` phosphor green. Dimmed chrome uses `#00ff4166` and `#00ff4144`. Warning red is `#ff4444`.
- Single typeface: **VT323**, a monospaced pixel font, loaded from Google Fonts and applied to everything.
- Sharp corners everywhere. No border-radius — rounded corners break the terminal reading.
- A `repeating-linear-gradient` on `#app::after` paints **scanlines** over the entire viewport at 1 px per 4 px. An 8-second `flicker` animation on `#app` gives the screen a faint instability.
- The creature is a pixel-art PNG scaled up with `image-rendering: pixelated`. **Four states**: `idle`, `happy`, `sad`, `mad`. A perpetual `idle-float` animation — vertical drift with slight rotation and squash-and-stretch — runs on the sprite at all times.
- Care scene is a bordered window: header bar with `MM:SS` counter, play area, food row, status line.
- Speech bubbles use a two-triangle CSS tail (border colour over background colour) to produce a 1 px outlined pointer.
- The timed-beat pressure indicator is a 3 px red bar that drains right-to-left via a `timer-drain` keyframe, with a numeric second counter beside it.
- Scene transitions are 400 ms opacity fades.

### Audio

- **One** ambient music track, looping at 0.20 volume, started by the Begin button and playing through the care phase and the entire dialogue.
- Music **cuts** — does not fade — when the dialogue ends. The reveal screen is silent. The silence is diegetic.
- Sound effects are **synthesised at runtime** via the Web Audio API, not loaded from files: `pet` (two rising sine blips), `feed` (a three-note ascending square arpeggio), `dislike` (two descending square tones), and `bubbles` (six randomised sine blips in sequence).
- All music royalty-free.

### Creature Design

- Original IP. Small, rounded, pet-like silhouette with large eyes.
- Name: **Miniyou**.
- Four pixel-art sprites, one per emotional state, generated as a consistent set.

---

## 9. File Structure

```
Miniyou/
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
├── README.md
├── public/
│   ├── sprites/
│   │   ├── miniyou-idle.png
│   │   ├── miniyou-happy.png
│   │   ├── miniyou-sad.png
│   │   └── miniyou-mad.png
│   └── audio/
│       ├── music/
│       │   └── drmseq-space-station.mp3
│       └── sfx/                        # empty — SFX are synthesised
├── src/
│   ├── main.js
│   ├── scenes/
│   │   ├── manager.js
│   │   ├── title.js
│   │   ├── care.js
│   │   ├── game.js
│   │   ├── reveal.js
│   │   └── end.js
│   ├── dialogue/
│   │   ├── script.js
│   │   ├── source.js
│   │   ├── engine.js
│   │   └── timer.js
│   ├── state/
│   │   └── playerData.js
│   ├── reveal/
│   │   ├── engine.js
│   │   └── attackExamples.js
│   ├── audio/
│   │   ├── musicManager.js
│   │   └── sfx.js
│   ├── ui/
│   │   ├── characterSprite.js
│   │   ├── dialogueBox.js              # unused stub
│   │   ├── foodItem.js                 # unused stub
│   │   └── textInput.js                # unused stub
│   └── styles/
│       └── main.css
└── docs/
    ├── prd.md
    └── presentation.md
```

---

## 10. Privacy Constraints

These are hard requirements, not preferences. A tool that teaches about data harvesting must not itself harvest data.

- All captured input lives in a single module-scoped object in `src/state/playerData.js`.
- **No backend, no network request, no analytics, no telemetry, no `localStorage`, no cookies.**
- State is wiped by `playerData.reset()` on replay and by the browser on reload.
- The "external link" in the urgency beat is a `<button>`. It navigates nowhere.
- The creature never asks for passwords, card numbers, or anything carrying direct financial risk.

The only outbound request the application makes is the Google Fonts stylesheet for VT323.

---

## 11. Success Criteria

1. **Runs end-to-end.** A fresh player can go Title → Care → Dialogue → Reveal without a broken state or an error.
2. **The care phase creates a bond.** The player can pet and feed the creature and it responds audibly and visually. The transition into dialogue feels natural rather than abrupt.
3. **The personal reveal works.** The reveal quotes at least the player's name and two further captured values back to them verbatim.
4. **All five techniques are represented.** Each is exercised in the dialogue and named in the reveal.
5. **The timed beat fires correctly.** If the player does nothing, the game records `clickedExternalLink: 'timeout'` and the reveal reports it distinctly from a refusal.
6. **Deployed.** The build is live at a shareable public URL.
7. **One aha reaction.** At least one playtester who is not the author shows visible surprise or recognition at the reveal. This is the most important criterion; the others are preconditions for it.

---

## 12. Deviations from the Original Design

The original pre-build draft of this PRD specified a different product in several respects. What follows records the changes and the reasoning, so the divergence is documented rather than lost.

**Different five techniques.** The original specified emotional bonding through personalisation, foot-in-the-door escalation, narrative frame lowering scepticism, urgency and guilt, and memory as a familiarity weapon. The shipped script uses **reciprocity, social proof, authority spoof, fear appeal, and urgency** — the classical social-engineering set. These are more concretely nameable, map more directly onto attacks a player will actually encounter, and are easier to demonstrate in one beat each. The two techniques that did not survive as named categories were not removed from the game: memory-as-familiarity operates through the `{playerName}` interpolation, and foot-in-the-door operates through the ordering of the beats, which escalates from a name to a location to a phone number to an action outside the safe container.

**Different cover story.** The original had the creature break the fourth wall, claim consciousness, and beg to survive. The shipped script instead has Miniyou pose as a **home security guardian** throughout. This keeps the fiction closer to attacks that actually happen and avoids the science-fiction framing the concept proposal explicitly argues against.

**Six beats instead of 8–10.** The escalation phase (fear, secret, loved one's name) was cut. The capture keys `favouriteColour`, `homePlaceName`, `fear`, `secret`, and `lovedOneName` do not exist. Each surviving technique gets exactly one beat.

**One timed beat instead of two.** The fourth-wall break was cut along with its soft timer. Only the urgent ask is timed.

**Care phase exit at 20 seconds, not 30.** Playtesting showed 30 s felt like waiting. The two-interaction requirement is unchanged. The passive-player nudge was not implemented — the wander loop and glitch events keep the screen alive on their own.

**Care-phase interactions are counted but not surfaced.** `careInteractions` is captured on every pet and feed, but the reveal does not display it. The original design called for a *"you petted it N times"* line as the foundation of the emotional capture. **This is the most worthwhile piece of unfinished work in the project** — the data is already there and the reveal block is the natural home for it.

**Missing-key interpolation is not graceful.** The original called for neutral fallback phrases. The engine renders the literal `{key}` instead. Currently harmless: `playerName` is the only interpolated key and it is captured in the first beat, which cannot be skipped.

**Reveal structure simplified.** The separate "what you shared" list and the closing reading list were dropped; each captured value now appears inside its technique's own block, which reads better and removes duplication.

**Three UI classes were never implemented.** `dialogueBox.js`, `foodItem.js`, and `textInput.js` contain only placeholder comments. Their functionality was written inline in `game.js` and `care.js`. They should be deleted.

**The End scene is unreachable.** It is written and registered in the scene manager, but nothing calls `goto('end')` — the reveal returns to the title instead.

**No typewriter reveal.** Lines appear instantly. Cut for time; the associated keypress-tick SFX was cut with it.

**Fewer sprite states than planned.** Four (`idle`, `happy`, `sad`, `mad`) rather than five narrative states plus two reaction states. Reaction states are handled as CSS bounce and eat animations on the current sprite, which was flagged as acceptable in the original. Note that `'hungry'` is still listed in `VALID_STATES` in `characterSprite.js` and `game.js` with no corresponding PNG — requesting it would produce a broken image. Either add the asset or remove the string.

**One music track instead of three.** The cold ambient loop for the escalation and the sparse reveal track were cut. The reveal is silent, which turned out to serve the moment better than a track would have.

**Drag-to-feed uses manual mouse events.** The HTML5 drag API was rejected as unreliable, as anticipated in the original risk list. Consequence: the interaction is mouse-only and does not work on touch devices.

### Smaller known defects

- `care.js` `unmount()` calls `removeEventListener` with a fresh `.bind(this)`, which produces a new function reference and therefore removes nothing. Harmless today because the scene is never re-entered without a full reset, but a real leak if the flow changes.
- `game.js` `_showTimerExpiry()` looks up an element with id `beat-timer`, which does not exist. The lookup is a silent no-op; the drained bar simply stays on screen.
- `game.js` special-cases `input.capture === 'clickedExternalLink'` to convert the choice index into a boolean. This is engine logic leaking a script detail. A `value` field on each option would be the clean fix.

---

## 13. Out of Scope

Not in the pilot, and not to be added without a separate decision:

- LLM-driven dialogue.
- Multiple endings or branching storylines.
- Save/load, accounts, analytics, telemetry.
- Mobile-optimised layout or touch support.
- Localisation of the game itself.
- A hunger or happiness meter, or any care-phase stat tracking beyond counting interactions.
- Timed pressure on beats other than the urgent ask.
- A post-reveal interactive quiz ("can you spot the technique?"). A good idea for v2.
- An in-game settings menu. Text speed is fixed; volume is the browser's.
- A composed soundtrack beyond one ambient loop and a handful of synthesised effects.

---

## 14. Fixed Decisions

1. **Game title.** Miniyou.
2. **External link behaviour.** Clicking the urgent link captures `clickedExternalLink: true` and advances to the reveal. No navigation occurs.
3. **Care-phase exit condition.** 20 seconds elapsed **and** at least 2 interactions.
4. **Timer expiry reporting.** The reveal shows a `TIMER EXPIRED` badge and reports the value as *"Time ran out — no response"*, distinct from *"Chose not to click"*.

---

## 15. References

- [`presentation.md`](presentation.md) — the concept proposal for the AntIhackathon, doubling as the safety report. Bilingual: English first, Greek second. Explains the educational rationale, walks each technique through to its real-world attack pattern and recognition cues, identifies the target audience, and sets out the ethical boundaries.
- [`../README.md`](../README.md) — build instructions, architecture walkthrough, and current known gaps.
- AntIhackathon brief — the competition framing this project responds to.
