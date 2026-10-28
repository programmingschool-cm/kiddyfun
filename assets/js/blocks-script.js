/**
 * KiddyFun blocks — line tree that round-trips with text code.
 * Structure follows `end` (and `else`), same as the parser. Indent is only for output.
 */
(function () {
  'use strict';

  var INDENT = '    ';
  var seq = 1;

  var ACTIONS = (window.KiddyCatalog && KiddyCatalog.storyActions)
    ? KiddyCatalog.storyActions.slice()
    : [
      'waves', 'smiles', 'jumps', 'flies', 'runs', 'walks', 'dances', 'claps',
      'hides', 'shows', 'bows', 'nods', 'cheers', 'handshakes', 'flaps',
      'moves left', 'moves right'
    ];

  var COMPARE_OPS = (window.KiddyCatalog && KiddyCatalog.compareOps)
    ? KiddyCatalog.compareOps.slice()
    : [
      'is greater than or equal to',
      'is less than or equal to',
      'is not equal to',
      'is greater than',
      'is less than',
      'is equal to',
      'equals'
    ];

  var MATH_OPS = (window.KiddyCatalog && KiddyCatalog.mathOps)
    ? KiddyCatalog.mathOps.slice()
    : ['plus', 'minus', 'times', 'divided by', 'remainder', 'joined with'];
  MATH_OPS.sort(function (a, b) { return b.length - a.length; });

  var C_BLOCK = {
    repeat: true,
    repeatWhile: true,
    if: true,
    else: true,
    everyFrame: true,
    when: true,
    forEach: true,
    whileKey: true,
    define: true,
    craw: true
  };

  var PALETTE = [
    { cat: 'Story', tone: 'story', items: [
      { id: 'scene', label: 'Scene', icon: '🎬' },
      { id: 'appears', label: 'Appears', icon: '✨' },
      { id: 'says', label: 'Says', icon: '💬' },
      { id: 'narrator', label: 'Narrator', icon: '📖' },
      { id: 'action', label: 'Action', icon: '🎭' },
      { id: 'wait', label: 'Wait', icon: '⏸️' },
      { id: 'word', label: 'Word', icon: '📚' },
      { id: 'choose', label: 'Choose', icon: '🔀' },
      { id: 'sound', label: 'Sound', icon: '🔊' }
    ]},
    { cat: 'Logic', tone: 'logic', items: [
      { id: 'repeat', label: 'Repeat', icon: '🔁' },
      { id: 'repeatWhile', label: 'Repeat while', icon: '🔁' },
      { id: 'if', label: 'If', icon: '🧠' },
      { id: 'else', label: 'Else', icon: '↪️' },
      { id: 'forEach', label: 'For each', icon: '📋' },
      { id: 'break', label: 'Break', icon: '⏭️' },
      { id: 'continue', label: 'Continue', icon: '↩️' },
      { id: 'quiz', label: 'Quiz', icon: '❓' },
      { id: 'set', label: 'Set', icon: '📦' }
    ]},
    { cat: 'Data', tone: 'logic', items: [
      { id: 'const', label: 'Const', icon: '🔒' },
      { id: 'askUser', label: 'Ask user', icon: '⌨️' },
      { id: 'define', label: 'Define', icon: '⚙️' },
      { id: 'call', label: 'Call', icon: '▶️' },
      { id: 'return', label: 'Return', icon: '↩️' },
      { id: 'addToList', label: 'Add to list', icon: '➕' },
      { id: 'removeItem', label: 'Remove item', icon: '➖' },
      { id: 'showValue', label: 'Show value', icon: '🔍' },
      { id: 'showType', label: 'Show type', icon: '🔎' }
    ]},
    { cat: 'Score', tone: 'logic', items: [
      { id: 'score', label: 'Score', icon: '🏆' },
      { id: 'points', label: 'Points', icon: '⭐' },
      { id: 'showScore', label: 'Show score', icon: '📊' }
    ]},
    { cat: 'Game', tone: 'game', items: [
      { id: 'game', label: 'Game', icon: '🎮' },
      { id: 'player', label: 'Player', icon: '👤' },
      { id: 'everyFrame', label: 'Every frame', icon: '🔄' },
      { id: 'spawn', label: 'Spawn coin', icon: '🪙' },
      { id: 'wall', label: 'Wall', icon: '🧱' },
      { id: 'move', label: 'Move', icon: '➡️' },
      { id: 'whenKey', label: 'When key', icon: '⌨️' },
      { id: 'whileKey', label: 'While key', icon: '🕹️' },
      { id: 'jump', label: 'Jump', icon: '⬆️' },
      { id: 'touches', label: 'Touches coin', icon: '✨' },
      { id: 'lives', label: 'Lives', icon: '❤️' },
      { id: 'timer', label: 'Timer', icon: '⏱️' },
      { id: 'goal', label: 'Goal', icon: '🏁' },
      { id: 'loseLife', label: 'Lose life', icon: '💔' },
      { id: 'message', label: 'Message', icon: '📣' },
      { id: 'removeCoin', label: 'Remove', icon: '🗑️' },
      { id: 'enemy', label: 'Enemy', icon: '🦁' },
      { id: 'isEnemy', label: 'Is enemy', icon: '👾' },
      { id: 'patrol', label: 'Patrol', icon: '🚶' },
      { id: 'map', label: 'Map', icon: '🗺️' },
      { id: 'speed', label: 'Speed', icon: '💨' },
      { id: 'camera', label: 'Camera', icon: '📷' },
      { id: 'pause', label: 'Pause', icon: '⏸️' },
      { id: 'level', label: 'Level', icon: '📈' },
      { id: 'nextLevel', label: 'Next level', icon: '⬆️' },
      { id: 'health', label: 'Health', icon: '💚' },
      { id: 'damage', label: 'Damage', icon: '💢' },
      { id: 'chase', label: 'Chase', icon: '🐾' },
      { id: 'hazard', label: 'Hazard', icon: '🌋' },
      { id: 'shoot', label: 'Shoot', icon: '💥' },
      { id: 'give', label: 'Give', icon: '🔑' }
    ]}
  ];

  var STARTERS = [
    {
      id: 'hello',
      label: 'Hello story',
      hint: 'A friend appears and says hi',
      code: 'scene "school"\nRafi appears\nRafi says "Hello!"\nRafi waves'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      hint: 'Ask a question and react',
      code: 'ask "2 + 2?"\nchoice "4" correct\nchoice "5" wrong\nif answer is correct\n    narrator says "Great!"\nend'
    },
    {
      id: 'coin',
      label: 'Coin game',
      hint: 'Move and pick up a coin',
      code: 'game "Coin Collector"\ngame view top\nscene "playground" with walls\nRafi is player\nspawn coin at x 200 y 150\nevery frame\n    if right key is held\n        move Rafi right by 4\n    end\nend\nif Rafi touches coin\n    add 10 points\n    remove coin\nend'
    }
  ];

  function create(kind, fields, children) {
    var f = fields || {};
    var raw = (kind === 'raw' || kind === 'craw') ? (f.raw || '') : null;
    return {
      id: 'b' + (seq++),
      kind: kind,
      fields: f,
      children: children || [],
      raw: raw,
      cBlock: !!C_BLOCK[kind]
    };
  }

  function stripComment(line) {
    var inStr = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') inStr = !inStr;
      else if (ch === '#' && !inStr) return line.slice(0, i).trim();
    }
    return line.trim();
  }

  function classify(code) {
    var m;

    m = code.match(/^scene\s+"([^"]*)"\s*(.*)$/i);
    if (m) {
      var extra = (m[2] || '').trim().toLowerCase();
      if (!extra || extra === 'with walls') {
        return create('scene', { name: m[1], withWalls: extra === 'with walls' });
      }
    }

    m = code.match(/^narrator\s+says\s+(.*)$/i);
    if (m) return create('narrator', stringField(m[1]));

    m = code.match(/^wait\s+(\d+(?:\.\d+)?)\s+seconds?\s*$/i);
    if (m) return create('wait', { seconds: m[1] });

    m = code.match(/^repeat\s+(\d+)\s+times\s*$/i);
    if (m) return create('repeat', { times: m[1] });

    m = code.match(/^repeat\s+while\s+(.+)$/i);
    if (m) return create('repeatWhile', { condition: m[1].trim() });

    m = code.match(/^if\b\s*(.*)$/i);
    if (m) return create('if', { condition: (m[1] || '').trim() });

    if (/^else\s*$/i.test(code)) return create('else', {});

    if (/^every\s+frame\s*$/i.test(code)) return create('everyFrame', {});

    m = code.match(/^when\s+(.+)$/i);
    if (m) return create('when', { clause: m[1].trim() });

    m = code.match(/^game\s+view\s+(top|side)\s*$/i);
    if (m) return create('gameView', { view: m[1].toLowerCase() });

    m = code.match(/^game\s+"([^"]*)"\s*$/i);
    if (m) return create('game', { title: m[1] });

    m = code.match(/^ask\s+user\s+"([^"]*)"(?:\s+as\s+([A-Za-z_][\w]*))?\s*$/i);
    if (m) return create('askUser', { text: m[1], storeAs: m[2] || '' });

    m = code.match(/^ask\s+"([^"]*)"\s*$/i);
    if (m) return create('ask', { text: m[1] });

    m = code.match(/^choice\s+"([^"]*)"\s+(correct|wrong)\s*$/i);
    if (m) return create('choice', { text: m[1], result: m[2].toLowerCase() });

    m = code.match(/^const\s+([A-Za-z_][\w]*)\s+to\s+(.*)$/i);
    if (m) {
      var packedConst = stringField(m[2].trim());
      return create('const', { name: m[1], value: packedConst.text, quoted: packedConst.quoted });
    }

    m = code.match(/^set\s+([A-Za-z_][\w]*)\s+speed\s+to\s+(\S+)\s*$/i);
    if (m) return create('speed', { name: m[1], value: m[2] });

    m = code.match(/^set\s+([A-Za-z_][\w]*)\s+to\s+(.*)$/i);
    if (m) {
      var packed = stringField(m[2].trim());
      return create('set', { name: m[1], value: packed.text, quoted: packed.quoted });
    }

    m = code.match(/^spawn\s+coin\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s*$/i);
    if (m) return create('spawnCoin', { x: m[1], y: m[2] });

    m = code.match(/^spawn\s+([A-Za-z_][\w]*)\s+as\s+enemy\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s*$/i);
    if (m) return create('spawnEnemy', { name: m[1], x: m[2], y: m[3] });

    m = code.match(/^add\s+wall\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s+width\s+(\S+)\s+height\s+(\S+)\s*$/i);
    if (m) return create('wall', { x: m[1], y: m[2], width: m[3], height: m[4] });

    m = code.match(/^add\s+(\d+(?:\.\d+)?)\s+points\s*$/i);
    if (m) return create('scoreAdd', { value: m[1] });

    m = code.match(/^add\s+(.+?)\s+to\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) {
      var added = stringField(m[1].trim());
      return create('addToList', { value: added.text, quoted: added.quoted, list: m[2] });
    }

    m = code.match(/^move\s+([A-Za-z_][\w]*)\s+(left|right|up|down)\s+by\s+(\S+)\s*$/i);
    if (m) return create('move', { name: m[1], dir: m[2].toLowerCase(), by: m[3] });

    m = code.match(/^([A-Za-z_][\w]*)\s+is\s+player\s*$/i);
    if (m) return create('player', { name: m[1] });

    m = code.match(/^([A-Za-z_][\w]*)\s+is\s+enemy\s*$/i);
    if (m) return create('isEnemy', { name: m[1] });

    m = code.match(/^([A-Za-z_][\w]*)\s+chases\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('chase', { name: m[1], target: m[2] });

    m = code.match(/^([A-Za-z_][\w]*)\s+jump(?:\s+with\s+power\s+(\S+))?\s*$/i);
    if (m) return create('jump', { name: m[1], power: m[2] || '' });

    m = code.match(/^([A-Za-z_][\w]*)\s+patrols\s+between\s+x\s+(\S+)\s+and\s+x\s+(\S+)\s*$/i);
    if (m) return create('patrol', { name: m[1], min: m[2], max: m[3] });

    m = code.match(/^([A-Za-z_][\w]*)\s+appears\s*$/i);
    if (m) return create('appears', { name: m[1] });

    m = code.match(/^([A-Za-z_][\w]*)\s+says\s+(.*)$/i);
    if (m) {
      var said = stringField(m[2].trim());
      return create('says', { name: m[1], text: said.text, quoted: said.quoted });
    }

    m = code.match(/^([A-Za-z_][\w]*)\s+moves\s+(left|right)\s*$/i);
    if (m) return create('action', { name: m[1], action: 'moves ' + m[2].toLowerCase() });

    m = code.match(/^([A-Za-z_][\w]*)\s+(waves|smiles|jumps|flies|runs|walks|dances|claps|hides|shows|bows|nods|cheers|handshakes|flaps)\s*$/i);
    if (m) return create('action', { name: m[1], action: m[2].toLowerCase() });

    m = code.match(/^play\s+sound\s+"([^"]*)"\s*$/i);
    if (m) return create('playSound', { sound: m[1] });

    m = code.match(/^choose\s+(.+)$/i);
    if (m) {
      var options = [];
      var chooseRe = /"([^"]*)"/g;
      var chooseHit;
      while ((chooseHit = chooseRe.exec(m[1]))) options.push(chooseHit[1]);
      if (options.length) return create('choose', { options: options });
    }

    m = code.match(/^score\s+(start|starts)\s+at\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('scoreSet', { verb: m[1].toLowerCase(), value: m[2] });

    m = code.match(/^lives\s+(start|starts)\s+at\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('lives', { verb: m[1].toLowerCase(), value: m[2] });

    m = code.match(/^timer\s+(start|starts)\s+at\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('timer', { verb: m[1].toLowerCase(), value: m[2] });

    m = code.match(/^goal\s+is\s+collect\s+(\d+)\s+coins\s*$/i);
    if (m) return create('goal', { value: m[1] });

    m = code.match(/^show\s+score\s*$/i);
    if (m) return create('showScore', {});

    m = code.match(/^show\s+message\s+"([^"]*)"\s*$/i);
    if (m) return create('showMessage', { text: m[1] });

    m = code.match(/^show\s+word\s+"([^"]*)"\s+means\s+"([^"]*)"\s*$/i);
    if (m) return create('showWord', { word: m[1], meaning: m[2] });

    m = code.match(/^show\s+type\s+of\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('showType', { name: m[1] });

    m = code.match(/^show\s+value\s+of\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('showValue', { name: m[1] });

    m = code.match(/^remove\s+item\s+(\d+)\s+from\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('removeItem', { index: m[1], list: m[2] });

    m = code.match(/^remove\s+(coin|enemy)\s*$/i);
    if (m) return create('removeEntity', { target: m[1].toLowerCase() });

    m = code.match(/^lose\s+(\d+)\s+(life|lives)\s*$/i);
    if (m) return create('loseLife', { value: m[1], noun: m[2].toLowerCase() });

    m = code.match(/^load\s+map\s+"([^"]*)"\s*$/i);
    if (m) return create('loadMap', { name: m[1] });

    m = code.match(/^camera\s+(follows|follow)\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('camera', { verb: m[1].toLowerCase(), name: m[2] });

    m = code.match(/^for\s+each\s+([A-Za-z_][\w]*)\s+in\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('forEach', { item: m[1], list: m[2] });

    m = code.match(/^while\s+(left|right|up|down|space)\s+key\s+is\s+held\s*$/i);
    if (m) return create('whileKey', { key: m[1].toLowerCase() });

    m = code.match(/^define\s+([A-Za-z_][\w]*)(?:\s+with\s+(.+))?$/i);
    if (m) return create('define', { name: m[1], params: m[2] ? m[2].trim() : '' });

    m = code.match(/^call\s+([A-Za-z_][\w]*)(?:\s+with\s+(.*))?$/i);
    if (m) return create('call', { name: m[1], withArgs: m[2] != null, args: m[2] != null ? m[2] : '' });

    m = code.match(/^return\b\s*(.*)$/i);
    if (m) return create('return', { expr: (m[1] || '').trim() });

    m = code.match(/^(pause|resume|stop|restart)\s+game\s*$/i);
    if (m) return create('gameFlow', { action: m[1].toLowerCase() });

    m = code.match(/^level\s+(start|starts)\s+at\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('levelSet', { verb: m[1].toLowerCase(), value: m[2] });

    if (/^next\s+level\s*$/i.test(code)) return create('nextLevel', {});

    m = code.match(/^health\s+(start|starts)\s+at\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('health', { verb: m[1].toLowerCase(), value: m[2] });

    m = code.match(/^spawn\s+hazard\s+([A-Za-z_][\w]*)\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s+width\s+(\S+)\s+height\s+(\S+)\s*$/i);
    if (m) return create('hazard', { name: m[1], x: m[2], y: m[3], width: m[4], height: m[5] });

    m = code.match(/^shoot\s+bullet\s+from\s+([A-Za-z_][\w]*)\s+toward\s+(left|right|up|down)(?:\s+speed\s+(\S+))?\s*$/i);
    if (m) return create('shoot', { name: m[1], dir: m[2].toLowerCase(), speed: m[3] || '' });

    m = code.match(/^give\s+([A-Za-z_][\w]*)\s+([A-Za-z_][\w]*)\s*$/i);
    if (m) return create('give', { name: m[1], item: m[2] });

    m = code.match(/^(damage|hurt)\s+([A-Za-z_][\w]*)\s+by\s+(\d+(?:\.\d+)?)\s*$/i);
    if (m) return create('damage', { verb: m[1].toLowerCase(), name: m[2], value: m[3] });

    if (/^break\s*$/i.test(code)) return create('break', {});
    if (/^continue\s*$/i.test(code)) return create('continue', {});

    if (/^(define|for\s+each|while|repeat|every\s+frame|when)\b/i.test(code)) {
      return create('craw', { raw: code });
    }

    return create('raw', { raw: code });
  }

  function stringField(rest) {
    var m = rest.match(/^"([^"]*)"\s*$/);
    if (m) return { text: m[1], quoted: true };
    return { text: rest, quoted: false };
  }

  function parse(source) {
    var root = {
      id: 'root',
      kind: 'root',
      fields: {},
      children: [],
      raw: null,
      cBlock: true
    };
    var stack = [root];
    var lines = String(source || '').replace(/\r\n/g, '\n').split('\n');

    function adopt(node) {
      node.line = i;
      stack[stack.length - 1].children.push(node);
      if (node.cBlock) stack.push(node);
    }

    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (!trimmed) continue;
      var code = stripComment(trimmed);
      if (!code) {
        if (/^#/.test(trimmed)) adopt(create('comment', { text: trimmed.replace(/^#\s?/, '') }));
        else adopt(create('raw', { raw: trimmed }));
        continue;
      }
      if (/^end\b/i.test(code)) {
        if (stack.length > 1) stack.pop();
        continue;
      }
      if (/^else\s*$/i.test(code) && stack.length > 1 && stack[stack.length - 1].kind === 'if') {
        stack.pop();
      }
      adopt(classify(code));
    }
    root.children = foldQuizzes(root.children);
    return root;
  }

  function foldQuizzes(nodes) {
    var out = [];
    var i;
    for (i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.children && node.children.length) node.children = foldQuizzes(node.children);
      if (node.kind !== 'ask') {
        out.push(node);
        continue;
      }
      var choices = [];
      while (i + 1 < nodes.length && nodes[i + 1].kind === 'choice') {
        i++;
        var picked = nodes[i].fields || {};
        choices.push({ text: picked.text || '', result: picked.result === 'wrong' ? 'wrong' : 'correct' });
      }
      if (!choices.length) {
        out.push(node);
        continue;
      }
      var quiz = create('quiz', { text: (node.fields && node.fields.text) || '', choices: choices });
      quiz.line = node.line;
      out.push(quiz);
    }
    return out;
  }

  function quote(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '') + '"';
  }

  function ident(value, fallback) {
    var t = String(value == null ? '' : value).replace(/[^A-Za-z0-9_]/g, '');
    if (!t || !/^[A-Za-z_]/.test(t)) return fallback || 'Rafi';
    return t;
  }

  function header(node) {
    var f = node.fields || {};
    switch (node.kind) {
      case 'scene':
        return 'scene ' + quote(f.name) + (f.withWalls ? ' with walls' : '');
      case 'appears':
        return ident(f.name, 'Rafi') + ' appears';
      case 'says':
        return ident(f.name, 'Rafi') + ' says ' + (f.quoted === false ? String(f.text || '') : quote(f.text));
      case 'narrator':
        return 'narrator says ' + (f.quoted === false ? String(f.text || '') : quote(f.text));
      case 'action':
        return ident(f.name, 'Rafi') + ' ' + (f.action || 'waves');
      case 'wait':
        var n = String(f.seconds || '1');
        return 'wait ' + n + (n === '1' ? ' second' : ' seconds');
      case 'set':
        return 'set ' + ident(f.name, 'name') + ' to ' + (f.quoted ? quote(f.value) : String(f.value == null ? '' : f.value));
      case 'repeat':
        return 'repeat ' + String(f.times || '3') + ' times';
      case 'repeatWhile':
        return 'repeat while ' + String(f.condition || 'true');
      case 'if':
        return 'if ' + String(f.condition || 'true');
      case 'else':
        return 'else';
      case 'everyFrame':
        return 'every frame';
      case 'when':
        return 'when ' + String(f.clause || 'space is pressed');
      case 'game':
        return 'game ' + quote(f.title || 'My Game');
      case 'gameView':
        return 'game view ' + (f.view === 'side' ? 'side' : 'top');
      case 'player':
        return ident(f.name, 'Rafi') + ' is player';
      case 'spawnCoin':
        return 'spawn coin at x ' + String(f.x || '200') + ' y ' + String(f.y || '150');
      case 'wall':
        return 'add wall at x ' + String(f.x || '200') + ' y ' + String(f.y || '250') +
          ' width ' + String(f.width || '80') + ' height ' + String(f.height || '40');
      case 'ask':
        return 'ask ' + quote(f.text);
      case 'choice':
        return 'choice ' + quote(f.text) + ' ' + (f.result === 'wrong' ? 'wrong' : 'correct');
      case 'quiz':
        return 'ask ' + quote(f.text);
      case 'move':
        return 'move ' + ident(f.name, 'Rafi') + ' ' + (f.dir || 'right') + ' by ' + String(f.by || '4');
      case 'comment':
        return '# ' + String(f.text == null ? '' : f.text);
      case 'playSound':
        return 'play sound ' + quote(f.sound || 'success');
      case 'choose':
        var opts = f.options && f.options.length ? f.options : ['Go left', 'Go right'];
        var optParts = [];
        for (var oi = 0; oi < opts.length; oi++) optParts.push(quote(opts[oi]));
        return 'choose ' + optParts.join(' or ');
      case 'const':
        return 'const ' + ident(f.name, 'maxScore') + ' to ' + (f.quoted ? quote(f.value) : String(f.value == null ? '' : f.value));
      case 'speed':
        return 'set ' + ident(f.name, 'Rafi') + ' speed to ' + String(f.value || '4');
      case 'askUser':
        return 'ask user ' + quote(f.text) + (f.storeAs ? ' as ' + ident(f.storeAs, 'name') : '');
      case 'scoreSet':
        return 'score ' + (f.verb === 'start' ? 'start' : 'starts') + ' at ' + String(f.value || '0');
      case 'scoreAdd':
        return 'add ' + String(f.value || '10') + ' points';
      case 'showScore':
        return 'show score';
      case 'showMessage':
        return 'show message ' + quote(f.text);
      case 'showWord':
        return 'show word ' + quote(f.word) + ' means ' + quote(f.meaning);
      case 'showType':
        return 'show type of ' + ident(f.name, 'name');
      case 'showValue':
        return 'show value of ' + ident(f.name, 'name');
      case 'addToList':
        return 'add ' + (f.quoted ? quote(f.value) : String(f.value == null ? '' : f.value)) + ' to ' + ident(f.list, 'items');
      case 'removeItem':
        return 'remove item ' + String(f.index || '1') + ' from ' + ident(f.list, 'items');
      case 'removeEntity':
        return 'remove ' + (f.target === 'enemy' ? 'enemy' : 'coin');
      case 'lives':
        return 'lives ' + (f.verb === 'starts' ? 'starts' : 'start') + ' at ' + String(f.value || '3');
      case 'timer':
        return 'timer ' + (f.verb === 'start' ? 'start' : 'starts') + ' at ' + String(f.value || '60');
      case 'goal':
        return 'goal is collect ' + String(f.value || '5') + ' coins';
      case 'loseLife':
        return 'lose ' + String(f.value || '1') + ' ' + (f.noun === 'lives' ? 'lives' : 'life');
      case 'loadMap':
        return 'load map ' + quote(f.name || 'school_maze');
      case 'camera':
        return 'camera ' + (f.verb === 'follow' ? 'follow' : 'follows') + ' ' + ident(f.name, 'Rafi');
      case 'jump':
        return ident(f.name, 'Rafi') + ' jump' + (f.power ? ' with power ' + f.power : '');
      case 'spawnEnemy':
        return 'spawn ' + ident(f.name, 'Lion') + ' as enemy at x ' + String(f.x || '400') + ' y ' + String(f.y || 'ground');
      case 'patrol':
        return ident(f.name, 'Lion') + ' patrols between x ' + String(f.min || '200') + ' and x ' + String(f.max || '500');
      case 'forEach':
        return 'for each ' + ident(f.item, 'item') + ' in ' + ident(f.list, 'items');
      case 'whileKey':
        return 'while ' + (f.key || 'right') + ' key is held';
      case 'define':
        return 'define ' + ident(f.name, 'greet') + (f.params ? ' with ' + f.params : '');
      case 'call':
        return 'call ' + ident(f.name, 'greet') + (f.withArgs ? ' with ' + String(f.args == null ? '' : f.args) : '');
      case 'return':
        return f.expr ? 'return ' + f.expr : 'return';
      case 'isEnemy':
        return ident(f.name, 'Lion') + ' is enemy';
      case 'chase':
        return ident(f.name, 'Lion') + ' chases ' + ident(f.target, 'Rafi');
      case 'gameFlow':
        return (f.action || 'pause') + ' game';
      case 'levelSet':
        return 'level ' + (f.verb === 'start' ? 'start' : 'starts') + ' at ' + String(f.value || '1');
      case 'nextLevel':
        return 'next level';
      case 'health':
        return 'health ' + (f.verb === 'start' ? 'start' : 'starts') + ' at ' + String(f.value || '100');
      case 'hazard':
        return 'spawn hazard ' + ident(f.name, 'lava') + ' at x ' + String(f.x || '200') + ' y ' + String(f.y || '200') +
          ' width ' + String(f.width || '60') + ' height ' + String(f.height || '40');
      case 'shoot':
        return 'shoot bullet from ' + ident(f.name, 'Rafi') + ' toward ' + (f.dir || 'right') +
          (f.speed ? ' speed ' + f.speed : '');
      case 'give':
        return 'give ' + ident(f.name, 'Rafi') + ' ' + ident(f.item, 'key');
      case 'damage':
        return (f.verb === 'hurt' ? 'hurt' : 'damage') + ' ' + ident(f.name, 'Rafi') + ' by ' + String(f.value || '10');
      case 'break':
        return 'break';
      case 'continue':
        return 'continue';
      case 'raw':
      case 'craw':
        return node.raw != null ? node.raw : String(f.raw || '');
      default:
        return node.raw || '';
    }
  }

  function serialize(tree) {
    var lines = [];
    writeChildren(tree && tree.children ? tree.children : [], 0, lines);
    return lines.join('\n');
  }

  function writeChildren(children, indent, lines) {
    for (var i = 0; i < children.length; i++) {
      writeNode(children[i], indent, children[i + 1], lines);
    }
  }

  function writeNode(node, indent, next, lines) {
    var pad = '';
    for (var i = 0; i < indent; i++) pad += INDENT;
    lines.push(pad + header(node));
    if (node.kind === 'quiz') {
      var answers = (node.fields && node.fields.choices) || [];
      var q;
      for (q = 0; q < answers.length; q++) {
        lines.push(pad + 'choice ' + quote(answers[q].text) + ' ' + (answers[q].result === 'wrong' ? 'wrong' : 'correct'));
      }
    }
    if (!node.cBlock) return;
    writeChildren(node.children || [], indent + 1, lines);
    var sharesEnd = node.kind === 'if' && next && next.kind === 'else';
    if (!sharesEnd) lines.push(pad + 'end');
  }

  function find(tree, id) {
    if (!tree || !id) return null;
    if (tree.id === id) return tree;
    var kids = tree.children || [];
    for (var i = 0; i < kids.length; i++) {
      var hit = find(kids[i], id);
      if (hit) return hit;
    }
    return null;
  }

  function locate(tree, id) {
    if (!tree) return null;
    var kids = tree.children || [];
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].id === id) return { parent: tree, index: i, node: kids[i] };
      var inner = locate(kids[i], id);
      if (inner) return inner;
    }
    return null;
  }

  function insert(tree, parentId, nodes) {
    var parent = tree;
    if (parentId) {
      var found = find(tree, parentId);
      if (found && found.cBlock) parent = found;
    }
    var list = parent.children;
    var arr = Array.isArray(nodes) ? nodes : [nodes];
    for (var i = 0; i < arr.length; i++) list.push(arr[i]);
    return arr;
  }

  function insertAfter(tree, id, nodes) {
    var loc = locate(tree, id);
    if (!loc) return insert(tree, null, nodes);
    var arr = Array.isArray(nodes) ? nodes : [nodes];
    var list = loc.parent.children;
    for (var i = 0; i < arr.length; i++) list.splice(loc.index + 1 + i, 0, arr[i]);
    return arr;
  }

  function remove(tree, id) {
    var loc = locate(tree, id);
    if (!loc) return null;
    return loc.parent.children.splice(loc.index, 1)[0];
  }

  function move(tree, id, delta) {
    var loc = locate(tree, id);
    if (!loc) return false;
    var next = loc.index + delta;
    var list = loc.parent.children;
    if (next < 0 || next >= list.length) return false;
    var item = list.splice(loc.index, 1)[0];
    list.splice(next, 0, item);
    return true;
  }

  function updateField(tree, id, key, value) {
    var node = find(tree, id);
    if (!node) return false;
    node.fields[key] = value;
    if (key === 'raw') node.raw = value;
    return true;
  }

  function hasLogicJoin(text) {
    var masked = text;
    for (var i = 0; i < COMPARE_OPS.length; i++) {
      masked = masked.replace(new RegExp(COMPARE_OPS[i], 'ig'), ' ');
    }
    return /\b(and|or)\b/i.test(masked);
  }

  function describeCondition(text) {
    var t = String(text == null ? '' : text).trim();
    var m = t.match(/^answer is (correct|wrong)$/i);
    if (m) return { kind: 'answer', result: m[1].toLowerCase() };
    m = t.match(/^choice equals "(.*)"$/i);
    if (m) return { kind: 'choice', text: m[1] };
    m = t.match(/^(left|right|up|down|space) key is held$/i);
    if (m) return { kind: 'keyHeld', key: m[1].toLowerCase() };
    m = t.match(/^([A-Za-z_][\w]*) touches ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'touches', name: m[1], target: m[2] };
    m = t.match(/^([A-Za-z_][\w]*) has ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'has', name: m[1], item: m[2] };
    m = t.match(/^([A-Za-z_][\w]*) is empty$/i);
    if (m) return { kind: 'empty', name: m[1] };
    m = t.match(/^"(.*)" is in ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'in', text: m[1], list: m[2], quoted: true };
    m = t.match(/^([A-Za-z_][\w]*) is in ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'in', text: m[1], list: m[2], quoted: false };
    if (!hasLogicJoin(t)) {
      var lower = t.toLowerCase();
      for (var i = 0; i < COMPARE_OPS.length; i++) {
        var op = COMPARE_OPS[i];
        var token = ' ' + op + ' ';
        var idx = lower.indexOf(token);
        if (idx > 0) {
          return {
            kind: 'compare',
            left: t.slice(0, idx),
            op: t.slice(idx + 1, idx + 1 + op.length),
            right: t.slice(idx + token.length)
          };
        }
      }
    }
    return { kind: 'custom', text: t };
  }

  function buildCondition(parts) {
    var p = parts || {};
    switch (p.kind) {
      case 'answer':
        return 'answer is ' + (p.result === 'wrong' ? 'wrong' : 'correct');
      case 'choice':
        return 'choice equals ' + quote(p.text);
      case 'keyHeld':
        return (p.key || 'right') + ' key is held';
      case 'touches':
        return ident(p.name, 'Rafi') + ' touches ' + (p.target || 'coin');
      case 'has':
        return ident(p.name, 'Rafi') + ' has ' + ident(p.item, 'key');
      case 'empty':
        return ident(p.name, 'items') + ' is empty';
      case 'in':
        var left = String(p.text == null ? '' : p.text).replace(/"/g, '');
        var leftCode = p.quoted || /\s/.test(left) ? quote(left) : left;
        return leftCode + ' is in ' + ident(p.list, 'items');
      case 'compare':
        return String(p.left == null ? '' : p.left) + ' ' + (p.op || 'is greater than') + ' ' + String(p.right == null ? '' : p.right);
      default:
        return String(p.text == null ? '' : p.text);
    }
  }

  function atomOf(text) {
    var s = String(text == null ? '' : text);
    if (s === 'true' || s === 'false') return { kind: 'bool', text: s };
    if (/^-?\d+(?:\.\d+)?$/.test(s)) return { kind: 'number', text: s };
    if (/^[A-Za-z_][\w]*$/.test(s)) return { kind: 'name', text: s };
    var quoted = s.match(/^"([^"]*)"$/);
    if (quoted) return { kind: 'words', text: quoted[1] };
    return null;
  }

  function splitAnd(rest) {
    var items = [];
    var cur = '';
    var inQ = false;
    var i;
    for (i = 0; i < rest.length; i++) {
      var ch = rest.charAt(i);
      if (ch === '"') {
        inQ = !inQ;
        cur += ch;
        continue;
      }
      if (!inQ && rest.substr(i, 5) === ' and ') {
        items.push(cur.trim());
        cur = '';
        i += 4;
        continue;
      }
      cur += ch;
    }
    if (cur.trim()) items.push(cur.trim());
    return items;
  }

  function atomsOfPieces(pieces) {
    var out = [];
    var i;
    for (i = 0; i < pieces.length; i++) {
      var atom = atomOf(pieces[i]);
      if (!atom) return null;
      out.push({ text: atom.text, quoted: atom.kind === 'words' });
    }
    return out;
  }

  function insideQuotes(text, index) {
    var q = false;
    var k;
    for (k = 0; k < index; k++) if (text.charAt(k) === '"') q = !q;
    return q;
  }

  function mathSplit(text) {
    var lower = text.toLowerCase();
    var hits = [];
    var i, from, idx, h;
    for (i = 0; i < MATH_OPS.length; i++) {
      var op = MATH_OPS[i];
      var token = ' ' + op + ' ';
      from = 0;
      while ((idx = lower.indexOf(token, from)) >= 0) {
        if (!insideQuotes(text, idx)) {
          var covered = false;
          for (h = 0; h < hits.length; h++) {
            if (idx >= hits[h].idx && idx < hits[h].idx + hits[h].span) covered = true;
          }
          if (!covered) {
            hits.push({
              idx: idx,
              op: text.slice(idx + 1, idx + 1 + op.length),
              span: token.length
            });
          }
        }
        from = idx + token.length;
      }
    }
    if (hits.length !== 1) return null;
    return {
      left: text.slice(0, hits[0].idx),
      op: hits[0].op,
      right: text.slice(hits[0].idx + hits[0].span)
    };
  }

  function describeValue(text, quoted) {
    if (quoted) return { kind: 'words', text: String(text == null ? '' : text) };
    var t = String(text == null ? '' : text).trim();
    if (!t) return { kind: 'value', text: '' };
    var atom = atomOf(t);
    if (atom) return atom.kind === 'words' ? { kind: 'words', text: atom.text } : atom;
    var m = t.match(/^random number from (.+) to (.+)$/);
    if (m && atomOf(m[1]) && atomOf(m[2])) return { kind: 'random', low: m[1], high: m[2] };
    m = t.match(/^length of ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'length', name: m[1] };
    m = t.match(/^item (\d+) in ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'item', index: m[1], name: m[2] };
    m = t.match(/^ask user "(.*)"$/);
    if (m) return { kind: 'ask', text: m[1] };
    m = t.match(/^call ([A-Za-z_][\w]*)$/);
    if (m) return { kind: 'call', name: m[1], args: [] };
    m = t.match(/^call ([A-Za-z_][\w]*) with (.+)$/);
    if (m) {
      var args = atomsOfPieces(splitAnd(m[2]));
      if (args) return { kind: 'call', name: m[1], args: args };
    }
    m = t.match(/^list (.+)$/);
    if (m) {
      var items = atomsOfPieces(splitAnd(m[1]));
      if (items && items.length) return { kind: 'list', items: items };
    }
    m = t.match(/^not (.+)$/);
    if (m && atomOf(m[1])) return { kind: 'not', text: m[1] };
    var math = mathSplit(t);
    if (math && atomOf(math.left) && atomOf(math.right)) {
      return { kind: 'math', left: math.left, op: math.op, right: math.right };
    }
    return { kind: 'value', text: t };
  }

  function pieceCode(piece) {
    if (piece && piece.quoted) return quote(piece.text);
    return String(piece && piece.text != null ? piece.text : '');
  }

  function buildValue(parts) {
    var p = parts || {};
    switch (p.kind) {
      case 'words':
        return { text: String(p.text == null ? '' : p.text).replace(/"/g, ''), quoted: true };
      case 'number':
        return { text: String(p.text == null ? '0' : p.text), quoted: false };
      case 'name':
        return { text: ident(p.text, 'name'), quoted: false };
      case 'bool':
        return { text: p.text === 'false' ? 'false' : 'true', quoted: false };
      case 'math':
        return {
          text: String(p.left == null ? '0' : p.left) + ' ' + (p.op || 'plus') + ' ' + String(p.right == null ? '0' : p.right),
          quoted: false
        };
      case 'random':
        return { text: 'random number from ' + (p.low || '1') + ' to ' + (p.high || '6'), quoted: false };
      case 'list':
        var items = p.items && p.items.length ? p.items : [{ text: 'apple', quoted: true }, { text: 'banana', quoted: true }];
        var bits = [];
        var i;
        for (i = 0; i < items.length; i++) bits.push(pieceCode(items[i]));
        return { text: 'list ' + bits.join(' and '), quoted: false };
      case 'length':
        return { text: 'length of ' + ident(p.name, 'name'), quoted: false };
      case 'item':
        var idx = String(p.index == null ? '1' : p.index).replace(/[^\d]/g, '') || '1';
        return { text: 'item ' + idx + ' in ' + ident(p.name, 'items'), quoted: false };
      case 'ask':
        return { text: 'ask user ' + quote(p.text), quoted: false };
      case 'call':
        var callArgs = p.args || [];
        var callName = ident(p.name, 'greet');
        if (!callArgs.length) return { text: 'call ' + callName, quoted: false };
        var argBits = [];
        for (i = 0; i < callArgs.length; i++) argBits.push(pieceCode(callArgs[i]));
        return { text: 'call ' + callName + ' with ' + argBits.join(' and '), quoted: false };
      case 'not':
        return { text: 'not ' + String(p.text == null ? 'true' : p.text), quoted: false };
      default:
        return { text: String(p.text == null ? '' : p.text), quoted: false };
    }
  }

  function makeTemplate(id) {
    switch (id) {
      case 'scene':
        return [create('scene', { name: 'school', withWalls: false })];
      case 'appears':
        return [create('appears', { name: 'Rafi' })];
      case 'says':
        return [create('says', { name: 'Rafi', text: 'Hello!', quoted: true })];
      case 'narrator':
        return [create('narrator', { text: 'Once upon a time...', quoted: true })];
      case 'action':
      case 'wave':
        return [create('action', { name: 'Rafi', action: 'waves' })];
      case 'wait':
        return [create('wait', { seconds: '1' })];
      case 'repeat':
        return [create('repeat', { times: '3' })];
      case 'if':
        return [create('if', { condition: 'score is greater than 10' }, [
          create('narrator', { text: 'High!', quoted: true })
        ])];
      case 'quiz':
        return [create('quiz', {
          text: '2 + 2?',
          choices: [
            { text: '4', result: 'correct' },
            { text: '5', result: 'wrong' }
          ]
        })];
      case 'set':
        return [create('set', { name: 'name', value: 'Rafi', quoted: true })];
      case 'game':
        return [
          create('game', { title: 'My Game' }),
          create('gameView', { view: 'top' })
        ];
      case 'player':
        return [create('player', { name: 'Rafi' })];
      case 'everyFrame':
        return [create('everyFrame', {})];
      case 'spawn':
        return [create('spawnCoin', { x: '200', y: '150' })];
      case 'wall':
        return [create('wall', { x: '200', y: '250', width: '80', height: '40' })];
      case 'move':
        return [create('move', { name: 'Rafi', dir: 'right', by: '4' })];
      case 'whenKey':
        return [create('when', { clause: 'space is pressed' })];
      case 'touches':
        return [create('if', { condition: 'Rafi touches coin' }, [
          create('scoreAdd', { value: '10' }),
          create('removeEntity', { target: 'coin' })
        ])];
      case 'word':
        return [create('showWord', { word: 'brave', meaning: 'সাহসী' })];
      case 'choose':
        return [create('choose', { options: ['Go left', 'Go right'] })];
      case 'sound':
        return [create('playSound', { sound: 'success' })];
      case 'repeatWhile':
        return [create('repeatWhile', { condition: 'n is less than 4' })];
      case 'else':
        return [create('else', {})];
      case 'forEach':
        return [create('forEach', { item: 'fruit', list: 'fruits' }, [
          create('narrator', { text: 'fruit', quoted: false })
        ])];
      case 'break':
        return [create('break', {})];
      case 'continue':
        return [create('continue', {})];
      case 'const':
        return [create('const', { name: 'maxScore', value: '100', quoted: false })];
      case 'askUser':
        return [create('askUser', { text: 'What is your name?', storeAs: 'playerName' })];
      case 'define':
        return [create('define', { name: 'greet', params: 'name' }, [
          create('narrator', { text: 'Hello!', quoted: true })
        ])];
      case 'call':
        return [create('call', { name: 'greet', withArgs: true, args: '"Rafi"' })];
      case 'return':
        return [create('return', { expr: '0' })];
      case 'addToList':
        return [create('addToList', { value: 'mango', quoted: true, list: 'fruits' })];
      case 'removeItem':
        return [create('removeItem', { index: '1', list: 'fruits' })];
      case 'showValue':
        return [create('showValue', { name: 'name' })];
      case 'showType':
        return [create('showType', { name: 'name' })];
      case 'score':
        return [create('scoreSet', { verb: 'starts', value: '0' })];
      case 'points':
        return [create('scoreAdd', { value: '10' })];
      case 'showScore':
        return [create('showScore', {})];
      case 'whileKey':
        return [create('whileKey', { key: 'right' }, [
          create('move', { name: 'Rafi', dir: 'right', by: '4' })
        ])];
      case 'jump':
        return [create('jump', { name: 'Rafi', power: '12' })];
      case 'lives':
        return [create('lives', { verb: 'start', value: '3' })];
      case 'timer':
        return [create('timer', { verb: 'starts', value: '60' })];
      case 'goal':
        return [create('goal', { value: '5' })];
      case 'loseLife':
        return [create('loseLife', { value: '1', noun: 'life' })];
      case 'message':
        return [create('showMessage', { text: 'You win!' })];
      case 'removeCoin':
        return [create('removeEntity', { target: 'coin' })];
      case 'enemy':
        return [create('spawnEnemy', { name: 'Lion', x: '400', y: 'ground' })];
      case 'isEnemy':
        return [create('isEnemy', { name: 'Lion' })];
      case 'patrol':
        return [create('patrol', { name: 'Lion', min: '200', max: '500' })];
      case 'map':
        return [create('loadMap', { name: 'school_maze' })];
      case 'speed':
        return [create('speed', { name: 'Rafi', value: '5' })];
      case 'camera':
        return [create('camera', { verb: 'follows', name: 'Rafi' })];
      case 'pause':
        return [create('gameFlow', { action: 'pause' })];
      case 'level':
        return [create('levelSet', { verb: 'starts', value: '1' })];
      case 'nextLevel':
        return [create('nextLevel', {})];
      case 'health':
        return [create('health', { verb: 'starts', value: '100' })];
      case 'chase':
        return [create('chase', { name: 'Lion', target: 'Rafi' })];
      case 'hazard':
        return [create('hazard', { name: 'lava', x: '200', y: '200', width: '60', height: '40' })];
      case 'shoot':
        return [create('shoot', { name: 'Rafi', dir: 'right', speed: '8' })];
      case 'give':
        return [create('give', { name: 'Rafi', item: 'key' })];
      case 'damage':
        return [create('damage', { verb: 'damage', name: 'Rafi', value: '10' })];
      default:
        return [];
    }
  }

  var STORY_KINDS = {
    appears: 1, says: 1, narrator: 1, action: 1, showWord: 1,
    choose: 1, ask: 1, choice: 1, quiz: 1, wait: 1
  };

  function programMode(tree) {
    if (!tree || !tree.children || !tree.children.length) return 'empty';
    var hasGame = false;
    var hasStory = false;
    function walk(node) {
      if (!node) return;
      if (node.kind === 'game') hasGame = true;
      if (STORY_KINDS[node.kind]) hasStory = true;
      var kids = node.children || [];
      var i;
      for (i = 0; i < kids.length; i++) walk(kids[i]);
    }
    walk(tree);
    if (hasGame && hasStory) return 'mixed';
    if (hasGame) return 'game';
    if (hasStory) return 'story';
    return 'open';
  }

  function placementWarning(node, ancestors, mode) {
    if (!node) return '';
    var insideFrame = false;
    var i;
    ancestors = ancestors || [];
    for (i = 0; i < ancestors.length; i++) {
      if (ancestors[i].kind === 'everyFrame' || ancestors[i].kind === 'whileKey') insideFrame = true;
    }
    if ((mode === 'game' || mode === 'mixed') && STORY_KINDS[node.kind]) return 'Story blocks do not run in a game';
    if (node.kind === 'move' && !insideFrame) return 'Put Move inside Every frame';
    if (node.kind === 'if' && node.fields) {
      var described = describeCondition(node.fields.condition || '');
      if (described.kind === 'touches' && insideFrame) return 'Put Touches outside Every frame';
      if (described.kind === 'keyHeld' && !insideFrame && (mode === 'game' || mode === 'mixed')) {
        return 'Put key held inside Every frame';
      }
    }
    if (node.kind === 'repeat' && node.fields) {
      var times = parseInt(node.fields.times, 10);
      if (!isNaN(times) && (times < 1 || times > 100)) return 'Repeat must be from 1 to 100';
    }
    if (node.kind === 'wait' && node.fields && mode !== 'game' && mode !== 'mixed') {
      var seconds = parseFloat(node.fields.seconds);
      if (!isNaN(seconds) && (seconds < 1 || seconds > 8)) return 'Wait must be from 1 to 8 seconds';
    }
    return '';
  }

  function placementFix(message) {
    if (message === 'Put Move inside Every frame') return 'Put this line inside every frame ... end';
    if (message === 'Put Touches outside Every frame') return 'Put this if outside every frame';
    if (message === 'Put key held inside Every frame') return 'Put this if inside every frame ... end';
    if (message === 'Repeat must be from 1 to 100') return 'Use a number from 1 to 100';
    if (message === 'Wait must be from 1 to 8 seconds') return 'Use 1 to 8 seconds';
    if (message === 'Story blocks do not run in a game') return 'Keep story lines in a story file';
    return '';
  }

  function placementWarnings(source) {
    var tree = typeof source === 'string' || source == null ? parse(source || '') : source;
    var mode = programMode(tree);
    var out = [];
    function walk(node, ancestors) {
      if (!node || node.kind === 'root') {
        var top = (node && node.children) || [];
        var k;
        for (k = 0; k < top.length; k++) walk(top[k], ancestors);
        return;
      }
      var message = placementWarning(node, ancestors, mode);
      if (message && node.line != null) out.push({ line: node.line, message: message, fix: placementFix(message) });
      var next = ancestors.concat([node]);
      var kids = node.children || [];
      var i;
      for (i = 0; i < kids.length; i++) walk(kids[i], next);
    }
    walk(tree, []);
    return out;
  }

  function starterById(id) {
    for (var i = 0; i < STARTERS.length; i++) {
      if (STARTERS[i].id === id) return STARTERS[i];
    }
    return null;
  }

  window.KiddyBlocksScript = {
    parse: parse,
    serialize: serialize,
    insert: insert,
    insertAfter: insertAfter,
    remove: remove,
    move: move,
    updateField: updateField,
    find: find,
    locate: locate,
    create: create,
    makeTemplate: makeTemplate,
    describeCondition: describeCondition,
    buildCondition: buildCondition,
    describeValue: describeValue,
    buildValue: buildValue,
    programMode: programMode,
    placementWarning: placementWarning,
    placementWarnings: placementWarnings,
    starterById: starterById,
    PALETTE: PALETTE,
    STARTERS: STARTERS,
    ACTIONS: ACTIONS
  };
})();
