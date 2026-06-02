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

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
