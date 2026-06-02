/**
 * KiddyFun Example Programs — full language coverage (story + game + programming)
 * Each example focuses on one area; together they teach the whole language.
 */

const EXAMPLES = [
  /* ── Story — Start Here ─────────────────────────────────────────────── */
  {
    id: 'story_hello',
    category: 'Story — Start Here',
    title: '👋 Hello Story',
    desc: 'Minimal story: scene, appears, says, narrator.',
    code: `# Hello Story — your first program
scene "school"

Rafi appears
Rafi waves
Rafi says "Hello! I am Rafi."

Mina appears
Mina smiles
Mina says "Hi Rafi! Nice to meet you."

narrator says "Two friends meet at school."
`,
  },
  {
    id: 'story_scenes',
    category: 'Story — Start Here',
    title: '🎬 Scene Backgrounds',
    desc: 'Try different built-in scenes (change the scene name and Run).',
    code: `# Built-in scenes: school, classroom, jungle, restaurant, home, playground, space
scene "playground"

Teacher appears
Teacher says "We are at the playground today!"
Teacher says "You can change scene to jungle, space, classroom, and more."

narrator says "Edit the scene line above and Run again to see each background."
`,
  },
  {
    id: 'story_wait_sound',
    category: 'Story — Start Here',
    title: '⏸️ Wait & Sound',
    desc: 'Pause the story and play built-in sounds.',
    code: `# Wait and sound effects
scene "classroom"

Teacher appears
Teacher says "Listen carefully..."

play sound "pop"
wait 1 second

Teacher says "That was a pop sound!"
play sound "success"
wait 1 second

Teacher says "Great job listening!"
play sound "clap"
`,
  },

  /* ── Story — Characters & Actions ─────────────────────────────────── */
  {
    id: 'story_actions',
    category: 'Story — Characters & Actions',
    title: '🎭 All Character Actions',
    desc: 'waves, smiles, jumps, flies, runs, walks, moves, hides, shows, bows, nods, cheers, handshakes, dances, claps, flaps.',
    code: `# Every story action on one stage
scene "playground"

Rafi appears
Rafi waves
Rafi smiles
Rafi runs
Rafi walks
Rafi jumps
Rafi moves right
Rafi moves left
Rafi bows
Rafi nods
Rafi cheers
Rafi handshakes
Rafi dances
Rafi claps

Bird appears
Bird flies
Bird flaps

Cat appears
Cat hides
wait 1 second
Cat shows

narrator says "You saw every character action in kiddyFun!"
`,
  },
  {
    id: 'story_dialogue',
    category: 'Story — Characters & Actions',
    title: '💬 Dialogue Story',
    desc: 'Multi-character conversation with narrator.',
    code: `# Restaurant dialogue
scene "restaurant"

Seller appears
Buyer appears
Cow appears

Seller says "Welcome! What would you like?"
Buyer says "Hello! I want mango juice please."
Seller says "Here you are. Enjoy!"
Buyer says "Thank you very much!"

narrator says "Always be polite when you order food."
`,
  },
  {
    id: 'story_characters',
    category: 'Story — Characters & Actions',
    title: '🦁 Built-in Characters',
    desc: 'Rafi, Mina, Teacher, Lion, Bird, Monkey, Robot, Cat, Dog, Mostak, Sagor, Rabiul — any name works.',
    code: `# Built-in and custom character names
scene "jungle"

Lion appears
Bird appears
Monkey appears
Robot appears

Lion says "I am strong!"
Bird flies
Bird says "I can fly!"
Monkey jumps
Monkey says "Bananas!"
Robot waves
Robot says "Beep boop!"

Hero appears
Hero says "Any new name creates a character too!"
`,
  },

  /* ── Story — Quiz & Score ─────────────────────────────────────────── */
  {
    id: 'story_quiz',
    category: 'Story — Quiz & Score',
    title: '❓ Fruit Quiz',
    desc: 'ask, choice correct/wrong, if answer is correct / else.',
    code: `# Multiple-choice quiz
scene "classroom"

Teacher appears
Teacher says "Quiz time! Which fruit is yellow?"

ask "Which fruit is yellow?"
choice "Apple" wrong
choice "Banana" correct
choice "Grape" wrong

if answer is correct
    Teacher says "Yes! Bananas are yellow!"
    play sound "success"
else
    Teacher says "Not quite. The answer is Banana."
    play sound "wrong"
end
`,
  },
  {
    id: 'story_score_quiz',
    category: 'Story — Quiz & Score',
    title: '🏆 Quiz with Score',
    desc: 'score starts at, add points, show score with quiz.',
    code: `# Track points during a quiz
scene "school"

score starts at 0

Teacher appears
Teacher says "Answer correctly to earn points!"

ask "What is 2 plus 2?"
choice "3" wrong
choice "4" correct
choice "5" wrong

if answer is correct
    Teacher says "Correct!"
    add 10 points
    play sound "success"
else
    Teacher says "The answer is 4."
end

show score
narrator says "Keep learning to grow your score!"
`,
  },

  /* ── Story — Vocabulary & Loops ───────────────────────────────────── */
  {
    id: 'story_vocab',
    category: 'Story — Vocabulary & Loops',
    title: '📚 Vocabulary Cards',
    desc: 'show word "..." means "..." — learn English with Bangla meanings.',
    code: `# Vocabulary cards
scene "classroom"

Teacher appears
Teacher says "Today we learn new English words!"

show word "brave" means "সাহসী"
show word "friend" means "বন্ধু"
show word "river" means "নদী"
show word "sky" means "আকাশ"
show word "jump" means "লাফানো"

Teacher says "Can you say each word in a sentence?"
`,
  },
  {
    id: 'story_repeat',
    category: 'Story — Vocabulary & Loops',
    title: '🔁 Repeat Loop',
    desc: 'repeat N times ... end',
    code: `# Repeat an action 3 times
scene "playground"

Bird appears
narrator says "The bird will sing three times."

repeat 3 times
    Bird flies
    Bird says "Tweet tweet!"
end

narrator says "The bird loves to sing!"
`,
  },
  {
    id: 'story_repeat_while',
    category: 'Story — Vocabulary & Loops',
    title: '🔁 Repeat While',
    desc: 'repeat while condition ... end — loop until condition is false.',
    code: `# Repeat while a variable is less than 4
scene "classroom"

Rafi appears
set count to 1

repeat while count is less than 4
    Rafi waves
    Rafi says count
    set count to count plus 1
end

narrator says "Rafi waved three times!"
`,
  },

  /* ── Programming — Variables & Math ─────────────────────────────────── */
  {
    id: 'prog_variables',
    category: 'Programming — Variables & Math',
    title: '📦 Variables & Types',
    desc: 'set, text/number/boolean, show type of, show value of, joined with.',
    code: `# Variables store data
scene "classroom"

Teacher appears

set name to "Rafi"
set age to 10
set happy to true
set greeting to "Hello" joined with " friend"

show type of name
show type of age
show type of happy
show value of greeting

Teacher says greeting

Rafi appears
Rafi says name
`,
  },
  {
    id: 'prog_math',
    category: 'Programming — Variables & Math',
    title: '🧮 Math Operations',
    desc: 'plus, minus, times, divided by, remainder, update variables.',
    code: `# Math in kiddyFun
scene "classroom"

Teacher appears

set a to 10 plus 5
set b to 20 minus 8
set c to 4 times 3
set d to 15 divided by 3
set oddCheck to 11 remainder 2

show value of a
show value of b
show value of c
show value of d
show value of oddCheck

set score to 0
set score to score plus 25
show value of score

Teacher says "Math powers your games and stories!"
`,
  },

  /* ── Programming — Lists ────────────────────────────────────────────── */
  {
    id: 'prog_lists',
    category: 'Programming — Lists',
    title: '📋 Lists Basics',
    desc: 'list ... and ..., item N in, add to, remove item, for each.',
    code: `# Lists hold many items (positions start at 1)
scene "classroom"

set fruits to list "apple" and "banana" and "mango"
show value of fruits

set first to item 1 in fruits
show value of first

add "pear" to fruits
show value of fruits

remove item 2 from fruits
show value of fruits

for each fruit in fruits
    narrator says fruit
end
`,
  },
  {
    id: 'prog_lists_check',
    category: 'Programming — Lists',
    title: '📋 List Checks',
    desc: 'is empty, is in, length of.',
    code: `# Test what is inside a list
scene "classroom"

set colors to list "red" and "blue"

if colors is empty
    narrator says "No colors!"
else
    narrator says "We have colors!"
end

if "red" is in colors
    narrator says "Red is on the list!"
end

set n to length of colors
show value of n

remove item 1 from colors
remove item 1 from colors

if colors is empty
    narrator says "List is empty now!"
end
`,
  },

  /* ── Programming — Logic & Loops ────────────────────────────────────── */
  {
    id: 'prog_conditions',
    category: 'Programming — Logic & Loops',
    title: '🤔 If / Else & Logic',
    desc: 'equals, greater/less than, and, or, not, else.',
    code: `# Conditions and logic
scene "classroom"

Teacher appears
set score to 12
set name to "Rafi"
set tired to false

if score is greater than 10
    Teacher says "High score!"
else
    Teacher says "Keep trying!"
end

if name equals "Rafi"
    Rafi appears
    Rafi smiles
end

if name is equal to "Rafi"
    Teacher says "Welcome back, Rafi!"
end

if tired is not equal to true
    Teacher says "You are awake!"
end

if score is greater than or equal to 10
    Teacher says "Score is 10 or more!"
end

if tired equals true or score is less than 5
    Teacher says "Rest or practice more."
else
    Teacher says "You are doing great!"
end

if not tired equals true
    Teacher says "Wide awake!"
end
`,
  },
  {
    id: 'prog_break_continue',
    category: 'Programming — Logic & Loops',
    title: '⏭️ Break & Continue',
    desc: 'break stops a loop early; continue skips to the next loop turn.',
    code: `# break and continue inside loops
scene "classroom"

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

narrator says "We skipped 5 and stopped after 7."
`,
  },

  /* ── Programming — Functions & Input ────────────────────────────────── */
  {
    id: 'prog_functions',
    category: 'Programming — Functions & Input',
    title: '⚙️ Functions',
    desc: 'define, call, parameters with and, return values.',
    code: `# Reusable functions
scene "classroom"

define waveHello
    Rafi appears
    Rafi waves
    Rafi says "Hello!"
end

define greet with name
    narrator says name
end

define addNumbers with a and b
    return a plus b
end

call waveHello
call greet with "Welcome to kiddyFun!"

set total to call addNumbers with 5 and 10
show value of total
`,
  },
  {
    id: 'prog_input',
    category: 'Programming — Functions & Input',
    title: '⌨️ Ask User Input',
    desc: 'ask user "..." as name, answer variable, say variables.',
    code: `# Keyboard input while the story runs
scene "classroom"

Teacher appears
Teacher says "I will ask you a question. Type in the Output panel."

ask user "What is your name?" as playerName
Teacher says playerName

ask user "How old are you?"
set ageText to answer
Teacher says ageText

set colour to ask user "Favourite colour?"
Teacher says colour

Teacher says "Nice to meet you!"
`,
  },

  /* ── Programming — Extra Tools ──────────────────────────────────────── */
  {
    id: 'prog_const',
    category: 'Programming — Extra Tools',
    title: '🔒 Const & Debug',
    desc: 'const (fixed value), show type/value for debugging.',
    code: `# const cannot change; use show for debugging
scene "classroom"

const maxScore to 100
show type of maxScore
show value of maxScore

set points to 50
show type of points
show value of points

Teacher appears
Teacher says "maxScore stays 100 for the whole program."
`,
  },
  {
    id: 'prog_random',
    category: 'Programming — Extra Tools',
    title: '🎲 Random & Remainder',
    desc: 'random number from A to B, remainder for even/odd.',
    code: `# Random dice and even/odd check
scene "classroom"

Teacher appears
Teacher says "Let us roll a dice!"

set roll to random number from 1 to 6
narrator says roll

set n to 11
set leftover to n remainder 2

if leftover equals 0
    narrator says "11 is even"
else
    narrator says "11 is odd"
end

play sound "pop"
`,
  },

  /* ── Game — First Steps ─────────────────────────────────────────────── */
  {
    id: 'game_starter',
    category: 'Game — First Steps',
    title: '🎮 Game Starter (Side View)',
    desc: 'game, player, every frame, move left/right — minimal playable game.',
    code: `# Side-view starter — arrows to move
game "Starter"

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
`,
  },
  {
    id: 'game_jump',
    category: 'Game — First Steps',
    title: '⬆️ Platform Jump',
    desc: 'when space is pressed, jump with power, collect coins.',
    code: `# Jump with space + collect coins
game "Platform Jump"

scene "playground" with walls
score starts at 0

Rafi is player
set Rafi speed to 5

when space is pressed
    Rafi jump with power 14
end

every frame
    if left key is held
        move Rafi left by 5
    end
    if right key is held
        move Rafi right by 5
    end
end

if Rafi touches coin
    add 10 points
    play sound "success"
    remove coin
end
`,
  },
  {
    id: 'game_topdown',
    category: 'Game — First Steps',
    title: '🪙 Coin Collector (Top-Down)',
    desc: 'game view top, four directions, no gravity.',
    code: `# Top-down — move in all 4 directions
game "Coin Collector"
game view top

scene "school" with walls
score starts at 0

Mina is player
set Mina speed to 4

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

if Mina touches coin
    add 15 points
    play sound "cheer"
    remove coin
end
`,
  },

  /* ── Game — Collect & Build ─────────────────────────────────────────── */
  {
    id: 'game_spawn',
    category: 'Game — Collect & Build',
    title: '📍 Spawn Coins',
    desc: 'spawn coin at x ... y ... — place your own coins.',
    code: `# Custom coin layout (top-down)
game "My Coins"
game view top

scene "school" with walls
score starts at 0
Mina is player

spawn coin at x 120 y 120
spawn coin at x 480 y 200
spawn coin at x 300 y 300
spawn coin at x 150 y 280

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

if Mina touches coin
    add 10 points
    play sound "success"
    remove coin
end
`,
  },
  {
    id: 'game_walls',
    category: 'Game — Collect & Build',
    title: '🧱 Custom Walls',
    desc: 'add wall at x y width height — build your own obstacles.',
    code: `# Add custom wall boxes
game "Maze Builder"
game view top

scene "playground"
score starts at 0
Rafi is player

add wall at x 200 y 150 width 120 height 40
add wall at x 350 y 250 width 80 height 100

spawn coin at x 100 y 100
spawn coin at x 500 y 300

every frame
    if left key is held
        move Rafi left by 4
    end
    if right key is held
        move Rafi right by 4
    end
    if up key is held
        move Rafi up by 4
    end
    if down key is held
        move Rafi down by 4
    end
end

if Rafi touches coin
    add 10 points
    remove coin
end
`,
  },
  {
    id: 'game_while_move',
    category: 'Game — Collect & Build',
    title: '⌨️ While Key Held',
    desc: 'Alternative to if inside every frame: while right key is held.',
    code: `# while key is held — smooth movement
game "While Move"

scene "playground" with walls
Mina is player

while left key is held
    move Mina left by 4
end

while right key is held
    move Mina right by 4
end
`,
  },

  /* ── Game — Arcade ──────────────────────────────────────────────────── */
  {
    id: 'game_timer',
    category: 'Game — Arcade',
    title: '⏱️ Coin Rush (Timer)',
    desc: 'timer starts at, goal is collect N coins, when time is 0.',
    code: `# Beat the clock!
game "Coin Rush"
game view top

scene "school" with walls
score starts at 0
timer starts at 45
goal is collect 5 coins

Mina is player

spawn coin at x 120 y 100
spawn coin at x 480 y 120
spawn coin at x 300 y 280
spawn coin at x 150 y 250
spawn coin at x 450 y 300

every frame
    if left key is held
        move Mina left by 5
    end
    if right key is held
        move Mina right by 5
    end
    if up key is held
        move Mina up by 5
    end
    if down key is held
        move Mina down by 5
    end
end

if Mina touches coin
    add 10 points
    play sound "cheer"
    remove coin
end

when time is 0
    show message "Time is up!"
    play sound "gameover"
end
`,
  },
  {
    id: 'game_lives',
    category: 'Game — Arcade',
    title: '❤️ Lives & Enemies',
    desc: 'lives start at, spawn enemy, patrol, lose 1 life, when lives is 0.',
    code: `# Three lives — avoid the Lion!
game "Platform Escape"

scene "playground" with walls
score starts at 0
lives start at 3
goal is collect 3 coins

Rafi is player

spawn Lion as enemy at x 350 y ground
Lion patrols between x 250 and x 500

when space is pressed
    Rafi jump with power 13
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
    add 20 points
    play sound "success"
    remove coin
end

if Rafi touches enemy
    lose 1 life
    play sound "wrong"
end

when lives is 0
    show message "Try again!"
end
`,
  },
  {
    id: 'game_events',
    category: 'Game — Arcade',
    title: '🏁 Game Events',
    desc: 'when all coins collected, show message, win goal overlay.',
    code: `# All game event handlers
game "Event Demo"
game view top

scene "school" with walls
score starts at 0
goal is collect 3 coins

Mina is player

every frame
    if left key is held
        move Mina left by 4
    end
    if right key is held
        move Mina right by 4
    end
end

if Mina touches coin
    add 10 points
    remove coin
end

when all coins collected
    show message "All coins gone!"
    play sound "win"
end
`,
  },

  /* ── Game — Complete Demos ──────────────────────────────────────────── */
  {
    id: 'game_master',
    category: 'Game — Complete Demos',
    title: '🏆 Arcade Master (Full)',
    desc: 'Timer + lives + enemy + spawn + goal + camera + all events combined.',
    code: `# Full arcade game — everything together
game "Arcade Master"
game view top

scene "school" with walls
score starts at 0
lives start at 3
timer starts at 90
goal is collect 6 coins

Mina is player
set Mina speed to 5
camera follows Mina

spawn coin at x 100 y 100
spawn coin at x 500 y 120
spawn coin at x 300 y 200
spawn coin at x 150 y 280
spawn coin at x 450 y 300
spawn coin at x 280 y 150

spawn Lion as enemy at x 400 y 250
Lion patrols between x 300 and x 550

every frame
    if left key is held
        move Mina left by 5
    end
    if right key is held
        move Mina right by 5
    end
    if up key is held
        move Mina up by 5
    end
    if down key is held
        move Mina down by 5
    end
end

if Mina touches coin
    add 15 points
    play sound "cheer"
    remove coin
end

if Mina touches enemy
    lose 1 life
    play sound "wrong"
end

when time is 0
    show message "Time is up!"
end

when lives is 0
    show message "Game over!"
end

when all coins collected
    show message "Coins cleared!"
end
`,
  },
  {
    id: 'game_jungle_side',
    category: 'Game — Complete Demos',
    title: '🌿 Jungle Platformer',
    desc: 'Side view on jungle scene with walls, jump, coins.',
    code: `# Side-view jungle platformer
game "Jungle Run"

scene "jungle" with walls
score starts at 0
lives start at 2
goal is collect 2 coins

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
    add 25 points
    play sound "success"
    remove coin
end
`,
  },

  /* ── Showcase Stories ───────────────────────────────────────────────── */
  {
    id: 'showcase_kiddyfun',
    category: 'Showcase Stories',
    title: '🎓 The kiddyFun Project',
    desc: 'Long story: characters, quiz, score, vocab, sounds — story mode showcase.',
    code: `# The kiddyFun Project — full story showcase
scene "classroom"

score starts at 0

Mostak appears
Sagor appears
Rabiul appears

narrator says "Three friends plan a coding school in Cumilla."

Mostak runs
Mostak says "Let us teach kids to code!"

Sagor nods
Sagor says "We need a fun language."

Rabiul cheers
Rabiul says "kiddyFun it is!"

show word "logic" means "যুক্তি"
show word "future" means "ভবিষ্যৎ"

ask "Why learn to code?"
choice "To solve problems and build games" correct
choice "To sleep all day" wrong

if answer is correct
    play sound "success"
    add 10 points
    Mostak says "Exactly!"
else
    Mostak says "Coding helps you solve problems!"
end

show score
play sound "cheer"
narrator says "The journey of kiddyFun begins!"
`,
  },
  {
    id: 'showcase_eid',
    category: 'Showcase Stories',
    title: '🕌 Eid ul Adha 2026',
    desc: 'Animated Eid story with Mostak, Sagor, Rabiul and Cow.',
    code: `# Eid ul Adha 2026 — Programming School
scene "school"

play sound "success"

Mostak appears
Sagor appears
Rabiul appears
Cow appears

narrator says "Eid ul Adha 2026 at Programming School!"

Mostak runs
Mostak moves right
Sagor runs
Sagor moves right
Rabiul runs
Rabiul moves right
Cow walks

Mostak says "Eid Mubarak to all our friends!"
Sagor says "Happy Eid ul Adha 2026!"
Rabiul says "May this Eid bring joy to everyone!"

Mostak waves
Sagor cheers
Rabiul handshakes

play sound "cheer"
narrator says "Eid Mubarak from Programming School!"
`,
  },

  /* ── Reference — Language Tour ────────────────────────────────────────── */
  {
    id: 'ref_language_tour',
    category: 'Reference — Full Tour',
    title: '📖 Language Tour (Story)',
    desc: 'One program touching many story + programming features (read & Run).',
    code: `# Language tour — story + programming in one file
scene "classroom"

score starts at 0
Teacher appears

# Variables & math
set name to "Rafi"
set points to 10 plus 5
show value of points

# List & loop
set items to list "A" and "B"
for each item in items
    show value of item
end

# Function
define cheer
    play sound "cheer"
end
call cheer

# Character & speech
Rafi appears
Rafi says name
Rafi waves

# Quiz
ask "Is coding fun?"
choice "Yes!" correct
choice "No" wrong

if answer is correct
    add 10 points
    Teacher says "Wonderful!"
else
    Teacher says "Try coding — it is fun!"
end

show score
narrator says "You toured kiddyFun story mode!"
`,
  },
  {
    id: 'ref_game_cheatsheet',
    category: 'Reference — Full Tour',
    title: '🎮 Game Cheatsheet',
    desc: 'All game commands in one runnable file (comment = # lines).',
    code: `# Game cheatsheet — every game command demonstrated
game "Cheatsheet"
game view top

scene "school" with walls
score starts at 0
lives start at 3
timer starts at 120
goal is collect 2 coins

Mina is player
set Mina speed to 4

spawn coin at x 200 y 150
spawn coin at x 400 y 250

# spawn Lion as enemy at x 350 y 250
# Lion patrols between x 280 and x 480

when space is pressed
    # jump only in side view — comment out for top-down
end

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

if Mina touches coin
    add 10 points
    play sound "success"
    remove coin
end

# if Mina touches enemy
#     lose 1 life
# end

when time is 0
    show message "Time up!"
end

when lives is 0
    show message "No lives!"
end

when all coins collected
    show message "Goal reached!"
end

# stop game
# restart game
`,
  },
];

window.SpeakExamples = EXAMPLES;
