# KiddyFun Code v1.0

**A magically easy programming language for kids!**

KiddyFun Code allows kids to write simple, English-like code to create animated stories, conversations, quizzes, and vocabulary learning games right in the browser.

It aims to teach basic logic, sequencing, commands, and loops while building confidence in reading, typing, and **speaking English**.

> **Product roadmap:** see [ROADMAP.md](./ROADMAP.md) for the step-by-step plan to grow this into a full kids coding + English speaking platform. Check off items there as you ship.

## Features
- **No Backend, No Node.js, No Build step**: Pure HTML, CSS, Vanilla JS.
- **Works completely offline**: Just open `index.html`.
- **Kid-friendly Parser**: Recognizes simple sentences like `Rafi says "Hello!"`
- **Helpful Errors**: Friendly, action-oriented error messages instead of technical jargon.
- **Visual Engine**: Characters animate, scenes change, and speech bubbles appear dynamically.
- **English voice (TTS)** and synthesized sound effects (no audio files to import)
- **Built-in Missions & Examples**: Ready-to-load exercises to guide learning.
- **State Persistence**: Offline-first `localStorage`; optional **Supabase** cloud sync (programs, missions, badges) — see [`docs/SUPABASE_GUIDE.md`](docs/SUPABASE_GUIDE.md) (full setup) or [`docs/BACKEND.md`](docs/BACKEND.md) (quick reference).

## How to Run

**Production (recommended):** host on **GitHub Pages** + optional **Supabase** cloud sync — no server code. See [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md).

**Local quick try:** open `index.html` in a browser (offline mode). For Supabase sync testing, use a simple static server, e.g. `python -m http.server 5500`.

```bash
# Local static server (optional, for cloud sync dev)
python -m http.server 5500
# then open http://localhost:5500/index.html
```

## Folder Structure

```
SmartScript/
├── index.html          # Main UI layout
├── README.md           # This documentation
├── docs/
│   ├── TUTORIAL.md     # Complete language tutorial & reference
│   └── LANGUAGE.md     # Quick syntax summary
└── assets/
    ├── css/
    │   ├── bootstrap.min.css  # Layout framework
    │   └── style.css          # Core UI & animation styles
    └── js/
        ├── bootstrap.bundle.min.js
        ├── app.js         # Bootstrap and UI event binding
        ├── lexer.js       # Converts text string to token array
        ├── expr.js        # English-like expressions (math, logic, variables)
        ├── parser.js      # Converts tokens to AST commands
        ├── runtime.js     # DOM Manipulation / Visual Stage
        ├── interpreter.js # Walks AST, sequences runtime with async timing
        ├── errors.js      # Kid-friendly error handling
        ├── storage.js          # localStorage + cloud sync hooks
        ├── supabase-config.js  # Supabase URL + anon key
        ├── supabase-client.js  # Supabase client wrapper
        ├── supabase-sync.js    # Push/pull merge with cloud
        ├── supabase-auth.js    # Sign-in UI (anonymous + parent email)
        ├── examples.js    # Built-in example snippets
        ├── missions.js    # Learning validation missions
        └── ui.js          # DOM Panels and dynamic UI logic
```

## Supported Commands

### 1. Scene Setting
Sets the visual background.
```
scene "school"
```
*(Supported: school, classroom, jungle, restaurant, home, playground, space)*

### 2. Character Creation
Brings a character to the stage.
```
Rafi appears
Lion appears
```

### 3. Dialogue
Makes a character or narrator speak.
```
Rafi says "Good morning!"
narrator says "Once upon a time..."
```

### 4. Actions
Triggers an animation.
```
Mina smiles
Lion jumps
Bird flies
Robot moves right
Cat hides
Cat shows
```

### 5. Learning Elements
Vocab cards and interactive quizzes.
```
show word "brave" means "সাহসী"

ask "Which fruit is yellow?"
choice "Apple" wrong
choice "Banana" correct
```

### 6. Logic (Loops & Conditionals)
```
repeat 3 times
    Bird flies
end

if answer is correct
    narrator says "Great job!"
else
    narrator says "Try again."
end
```

### 7. Game Mechanics
```
score starts at 0
add 10 points
show score
```

### 8. Programming concepts (v2 — industry-grade, kid-easy)

**Language docs:** [Complete tutorial](docs/TUTORIAL.md) · [Quick reference](docs/LANGUAGE.md)

```
set name to "Rafi"
set age to 10
set ready to true
show type of age
show value of name

set fruits to list "apple" and "banana"
set first to item 1 in fruits

if age is greater than 5
    narrator says "Great!"
else
    narrator says "Keep going!"
end

define cheer
    play sound "cheer"
end
call cheer

repeat while count is less than 4
    set count to count plus 1
end

ask user "What is your name?" as playerName
const maxLives to 3
for each fruit in fruits
    narrator says fruit
end
set total to call addTen with 5
```

Load **💻 Programming 101**, **⌨️ Input, for-each, const**, and **🎲 Lists, random, and more** from the Examples menu.

## Architecture

1. **Lexer (`lexer.js`)**: Scans code line by line, stripping whitespace and comments, identifying strings, numbers, keywords, and indentation to produce an array of tokens.
2. **Parser (`parser.js`)**: Reads tokens and maps them to semantic AST nodes (e.g. `scene`, `say`, `character_appears`, `repeat`, `quiz`). Validates syntax rules.
3. **Interpreter (`interpreter.js`)**: An asynchronous walker that takes the AST array. It `await`s between DOM actions so that stories play out sequentially rather than all at once.
4. **Runtime (`runtime.js`)**: Handles all DOM manipulation on the stage. Generates CSS keyframe classes and inline styles to render avatars and scenes.

## Future Roadmap

- **Block Mode**: Toggle between text typing and visual drag-and-drop blocks.
- **Audio Output**: Text-To-Speech integration for pronunciation.
- **Custom Assets**: Allow uploading custom `.png` files for characters.
- **Python Converter**: "Eject" SpeakScript to basic Python as the child grows.
