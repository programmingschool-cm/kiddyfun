/**
 * Friend-room turn and actor names — run: node tests/room-turn.test.js
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

loadScript('assets/js/room-turn.js');

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

var turn = KiddyRoomTurn;

test('latin nickname becomes one stage name', function () {
  assert(turn.actorName('Sunny Panda', {}) === 'SunnyPanda');
});

test('a single word keeps its capital', function () {
  assert(turn.actorName('rafi', {}) === 'Rafi');
});

test('bangla nickname gets a fallback actor', function () {
  assert(turn.actorName('সানি', {}) === 'Friend');
});

test('keyword nickname is not used as code', function () {
  assert(turn.actorName('scene', {}) === 'Friend');
  assert(turn.actorName('end', {}) === 'Friend');
});

test('taken fallback moves to the next free name', function () {
  assert(turn.actorName('সানি', { friend: true }) === 'Buddy');
});

test('taken latin name also takes a fallback', function () {
  assert(turn.actorName('Sunny Panda', { sunnypanda: true }) === 'Friend');
});

test('alone, the same person can send again', function () {
  assert(turn.canSend('me', 'me', 1) === true);
});

test('first message is open when nobody has sent', function () {
  assert(turn.canSend('', 'me', 2) === true);
  assert(turn.canSend(null, 'me', 3) === true);
});

test('last sender waits when two or more are in the room', function () {
  assert(turn.canSend('me', 'me', 2) === false);
  assert(turn.canSend('me', 'me', 6) === false);
});

test('someone else can take the next turn', function () {
  assert(turn.canSend('me', 'you', 2) === true);
});

test('missing self cannot send over a live turn', function () {
  assert(turn.canSend('me', '', 2) === false);
});

test('color stays the same for one id', function () {
  assert(turn.colorFor('abc') === turn.colorFor('abc'));
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
