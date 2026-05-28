# KiddyFun Code — Product Roadmap

> **Vision:** Scratch-style visual coding + Duolingo-style English speaking + KiddyFun's own English-like language — in one browser platform for kids.

**Last updated:** 2026-05-24 (Supabase cloud sync)  
**Current version:** v1.0 (compiler, TTS, missions, mobile UI)

---

## How to use this document

1. Pick **one phase** and **one unchecked item** at a time.
2. When done, change `[ ]` → `[x]` and add a note under **Changelog** at the bottom.
3. Update **Last updated** date when you edit this file.
4. Keep items small — if a task takes more than ~1 week, split it into sub-items.

**Status legend**

| Mark | Meaning |
|------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[—]` | Cancelled / deferred |

**Priority order (recommended)**

1. Speak-back + pronunciation  
2. Structured 30-lesson curriculum  
3. Block mode (ages 6–9)  
4. PWA + teacher dashboard  
5. Python bridge (ages 10+)

---

## Phase 0 — Foundation (mostly done)

Core platform that exists today. Use as baseline before new features.

- [x] Lexer → Parser → Interpreter → Runtime pipeline
- [x] Scenes, characters, actions, dialogue
- [x] Quiz, repeat, if/else, score
- [x] Vocabulary cards (`show word`)
- [x] Web Speech TTS (English voice on `says`)
- [x] Web Audio synthesized sounds
- [x] Examples + missions + localStorage progress
- [x] Responsive desktop + mobile layout
- [x] Fixed-height scrollable console log

---

## Phase A — Quick wins (1–2 weeks)

High impact, low complexity. Good next sprint.

### A1. Learning UX polish

- [ ] Line-number highlight on error (show which line failed)
- [ ] Editor undo/redo (Ctrl+Z / Ctrl+Y)
- [ ] “First run” tooltip tour (Code tab → Run → Output tab on mobile)
- [ ] Copy share link with encoded example (URL hash or query)

### A2. English & speaking (light)

- [ ] TTS speed toggle: Slow / Normal (store preference in localStorage)
- [ ] “Repeat after me” button under speech bubbles (replay TTS)
- [ ] Word-of-the-day card on menu open (rotate from a word list)

### A3. Content

- [ ] Add 10 new example programs (themed: Eid, sports, Cumilla, animals)
- [ ] Expand missions from 5 → 10 (one concept per mission)
- [ ] Each mission: goal, hint, starter code, validation, badge (template in `missions.js`)

### A4. Platform

- [ ] PWA: `manifest.json` + service worker for offline install
- [ ] Auto-run all examples in a smoke-test script (headless or manual checklist)
- [ ] Update README to match KiddyFun branding and v1.0 features

---

## Phase G — Game engine (keyboard / 2D)

Real-time **Game mode** alongside existing **Story mode** (dual mode — story programs unchanged).

- [x] G0: Architecture — `game-world.js`, `game-loop.js`, `game-input.js`, `game-runtime.js`, `docs/GAME_ENGINE.md`
- [x] G1: Language — `game "..."`, `Rafi is player`, `when` / `while key` / `every frame`
- [x] G2: Side-view physics — gravity, jump, `move … by`, entity render sync
- [x] G3: AABB collision — `if … touches`, `scene … with walls`, `add wall at`, `remove coin`
- [x] G4: Examples + missions + syntax reference (Game mode group)
- [x] G5: Top-down — `game view top`, 4-direction movement, Coin Collector example
- [ ] G6 (future): Scrolling camera, enemy templates, tile editor, block mode mapping

---

## Phase B — Core platform (1–2 months)

Makes KiddyFun a **product**, not just a demo.

### B1. Speak-back & pronunciation (★ top differentiator)

- [ ] Web Speech **Recognition** API integration (`assets/js/speech-practice.js`)
- [ ] After character speaks: “Your turn!” → kid speaks → match score
- [ ] Gentle feedback: “Try again: Good MOR-ning” (keyword / fuzzy match)
- [ ] Store speaking attempts in localStorage (optional privacy-safe stats)
- [ ] Mission type: “Say this sentence correctly to continue”

### B2. Structured curriculum (30 lessons)

- [ ] Create `assets/data/curriculum.json` (or `lessons.js`) — levels 1–6
- [ ] Level 1: Hello & Scene  
- [ ] Level 2: Actions & Movement  
- [ ] Level 3: Quiz & Logic  
- [ ] Level 4: Loops (`repeat`)  
- [ ] Level 5: Score & Sound  
- [ ] Level 6: Mini projects (restaurant, jungle, classroom)
- [ ] UI: Lesson list in offcanvas with lock/unlock by completion
- [ ] Each lesson: goal → hint → starter → challenge → badge

### B3. Block mode (ages 6–9)

- [ ] Choose approach: Blockly library **or** custom drag blocks
- [ ] Blocks map to same AST nodes as text parser (single interpreter)
- [ ] Toggle: **Blocks | Text** in editor header
- [ ] Block → generate text code (readable export)
- [ ] Text → blocks (best-effort, v2)

### B4. New language features

- [ ] Variables: `set name to "Rafi"`
- [ ] Lists: `words are "hello", "bye", "thanks"`
- [ ] Random: `pick random "sunny", "rainy", "cloudy"`
- [ ] Update lexer, parser, interpreter, guide, and one mission per feature

### B5. Gamification

- [ ] XP points per mission + daily streak
- [ ] Badge gallery page (all earned badges)
- [ ] Daily challenge (rotating goal in menu)
- [ ] Optional avatar / theme unlock (localStorage only, no accounts yet)

---

## Phase C — Scale & ecosystem (3–6 months)

School-ready and growth features.

### C1. Teacher & parent layer

- [ ] Teacher dashboard (class code, view aggregated progress)
- [ ] Parent summary: “Today: loops, words: brave, friend”
- [ ] Printable worksheet generator (PDF or print CSS)
- [ ] Export student progress CSV

### C2. Accounts & backend (optional)

- [x] Choose backend: **Supabase** (see [`docs/BACKEND.md`](docs/BACKEND.md); Firebase deferred)
- [x] Child-safe auth (minimal PII, parent consent flow) — anonymous sign-in + optional parent email magic link ([`assets/js/supabase-auth.js`](assets/js/supabase-auth.js))
- [x] Cloud save programs + sync progress across devices — offline-first [`storage.js`](assets/js/storage.js) + [`supabase-sync.js`](assets/js/supabase-sync.js); SQL schema in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
- [ ] Moderated project gallery (share story URL)

### C3. Grow to Python

- [ ] `SpeakScript → Python` transpiler module
- [ ] “Export as Python” button in editor
- [ ] Side-by-side view: KiddyFun code | Python equivalent
- [ ] Lesson bridge: “You learned loops — here is Python `for`”

### C4. AI & content tools

- [ ] “Why isn’t my code working?” hint bot (rule-based first, AI optional)
- [ ] Teacher content authoring UI (add lesson without editing JSON by hand)
- [ ] Bangla instruction layer (UI language toggle, code stays English)

### C5. Mobile app & performance

- [ ] Capacitor (or similar) wrapper for installable app
- [ ] Test on low-end Android + slow 3G
- [ ] Lazy-load fonts; reduce first paint time
- [ ] Accessibility audit (keyboard, contrast, ARIA)

---

## Phase D — Quality, safety & trust

Run in parallel with any phase.

### D1. Child safety

- [ ] No open public chat
- [ ] Gallery moderation workflow documented
- [ ] Privacy policy + minimal data collection (COPPA-inspired checklist)
- [ ] No third-party trackers in kid-facing pages

### D2. Testing & CI

- [ ] Parser unit tests (valid + invalid programs)
- [ ] Mission validation tests
- [ ] GitHub Action: run tests on push
- [ ] Manual QA checklist for mobile (iOS Safari, Android Chrome)

### D3. Documentation

- [ ] `docs/LANGUAGE.md` — full syntax reference
- [ ] `docs/CONTRIBUTING.md` — how to add examples/missions
- [ ] `docs/ARCHITECTURE.md` — lexer/parser/runtime diagram
- [ ] Video walkthrough for teachers (link in README)

---

## Content calendar (ongoing)

Aim for **1 release per week** of learning material.

| Weekly deliverable | Owner | Status |
|--------------------|-------|--------|
| 1 themed project (story + code) | | [ ] |
| 5 vocabulary cards | | [ ] |
| 1 speaking challenge | | [ ] |
| 1 quiz mission | | [ ] |

**Theme ideas:** Eid story, World Cup, Cumilla tour, school day, restaurant, space, friendship.

---

## Technical notes (for implementers)

| Area | Current location | Notes |
|------|------------------|-------|
| Language lexer | `assets/js/lexer.js` | Add keywords here first |
| Parser / AST | `assets/js/parser.js` | New node types |
| Execution | `assets/js/interpreter.js` | Async timing + TTS waits |
| Stage / UI | `assets/js/runtime.js` | DOM, animations |
| TTS / sound | `assets/js/audio.js` | Speech synthesis + Web Audio |
| Missions | `assets/js/missions.js` | Copy pattern for new missions |
| Examples | `assets/js/examples.js` | Copy pattern for new examples |
| UI panels | `assets/js/ui.js` | Guide, missions, saved |
| Styles | `assets/css/style.css` | Design tokens `--kf-*` |

**Suggested new files (when ready)**

```
assets/js/speech-practice.js   # Phase B1
assets/js/blocks.js            # Phase B3
assets/js/curriculum.js        # Phase B2
assets/data/curriculum.json    # Phase B2
docs/LANGUAGE.md               # Phase D3
manifest.json                  # Phase A4
sw.js                          # Phase A4 service worker
docs/BACKEND.md                # Phase C2 — Supabase quick reference
docs/SUPABASE_GUIDE.md         # Phase C2 — full Supabase guideline (BN)
supabase/migrations/001_initial_schema.sql
assets/js/supabase-*.js        # Phase C2 — config, client, sync, auth
```

---

## Changelog (execution log)

Record completed steps here. Newest first.

| Date | Item | Notes |
|------|------|-------|
| 2026-05-27 | Phase G (Game engine) | Dual mode: game loop, keyboard, jump, collision, top-down view |
| 2026-05-24 | Roadmap created | Initial plan from product review |
| 2026-05-24 | Phase 0 baseline | v1.0: TTS, audio, UI upgrade, mobile stage fix |

---

## One-sentence pitch (for README / marketing)

**KiddyFun Code** teaches kids programming and spoken English together — they write simple English stories, watch them come alive, answer quizzes, and practice speaking, all in the browser with no install.

---

*Programming School — Cumilla · [Update this roadmap as you ship]*
