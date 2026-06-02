# KiddyFun Language — Quick Reference

> **Full tutorial:** [TUTORIAL.md](./TUTORIAL.md) — complete guide with rules, keywords, examples, and teaching path.

**Version:** 2.2

---

## At a glance

| Idea | Syntax |
|------|--------|
| Variable | `set name to "Rafi"` |
| Constant | `const max to 3` |
| Text / number / boolean | `"Hi"`, `10`, `true` |
| List | `list "a" and "b"` |
| If / else | `if` … `else` … `end` |
| Repeat N | `repeat 3 times` … `end` |
| While | `repeat while` … `end` |
| For-each | `for each x in list` … `end` |
| Function | `define` … `end` / `call` |
| Return | `return x plus 1` |
| Input | `ask user "?"` |
| Quiz | `ask "?"` + `choice` |
| Random | `random number from 1 to 6` |
| Remainder | `10 remainder 3` |
| Add to list | `add "x" to items` |
| Remove | `remove item 2 from items` |
| Empty / contains | `is empty`, `is in` |
| break / continue | inside loops |
| Game start (game mode only) | `game "My Game"` |
| Top-down view (game mode only) | `game view top` |
| Set player (game mode only) | `Rafi is player` |
| Key pressed (game mode only) | `when space is pressed` |
| Key held (game mode only) | `if left key is held` |
| Movement (game mode only) | `move Rafi left by 4` |
| Jump (game mode only) | `Rafi jump with power 12` |
| Collision (game mode only) | `if Rafi touches coin` |
| Spawn coin (game mode only) | `spawn coin at x 200 y 150` |
| Add wall (game mode only) | `add wall at x 200 y 250 width 80 height 40` |
| Comment | `# note` |

---

## Minimal program

```text
scene "classroom"
Teacher appears
Teacher says "Hello!"
```

---

## Game mode quick starter

```text
game "Starter"
scene "playground" with walls
Rafi is player

when space is pressed
    Rafi jump with power 12
end

every frame
    if left key is held
        move Rafi left by 4
    end
    if right key is held
        move Rafi right by 4
    end
end

if Rafi touches coin
    add 10 points
    remove coin
end
```

Game mode tips:
- Use `game "..."` at the top of the file.
- Use `if <key> is held` inside `every frame` (not alone at the top level).
- Use `if <character> touches <target>` for collisions (top level or inside blocks).
- Use `spawn coin at x … y …` to place extra coins in setup.
- On mobile, use the on-screen touch pad in Output.
- Debug: `KiddyGameRuntime.debug = true` in the browser console, or `?gameDebug=1` in the URL.

---

## See also

- **[TUTORIAL.md](./TUTORIAL.md)** — complete documentation (recommended)
- **[GAME_ENGINE.md](./GAME_ENGINE.md)** — game mode behavior and architecture
- In-app **Guide** menu — copy-paste snippets
- **Examples** menu — Platform Jump, Coin Collector, Programming 101/102/103
