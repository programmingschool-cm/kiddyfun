# KiddyFun Code — Complete Language Tutorial & Reference

**Version:** 2.2  
**Audience:** Kids (ages 6–12), teachers, and parents  
**Style:** English-like sentences — read them aloud like normal English.

---

## Table of contents

1. [What is KiddyFun Code?](#1-what-is-kiddyfun-code)
2. [Your first program](#2-your-first-program)
3. [How to run code](#3-how-to-run-code)
4. [Writing rules (must follow)](#4-writing-rules-must-follow)
5. [Comments](#5-comments)
6. [Data types](#6-data-types)
7. [Variables](#7-variables)
8. [Constants (`const`)](#8-constants-const)
9. [Expressions & math](#9-expressions--math)
10. [Comparisons & logic](#10-comparisons--logic)
11. [Conditions (`if` / `else`)](#11-conditions-if--else)
12. [Loops](#12-loops)
13. [Lists](#13-lists)
14. [Functions](#14-functions)
15. [Keyboard input (`ask user`)](#15-keyboard-input-ask-user)
16. [Random numbers & remainder](#16-random-numbers--remainder)
17. [Story & stage commands](#17-story--stage-commands)
18. [Quiz (multiple choice)](#18-quiz-multiple-choice)
19. [Score & sounds](#19-score--sounds)
20. [Vocabulary cards](#20-vocabulary-cards)
21. [Debug: `show type` / `show value`](#21-debug-show-type--show-value)
22. [Complete keyword list](#22-complete-keyword-list)
23. [Variable naming rules](#23-variable-naming-rules)
24. [Built-in characters & scenes](#24-built-in-characters--scenes)
25. [Common mistakes](#25-common-mistakes)
26. [Quick reference cheat sheet](#26-quick-reference-cheat-sheet)
27. [Learning path & examples](#27-learning-path--examples)
28. [Game mode quick start](#28-game-mode-quick-start)
29. [Build a side-view game in 5 steps](#29-build-a-side-view-game-in-5-steps)
30. [Build a top-down game in 5 steps](#30-build-a-top-down-game-in-5-steps)
31. [Game debug checklist](#31-game-debug-checklist)

---

## 1. What is KiddyFun Code?

KiddyFun Code is a **small programming language** made for children. You type **simple English sentences**. The computer runs them step by step and shows an **animated story** on stage.

You learn real ideas used everywhere in programming:

- Storing data (**variables**)
- Making decisions (**if**)
- Repeating work (**loops**)
- Reusing steps (**functions**)
- Talking to the user (**input**)

You do **not** need to install anything. Open the app in a browser, write code, press **▶️ RUN**.

---

## 2. Your first program

```text
scene "classroom"

Teacher appears
Teacher says "Hello! Welcome to coding!"
Teacher waves
```

**What happens:**

1. Background changes to a classroom.
2. Teacher character appears.
3. Teacher speaks (speech bubble + optional English voice).
4. Teacher waves.

---

## 3. How to run code

| Step | Action |
|------|--------|
| 1 | Write code in the **Code** panel (left on desktop, **Code** tab on mobile). |
| 2 | Click **▶️ RUN**. |
| 3 | Watch the **Output** panel (stage, log, score). |
| 4 | Use **⏹️ STOP** to cancel a running program. |
| 5 | Use **🔄 Reset** to clear the stage. |

**Mobile:** After RUN, the app switches to the **Output** tab automatically.

**Keyboard input:** When the program uses `ask user`, a friendly input box appears **below the stage** in the Output panel. Type your answer and press **OK ✓** or **Enter**.

---

## 4. Writing rules (must follow)

### 4.1 One command per line

```text
Rafi appears
Rafi says "Hi"
```

### 4.2 Indentation inside blocks

Commands **inside** `if`, `repeat`, `define`, `for each`, and `else` must be **indented** (4 spaces or 1 tab):

```text
if score is greater than 10
    narrator says "Great score!"
end
```

### 4.3 Every block needs `end`

| Block starts with | Must end with |
|-------------------|---------------|
| `if` | `end` |
| `else` | `end` |
| `repeat` | `end` |
| `repeat while` | `end` |
| `define` | `end` |
| `for each` | `end` |

### 4.4 Text in double quotes

```text
Rafi says "Hello!"
set name to "Mina"
```

Use straight quotes `"` like on a keyboard.

### 4.5 Names are case-insensitive for characters

`Rafi`, `rafi`, and `RAFI` are the same character.

### 4.6 Order matters

The computer runs lines **from top to bottom**, unless a loop or `if` changes the flow.

---

## 5. Comments

Start a line with `#`. The computer ignores it.

```text
# This is a note for humans
Rafi says "Hi"   # you can also comment at the end (avoid on same line as complex commands)
```

---

## 6. Data types

| Type | Example in code | What it means |
|------|-----------------|---------------|
| **Text** (string) | `"Hello"` | Words and sentences |
| **Number** | `10`, `3.5` | Counting and math |
| **True/false** | `true`, `false` | Yes/no decisions |
| **List** | `list "a" and "b"` | Many items in order |

Check a value’s type:

```text
show type of age      # number
show type of name     # text
show type of ready    # true/false
show type of items    # list
```

---

## 7. Variables

Variables **store** values. Use `set` to create or change them.

```text
set name to "Rafi"
set age to 10
set happy to true
set score to 0

set score to score plus 10
set message to "Hi" joined with " there"
```

### Rules

- Format: `set` **name** `to` **value**
- You can use a variable on the right side: `set x to x plus 1`
- Use variables in speech: `Rafi says name` (no quotes around the variable name)

### Built-in variable: `answer`

- After a **quiz** (`ask "..."` with choices), `answer` is `"correct"` or `"wrong"`.
- After **`ask user`**, `answer` is the text the user typed.

---

## 8. Constants (`const`)

A **constant** is set once and **cannot change**.

```text
const maxLives to 3
const gameName to "KiddyFun"

# This will ERROR:
# set maxLives to 5
```

Format: `const` **name** `to` **value**

---

## 9. Expressions & math

Use these **inside** `set`, `if`, `return`, or when a character `says` a value.

| Operation | Syntax | Example |
|-----------|--------|---------|
| Add | `plus` | `5 plus 3` |
| Subtract | `minus` | `10 minus 4` |
| Multiply | `times` | `4 times 2` |
| Divide | `divided by` | `8 divided by 2` |
| Join text | `joined with` | `"Hi" joined with " there"` |
| Remainder (mod) | `remainder` | `11 remainder 2` |
| Length | `length of` | `length of name` |
| List item | `item` N `in` list | `item 1 in fruits` |
| Random | `random number from` A `to` B | `random number from 1 to 6` |
| Call function | `call` fn `with` args | `call addTen with 5` |
| Ask user | `ask user` `"question?"` | `ask user "Your name?"` |

**List positions start at 1** (not 0): `item 1 in fruits` is the first item.

**Example:**

```text
set total to 5 plus 3 times 2
set fullName to firstName joined with " " joined with lastName
set dice to random number from 1 to 6
```

---

## 10. Comparisons & logic

### Comparisons

| Meaning | Syntax |
|---------|--------|
| Equal | `x equals 5` or `x equals "hi"` |
| Equal (another form) | `x is equal to 5` |
| Not equal | `x is not equal to 5` |
| Greater than | `x is greater than 10` |
| Less than | `x is less than 3` |
| Greater or equal | `x is greater than or equal to 5` |
| Less or equal | `x is less than or equal to 0` |
| List is empty | `items is empty` |
| Value in list | `"apple" is in fruits` |

### Logic

| Operation | Syntax |
|-----------|--------|
| And | `... and ...` |
| Or | `... or ...` |
| Not | `not ...` |

**Example:**

```text
if age is greater than 5 and happy equals true
    narrator says "Ready to code!"
end
```

---

## 11. Conditions (`if` / `else`)

### General condition

```text
if score is greater than 10
    narrator says "High score!"
else
    narrator says "Keep trying!"
end
```

- `else` is optional.
- There is **no** `else if` yet — nest another `if` inside if you need more branches.

### Quiz condition

After a multiple-choice quiz:

```text
ask "What is 2 + 2?"
choice "3" wrong
choice "4" correct
choice "5" wrong

if answer is correct
    narrator says "Yes!"
else
    narrator says "Try again!"
end
```

---

## 12. Loops

### Repeat a fixed number of times

```text
repeat 3 times
    Rafi waves
end
```

- Number must be **1 to 100**.

### Repeat while a condition is true

```text
set count to 1
repeat while count is less than 4
    Rafi waves
    set count to count plus 1
end
```

Safety: loops stop after 500 iterations to avoid infinite loops.

### For each item in a list

```text
set colours to list "red" and "blue" and "green"
for each colour in colours
    narrator says colour
end
```

### `break` and `continue`

Use **inside** loops only.

| Command | Effect |
|---------|--------|
| `break` | Stop the loop completely |
| `continue` | Skip to the next repeat / next list item |

```text
set n to 0
repeat while n is less than 10
    set n to n plus 1
    if n equals 5
        continue
    end
    if n is greater than 7
        break
    end
    show value of n
end
```

---

## 13. Lists

### Create a list

```text
set fruits to list "apple" and "banana" and "mango"
set numbers to list 1 and 2 and 3
```

### Read items

```text
set first to item 1 in fruits
set n to length of fruits
```

### Change a list

```text
add "pear" to fruits
remove item 2 from fruits
```

- `remove item 2 from fruits` removes the **2nd** item (position 2).
- You cannot `add` to a `const` list.

### Test a list

```text
if fruits is empty
    narrator says "No fruit!"
end

if "apple" is in fruits
    narrator says "We have apples!"
end
```

---

## 14. Functions

Functions group steps you want to run again.

### No parameters

```text
define waveHello
    Rafi waves
    Rafi says "Hello!"
end

call waveHello
```

### With parameters

```text
define greet with name
    narrator says name
end

call greet with "Teacher"
call greet with "Rafi"
```

Multiple parameters use `and`:

```text
define addNumbers with a and b
    return a plus b
end

set total to call addNumbers with 5 and 10
```

### Return a value

```text
define double with n
    return n times 2
end

set score to 10
set score to call double with score
```

- `return` can be used alone: `return` (returns true).
- Use `set x to call myFn with ...` to store the result.

### Function naming tip

Do **not** use grammar words as the function name (`with`, `to`, `if`, `list`, …).  
Good names: `addNumbers`, `double`, `sayHello`.

---

## 15. Keyboard input (`ask user`)

Shows an input box in the **Output** panel (not a browser popup).

### As a statement

```text
ask user "What is your name?" as playerName
narrator says playerName
```

- Saves the typed text in `playerName`.
- Also saves in `answer`.

### Inside an expression

```text
set colour to ask user "Favourite colour?"
```

### Format

```text
ask user "Your question here?"
ask user "Your question?" as variableName
```

---

## 16. Random numbers & remainder

```text
set roll to random number from 1 to 6
narrator says roll

set check to 11 remainder 2
if check equals 0
    narrator says "11 is even"
else
    narrator says "11 is odd"
end
```

- Random includes **both** ends: `from 1 to 6` can be 1, 2, 3, 4, 5, or 6.
- `remainder` is the same idea as “modulo” (%) in other languages.

---

## 17. Story & stage commands

### Scenes

```text
scene "classroom"
scene "jungle"
scene "space"
```

Built-in scene names (see [§24](#24-built-in-characters--scenes)): `school`, `classroom`, `jungle`, `restaurant`, `home`, `playground`, `space`.  
Unknown names still work with a default background.

### Character appears

```text
Rafi appears
Teacher appears
```

### Character says (text)

```text
Rafi says "Hello!"
Rafi says name
```

### Narrator

```text
narrator says "Once upon a time..."
narrator says message
```

### Character actions

| Command | Effect |
|---------|--------|
| `waves` | Wave |
| `smiles` | Smile |
| `jumps` | Jump |
| `flies` | Fly |
| `hides` | Hide |
| `shows` | Show again |
| `flaps` | Flap wings |
| `runs` | Run |
| `dances` | Dance |
| `bows` | Bow |
| `walks` | Walk |
| `handshakes` | Handshake |
| `nods` | Nod |
| `cheers` | Cheer |
| `moves right` | Move right |
| `moves left` | Move left |

**Example:**

```text
Monkey appears
Monkey jumps
Monkey says "Bananas!"
```

### Wait (pause)

```text
wait 1
wait 2
```

Pauses for that many **seconds** (max 8 seconds per wait).

---

## 18. Quiz (multiple choice)

Different from `ask user` — this shows **buttons** on stage.

```text
ask "What colour is the sky?"
choice "Green" wrong
choice "Blue" correct
choice "Red" wrong

if answer is correct
    narrator says "Correct!"
else
    narrator says "Not quite."
end
```

### Rules

1. Start with `ask "question?"` (no `user` keyword).
2. Add one or more `choice "text" correct` or `choice "text" wrong`.
3. At least one choice should be `correct`.
4. Use `if answer is correct` or `if answer is wrong` after the quiz runs.

---

## 19. Score & sounds

### Score

```text
score starts at 0
add 10 points
add 5 points
show score
```

- `add 10 points` is for the **game score** (not the same as `add "x" to list`).

### Sounds

```text
play sound "success"
play sound "clap"
play sound "cheer"
```

Common sound names: `success`, `clap`, `cheer`, `win`, `pop`.

---

## 20. Vocabulary cards

Teach English words on screen:

```text
show word "brave" means "সাহসী"
show word "hello" means "হ্যালো"
```

---

## 21. Debug: `show type` / `show value`

Prints to the **log** panel (green console in Output):

```text
show type of score
show value of playerName
```

Use while learning to see what the computer stored.

---

## 22. Complete keyword list

Words the language understands (do not misspell):

### Story & stage

`scene`, `appears`, `says`, `narrator`, `wait`, `show`, `word`, `means`,  
`waves`, `smiles`, `jumps`, `flies`, `moves`, `right`, `left`, `hides`, `shows`,  
`flaps`, `clap`, `runs`, `dances`, `bows`, `walks`, `handshakes`, `nods`, `cheers`

### Quiz & score

`ask`, `choice`, `correct`, `wrong`, `answer`, `score`, `starts`, `at`, `points`, `play`, `sound`

### Programming

`set`, `to`, `const`, `true`, `false`, `define`, `call`, `return`, `with`, `end`, `else`, `if`,  
`repeat`, `times`, `while`, `for`, `each`, `break`, `continue`,  
`and`, `or`, `not`, `is`, `equals`, `equal`, `greater`, `than`, `less`,  
`plus`, `minus`, `divided`, `by`, `joined`, `length`, `of`, `list`, `item`, `in`,  
`type`, `value`, `user`, `as`, `random`, `number`, `from`, `remainder`,  
`add`, `remove`, `empty`

---

## 23. Variable naming rules

### Allowed names

- Letters and numbers: `score`, `player1`, `maxLives`
- Many “normal” words that are keywords elsewhere: `add`, `times`, `show`, `play`, `score` (as **variable** names in expressions)

### Not allowed as names

Grammar words the parser needs:

`to`, `with`, `and`, `or`, `not`, `is`, `in`, `of`, `if`, `else`, `end`,  
`set`, `define`, `call`, `const`, `for`, `each`, `break`, `continue`,  
`list`, `item`, `ask`, `user`, `as`, `true`, `false`, …

### Tips

| Bad | Good |
|-----|------|
| `define with n` | `define greet with n` |
| `define add with a` | `define addNumbers with a` |
| `set to to 5` | `set target to 5` |

Character names (`Rafi`, `Teacher`) are separate from variables.

---

## 24. Built-in characters & scenes

### Characters (emoji on stage)

| Name | Emoji |
|------|-------|
| Rafi | 👦 |
| Mina | 👧 |
| Teacher | 👩‍🏫 |
| Seller | 🧑‍🍳 |
| Buyer | 🛍️ |
| Lion | 🦁 |
| Bird | 🐦 |
| Monkey | 🐒 |
| Robot | 🤖 |
| Cat | 🐱 |
| Dog | 🐶 |
| Mostak | 👨‍💻 |
| Sagor | 🧑‍💻 |
| Rabiul | 👨‍🎓 |
| Narrator | 📖 (use `narrator says` — no `appears` needed) |

Any other name you type still works with a default avatar.

### Scenes

| Name | Theme |
|------|--------|
| `school` | School outdoor |
| `classroom` | Indoor class |
| `jungle` | Jungle |
| `restaurant` | Restaurant |
| `home` | Home |
| `playground` | Playground |
| `space` | Space |

---

## 25. Common mistakes

| Error message / problem | Fix |
|-------------------------|-----|
| `Expected: define myFunction` | Put a name after `define`: `define greet with x` |
| `Your "if" block needs an "end"` | Add `end` at the same indent level as `if` |
| `Unknown variable: x` | `set x to ...` before using `x` |
| `Cannot change const` | Use `set` on a normal variable, not `const` |
| `Unexpected extra text` | Check quotes and spelling on the line |
| Quiz does nothing | Add `choice` lines after `ask "..."` |
| Input uses browser popup | Refresh page; use latest app with Output panel input |
| `add` confused with points | `add 10 points` vs `add "x" to myList` |

---

## 26. Quick reference cheat sheet

```text
# Structure
scene "classroom"
Character appears
Character says "text"
wait 1
end

# Data
set x to 10
set s to "hi"
set ok to true
set items to list "a" and "b"
const limit to 100

# Math & logic
set y to x plus 1
if x is greater than 5
if s equals "hi"
if items is empty
if "a" is in items

# Loops
repeat 3 times ... end
repeat while x is less than 10 ... end
for each item in items ... end
break / continue

# Functions
define fn with a and b ... end
call fn with 1 and 2
return value

# Input
ask user "?" as name

# Lists
add "x" to items
remove item 2 from items

# Random
set n to random number from 1 to 6

# Quiz
ask "?"
choice "a" correct
if answer is correct ... end

# Score
score starts at 0
add 10 points
show score
play sound "success"
```

---

## 27. Learning path & examples

Load these from the **Examples** menu in the app:

| Example | Topics |
|---------|--------|
| **💻 Programming 101** | Variables, types, lists, if, functions, `repeat while` |
| **⌨️ Input, for-each, const** | `ask user`, `for each`, `const`, `break`, `continue`, `return` |
| **🎲 Lists, random, and more** | Random, remainder, add/remove list, empty, `is in`, `>=` |

### Suggested order for teachers

1. Scene + character + `says` + actions  
2. `repeat N times`  
3. Quiz + `if answer is correct`  
4. `set` / `show value`  
5. `if` with comparisons  
6. `define` / `call`  
7. Lists + `for each`  
8. `ask user`  
9. Random, remainder, list add/remove  

---

## 28. Game mode quick start

Game mode is separate from story mode. Use it when you want real-time controls (arrow keys / touch pad), jump, and collisions.

```text
game "My First Game"
scene "playground" with walls
Rafi is player

every frame
    if left key is held
        move Rafi left by 4
    end
    if right key is held
        move Rafi right by 4
    end
end
```

Game-mode-only commands:
- `game "Title"`
- `game view top`
- `Rafi is player`
- `when <key> is pressed`
- `if <key> is held`
- `move <character> <dir> by <number>`
- `<character> jump with power <number>`
- `if <character> touches <coin/wall/...>`

---

## 29. Build a side-view game in 5 steps

### Step 1: Start game + scene
```text
game "Platform Jump"
scene "playground" with walls
score starts at 0
Rafi is player
```

### Step 2: Horizontal movement
```text
every frame
    if left key is held
        move Rafi left by 5
    end
    if right key is held
        move Rafi right by 5
    end
end
```

### Step 3: Add jump
```text
when space is pressed
    Rafi jump with power 14
end
```

### Step 4: Add collision reward
```text
if Rafi touches coin
    add 10 points
    play sound "success"
    remove coin
end
```

### Step 5: Polish + run
- Click **Run**
- Collect coins and watch score
- Tune difficulty by changing `move ... by` and `jump with power`

---

## 30. Build a top-down game in 5 steps

### Step 1: Enable top view
```text
game "Coin Collector"
game view top
scene "school" with walls
score starts at 0
Mina is player
```

### Step 2: 4-direction controls
```text
every frame
    if left key is held
        move Mina left by 4
    end
    if right key is held
        move Mina right by 4
    end
    if up key is held
        move Mina up by 4
    end
    if down key is held
        move Mina down by 4
    end
end
```

### Step 3: Collect coins
```text
if Mina touches coin
    add 15 points
    play sound "cheer"
    remove coin
end
```

### Step 4: Balance gameplay
- Lower speed for precision (`by 3`)
- Increase speed for challenge (`by 5`)

### Step 5: Make your own level
- Change scene (`school`, `jungle`, `playground`)
- Add custom walls with `add wall at x ... y ... width ... height ...`

---

## 31. Game debug checklist

If your game is not running correctly, check in this order:

1. **Mode start**: First line is `game "..."`.
2. **Player set**: You have `<Character> is player`.
3. **Movement block**: `every frame` block exists and lines are indented.
4. **Key condition**: Use `if left key is held` (not `if left key held`).
5. **Collision format**: Use `if Rafi touches coin` exactly.
6. **Block closing**: Every `if` / `when` / `every frame` ends with `end`.
7. **Mobile controls**: Use the on-screen pad at bottom-right in Output panel.

Quick test snippet:
```text
game "Input Test"
scene "playground"
Rafi is player
every frame
    if left key is held
        move Rafi left by 4
    end
    if right key is held
        move Rafi right by 4
    end
end
```

If this snippet works, your issue is in your game-specific logic.

See also [GAME_ENGINE.md](./GAME_ENGINE.md) for engine-level details.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [LANGUAGE.md](./LANGUAGE.md) | Short syntax summary |
| [GAME_ENGINE.md](./GAME_ENGINE.md) | Game mode (keyboard, collision) |
| [../README.md](../README.md) | Project overview & setup |
| [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) | Cloud save & login |
| [GITHUB_PAGES.md](./GITHUB_PAGES.md) | Publish online |

---

*KiddyFun Code — learn programming and English together.*
