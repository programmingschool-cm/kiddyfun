# SpeakScript v0.1

**A magically easy programming language for kids!**

SpeakScript allows kids to write simple, English-like code to create animated stories, conversations, quizzes, and vocabulary learning games right in the browser. 

It aims to teach basic logic, sequencing, commands, and loops while building confidence in reading and typing English.

## Features
- **No Backend, No Node.js, No Build step**: Pure HTML, CSS, Vanilla JS.
- **Works completely offline**: Just open `index.html`.
- **Kid-friendly Parser**: Recognizes simple sentences like `Rafi says "Hello!"`
- **Helpful Errors**: Friendly, action-oriented error messages instead of technical jargon.
- **Visual Engine**: Characters animate, scenes change, and speech bubbles appear dynamically.
- **Built-in Missions & Examples**: Ready-to-load exercises to guide learning.
- **State Persistence**: Uses `localStorage` to save user programs and mission progress.

## How to Run

Simply double click or open the `index.html` file in any modern web browser.

```bash
# Example if using command line:
open index.html  # on macOS
xdg-open index.html # on Linux
```

## Folder Structure

```
SmartScript/
├── index.html          # Main UI layout
├── README.md           # This documentation
└── assets/
    ├── css/
    │   ├── bootstrap.min.css  # Layout framework
    │   └── style.css          # Core UI & animation styles
    └── js/
        ├── bootstrap.bundle.min.js
        ├── app.js         # Bootstrap and UI event binding
        ├── lexer.js       # Converts text string to token array
        ├── parser.js      # Converts tokens to AST commands
        ├── runtime.js     # DOM Manipulation / Visual Stage
        ├── interpreter.js # Walks AST, sequences runtime with async timing
        ├── errors.js      # Kid-friendly error handling
        ├── storage.js     # localStorage interactions
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
