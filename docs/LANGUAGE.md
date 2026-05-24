# KiddyFun Language Reference (v2.2)

English-like syntax for kids — covers standard programming ideas used in industry.

## Concepts map

| Industry idea | KiddyFun syntax |
|---------------|-----------------|
| Variable | `set name to "Rafi"` |
| String (text) | `"Hello"` |
| Number | `10` / `3.5` |
| Boolean | `true` / `false` |
| List | `list "a" and "b"` |
| Function | `define` … `end` / `call` |
| If / else | `if` … `else` … `end` |
| Loop (count) | `repeat 3 times` … `end` |
| Loop (while) | `repeat while` … `end` |
| Loop (for-each) | `for each item in list` … `end` |
| Input | `ask user "question?"` |
| Constant | `const name to value` |
| break / continue | `break` / `continue` |
| Function result | `set x to call fn with 2 and 3` |
| Random | `random number from 1 to 6` |
| Remainder (mod) | `10 remainder 3` |
| List empty? | `if items is empty` |
| Item in list? | `if "a" is in items` |
| Add to list | `add "mango" to fruits` |
| Remove from list | `remove item 2 from fruits` |
| >= / <= | `is greater than or equal to` |
| Comments | `# line comment` |

## Variables

```
set player to "Rafi"
set score to 0
set alive to true
set message to "Hi" joined with " there"
```

## Types

```
show type of score    # number
show type of player   # text
show value of player  # Rafi
```

## Math & logic

```
set x to 5 plus 3
set y to 10 minus 2
set z to 4 times 2
set q to 8 divided by 2

if score is greater than 10
if name equals "Rafi"
if ready is equal to true
if count is less than 5
if level is greater than or equal to 3
if lives is less than or equal to 0
```

Use `and` / `or` / `not` inside conditions:

```
if age is greater than 5 and happy equals true
```

## Lists

```
set items to list "pen" and "book" and "bag"
set first to item 1 in items
set n to length of items
add "eraser" to items
remove item 2 from items

if items is empty
    narrator says "Nothing left!"
end

if "pen" is in items
    narrator says "We have a pen"
end
```

## Random & remainder

```
set dice to random number from 1 to 6
set oddCheck to 11 remainder 2
```

## Functions

```
define jumpTwice
    Monkey jumps
    Monkey jumps
end

call jumpTwice

define greet with who
    narrator says who
end

call greet with "Teacher"
```

## Keyboard input

A friendly input box appears in the **Output** panel (below the stage). Type your answer and press **OK** or Enter.

```
ask user "What is your name?" as playerName
narrator says playerName

set colour to ask user "Favourite colour?"
# answer variable is also set after ask user
```

## const (cannot change)

```
const maxLives to 3
# set maxLives to 5   ← error
```

## for each

```
set fruits to list "Apple" and "Banana"
for each fruit in fruits
    narrator says fruit
end
```

## break / continue

Inside `repeat` or `for each` blocks:

```
break      # stop the loop
continue   # skip to next item
```

## Function return value

```
define addTen with x
    return x plus 10
end

set total to call addTen with 5
narrator says total
```

## Story commands (v1)

Scenes, characters, `says`, actions, quiz, score, sounds — unchanged. See in-app **Guide**.

## Full examples

- **💻 Programming 101** — variables, types, functions  
- **⌨️ Input, for-each, const** — input, for-each, break, continue, return values  
- **🎲 Lists, random, and more** — random, remainder, add/remove list, empty, is in
