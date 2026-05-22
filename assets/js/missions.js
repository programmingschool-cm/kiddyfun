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
];

window.SpeakMissions = MISSIONS;
