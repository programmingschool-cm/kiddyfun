/**
 * Parser smoke tests — run: node tests/parser.test.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

global.window = global;

function loadScript(file) {
  var code = fs.readFileSync(path.join(root, file), 'utf8');
  eval(code);
}

loadScript('assets/js/lexer.js');
loadScript('assets/js/expr.js');
loadScript('assets/js/parser.js');

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

test('story hello parses', function () {
  var ast = SpeakParser.parseProgram('scene "school"\nRafi appears\nRafi says "Hi"');
  assert(ast.mode === 'story' || ast.nodes);
});

test('game mode parses', function () {
  var ast = SpeakParser.parseProgram('game "T"\ngame view top\nRafi is player\nevery frame\nend');
  assert(ast.mode === 'game');
});

test('choose branching parses', function () {
  var ast = SpeakParser.parseProgram(
    'scene "school"\nchoose "A" or "B"\nif choice equals "A"\nRafi says "A"\nend'
  );
  assert(ast.nodes && ast.nodes.length >= 1);
});

test('invalid scene throws', function () {
  var threw = false;
  try {
    SpeakParser.parseProgram('scene school');
  } catch (e) {
    threw = true;
  }
  assert(threw);
});

test('set variable parses', function () {
  var ast = SpeakParser.parseProgram('set x to 5\nnarrator says x');
  assert(ast.nodes);
});

test('quiz choices attach to the question', function () {
  var ast = SpeakParser.parseProgram(
    'ask "What is 2 + 2?"\nchoice "3" wrong\nchoice "4" correct'
  );
  var quiz = (ast.nodes || []).filter(function (n) { return n.type === 'quiz'; })[0];
  assert(quiz && quiz.choices.length === 2, 'expected two choices');
  assert(quiz.choices[1].result === 'correct');
});

test('ask with answers is rejected', function () {
  var threw = false;
  try {
    SpeakParser.parseProgram('ask "Colour?" with answers "red", "blue"');
  } catch (e) {
    threw = true;
    assert(/Unexpected/.test(e.message), e.message);
  }
  assert(threw, 'parser should reject with answers');
});

test('quiz without choices is rejected', function () {
  var threw = false;
  try {
    SpeakParser.parseProgram('ask "Colour?"\nRafi says "Hi"');
  } catch (e) {
    threw = true;
  }
  assert(threw);
});

loadScript('assets/js/curriculum.js');
loadScript('assets/js/python-export.js');

test('lessons unlock in order across levels', function () {
  var levels = [
    { id: 1, lessons: [{ id: 'L1-1' }, { id: 'L1-2' }] },
    { id: 2, lessons: [{ id: 'L2-1' }] },
  ];
  var unlocked = KiddyCurriculum.lessonUnlocked;
  assert(unlocked(levels, [], 'L1-1') === true);
  assert(unlocked(levels, [], 'L1-2') === false);
  assert(unlocked(levels, ['L1-1'], 'L1-2') === true);
  assert(unlocked(levels, ['L1-1'], 'L2-1') === false);
  assert(unlocked(levels, ['L1-2'], 'L2-1') === true);
  assert(unlocked(levels, ['L2-1'], 'L2-1') === true);
});

test('lesson completion needs the starter lines', function () {
  assert(KiddyCurriculum.starterMatches('Rafi says "Hi"', 'scene "school"\nRafi says "Hi"') === true);
  assert(KiddyCurriculum.starterMatches('Rafi says "Hi"', 'Rafi says "Hello"') === false);
});

test('python repeat body is indented', function () {
  var py = KiddyPythonExport.transpile('repeat 2 times\n    Rafi says "Hi"\nend\n');
  assert(py.indexOf('for _ in range(2):') !== -1, py);
  assert(py.indexOf('\n    print("Rafi: Hi")') !== -1, py);
});

test('curriculum starters parse', function () {
  var cur = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/curriculum.json'), 'utf8'));
  cur.levels.forEach(function (lvl) {
    lvl.lessons.forEach(function (les) {
      assert(les.starter.indexOf('with answers') === -1, les.id);
      var ast = SpeakParser.parseProgram(les.starter);
      assert(ast && (ast.nodes || ast.mode === 'game'), les.id);
      (ast.nodes || []).forEach(function (n) {
        if (n.type === 'quiz') assert(n.choices && n.choices.length, les.id + ' empty quiz');
      });
    });
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
