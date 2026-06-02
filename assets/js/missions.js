/**
 * SpeakScript Missions v0.1
 * Each mission has: id, title, goal, hint, requiredSyntax[], starterCode, validate(code)
 */

const MISSIONS = [
  {
    id    : 'greeting_mission',
    title : '👋 Mission 1: Greeting Friends',
    emoji : '👋',
    goal  : 'Make two friends greet each other in a scene.',
    hint  : 'Use "appears", "waves", and "says" for your characters.',
    badge : '🤝 Friendship Badge',
    requiredSyntax: [
      'scene "..."',
      'Character appears',
      'Character says "..."',
    ],
    starterCode: `# Greeting Mission
scene "school"

Rafi appears
Mina appears

Rafi waves
Rafi says ""

Mina smiles
Mina says ""
`,
    validate(code) {
      const c = code.toLowerCase();
      const hasScene    = /scene\s+"/.test(c);
      const appears     = (c.match(/appears/g) || []).length;
      const says        = (c.match(/says\s+"/g) || []).length;
      return hasScene && appears >= 2 && says >= 2;
    },
  },

  {
    id    : 'animal_mission',
    title : '🦁 Mission 2: Animal Story',
    emoji : '🦁',
    goal  : 'Create a jungle story with at least two animals doing actions.',
    hint  : 'Use "jungle" scene and actions like "jumps" or "flies".',
    badge : '🌿 Nature Explorer Badge',
    requiredSyntax: [
      'scene "jungle"',
      'Animal appears',
      'Animal <action>',
      'Animal says "..."',
    ],
    starterCode: `# Animal Mission
scene "jungle"

Lion appears
Bird appears

Lion says ""
Lion jumps

Bird flies
Bird says ""

narrator says ""
`,
    validate(code) {
      const c = code.toLowerCase();
      const hasJungle   = /scene\s+"jungle"/.test(c);
      const appears     = (c.match(/appears/g) || []).length;
      const actions     = /jumps|flies|waves|smiles|hides|shows|flaps/.test(c);
      const says        = (c.match(/says\s+"/g) || []).length;
      return hasJungle && appears >= 2 && actions && says >= 2;
    },
  },

  {
    id    : 'food_mission',
    title : '🍽️ Mission 3: Restaurant Talk',
    emoji : '🍽️',
    goal  : 'Write a full restaurant conversation between a Seller and Buyer.',
    hint  : 'Include a welcome, an order, and a thank you.',
    badge : '🍴 Polite Speaker Badge',
    requiredSyntax: [
      'scene "restaurant"',
      'Seller appears',
      'Buyer appears',
      'Seller says "..."',
      'Buyer says "..."',
    ],
    starterCode: `# Food Mission
scene "restaurant"

Seller appears
Buyer appears

Seller says "Welcome!"
Buyer says ""
Seller says ""
Buyer says "Thank you!"
`,
    validate(code) {
      const c = code.toLowerCase();
      const hasRestaurant = /scene\s+"restaurant"/.test(c);
      const hasSeller     = /seller\s+says/.test(c);
      const hasBuyer      = /buyer\s+says/.test(c);
      const says          = (c.match(/says\s+"/g) || []).length;
      return hasRestaurant && hasSeller && hasBuyer && says >= 3;
    },
  },

  {
    id    : 'quiz_mission',
    title : '📝 Mission 4: Build a Quiz',
    emoji : '📝',
    goal  : 'Build a quiz with one question, three choices, and a correct answer.',
    hint  : 'Use: ask, choice ... correct, choice ... wrong, if answer is correct.',
    badge : '🧠 Quiz Master Badge',
    requiredSyntax: [
      'ask "question"',
      'choice "answer" correct',
      'choice "answer" wrong',
      'if answer is correct',
    ],
    starterCode: `# Quiz Mission
scene "classroom"

Teacher appears
Teacher says "Quiz time!"

ask ""
choice "" correct
choice "" wrong
choice "" wrong

if answer is correct
    Teacher says "Well done!"
else
    Teacher says "Try again!"
end
`,
    validate(code) {
      const c = code.toLowerCase();
      const hasAsk        = /^ask\s+"/m.test(c);
      const correctCount  = (c.match(/choice\s+"[^"]+"\s+correct/g) || []).length;
      const wrongCount    = (c.match(/choice\s+"[^"]+"\s+wrong/g) || []).length;
      const hasIf         = /if\s+answer\s+is\s+correct/.test(c);
      const hasEnd        = /\bend\b/.test(c);
      return hasAsk && correctCount >= 1 && wrongCount >= 1 && hasIf && hasEnd;
    },
  },

  {
    id    : 'repeat_mission',
    title : '🔁 Mission 5: Repeat Loop',
    emoji : '🔁',
    goal  : 'Make a character do something at least 3 times using repeat.',
    hint  : 'Use: repeat 3 times ... end',
    badge : '⚡ Loop Master Badge',
    requiredSyntax: [
      'repeat 3 times',
      '    Character action',
      'end',
    ],
    starterCode: `# Repeat Mission
scene "playground"

Bird appears

repeat 3 times
    Bird flies
    Bird says "Tweet!"
end

narrator says "The bird loves to sing!"
`,
    validate(code) {
      const c = code.toLowerCase();
      const hasRepeat = /repeat\s+\d+\s+times/.test(c);
      const hasEnd    = /\bend\b/.test(c);
      const num       = parseInt((c.match(/repeat\s+(\d+)\s+times/) || [,0])[1]);
      return hasRepeat && hasEnd && num >= 3;
    },
  },

  {
    id    : 'game_move_mission',
    title : '🎮 Mission 6: Move with Keys',
    emoji : '🎮',
    goal  : 'Start a game and move a player with arrow keys.',
    hint  : 'Use game, Rafi is player, every frame, if left key is held, move Rafi left by 4.',
    badge : '🕹️ Game Starter Badge',
    requiredSyntax: [
      'game "..."',
      'Rafi is player',
      'every frame',
      'move Rafi left by 4',
    ],
    starterCode: `# Move with Keys
game "My Game"

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
`,
    validate(code) {
      const c = code.toLowerCase();
      return /^game\s+"/m.test(c) &&
        /is\s+player/.test(c) &&
        /every\s+frame/.test(c) &&
        /move\s+\w+\s+(left|right)\s+by/.test(c);
    },
  },

  {
    id    : 'game_jump_mission',
    title : '⬆️ Mission 7: Jump!',
    emoji : '⬆️',
    goal  : 'Add a jump when space is pressed in game mode.',
    hint  : 'Use: when space is pressed ... Rafi jump with power 12 ... end',
    badge : '🦘 Jumper Badge',
    requiredSyntax: [
      'when space is pressed',
      'jump with power',
    ],
    starterCode: `# Jump Game
game "Jump"

scene "playground" with walls
Rafi is player

when space is pressed
    Rafi jump with power 12
end

every frame
    if right key is held
        move Rafi right by 4
    end
end
`,
    validate(code) {
      const c = code.toLowerCase();
      return /when\s+space\s+is\s+pressed/.test(c) &&
        /jump\s+with\s+power/.test(c);
    },
  },

  {
    id    : 'game_coin_mission',
    title : '🪙 Mission 8: Collect Coins',
    emoji : '🪙',
    goal  : 'Collect coins for points when your player touches them.',
    hint  : 'Use: if Rafi touches coin ... add 10 points ... remove coin ... end',
    badge : '💰 Treasure Hunter Badge',
    requiredSyntax: [
      'if Rafi touches coin',
      'add 10 points',
      'remove coin',
    ],
    starterCode: `# Collect Coins
game "Coins"

scene "playground" with walls
score starts at 0
Rafi is player

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
`,
    validate(code) {
      const c = code.toLowerCase();
      return /touches\s+coin/.test(c) &&
        /add\s+\d+\s+points/.test(c) &&
        /remove\s+coin/.test(c);
    },
  },

  {
    id    : 'game_timer_mission',
    title : '⏱️ Mission 9: Beat the Clock',
    emoji : '⏱️',
    goal  : 'Add a countdown timer to your game.',
    hint  : 'Use: timer starts at 30',
    badge : '⏱️ Speed Runner Badge',
    requiredSyntax: ['timer starts at'],
    starterCode: `# Beat the Clock
game "Rush"
game view top

scene "school" with walls
timer starts at 30
score starts at 0
Mina is player

every frame
    if right key is held
        move Mina right by 4
    end
    if left key is held
        move Mina left by 4
    end
end

when time is 0
    show message "Time is up!"
end
`,
    validate(code) {
      return /timer\s+starts\s+at\s+\d+/i.test(code);
    },
  },

  {
    id    : 'game_lives_mission',
    title : '❤️ Mission 10: Three Lives',
    emoji : '❤️',
    goal  : 'Give the player lives and lose one on danger.',
    hint  : 'Use: lives start at 3  and  lose 1 life',
    badge : '❤️ Survivor Badge',
    requiredSyntax: ['lives start at', 'lose 1 life'],
    starterCode: `# Three Lives
game "Survive"

scene "playground" with walls
lives start at 3
Rafi is player

every frame
    if right key is held
        move Rafi right by 4
    end
end

if Rafi touches wall
    lose 1 life
end
`,
    validate(code) {
      const c = code.toLowerCase();
      return /lives\s+start\s+at/.test(c) && /lose\s+1\s+life/.test(c);
    },
  },

  {
    id    : 'game_goal_mission',
    title : '🏆 Mission 11: Win Goal',
    emoji : '🏆',
    goal  : 'Set a coin goal and collect them to win.',
    hint  : 'Use: goal is collect 3 coins',
    badge : '🏆 Champion Badge',
    requiredSyntax: ['goal is collect', 'remove coin'],
    starterCode: `# Win Goal
game "Champion"
game view top

scene "school" with walls
goal is collect 3 coins
score starts at 0
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
`,
    validate(code) {
      const c = code.toLowerCase();
      return /goal\s+is\s+collect\s+\d+\s+coins/.test(c) && /remove\s+coin/.test(c);
    },
  },
];

window.SpeakMissions = MISSIONS;
