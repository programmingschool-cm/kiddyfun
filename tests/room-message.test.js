/**
 * Friend-room message checks — run: node tests/room-message.test.js
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
loadScript('assets/js/room-message.js');

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

var check = KiddyRoomMessage.check;

test('short story is ok and previews the first say', function () {
  var res = check('scene "school"\nRafi appears\nRafi says "Hello friends"');
  assert(res.ok, 'expected ok');
  assert(res.preview === 'Hello friends', 'preview ' + res.preview);
});

test('repeat N times is ok', function () {
  var res = check('scene "park"\nCat appears\nrepeat 3 times\n    Cat says "Hi"\nend');
  assert(res.ok, res.error || 'expected ok');
});

test('empty code is rejected', function () {
  assert(check('   ').error === 'empty');
});

test('game mode is rejected', function () {
  var res = check('game "T"\ngame view top\nRafi is player\nevery frame\nend');
  assert(res.error === 'game', res.error);
});

test('ask user is rejected', function () {
  var res = check('ask user "What is your name?"');
  assert(res.error === 'ask', res.error);
});

test('quiz is rejected', function () {
  var res = check('ask "What is 2 + 2?"\nchoice "3" wrong\nchoice "4" correct');
  assert(res.error === 'quiz', res.error);
});

test('choose is rejected', function () {
  var res = check('scene "school"\nchoose "Go left" or "Go right"');
  assert(res.error === 'choose', res.error);
});

test('repeat while is rejected', function () {
  var res = check('set n to 1\nrepeat while n is less than 4\n    set n to n plus 1\nend');
  assert(res.error === 'repeat_while', res.error);
});

test('ask nested in repeat is rejected', function () {
  var res = check('repeat 2 times\n    ask user "Name?"\nend');
  assert(res.error === 'ask', res.error);
});

test('too long code is rejected', function () {
  var res = check('narrator says "' + new Array(900).join('a') + '"');
  assert(res.error === 'too_long', res.error);
});

test('broken code is rejected', function () {
  assert(check('scene school').error === 'parse');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
