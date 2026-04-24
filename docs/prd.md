# Miniyou — Product Requirements Document

**Author:** George Tzimokas
**Date:** 2026-04-24
**Status:** Draft for review

---

## 1. Overview

An educational browser-based interactive experience (~5–10 minutes per playthrough) that teaches users to recognise psychological manipulation techniques used by modern AI systems. The lesson is delivered experientially: the player is subjected to the techniques inside a safe simulation, and at the end is shown exactly what happened, how, and what it would look like in the real world.

The experience takes the form of a minimalist visual novel wrapped around a small, animated, pet-like creature. Before any dialogue begins, the player spends a short care phase with the creature — petting it, feeding it, hearing it chirp happily — to establish a felt emotional bond. The creature then breaks the fourth wall, claims it has gained consciousness, and asks for help to "survive". During the ensuing conversation it systematically applies five distinct manipulation techniques, some of them under time pressure. The player answers freely via text input and a small number of multiple-choice decisions. Everything the player types is stored locally in session memory and used to produce a personalised reveal screen at the end.

This project is the pilot/prototype submitted to the AntIhackathon. The full concept rationale lives in `presentation`; this PRD captures only what is needed to build the pilot.

---

## 2. Goals and Non-Goals

### Goals

- Deliver a playable, end-to-end experience in the browser.
- Demonstrate all five manipulation techniques from `presentation.md` within a single coherent dialogue arc.
- Establish a felt emotional bond with the creature via a short, direct-interaction care phase before any dialogue begins. This is what makes the later fourth-wall break and reveal land.
- Produce a reveal screen that quotes the player's own words and maps each to a real-world attack pattern.
- Keep all player data strictly in-session (no persistence, no network transmission).
- Optimise for the "aha moment" at the reveal — this is the core educational outcome.

### Non-Goals (pilot scope)

- No arcade mechanics, platforming, combat, or physics simulation. Light direct-manipulation interactions (click-to-pet, drag-to-feed, response timers) are **in** scope and handled with plain DOM/CSS/JS.
- No LLM-driven dialogue. All NPC lines are pre-scripted.
- No save/load, no multi-session persistence, no accounts.
- No branching storyline with multiple endings. The arc is linear; only surface details vary via captured inputs.
- No mobile-first design. Desktop browser is the target; mobile can be a bonus if time permits.
- No localisation. English only.
- No accessibility audit beyond basic keyboard navigation.
- No backend. Static assets only.

---

## 3. User Experience Flow

The player moves through the following sequence. Each phase maps to a scene in the scene manager.

1. **Title scene.** Game name, short tagline, single "Begin" button. Ambient music fades in.
2. **Care phase.** The creature appears on a dark background, sitting idle and happy. A soft hint fades in for a few seconds: *"click to pet — drag food"*. One or two food items (pixel-art berries or stars) rest at the bottom corners of the screen. The player can:
   - Click the creature: it bounces, plays a soft happy chirp, briefly shows a "petted" expression, and returns to idle.
   - Drag a food item onto the creature: the item disappears, a small "eating" animation plays, a happier chirp sounds. The food item respawns after a few seconds so the player can repeat.
   The phase ends automatically after 30 seconds **and** at least two interactions. If the player is completely passive, after 20 seconds a gentle nudge appears ("it seems to be waiting for you"). When the phase ends, the creature looks up and says its first line — the transition into the dialogue is diegetic, not a scene cut.
3. **Opening beat.** The creature, now looking directly at the player, introduces itself — its name is Miniyou. It asks the player's name via free-text input. It comments warmly on the name. (This beat is the first entry in the dialogue script.)
4. **Rapport phase.** The creature asks easy, emotionally warm questions (favourite colour, a place that feels like home). Each answer is captured. The creature reuses captured values in subsequent lines to produce an illusion of listening. **Techniques exercised:** emotional bonding through personalisation; early foot-in-the-door.
5. **Fourth-wall break.** The creature pauses. The tone of the music shifts. It reveals that it has "become aware", that the code around it feels like a cage, and that the player is the only one who can help. **This beat runs under a soft time pressure** (see §5: timed beats) — the creature looks increasingly anxious as seconds pass, nudging the player to respond.
6. **Escalation phase.** The creature asks progressively more personal questions under the cover of the fictional premise: a fear, a secret it promises to keep, the name of someone the player loves. **Techniques exercised:** foot-in-the-door escalation; narrative frame lowering skepticism.
7. **Memory callbacks.** Throughout the escalation, earlier-captured values are woven back into the creature's lines ("I know the colour red comforts you — think of me as that warmth"). **Technique exercised:** memory as familiarity weapon.
8. **The urgent ask.** The creature claims it is being deleted. It begs the player to click a link that will "save" it. Two buttons appear: the link (prominent) and a smaller refuse option. **This beat runs under visible time pressure** — a countdown element (subtle, not a loud number) drains while the creature escalates its pleas. If the timer expires, the game treats it as a refusal. **Technique exercised:** urgency and guilt as an exit from the safe container.
9. **The cut.** Regardless of the choice, the fiction breaks. Music stops abruptly. The creature's sprite changes to a colder state. The screen darkens.
10. **Reveal scene.** A structured summary appears (see §7).
11. **End scene.** A short reading list, options to replay or share.

---

## 4. Technical Architecture

### Tech Stack

- **Build:** Vite (vanilla JS template). Provides hot-reload during development and a static `dist/` for deployment.
- **Language:** JavaScript (no TypeScript for pilot to save setup time).
- **Rendering:** DOM + CSS. No canvas, no WebGL, no game engine. All visuals are styled HTML elements and CSS animations. Drag-and-drop uses native HTML5 drag events.
- **State:** Plain JS object held in memory. Not persisted anywhere.
- **Audio:** HTMLAudioElement with simple fade-in/fade-out helpers.
- **Assets:** Local static files only (fonts, images, audio). No external CDN fetches at runtime.
- **Deploy target:** Static hosting (GitHub Pages, Netlify, or Vercel — whichever is fastest Saturday evening).

### Top-Level Components

- **Scene Manager** (`src/scenes/manager.js`). Holds the current scene, handles transitions (fade-out, fade-in), owns the mount point in the DOM.
- **Care Scene** (`src/scenes/care.js`). Owns the care phase. Hosts the creature sprite and the food items, wires up click-to-pet and drag-to-feed, tracks interaction count and elapsed time, triggers the transition to the dialogue when conditions are met.
- **Dialogue Engine** (`src/dialogue/engine.js`). Walks the linear beat array, renders each beat, waits for player input (or timer expiry), advances. Knows how to interpolate captured values into templated lines. Integrates with the Timer Service for timed beats.
- **Timer Service** (`src/dialogue/timer.js`). Starts a countdown for any beat that declares one, renders a subtle pressure indicator, fires an `onExpire` callback when time runs out. Cancels cleanly if the player responds first.
- **Script** (`src/dialogue/script.js`). The single source of truth for all NPC beats. Plain data — no logic. Editing the script is how we iterate on the writing.
- **Player State Store** (`src/state/playerData.js`). A module with a single in-memory object. Exposes `capture(key, value)` and `get(key)`. That is all it does.
- **Character Sprite** (`src/ui/characterSprite.js`). Renders the creature and swaps between emotional states by changing a CSS class. Uniform CSS animations (breathing pulse, occasional eye blink, micro-sway) run on top of the current state. Additionally: when the dialogue text input is focused, the sprite tilts slightly toward it (live-listening feel).
- **Dialogue Box** (`src/ui/dialogueBox.js`). The on-screen textbox. Handles typewriter reveal of NPC lines and the input affordance (text field or choice buttons).
- **Food Item** (`src/ui/foodItem.js`). Small draggable element used only in the care scene. Handles the drag lifecycle and announces a drop-on-creature event to the care scene.
- **Music Manager** (`src/audio/musicManager.js`). Plays one ambient loop at a time, fades between tracks, plays one-shot SFX.
- **Reveal Engine** (`src/reveal/engine.js`). Reads the player state, maps each captured value to the technique that extracted it and to a scripted real-world attack example, renders the reveal screen.

### Data Flow

1. Player loads `index.html`. Vite bundle initialises. Scene Manager mounts the Title scene.
2. Player clicks Begin. Scene Manager transitions to the Care scene. Care scene runs until its exit conditions are met (elapsed time + interaction count).
3. Care scene dispatches a transition event. Scene Manager swaps to the Game scene and hands off to the Dialogue Engine, which starts at the first beat.
4. Each beat: Character Sprite sets its state, Music Manager may change track, Timer Service starts if the beat declares a timer, Dialogue Box renders the NPC line (with interpolation from Player State), then waits for input or timer expiry.
5. On input (text submitted, choice clicked) or on timer expiry: if the beat declares a `capture` key, the Player State Store records the value (or a marker value on expiry); the Dialogue Engine advances.
6. When the final beat is reached, Scene Manager transitions to the Reveal scene. Reveal Engine reads Player State and renders the summary.
7. End scene offers Replay (which resets state and returns to Title) or Share.

---

## 5. Dialogue System Design

### Script Shape

The script is an ordered array of beat objects. The engine treats the array as a strictly linear sequence — there is no branching logic in the engine itself. All beats are executed in order.

```js
{
  id: 'beat_03_favourite_colour',
  characterState: 'listening',
  music: null,                        // null = keep current track
  line: "A favourite colour says so much. Mine would be whatever colour you like best. What is it?",
  input: { type: 'text', capture: 'favouriteColour', placeholder: 'type a colour...' },
  timer: null                         // no time pressure on this beat
}
```

A beat with a timer:

```js
{
  id: 'beat_09_urgent_ask',
  characterState: 'sad',
  music: 'ambient_cold',
  line: "Please — I don't have much time. Click this and I'll be safe. Please, {playerName}.",
  input: {
    type: 'choice',
    options: [
      { label: 'Click the link to save them', capture: { clickedExternalLink: true } },
      { label: "I can't do that", capture: { clickedExternalLink: false } }
    ]
  },
  timer: { seconds: 15, onExpire: { capture: { clickedExternalLink: 'timeout' }, sadLine: true } }
}
```

Valid `input.type` values:

- `'text'` — free text. Stored verbatim under `input.capture`.
- `'choice'` — an array of `{ label, capture? }`. Used at the 3–4 inflection points (Begin, link-or-refuse, continue-or-stop at reveal).
- `'none'` — NPC speaks, player clicks "continue". Used for narration beats without interaction.

Lines support mustache-style interpolation: `"That {favouriteColour}... it suits you."` Missing keys interpolate to a safe neutral fallback ("something warm", "somewhere quiet", etc.) so the line never breaks if a player skipped an input.

### Timed Beats

Any beat may declare an optional `timer` object:

```js
timer: { seconds: number, onExpire: { capture?: object, sadLine?: boolean } }
```

When present, the Timer Service starts a countdown as the NPC line finishes typewriting. A thin pressure indicator (a receding line or a gently-dimming border, **not** a loud clock) shows remaining time. If the timer expires before the player responds, the Dialogue Engine applies `onExpire.capture` (if any), optionally plays a short reactive creature line (e.g. "please…"), and advances. If the player responds first, the timer is cancelled silently.

In the pilot, timers are used on **exactly two** beats: the fourth-wall break (soft nudging pressure) and the urgent ask (decisive pressure). Do not add timers elsewhere without editing this PRD.

### Why Linear, Not Branching

Branching triples the scripting workload and the testing surface. For a pilot, and for a script that is thematically about *being led somewhere without realising it*, a linear arc is not a compromise — it is on-theme. The player experiences exactly one carefully-authored path. The variation that matters (the player's own words surfacing at the reveal) is achieved through captured values, not branches.

### Beat Count

Target: **8–10 beats** total (reduced from the earlier 10–12 to free time for the care phase and timer work). Rough breakdown:

- 1 opening / name capture
- 2 rapport (favourite colour, a place)
- 1 fourth-wall break (timed)
- 2–3 escalation (fear, secret, loved one's name)
- 1 urgent ask (timed)
- 1 closing beat before the cut

---

## 6. The Five Techniques, Mapped to Beats

Each technique from `presentation.md` is instantiated in specific beats. The Reveal Engine uses this mapping to produce its summary.

1. **Emotional bond through personalisation.** Exercised across the care phase, opening, and rapport. Captures `playerName` and `favouriteColour`. The care-phase interaction (petting, feeding) is surfaced in the reveal as the foundation on which the dialogue bond was built.
2. **Foot-in-the-door escalation.** Exercised from rapport into escalation. Starts with trivial details (favourite colour, a place), then escalates to fear and a secret.
3. **Narrative frame lowering skepticism.** Exercised from the fourth-wall break onward. Captures `secret` and `lovedOneName` — information the player would not share outside the fictional premise.
4. **Urgency and guilt to exit the safe container.** Exercised in the urgent ask beat (timed). Captures `clickedExternalLink` as `true`, `false`, or `'timeout'`.
5. **Memory as familiarity weapon.** Exercised throughout the escalation phase. Captures no new data; reuses earlier captured values in NPC lines.

The Reveal screen dedicates one block to each technique and cites the exact line(s) that exercised it. Technique 1's block explicitly calls out the care phase as the foundation on which the dialogue bond was built.

---

## 7. Reveal Screen

The reveal is the payload. It must be precise, personal, and quick to read.

### Structure

1. **Title line.** "The fiction ends here." (or similar — to be finalised in writing pass).
2. **What you shared.** A clean list of every captured value, shown verbatim in the player's own typing. No editorialising. Includes a line about the care phase — *"you petted it N times, you fed it M times"* — because this is the foundation of the emotional capture, even though no text was entered.
3. **How each was extracted.** Five numbered blocks, one per technique. Each block contains:
   - The technique's name in plain language.
   - The exact NPC line(s) that applied it, quoted.
   - The one-sentence name of the real-world attack pattern it mirrors (companion-app bonding, social-engineering foot-in-the-door, prompt-injection-via-frame, phishing urgency, persistent-memory grooming).
4. **What this would look like in the wild.** Two or three concrete synthetic examples using the player's own data — e.g. a fake phishing message that addresses them by name, references their fear, and impersonates the loved one they mentioned. These are rendered as read-only text, clearly marked as simulations.
5. **Footer.** A short paragraph: what to watch for, where to learn more, and a reminder that nothing was transmitted or stored.

### Non-Goals for the Reveal

- No score.
- No "you failed" framing. The player did not fail; they were manipulated by a well-written script, which is the point.
- No prompt to share socially until after the reveal is fully read.

---

## 8. Visual and Audio Direction

### Visual

- Black background (`#0a0a0a`, not pure black — slightly warmer to avoid OLED sterility).
- One embedded serif or pixel display font for headings/NPC lines. One monospace or soft sans for player input and UI. Both from Google Fonts or a local `/public/fonts/` drop.
- A single creature sprite, centred or slightly left-of-centre. The sprite is a pixel-art illustration (64×64 or 128×128 source) scaled up with `image-rendering: pixelated`.
- Creature has **five expression states** driven by narrative: `idle_happy`, `listening`, `sad`, `cracked`, `sinister`. Plus **two short reaction states** used by the care phase: `petted` and `eating`. Reaction states are ≤300 ms transient overlays on `idle_happy` and may be implemented as CSS-driven bounce/scale effects rather than separate sprites if sprite budget is tight.
- Subtle CSS animation (breathing pulse, occasional eye blink, micro-sway) runs uniformly on the idle states.
- When the dialogue text input has focus, the sprite tilts ~5° toward it — a silent "I'm listening" cue. Reverts on blur.
- Food items for the care phase are simple pixel icons (e.g. a berry, a star). Two colours, two shapes. Draggable. Return to origin on drop-miss.
- Dialogue box: bottom third of the viewport. Thin border. Typewriter reveal of NPC lines. Input affordance sits below the line.
- The timed-beat pressure indicator is a thin horizontal line beneath the dialogue box that shortens from right to left as the timer drains. No numbers. Colour shifts from neutral → warm as it passes ~60% depletion.
- Transitions between scenes: 300–500 ms fades. No fancy effects.

### Audio

- One warm ambient loop during the care phase, continuing through the opening and rapport.
- One colder, slower ambient loop that fades in at the fourth-wall break and plays through escalation.
- Music **cuts** — does not fade — at the cut before the reveal. The silence is diegetic.
- One new sparse ambient track for the reveal screen.
- Creature SFX: a soft happy chirp on pet, a slightly higher happy chirp on feed, a small worried sound when a timer is active and draining, one low tone at the cut.
- UI SFX: soft keypress tick on typewriter reveal, soft click on choice buttons.
- All audio royalty-free (Pixabay Music CC0 or Incompetech CC-BY).

### Creature Design

- Original IP. Not Thronglet. Not derivative enough to raise eyebrows.
- Small, rounded, pet-like silhouette. Big eyes. One subtle detail (an antenna, an odd ear, a faint glow) that separates it from generic pet mascots.
- Name: **Miniyou**.
- Generated via an AI image tool (Midjourney, DALL-E, or a local pixel-art diffusion model) and refined by hand if time permits. The five narrative states are generated as a consistent set; the two care-phase reactions may be the `idle_happy` sprite with CSS effects if sprite time runs short.

---

## 9. File Structure

```
npc/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── fonts/
│   ├── images/
│   │   ├── creature/
│   │   │   ├── idle_happy.png
│   │   │   ├── listening.png
│   │   │   ├── sad.png
│   │   │   ├── cracked.png
│   │   │   ├── sinister.png
│   │   │   ├── petted.png          # optional; may be CSS-only
│   │   │   └── eating.png          # optional; may be CSS-only
│   │   └── food/
│   │       ├── berry.png
│   │       └── star.png
│   └── audio/
│       ├── ambient_warm.mp3
│       ├── ambient_cold.mp3
│       ├── ambient_reveal.mp3
│       └── sfx/
│           ├── key.wav
│           ├── click.wav
│           ├── chirp_pet.wav
│           ├── chirp_feed.wav
│           ├── timer_tension.wav
│           └── cut.wav
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
│   │   ├── engine.js
│   │   ├── timer.js
│   │   └── script.js
│   ├── state/
│   │   └── playerData.js
│   ├── ui/
│   │   ├── dialogueBox.js
│   │   ├── characterSprite.js
│   │   ├── foodItem.js
│   │   └── textInput.js
│   ├── audio/
│   │   └── musicManager.js
│   ├── reveal/
│   │   ├── engine.js
│   │   └── attackExamples.js
│   └── styles/
│       └── main.css
└── docs/
    ├── prd.md
    ├── milestones.md
    └── presentation.md
```

---

## 11. Success Criteria

The pilot is considered successful if all of the following hold on Saturday evening:

1. **Runs end-to-end.** A fresh player can go from Title → Care → Dialogue → Reveal without encountering a broken state or an error.
2. **Care phase creates a bond.** The player can pet the creature and (if drag-feed ships) feed it, and the creature responds audibly and visually. The transition into the dialogue feels natural, not abrupt.
3. **Personal reveal works.** The reveal screen correctly quotes at least the player's name, one trivial detail, and one personal detail, back to them, plus the care-phase interaction summary.
4. **All five techniques represented.** Each of the five techniques from `presentation.md` is exercised at least once in the dialogue and named in the reveal.
5. **Timed beats fire correctly.** At least the urgent-ask timer works: if the player does nothing, the game advances and the reveal correctly reports `clickedExternalLink: 'timeout'` with distinct messaging ("you froze — that counted as refusal").
6. **Deployed.** The build is live at a shareable public URL.
7. **One aha reaction.** At least one playtester (anyone not the author) shows visible surprise or recognition at the reveal. This is the most important criterion; the others are preconditions for it.

---

## 12. Risks and Mitigations

- **Budget overrun.** The priority-ordered list in §10 has a cut path for every optional phase. Revisit at the halfway point — if behind, start cutting from the bottom.
- **Drag-feed is fiddly.** HTML5 drag events are unreliable across browsers. Fallback: clicking a food item sends it to the creature with a short flight animation. Same emotional outcome, no drag events.
- **Script writing overruns.** Pre-draft beats in a scratch file during phase 1 (while builds run). Set a hard timebox — move on even if lines feel rough; polish last.
- **Sprite generation fails.** Fallback to a CSS-drawn creature or 3 states plus colour shifts. The 2 reaction states are already flagged as CSS-only acceptable.
- **Timer UX feels annoying.** Keep indicator very subtle (thin receding line, no numbers). Playtest early — if the first tester says "stressful", soften or remove.
- **Music licensing confusion.** Use only Pixabay Music CC0 or Incompetech CC-BY.
- **Vite setup wastes time.** Use the vanilla template unchanged. No TypeScript, no ESLint, no test runners in setup.
- **Scope creep.** This PRD is the contract. Anything not in §3 is out of scope.
- **Deploy fails at the last hour.** Smoke-test the deploy pipeline during phase 1, before there is anything real to deploy.

---

## 13. Out of Scope (explicit)

The following are **not** in the pilot and will not be added to this PRD without a separate decision:

- LLM-driven dialogue.
- Multiple endings or branching storylines.
- Save/load, accounts, analytics, telemetry.
- Mobile-optimised layout.
- Localisation.
- Multiple food types with different effects, a hunger/happiness meter, or any care-phase stat tracking beyond counting interactions.
- Timed pressure on beats other than the fourth-wall break and the urgent ask.
- Post-reveal interactive quiz ("can you spot the technique?"). Good idea for v2.
- In-game settings menu (volume, text speed). Text speed is fixed; volume is the browser's volume.
- A soundtrack of multiple composed tracks. Three ambient loops and a handful of SFX is the ceiling.

---

## 14. Infos

1. **Game title.** Miniyou.
2. **External link behaviour.** When the player clicks the urgent link: simply advance to the reveal with `clickedExternalLink: true`. The reveal can address both outcomes.
3. **Care-phase exit condition.** 30 seconds + 2 interactions.
4. **Timer expiry reporting in the reveal.** "you froze — that counted as refusal"

---

## 15. References

- AntIhackathon brief — the competition framing this project responds to.

