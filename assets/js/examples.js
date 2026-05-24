/**
 * SpeakScript Built-in Example Programs v0.1
 */

const EXAMPLES = [
  {
    id   : 'greeting',
    title: '👋 Greeting Story',
    desc : 'Two friends meet at school and say good morning.',
    code : `# Greeting Story
scene "school"

Rafi appears
Mina appears

Rafi waves
Rafi says "Good morning, Mina!"

Mina smiles
Mina says "Good morning, Rafi!"

Rafi says "How are you?"
Mina says "I am fine. Thank you!"

narrator says "They are good friends."
`,
  },
  {
    id   : 'jungle',
    title: '🦁 Animal Jungle',
    desc : 'Animals in the jungle introduce themselves.',
    code : `# Animal Jungle
scene "jungle"

Lion appears
Bird appears
Monkey appears

Lion says "I am a lion."
Lion says "I am strong!"

Bird flies
Bird says "I can fly high!"

Monkey jumps
Monkey says "I love bananas!"

narrator says "The jungle is full of amazing animals."
`,
  },
  {
    id   : 'restaurant',
    title: '🍽️ Restaurant Conversation',
    desc : 'A buyer orders juice from a seller.',
    code : `# Restaurant Conversation
scene "restaurant"

Seller appears
Buyer appears

Seller says "Welcome to our restaurant!"
Buyer says "Hello! I want some juice please."
Seller says "Of course! Orange or mango?"
Buyer says "Mango juice please."
Seller says "Here you are."
Buyer says "Thank you very much!"
Seller says "Enjoy your drink!"

narrator says "Always be polite when you order food."
`,
  },
  {
    id   : 'quiz',
    title: '📝 Fruit Quiz',
    desc : 'A teacher runs a fruit colour quiz.',
    code : `# Fruit Quiz
scene "classroom"

Teacher appears
Teacher says "Let us play a fruit quiz!"
Teacher says "Are you ready?"

wait 1 second

ask "Which fruit is yellow?"
choice "Apple" wrong
choice "Banana" correct
choice "Mango" wrong

if answer is correct
    Teacher says "Excellent! Bananas are yellow!"
    narrator says "Well done! Keep it up!"
else
    Teacher says "Not quite! The answer is Banana."
    narrator says "Try again next time!"
end
`,
  },
  {
    id   : 'repeat',
    title: '🐦 Bird Repeat',
    desc : 'A bird flies and tweets three times.',
    code : `# Repeat Action
scene "playground"

Bird appears
narrator says "Watch the bird sing!"

repeat 3 times
    Bird flies
    Bird says "Tweet tweet!"
end

narrator says "The bird loves to sing!"
`,
  },
  {
    id   : 'vocab',
    title: '📚 Vocabulary Cards',
    desc : 'Learn some English words with meanings.',
    code : `# Vocabulary Learning
scene "classroom"

Teacher appears
Teacher says "Today we learn new words!"

show word "brave" means "সাহসী"
show word "jump" means "লাফানো"
show word "river" means "নদী"
show word "friend" means "বন্ধু"
show word "sky" means "আকাশ"

Teacher says "Can you use these words in a sentence?"
narrator says "Practice makes perfect!"
`,
  },
  {
    id   : 'space',
    title: '🚀 Space Adventure',
    desc : 'A robot explores outer space.',
    code : `# Space Adventure
scene "space"

Robot appears
narrator says "Year 2050. A robot is exploring space."

Robot says "I am Robot X9."
Robot says "I have landed on a new planet!"
Robot moves right
Robot says "The planet looks strange."
Robot moves left
Robot says "I see a glowing rock!"
Robot waves
Robot says "Mission complete! Heading home."

narrator says "The robot returned safely to Earth."
`,
  },
  {
    id   : 'score',
    title: '🏆 Score Game',
    desc : 'A quiz that tracks your score.',
    code : `# Score Game
scene "school"

score starts at 0

Teacher appears
Teacher says "Welcome to the Score Game!"

ask "What is the capital of Bangladesh?"
choice "Dhaka" correct
choice "London" wrong
choice "Paris" wrong

if answer is correct
    Teacher says "Correct! Dhaka is the capital!"
    add 10 points
else
    Teacher says "The answer is Dhaka."
end

show score

narrator says "Great effort! Keep learning!"
`,
  },
  {
    id   : 'kiddyfun',
    title: '🎓 The kiddyFun Project',
    desc : 'Three friends plan to open a kids coding course in Cumilla.',
    code : `# The kiddyFun Project
scene "classroom"

score starts at 0

Mostak appears
Sagor appears
Rabiul appears

narrator says "Mostak, Sagor, and Rabiul are friends from class 6."
narrator says "They graduated in CSE from the same institution."

Mostak runs
Mostak moves right
Mostak smiles
Mostak says "Friends, it is time we do something for our hometown Cumilla."

Sagor walks
Sagor nods
Sagor says "I agree. We should teach kids how to code!"

Rabiul cheers
Rabiul says "That is a brilliant idea! Programming is the future."

Mostak says "But how do we make coding easy for kids?"

Sagor handshakes
Sagor says "We can create a new, fun programming language."

Rabiul runs
Rabiul moves left
Rabiul says "Let us call it kiddyFun!"
Rabiul says "It will teach them logic and English together."

show word "logic" means "যুক্তি"
show word "future" means "ভবিষ্যৎ"
show word "programming" means "প্রোগ্রামিং"

Mostak walks
Mostak says "Let us test our idea. I will ask a question."

ask "Why should kids learn to code?"
choice "To build games and solve problems" correct
choice "To sleep all day" wrong

if answer is correct
    Mostak nods
    Mostak says "Exactly! Problem-solving is a great skill."
    play sound "success"
    add 10 points
else
    Mostak says "No, that is not right. Coding helps solve problems!"
end

ask "Where will we start our first course?"
choice "Dhaka" wrong
choice "Cumilla" correct

if answer is correct
    Sagor cheers
    Sagor says "Yes! Cumilla is our hometown."
    play sound "success"
    add 10 points
else
    Sagor says "Actually, we will start in Cumilla!"
end

show score

Rabiul handshakes
Rabiul says "I am so excited to see kids writing their first code."
Sagor says "Me too! We will open it next month."

narrator says "And so, the journey of kiddyFun begins!"
`,
  },
  {
    id   : 'programming101',
    title: '💻 Programming 101',
    desc : 'Variables, text, numbers, lists, functions, and conditions — industry concepts, super easy words.',
    code : `# Programming 101 — KiddyFun Language v2
scene "classroom"

Teacher appears
Teacher says "Today we learn real programming ideas!"

# Variables (store data)
set name to "Rafi"
set age to 10
set happy to true
set greeting to "Hello" joined with " friend"

show type of name
show type of age
show value of greeting

# Use variables when speaking
Teacher says greeting
Rafi appears
Rafi says name

# Math with numbers
set points to 0
set points to points plus 25
show value of points

# Lists (many items)
set fruits to list "apple" and "banana" and "mango"
set firstFruit to item 1 in fruits
show value of firstFruit

# Conditions
if age is greater than 5
    Teacher says "You are ready for coding!"
else
    Teacher says "Keep learning every day!"
end

# Functions (reusable steps)
define celebrate
    play sound "cheer"
    narrator says "Great job!"
end

call celebrate

# Loop while a condition is true
set count to 1
repeat while count is less than 4
    Rafi waves
    set count to count plus 1
end

narrator says "You used variables, types, lists, if, functions, and loops!"
`,
  },
  {
    id   : 'programming102',
    title: '⌨️ Input, for-each, const',
    desc : 'Keyboard input, loops over lists, break/continue, const, and function results.',
    code : `# Programming 102 — more basics
scene "classroom"

Teacher appears

# Keyboard input (also saved in "answer")
ask user "What is your name?" as playerName
Teacher says playerName

# const — cannot change later
const maxLives to 3
show type of maxLives

# Function that returns a value
define double with n
    return n times 2
end

set score to 10
set score to call double with score
show value of score

# for each item in a list
set fruits to list "Apple" and "Banana" and "Mango"
for each fruit in fruits
    narrator says fruit
end

# break and continue
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

narrator says "You learned input, for each, const, break, continue, and return values!"
`,
  },
  {
    id   : 'programming103',
    title: '🎲 Lists, random, and more',
    desc : 'Random numbers, remainder, empty/in checks, add/remove list items, >= comparisons.',
    code : `# Programming 103 — extra basics
scene "classroom"

Teacher appears
Teacher says "More real programming tools!"

set fruits to list "apple" and "banana"

# Add and remove list items
add "mango" to fruits
show value of fruits
remove item 2 from fruits
show value of fruits

# Check list
if fruits is empty
    narrator says "No fruit!"
else
    narrator says "We have fruit!"
end

if "apple" is in fruits
    narrator says "Apple is on the list!"
end

# Random dice (1 to 6)
set roll to random number from 1 to 6
narrator says roll

# Remainder (even or odd trick)
set n to 11
set leftover to n remainder 2
if leftover equals 0
    narrator says "n is even"
else
    narrator says "n is odd"
end

# Greater-or-equal
set level to 3
if level is greater than or equal to 3
    Teacher says "Level 3 unlocked!"
end

narrator says "You used random, remainder, list add/remove, empty, and is in!"
`,
  },
];

window.SpeakExamples = EXAMPLES;
