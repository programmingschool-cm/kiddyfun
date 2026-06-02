# KiddyFun — All Ages Upgrade Strategy

This document describes how KiddyFun grows from a **kids-first** learning app into a platform that also serves **teens, hobbyists, and adult creators**—without breaking the simple experience for ages 6–12.

## Vision

| Stage | Audience | Experience |
|-------|----------|------------|
| **Kid** (default) | 6–12 | Missions, friendly errors, colorful UI, guided examples |
| **Creator** | 13+, hobbyists | Dark theme, Map Helper, gallery remix, arcade templates |
| **Studio** | Adults, teachers | Multi-file tabs, debugger, Python export, teacher CSV |

**Principle:** One language, one runtime—experience layers on top.

## Current baseline (shipped)

- Story mode + programming (variables, lists, functions, quiz)
- Game mode G6 (lives, timer, goals, enemies, camera, FX)
- Cloud: Supabase sync, publish (`?p=shareId`), gallery browse/remix
- Phase E1: Kid/Creator toggle, Map Helper, `pause game` / `resume game` / `level` / `next level`

## Phase E1 — Foundation ✅

| Feature | Location |
|---------|----------|
| Kid / Creator modes | `assets/js/experience-mode.js`, navbar toggle, `?mode=creator` |
| Creator theme | `body.kf-mode-creator` in `style.css` |
| Map Helper | `assets/js/game-map-helper.js`, navbar **Map** |
| Saved: rename, duplicate | `storage.js`, **Saved** panel |
| Gallery + remix | `assets/js/gallery.js`, **Gallery** panel; `?p=id&remix=1` |
| Game commands | `pause game`, `resume game`, `level starts at N`, `next level` |

## Phase E2 — Game Pro ✅

| Status | Feature |
|--------|---------|
| ✅ | **G7 maps** — `load map "school_maze"` etc. (`game-maps.js`) |
| ✅ | **Story choose** — `choose "A" or "B"`, `if choice equals "A"` |
| ✅ | **G7b** — Map JSON editor in Creator menu (`game-map-editor.js`, `game-user-maps.js`) |
| ✅ | **G8 combat** — health, damage, chase, hazards, bullets, inventory (`game-combat.js`) |
| ✅ | **Debugger** — step frame, watch vars (`game-debugger.js`) |

## Phase E3 — Creator Platform ✅ (v1)

- **Studio** — `?mode=studio`, file tabs (`project-files.js`)
- **Python export** — `python-export.js`, Studio navbar 🐍
- **Teacher** — class code + progress CSV (`teacher-panel.js`)
- Moderated gallery tags — planned (E4)

## Phase E4 — Scale

- Canvas renderer (100+ entities)
- Local / online multiplayer (optional)
- Plugin API and asset marketplace

## Technical architecture

```
Editor UI (Kid | Creator | Studio themes)
        ↓
Lexer → Parser → AST
        ↓
Story Interpreter (async)  |  Game Interpreter (60fps loop)
        ↓
DOM Stage                  |  Game World + Runtime (+ Canvas G10)
        ↓
localStorage + Supabase (programs, publish, gallery)
```

## Remix & sharing rules

- Published programs are **public read** (share link).
- Remix prepends a comment header with original title and share id.
- Encourage saving remix under a **new name** (prompt after load).
- Future: optional `fork_of` column in `published_programs`.

## What we do not change for kids

- Default mode remains **Kid**
- Existing programs keep working (no breaking syntax)
- Kid gallery can later filter to “education” tagged posts only

## Metrics (success)

- Creator mode session length > 15 minutes
- At least one remix per published program (community)
- Gallery load < 2s on 3G (list metadata only)

## Related docs

- [ROADMAP.md](../ROADMAP.md) — checklists
- [GAME_ENGINE.md](./GAME_ENGINE.md) — game syntax
- [LANGUAGE.md](./LANGUAGE.md) — full language reference
