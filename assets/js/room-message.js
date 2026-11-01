/**
 * KiddyFun — which programs are safe to send into a friend room.
 * Story programs that finish on their own. No games, questions, or open loops.
 */
(function (root) {
  'use strict';

  var MAX_CHARS = 800;
  var BLOCKED = {
    ask_user_stmt: 'ask',
    quiz: 'quiz',
    quiz_start: 'quiz',
    quiz_choice: 'quiz',
    story_choose: 'choose',
    if_choice_equals: 'choose',
    repeat_while: 'repeat_while',
    game_start: 'game',
    game_view: 'game',
    every_frame: 'game',
    on_key_down: 'game',
    on_key_held: 'game',
    on_game_event: 'game',
  };
  var CHILD_KEYS = ['body', 'trueBranch', 'falseBranch', 'nodes', 'setup'];

  function walk(node, visit) {
    if (!node || typeof node !== 'object') return;
    if (Object.prototype.toString.call(node) === '[object Array]') {
      for (var i = 0; i < node.length; i++) walk(node[i], visit);
      return;
    }
    if (node.type) visit(node);
    for (var k = 0; k < CHILD_KEYS.length; k++) {
      if (node[CHILD_KEYS[k]]) walk(node[CHILD_KEYS[k]], visit);
    }
  }

  function firstSay(nodes) {
    var found = '';
    walk(nodes, function (node) {
      if (found) return;
      if (node.type === 'say' && node.text) found = String(node.text);
    });
    if (found.length > 80) found = found.slice(0, 77) + '...';
    return found;
  }

  function check(code) {
    var text = String(code || '');
    if (!text.trim()) return { ok: false, error: 'empty' };
    if (text.length > MAX_CHARS) return { ok: false, error: 'too_long' };

    var parser = root.SpeakParser;
    if (!parser || !parser.parseProgram) return { ok: false, error: 'parse' };

    var ast;
    try {
      ast = parser.parseProgram(text);
    } catch (e) {
      return { ok: false, error: 'parse' };
    }

    if (!ast || ast.mode === 'game') return { ok: false, error: 'game' };
    if (!ast.nodes || !ast.nodes.length) return { ok: false, error: 'empty' };

    var blocked = '';
    walk(ast.nodes, function (node) {
      if (blocked) return;
      if (BLOCKED[node.type]) blocked = BLOCKED[node.type];
    });
    if (blocked) return { ok: false, error: blocked };

    return { ok: true, preview: firstSay(ast.nodes) };
  }

  root.KiddyRoomMessage = {
    MAX_CHARS: MAX_CHARS,
    check: check,
  };
})(typeof window !== 'undefined' ? window : global);
