# KiddyFun Game Engine

Dual-mode platform: **Story mode** (existing interpreter) and **Game mode** (real-time loop).

## Entry

A program is Game mode when it starts with `game "Title"` or uses game-only blocks (`when … pressed`, `every frame`, etc.).

## Coordinates

- Origin: top-left of `#ss-stage`
- Units: pixels
- Side view: gravity pulls down; `groundY` = stage height − entity height − padding
- Top view (`game view top`): no gravity; 4-direction movement

## Input

| Syntax | Maps to |
|--------|---------|
| `left arrow` / `left key` | ArrowLeft / A |
| `right arrow` | ArrowRight / D |
| `up arrow` | ArrowUp / W |
| `down arrow` | ArrowDown / S |
| `space` | Jump (side view) |

Mobile: on-screen D-pad in bottom-right of stage.

## Core files

| File | Role |
|------|------|
| `game-world.js` | Entities, physics, AABB collision |
| `game-input.js` | Keyboard + touch pad |
| `game-loop.js` | 60fps fixed timestep |
| `game-runtime.js` | DOM rendering |
| `game-interpreter.js` | Runs game AST |
| `game-scenes.js` | Pre-built walls/coins per scene |

## Scene data

`scene "playground" with walls` loads obstacles/coins from `KiddyGameScenes`.

## Limits (v1)

- No TTS during active game loop (use log / HUD text)
- Max ~10 entities recommended
- Story and game do not mix in one program (use dual mode separately)
