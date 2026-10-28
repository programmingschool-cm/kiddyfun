/**
 * Blocks script round-trip — run: node tests/blocks-script.test.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

global.window = global;

function loadScript(file) {
  eval(fs.readFileSync(path.join(root, file), 'utf8'));
}

loadScript('assets/js/language-catalog.js');
loadScript('assets/js/blocks-script.js');
loadScript('assets/js/editor-linter.js');
loadScript('assets/js/lexer.js');
loadScript('assets/js/expr.js');
loadScript('assets/js/parser.js');

var S = window.KiddyBlocksScript;
var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  OK ' + name);
  } catch (e) {
    failed++;
    console.error('  FAIL ' + name + ': ' + e.message);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function roundTrip(src) {
  var out = S.serialize(S.parse(src));
  assert(out === src, 'expected:\n' + src + '\n\ngot:\n' + out);
}

test('hello story round-trips', function () {
  roundTrip('scene "school"\nRafi appears\nRafi says "Hello!"\nRafi waves');
});

test('if / else shares one end', function () {
  roundTrip('if score is greater than 10\n    narrator says "High!"\nelse\n    narrator says "Low!"\nend');
});

test('nested if / else keeps a single end per pair', function () {
  roundTrip(
    'if a\n    if b\n        narrator says "x"\n    else\n        narrator says "y"\n    end\nelse\n    narrator says "z"\nend'
  );
});

test('every frame with nested if round-trips', function () {
  roundTrip('every frame\n    if right key is held\n        move Rafi right by 4\n    end\nend');
});

test('unknown lines stay raw', function () {
  roundTrip('play sound "success"\nscore starts at 0');
});

test('full-line comments stay', function () {
  roundTrip('# hello\nRafi appears');
});

test('define and while stay closed blocks', function () {
  roundTrip('define greet with name\n    narrator says name\nend');
  roundTrip('while right key is held\n    move Rafi right by 4\nend');
});

test('set keeps quotes only when the value was quoted', function () {
  roundTrip('set name to "Rafi"');
  roundTrip('set age to 10');
  roundTrip('set total to 10 plus 5');
});

test('say expression stays unquoted', function () {
  roundTrip('Rafi says name');
});

test('scene with walls, game view, coin and wall', function () {
  roundTrip('scene "playground" with walls');
  roundTrip('game "My Game"\ngame view top');
  roundTrip('spawn coin at x 200 y 150');
  roundTrip('add wall at x 200 y 250 width 80 height 40');
});

test('starters round-trip and parse as programs', function () {
  S.STARTERS.forEach(function (starter) {
    roundTrip(starter.code);
    SpeakParser.parseProgram(starter.code);
  });
});

test('insert into a selected repeat', function () {
  var tree = S.parse('repeat 3 times\nend');
  var rep = tree.children[0];
  S.insert(tree, rep.id, S.makeTemplate('wave'));
  assert(S.serialize(tree) === 'repeat 3 times\n    Rafi waves\nend');
});

test('insert without a pocket goes at the end', function () {
  var tree = S.parse('scene "school"');
  S.insert(tree, null, S.makeTemplate('appears'));
  assert(S.serialize(tree) === 'scene "school"\nRafi appears');
});

test('delete removes a block and its children', function () {
  var tree = S.parse('repeat 2 times\n    Rafi waves\nend\nMina appears');
  S.remove(tree, tree.children[0].id);
  assert(S.serialize(tree) === 'Mina appears');
});

test('move swaps siblings', function () {
  var tree = S.parse('scene "school"\nRafi appears');
  assert(S.move(tree, tree.children[1].id, -1) === true);
  assert(S.serialize(tree) === 'Rafi appears\nscene "school"');
  assert(S.move(tree, tree.children[0].id, -1) === false);
});

test('field edit writes back', function () {
  var tree = S.parse('Rafi says "Hello!"');
  S.updateField(tree, tree.children[0].id, 'text', 'Hi');
  assert(S.serialize(tree) === 'Rafi says "Hi"');
});

test('condition forms rebuild the same line', function () {
  var samples = [
    'score is greater than 10',
    'score is greater than or equal to 10',
    'n is less than 4',
    'answer is correct',
    'answer is wrong',
    'choice equals "Go left"',
    'right key is held',
    'Rafi touches coin',
    'Rafi has key',
    'fruits is empty',
    '"apple" is in fruits',
    'item is in fruits',
    'a',
    'score is greater than 10 and lives is greater than 0'
  ];
  samples.forEach(function (sample) {
    assert(S.buildCondition(S.describeCondition(sample)) === sample, sample);
  });
});

test('simple values keep the same words through their slots', function () {
  function emitted(text, quoted) {
    var built = S.buildValue(S.describeValue(text, quoted));
    return built.quoted ? '"' + built.text + '"' : built.text;
  }
  [
    '10',
    'score',
    'true',
    'false',
    '10 plus 5',
    '8 minus 3',
    '4 times 2',
    '8 divided by 2',
    '10 remainder 3',
    '"Hi" joined with name',
    'random number from 1 to 6',
    'list "apple" and "banana"',
    'list 1 and 2',
    'item 1 in fruits',
    'length of name',
    'ask user "Name?"',
    'call greet',
    'call add with 1 and 2',
    'not ready',
    '10 plus 5 times 2'
  ].forEach(function (sample) {
    assert(emitted(sample, false) === sample, sample);
  });
  assert(emitted('Rafi', true) === '"Rafi"');
  assert(S.describeValue('10 plus 5', false).kind === 'math');
  assert(S.describeValue('random number from 1 to 6', false).kind === 'random');
  assert(S.describeValue('list "apple" and "banana"', false).kind === 'list');
  assert(S.describeValue('10 plus 5 times 2', false).kind === 'value');
});

test('scene typos suggest a built-in background', function () {
  assert(KiddyCatalog.suggestScene('scool') === 'school');
  assert(KiddyCatalog.suggestScene('playgound') === 'playground');
  assert(KiddyCatalog.suggestScene('school') === null);
  assert(KiddyCatalog.suggestScene('forest') === null);
});

test('action template is a character action', function () {
  var tree = S.parse('');
  S.insert(tree, null, S.makeTemplate('action'));
  assert(S.serialize(tree) === 'Rafi waves');
});

test('new story and game lines round-trip', function () {
  [
    'play sound "success"',
    'score starts at 0',
    'add 10 points',
    'show score',
    'show message "You win!"',
    'show word "brave" means "সাহসী"',
    'show type of age',
    'show value of name',
    'const maxScore to 100',
    'const title to "Quiz"',
    'ask user "What is your name?" as playerName',
    'ask user "Favourite colour?"',
    'choose "Go left" or "Go right"',
    'choose "A" or "B" or "C"',
    'add "mango" to fruits',
    'add name to fruits',
    'remove item 2 from fruits',
    'remove coin',
    'remove enemy',
    'break',
    'continue',
    'set total to 10 plus 5',
    'set roll to random number from 1 to 6',
    'set fruits to list "apple" and "banana"',
    'set picked to item 1 in fruits',
    'set len to length of name',
    'set who to ask user "Name?"',
    'set sum to call add with 1 and 2',
    'return a plus b',
    'return',
    'call waveHello',
    'call greet with "Rafi"',
    'set Rafi speed to 5',
    'lives start at 3',
    'timer starts at 60',
    'goal is collect 5 coins',
    'lose 1 life',
    'load map "school_maze"',
    'camera follows Mina',
    'camera follow Mina',
    'Rafi jump with power 12',
    'Rafi jump',
    'spawn Lion as enemy at x 350 y ground',
    'Lion patrols between x 200 and x 500',
    'pause game',
    'resume game',
    'stop game',
    'restart game',
    'level starts at 1',
    'next level',
    'health starts at 100',
    'Lion is enemy',
    'Lion chases Rafi',
    'spawn hazard lava at x 200 y 200 width 60 height 40',
    'shoot bullet from Rafi toward right speed 8',
    'give Rafi key',
    'damage Rafi by 10',
    'hurt Mina by 5',
    '# hello',
    '# Hello Story — your first program'
  ].forEach(roundTrip);
});

test('define, for each, and while key are real blocks', function () {
  roundTrip('define greet with name\n    narrator says name\nend');
  roundTrip('define waveHello\n    Rafi waves\nend');
  roundTrip('define addNumbers with a and b\n    return a plus b\nend');
  roundTrip('for each fruit in fruits\n    narrator says fruit\nend');
  roundTrip('while right key is held\n    move Rafi right by 4\nend');
  var tree = S.parse('define greet with name\nend');
  assert(tree.children[0].kind === 'define');
  assert(S.parse('for each fruit in fruits\nend').children[0].kind === 'forEach');
  assert(S.parse('play sound "success"').children[0].kind === 'playSound');
});

test('else lands beside the selected if', function () {
  var tree = S.parse('if score is greater than 1\n    narrator says "Yes"\nend');
  S.insertAfter(tree, tree.children[0].id, S.makeTemplate('else'));
  assert(S.serialize(tree) === 'if score is greater than 1\n    narrator says "Yes"\nelse\nend');
});

test('quiz template is one card of ask and choices', function () {
  var tree = S.parse('');
  S.insert(tree, null, S.makeTemplate('quiz'));
  assert(tree.children.length === 1);
  assert(tree.children[0].kind === 'quiz');
  assert(S.serialize(tree) === 'ask "2 + 2?"\nchoice "4" correct\nchoice "5" wrong');
  roundTrip('ask "Which fruit is yellow?"\nchoice "Apple" wrong\nchoice "Banana" correct\nchoice "Grape" wrong');
  roundTrip('repeat 2 times\n    ask "Is coding fun?"\n    choice "Yes!" correct\n    choice "No" wrong\nend');
  roundTrip('ask "Waiting"');
  roundTrip('choice "Alone" wrong');
});

test('narrator says is not treated as a character name', function () {
  function titles(src) {
    return KiddyEditorLinter.lintCode(src).map(function (d) { return d.title; }).join('|');
  }
  assert(titles('narrator says name').indexOf('Capitalize') < 0);
  assert(titles('narrator says "Hello"').indexOf('Capitalize') < 0);
  assert(KiddyEditorLinter.autoCorrectOnEnter('    narrator says name') === null);
  assert(titles('rafi says "Hi"').indexOf('Capitalize') >= 0);
  assert(KiddyEditorLinter.autoCorrectOnEnter('rafi waves') === 'Rafi waves');
  assert(titles('narator says "Hi"').indexOf('narrator') >= 0);
});

test('game jump is not rewritten as the story action jumps', function () {
  function titles(src) {
    return KiddyEditorLinter.lintCode(src).map(function (d) { return d.title; }).join('|');
  }
  assert(titles('Rafi jump').indexOf('jumps') < 0);
  assert(titles('Rafi jump with power 12').indexOf('jumps') < 0);
  assert(titles('Mina jump with power 8').indexOf('jumps') < 0);
  assert(KiddyEditorLinter.autoCorrectOnEnter('Rafi jump with power 12') === null);
  assert(titles('Rafi wave').indexOf('waves') >= 0);
});

test('text hints use the same placement rules as blocks', function () {
  function messages(src) {
    return S.placementWarnings(src).map(function (h) { return h.line + ':' + h.message; });
  }
  assert(messages('move Rafi right by 4').join('|') === '0:Put Move inside Every frame');
  assert(messages('every frame\n    move Rafi right by 4\nend').length === 0);
  assert(messages('while right key is held\n    move Rafi right by 4\nend').length === 0);
  assert(messages('every frame\n    if Rafi touches coin\n        add 10 points\n    end\nend').join('|') === '1:Put Touches outside Every frame');
  assert(messages('game "G"\nif right key is held\n    move Rafi right by 4\nend').indexOf('1:Put key held inside Every frame') >= 0);
  assert(messages('repeat 200 times\nend').join('|') === '0:Repeat must be from 1 to 100');
  assert(messages('repeat 3 times\nend').length === 0);
  assert(messages('wait 9 seconds').join('|') === '0:Wait must be from 1 to 8 seconds');
  assert(messages('wait 2 seconds').length === 0);
  assert(messages('game "G"\nRafi says "Hi"').join('|') === '1:Story blocks do not run in a game');
  var lint = KiddyEditorLinter.lintCode('move Rafi right by 4');
  var found = false;
  lint.forEach(function (d) {
    if (d.line === 0 && d.message === 'Put Move inside Every frame' && d.severity === 'warning') found = true;
  });
  assert(found, 'editor linter shows the move hint');
  var frame = KiddyEditorLinter.lintCode('every frame\n    if Rafi touches coin\n        add 10 points\n    end\nend');
  var extra = false;
  var touch = false;
  frame.forEach(function (d) {
    if (d.title && d.title.indexOf('Extra') >= 0) extra = true;
    if (d.message === 'Put Touches outside Every frame') touch = true;
  });
  assert(!extra, 'every frame keeps its end');
  assert(touch, 'touches inside every frame is hinted');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
