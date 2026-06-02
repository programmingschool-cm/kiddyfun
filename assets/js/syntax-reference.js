/**
 * KiddyFun Syntax Reference
 *  - Categorized list of every language construct with a copyable example
 *  - A master AI-prompt template kids can paste into ChatGPT / Claude / etc.
 *    so the AI generates code in this specific language.
 */
(function () {
  'use strict';

  var SYNTAX = [
    {
      group: '🎬 Story & Stage',
      items: [
        {
          title: 'Set the scene',
          desc: 'Change the background. Built-in: school, classroom, jungle, restaurant, home, playground, space',
          code: 'scene "classroom"',
        },
        {
          title: 'Character appears',
          desc: 'Add a character to the stage. Built-in: Rafi, Mina, Teacher, Lion, Bird, Monkey, Robot, Cat, Dog, Seller, Buyer',
          code: 'Rafi appears\nMina appears',
        },
        {
          title: 'Character says',
          desc: 'A character speaks (shows speech bubble + optional voice).',
          code: 'Rafi says "Hello, Mina!"',
        },
        {
          title: 'Narrator',
          desc: 'Story narration shown at the top of the stage.',
          code: 'narrator says "Once upon a time..."',
        },
        {
          title: 'Character actions',
          desc: 'waves, smiles, jumps, flies, hides, shows, runs, dances, bows, walks, handshakes, nods, cheers, moves right, moves left, flaps',
          code: 'Rafi waves\nMonkey jumps\nBird flies\nMina moves right',
        },
        {
          title: 'Wait (pause)',
          desc: 'Pause for N seconds (max 8).',
          code: 'wait 1',
        },
      ],
    },
    {
      group: '📦 Variables',
      items: [
        {
          title: 'Create / change a variable',
          desc: 'Use set NAME to VALUE.',
          code: 'set name to "Rafi"\nset age to 10\nset happy to true',
        },
        {
          title: 'Constant (cannot change)',
          desc: 'Use const NAME to VALUE.',
          code: 'const maxLives to 3',
        },
        {
          title: 'Use a variable in speech',
          desc: 'No quotes around variable names.',
          code: 'set name to "Mina"\nRafi says name',
        },
      ],
    },
    {
      group: '🧮 Math & Text',
      items: [
        {
          title: 'Math operations',
          desc: 'plus, minus, times, divided by, remainder',
          code: 'set total to 5 plus 3 times 2\nset rest to 11 remainder 3',
        },
        {
          title: 'Join text',
          desc: 'joined with combines two strings.',
          code: 'set msg to "Hi " joined with name',
        },
        {
          title: 'Length',
          desc: 'length of a list or text.',
          code: 'set n to length of name',
        },
        {
          title: 'Random number',
          desc: 'Pick a random integer from A to B (inclusive).',
          code: 'set dice to random number from 1 to 6',
        },
      ],
    },
    {
      group: '🤔 Conditions',
      items: [
        {
          title: 'If / else',
          desc: 'else is optional. No else if — nest another if inside else.',
          code: 'if score is greater than 10\n    narrator says "High score!"\nelse\n    narrator says "Keep trying!"\nend',
        },
        {
          title: 'Comparisons',
          desc: 'equals, is equal to, is not equal to, is greater than, is less than, is greater than or equal to, is less than or equal to',
          code: 'if age is greater than or equal to 5\n    narrator says "Old enough"\nend',
        },
        {
          title: 'Logic — and / or / not',
          desc: 'Combine conditions.',
          code: 'if age is greater than 5 and happy equals true\n    narrator says "Ready!"\nend',
        },
      ],
    },
    {
      group: '🔁 Loops',
      items: [
        {
          title: 'Repeat N times',
          desc: 'Number must be between 1 and 100.',
          code: 'repeat 3 times\n    Rafi waves\nend',
        },
        {
          title: 'Repeat while',
          desc: 'Loops while condition is true. Stops after 500 iterations for safety.',
          code: 'set count to 1\nrepeat while count is less than 4\n    Rafi waves\n    set count to count plus 1\nend',
        },
        {
          title: 'For each item in list',
          desc: 'Iterate through a list.',
          code: 'set colours to list "red" and "blue" and "green"\nfor each colour in colours\n    narrator says colour\nend',
        },
        {
          title: 'break / continue',
          desc: 'Use only inside a loop.',
          code: 'repeat 5 times\n    if count equals 3\n        break\n    end\nend',
        },
      ],
    },
    {
      group: '📚 Lists',
      items: [
        {
          title: 'Create a list',
          desc: 'Use list ITEM and ITEM and ITEM.',
          code: 'set fruits to list "apple" and "banana" and "mango"',
        },
        {
          title: 'Read items (1-indexed)',
          desc: 'Positions start at 1, not 0.',
          code: 'set first to item 1 in fruits',
        },
        {
          title: 'Add / remove',
          desc: 'add ITEM to LIST  |  remove item N from LIST',
          code: 'add "pear" to fruits\nremove item 2 from fruits',
        },
        {
          title: 'Test a list',
          desc: 'is empty, is in',
          code: 'if "apple" is in fruits\n    narrator says "We have apples!"\nend',
        },
      ],
    },
    {
      group: '🧩 Functions',
      items: [
        {
          title: 'Define a function',
          desc: 'Group steps you can reuse.',
          code: 'define greet with name\n    narrator says name\nend\n\ncall greet with "Rafi"',
        },
        {
          title: 'Multiple parameters',
          desc: 'Separate with and.',
          code: 'define addNumbers with a and b\n    return a plus b\nend\n\nset total to call addNumbers with 5 and 10',
        },
      ],
    },
    {
      group: '⌨️ Keyboard input',
      items: [
        {
          title: 'Ask the user',
          desc: 'Shows an input box in the Output panel.',
          code: 'ask user "What is your name?" as playerName\nnarrator says playerName',
        },
        {
          title: 'Ask inside an expression',
          desc: 'Directly use the answer.',
          code: 'set colour to ask user "Favourite colour?"',
        },
      ],
    },
    {
      group: '❓ Quiz (multiple choice)',
      items: [
        {
          title: 'Quiz with buttons',
          desc: 'Start with ask, then add choices. Use if answer is correct after.',
          code: 'ask "What colour is the sky?"\nchoice "Green" wrong\nchoice "Blue" correct\nchoice "Red" wrong\n\nif answer is correct\n    narrator says "Correct!"\nelse\n    narrator says "Not quite."\nend',
        },
      ],
    },
    {
      group: '🏆 Score & sounds',
      items: [
        {
          title: 'Score',
          desc: 'Track game score and show it.',
          code: 'score starts at 0\nadd 10 points\nshow score',
        },
        {
          title: 'Play a sound',
          desc: 'Built-in sounds: success, clap, cheer, win, pop',
          code: 'play sound "success"',
        },
      ],
    },
    {
      group: '🎮 Game mode (keyboard)',
      items: [
        {
          title: 'Start a game',
          desc: 'Use this first line when you want keyboard gameplay instead of story-only flow.',
          code: 'game "My Platform Game"',
        },
        {
          title: 'Top-down view',
          desc: 'Four-direction movement (no gravity). Default is side view.',
          code: 'game view top',
        },
        {
          title: 'Player character',
          desc: 'Marks who you control with arrow keys / touch pad. Add appears to show actor clearly.',
          code: 'Rafi is player\nRafi appears',
        },
        {
          title: 'When key pressed (once)',
          desc: 'Runs once per key press — good for jump.',
          code: 'when space is pressed\n    Rafi jump with power 12\nend',
        },
        {
          title: 'While key held',
          desc: 'Use inside every frame for smooth, continuous movement.',
          code: 'every frame\n    if left key is held\n        move Rafi left by 4\n    end\nend',
        },
        {
          title: 'Move & jump',
          desc: 'Move by pixels per frame; jump needs side view + space.',
          code: 'move Rafi right by 5\nRafi jump with power 14',
        },
        {
          title: 'Touch / collect',
          desc: 'Use collisions for rewards and rules. Scene with walls loads preset coins/obstacles.',
          code: 'scene "playground" with walls\nif Rafi touches coin\n    add 10 points\n    remove coin\nend',
        },
        {
          title: 'Add a wall',
          desc: 'Static obstacle box (pixels).',
          code: 'add wall at x 200 y 250 width 80 height 40',
        },
        {
          title: 'Spawn a coin',
          desc: 'Place a collectible in setup (before every frame). Use x and y in pixels.',
          code: 'spawn coin at x 200 y 150',
        },
        {
          title: 'Ready-to-run mini game',
          desc: 'Copy one block and run. Good first project for new learners.',
          code: 'game "Starter"\nscene "playground" with walls\nscore starts at 0\nRafi is player\n\nwhen space is pressed\n    Rafi jump with power 12\nend\n\nevery frame\n    if left key is held\n        move Rafi left by 4\n    end\n    if right key is held\n        move Rafi right by 4\n    end\nend\n\nif Rafi touches coin\n    add 10 points\n    play sound "success"\n    remove coin\nend',
        },
      ],
    },
    {
      group: '📖 Vocabulary & debug',
      items: [
        {
          title: 'Vocab card',
          desc: 'Show an English word with meaning.',
          code: 'show word "brave" means "সাহসী"',
        },
        {
          title: 'Show value / type',
          desc: 'Print to the log panel for debugging.',
          code: 'show value of score\nshow type of score',
        },
        {
          title: 'Comment',
          desc: 'Lines starting with # are ignored.',
          code: '# This is a comment',
        },
      ],
    },
  ];

  /**
   * Master AI-prompt template.
   * Paste this into ChatGPT, Claude, Gemini, etc. with your goal at the bottom.
   * The model will then output code that runs inside this app.
   */
  var AI_PROMPT_TEMPLATE = [
    'You are an expert in **KiddyFun Code** — a small English-like programming language for kids (ages 6–12).',
    'It runs in a browser app that shows an animated story stage as the code runs.',
    '',
    'Your job: write **one complete KiddyFun Code program** that solves the user task at the end.',
    '',
    '# Language reference',
    '',
    '## Writing rules',
    '- One command per line.',
    '- Strings use double quotes: `"hello"`.',
    '- Indent inside blocks with 4 spaces. Every block ends with `end`.',
    '- Character names are case-insensitive (`Rafi` = `rafi`).',
    '- No `else if` — nest another `if` inside `else`.',
    '- Comments start with `#`.',
    '',
    '## Story & stage',
    '- `scene "name"` — set background. Built-in: school, classroom, jungle, restaurant, home, playground, space.',
    '- `<Character> appears` — add a character.',
    '- `<Character> says "text"` — speech bubble.',
    '- `narrator says "text"` — story narration at the top.',
    '- Actions on a character: `waves`, `smiles`, `jumps`, `flies`, `hides`, `shows`, `runs`, `dances`, `bows`, `walks`, `handshakes`, `nods`, `cheers`, `flaps`, `moves right`, `moves left`.',
    '- `wait <seconds>` — pause (1..8).',
    '- Built-in characters: Rafi, Mina, Teacher, Lion, Bird, Monkey, Robot, Cat, Dog, Seller, Buyer, Mostak, Sagor, Rabiul. Any other name also works.',
    '',
    '## Variables & math',
    '- `set <name> to <value>` — create / change variable.',
    '- `const <name> to <value>` — constant (cannot change).',
    '- Math: `plus`, `minus`, `times`, `divided by`, `remainder`.',
    '- Text: `joined with`.',
    '- `length of <var>` — list length or string length.',
    '- `random number from A to B` — inclusive.',
    '- `ask user "question?" as <name>` — keyboard input; also stored in `answer`.',
    '',
    '## Comparisons & logic',
    '- `x equals 5` or `x is equal to 5`',
    '- `x is not equal to 5`',
    '- `x is greater than 10`, `x is less than 3`',
    '- `x is greater than or equal to 5`, `x is less than or equal to 0`',
    '- `<list> is empty`, `"apple" is in <list>`',
    '- Logic: `and`, `or`, `not`.',
    '',
    '## Control flow',
    '```',
    'if <cond>',
    '    ...',
    'else',
    '    ...',
    'end',
    '',
    'repeat 3 times',
    '    ...',
    'end',
    '',
    'repeat while <cond>',
    '    ...',
    'end',
    '',
    'for each item in <list>',
    '    ...',
    'end',
    '```',
    '- `break` and `continue` work inside loops.',
    '',
    '## Lists',
    '- Create: `set fruits to list "apple" and "banana" and "mango"`.',
    '- Read (1-indexed!): `item 1 in fruits`.',
    '- Modify: `add "pear" to fruits`, `remove item 2 from fruits`.',
    '',
    '## Functions',
    '```',
    'define greet with name',
    '    narrator says name',
    'end',
    '',
    'call greet with "Rafi"',
    '',
    'define addNumbers with a and b',
    '    return a plus b',
    'end',
    '',
    'set total to call addNumbers with 5 and 10',
    '```',
    '- Do **not** use grammar keywords (with, to, if, list, ...) as function or variable names.',
    '',
    '## Quiz (multiple-choice buttons)',
    '```',
    'ask "What colour is the sky?"',
    'choice "Green" wrong',
    'choice "Blue" correct',
    'choice "Red" wrong',
    '',
    'if answer is correct',
    '    narrator says "Yes!"',
    'else',
    '    narrator says "Try again!"',
    'end',
    '```',
    '',
    '## Score, sounds, vocab',
    '- `score starts at 0`, `add 10 points`, `show score`.',
    '- `play sound "success"` — built-in: success, clap, cheer, win, pop.',
    '- `show word "brave" means "সাহসী"` — vocab card.',
    '- `show value of <var>`, `show type of <var>` — debug.',
    '',
    '# Output format',
    '- Output **only** the program as a single code block, no prose, no explanation.',
    '- Make sure every block ends with `end`.',
    '- Keep it kid-friendly, fun, and run-ready.',
    '',
    '# Task',
    '<<DESCRIBE WHAT YOU WANT THE PROGRAM TO DO HERE>>',
  ].join('\n');

  window.KiddySyntax = {
    groups: SYNTAX,
    aiPrompt: AI_PROMPT_TEMPLATE,
  };
})();
