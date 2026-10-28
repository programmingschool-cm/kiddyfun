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

loadScript('assets/js/blocks-script.js');
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

test('quiz template is ask plus choices', function () {
  var tree = S.parse('');
  S.insert(tree, null, S.makeTemplate('quiz'));
  assert(S.serialize(tree) === 'ask "2 + 2?"\nchoice "4" correct\nchoice "5" wrong');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
