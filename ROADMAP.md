# KiddyFun Code — Product Roadmap

> **Vision:** Scratch-style visual coding + Duolingo-style English speaking + KiddyFun's own English-like language — in one browser platform for kids.

**Last updated:** 2026-05-28 (Full platform v1.2)  
**Current version:** v1.2 (Blocks, 30 lessons, tests, Bangla UI, full A/B/C/D v1)

---

## How to use this document

1. Pick **one phase** and **one unchecked item** at a time.
2. When done, change `[ ]` → `[x]` and add a note under **Changelog** at the bottom.
3. Update **Last updated** date when you edit this file.

**Status legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[—]` Cancelled

---

## Phase 0 — Foundation ✅

- [x] Lexer → Parser → Interpreter → Runtime pipeline
- [x] Scenes, characters, actions, dialogue, quiz, game engine G0–G8

---

## Phase A — Quick wins ✅ (v1)

### A1. Learning UX polish

- [x] Line-number highlight on error (`KiddySmartEditor.highlightErrorLine`)
- [x] Editor undo/redo (Ctrl+Z / Ctrl+Y)
- [x] “First run” tooltip tour (`tour.js`)
- [x] Copy share link with encoded example (`share-link.js`, `?z=`)

### A2. English & speaking

- [x] TTS speed toggle (`speech-practice.js`, ⏩ button)
- [x] “Repeat after me” on speech bubbles
- [x] Word-of-the-day on menu (`word-of-day.js`)

### A3. Content

- [x] 10 themed examples (Eid, Cumilla, sports, animals, etc.)
- [x] Missions expanded to 12 (incl. speaking mission)
- [x] Mission template: goal, hint, starter, validate, badge

### A4. Platform

- [x] PWA `manifest.json` + `sw.js`
- [x] Smoke tests: `npm test`, `npm run test:examples`
- [x] README updated for v1.2

---

## Phase G — Game engine ✅

- [x] G0–G8 including maps, combat, debugger
- [x] G7 tile painter UI (`game-tile-painter.js` in map editor)

---

## Phase E — All Ages ✅

- [x] E1 Kid / Creator / Studio
- [x] E2 Game Pro (maps, branching, combat, debugger)
- [x] E3 Python export, multi-file, teacher lite

---

## Phase B — Core platform ✅ (v1)

### B1. Speak-back

- [x] Speech recognition + repeat button
- [x] Speaking stats in localStorage
- [x] Mission 12: Speak English

### B2. Curriculum

- [x] 30 lessons in `curriculum.json` (6 levels × 5)
- [x] Lessons panel + sequential unlock

### B3. Block mode

- [x] Custom block palette (`blocks-mode.js`) — Text | Blocks toggle
- [x] Blocks → insert text code
- [ ] Text → blocks (best-effort) — deferred v2

### B4. Language features

- [x] Variables, lists, random (already in language)
- [x] `if choice equals` parser fix + interpreter

### B5. Gamification

- [x] XP, streak, daily challenge
- [x] Badge gallery panel
- [x] Theme unlock by XP (`avatar-themes.js`)

---

## Phase C — Scale ✅ (v1 lite)

### C1. Teacher & parent

- [x] Teacher dashboard + CSV + printable worksheet
- [x] Parent summary panel

### C2. Backend

- [x] Supabase sync (existing)
- [~] Moderated gallery — workflow doc only ([GALLERY_MODERATION.md](docs/GALLERY_MODERATION.md))

### C3. Python

- [x] Transpiler + export + Python bridge panel (side-by-side)

### C4. Tools

- [x] Rule-based hint bot (`hint-bot.js`)
- [ ] Teacher JSON lesson authoring UI — use `curriculum.json` for now
- [x] Bangla UI toggle (`ui-locale.js`) — code stays English

### C5. Mobile & performance

- [ ] Capacitor wrapper
- [ ] Low-end device QA
- [~] Font lazy-load
- [~] Full a11y audit

---

## Phase D — Quality ✅ (v1)

### D1. Child safety

- [x] No public chat (by design)
- [x] Gallery moderation doc
- [x] Privacy checklist ([PRIVACY.md](docs/PRIVACY.md))

### D2. Testing

- [x] Parser unit tests
- [x] Example smoke tests
- [x] GitHub Action `.github/workflows/test.yml`
- [ ] Manual mobile QA checklist

### D3. Documentation

- [x] `docs/LANGUAGE.md` (existing)
- [x] `docs/CONTRIBUTING.md`
- [x] `docs/ARCHITECTURE.md`
- [ ] Teacher video walkthrough

---

## Deferred / Phase E4 (future)

- [ ] Full Blockly drag-and-drop AST
- [ ] Canvas/WebGL renderer
- [ ] Multiplayer
- [ ] Plugin system
- [ ] AI hint bot (LLM)

---

## Changelog

| Date | Item | Notes |
|------|------|-------|
| 2026-05-28 | **v1.2 full platform** | A/B/C/D v1, blocks, 30 lessons, tests, Bangla UI, hints, themes |
| 2026-05-28 | E2 + E3 + B1/B2/B5/C1/C3 v1 | G8, Studio, curriculum starter |
| 2026-05-28 | E1 complete | Gallery, Creator modes |
| 2026-05-27 | Phase G | Game engine |
| 2026-05-24 | Phase 0 | v1.0 baseline |

---

*Programming School — Cumilla*
