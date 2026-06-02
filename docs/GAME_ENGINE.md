# KiddyFun Game Engine

Dual-mode platform: **Story mode** (existing interpreter) and **Game mode** (real-time loop).

## Entry

A program is Game mode when it starts with `game "Title"` or uses game-only blocks (`when … pressed`, `every frame`, etc.).

## Coordinates

- Origin: top-left of `#ss-stage`
- Units: pixels
- Side view: gravity pulls down; `groundY` = stage height − entity height − padding
- Top view (`game view top`): no gravity; 4-direction movement
- Pre-built scenes use reference size **600×360**; positions scale when the stage is resized

## Input

| Syntax | Maps to |
|--------|---------|
| `left arrow` / `left key` | ArrowLeft / A |
| `right arrow` | ArrowRight / D |
| `up arrow` | ArrowUp / W |
| `down arrow` | ArrowDown / S |
| `space` | Jump (side view) |

Mobile: on-screen D-pad in bottom-right of stage. Click the stage once so keys are captured.

## Collision

- Top-level `if Rafi touches coin` runs **once per touch** (edge-triggered), not every frame.
- The same edge logic applies to `if … touches …` **inside** `every frame` or other blocks.
- `remove coin` removes the coin that overlaps the **player** (best overlap), not a random coin.
- `else` after `if … touches …` runs while **not** touching (each frame).

## Spawning coins

Place coins in setup (before `every frame`):

```text
spawn coin at x 200 y 150
spawn coin at x 400 y 280
```

Do **not** use `add coin at …` — the parser will suggest `spawn coin` instead.

## Setup vs runtime blocks

These belong **inside** `every frame` / `when` / `while`, not at the top level alone:

- `if left key is held` … `move …`
- `move Rafi left by 4`

The parser shows a friendly error if they are misplaced.

## Debug hitboxes

In the browser console (F12):

```js
KiddyGameRuntime.debug = true
```

Then run a game. Green boxes = entities, red = walls/platforms.  
Or open the app with `?gameDebug=1` in the URL.

## Core files

| File | Role |
|------|------|
| `game-world.js` | Entities, physics, AABB collision |
| `game-input.js` | Keyboard + touch pad |
| `game-loop.js` | 60fps fixed timestep |
| `game-runtime.js` | DOM rendering, coins, debug overlay |
| `game-interpreter.js` | Runs game AST |
| `game-scenes.js` | Pre-built walls/coins per scene |

## Scene data

`scene "playground" with walls` loads obstacles/coins from `KiddyGameScenes` (playground, jungle, school).

## G6 — Arcade features

| Syntax | Purpose |
|--------|---------|
| `lives start at 3` | Heart lives (game over at 0) |
| `timer starts at 60` | Countdown seconds (top-left HUD) |
| `goal is collect 5 coins` | Win when 5 coins collected |
| `when all coins collected` | Run block when no coins left |
| `when lives is 0` | Game over handler |
| `when time is 0` | Time up handler |
| `lose 1 life` | Lose a heart |
| `show message "Level 2!"` | Banner on HUD |
| `spawn Lion as enemy at x 400 y ground` | Enemy character |
| `Lion patrols between x 200 and x 500` | Patrol AI |
| `camera follows Rafi` | Side-scroll camera |
| `restart game` | Restart current program |
| `pause game` | Freeze game loop (render continues) |
| `resume game` | Continue after pause |
| `level starts at N` | Set level number on HUD |
| `next level` | Increment level + banner |

Win / lose overlays appear automatically when goal is met, lives hit 0, or timer hits 0.

## G7 — Load map

Load a named layout (walls + coins). Use in game **setup** (before `every frame`):

```text
load map "school_maze"
```

Built-in maps (`assets/js/game-maps.js`):

| Map | View | Description |
|-----|------|-------------|
| `school_maze` | top | Border + inner walls, 5 coins |
| `playground_extended` | side | Multi-platform course |
| `jungle_run` | side | Trees + coins |
| `arena_coins` | top | Open arena with obstacles |

Tip: use `scene "school"` for background only (no `with walls`), then `load map "…"` for layout.

## Creator mode (Phase E1)

- Toggle **Kid / Creator** in navbar, or open `?mode=creator`
- **Map Helper** (Creator only): navbar **Map** → click stage → inserts spawn/wall lines into editor
- Dark pro theme when Creator mode is active

## Limits (v1)

- No TTS during active game loop (use log / HUD text)
- Max ~10 entities recommended
- Story and game do not mix in one program (use dual mode separately)
- Tile editor and block mode → planned G7
