/**
 * KiddyFun — which programs are safe to send into a friend room.
 * Story, logic, data, and score programs. No games.
 */
(function (root) {
  'use strict';

  var MAX_CHARS = 800;
  var BLOCKED = {
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

  var CHAT_SCENES = {
    school: 1,
    classroom: 1,
    jungle: 1,
    restaurant: 1,
    home: 1,
    playground: 1,
    space: 1,
  };

  function sceneToken(raw) {
    return String(raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Chat never shows the studio. An explicit default or unknown scene becomes school.
   * A snippet with no scene line keeps the stage that is already showing.
   * A real catalog scene is left alone.
   */
  function prepareChatCode(code) {
    var text = String(code || '').replace(/^\uFEFF/, '');
    if (!text.trim()) return text;
    var re = /^([ \t]*)scene([ \t]+)(["'])([^"']*)\3(.*)$/i;
    var lines = text.split(/\r?\n/);
    var i;
    for (i = 0; i < lines.length; i++) {
      var match = re.exec(lines[i]);
      if (!match) continue;
      if (CHAT_SCENES[sceneToken(match[4])]) continue;
      lines[i] = match[1] + 'scene' + match[2] + match[3] + 'school' + match[3] + match[5];
    }
    return lines.join('\n');
  }

  root.KiddyRoomMessage = {
    MAX_CHARS: MAX_CHARS,
    check: check,
    prepareChatCode: prepareChatCode,
  };
})(typeof window !== 'undefined' ? window : global);
