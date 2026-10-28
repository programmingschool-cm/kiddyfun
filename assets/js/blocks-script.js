/**
 * KiddyFun blocks — line tree that round-trips with text code.
 * Structure follows `end` (and `else`), same as the parser. Indent is only for output.
 */
(function () {
  'use strict';

  var INDENT = '    ';
  var seq = 1;

  var ACTIONS = [
    'waves', 'smiles', 'jumps', 'flies', 'runs', 'walks', 'dances', 'claps',
    'hides', 'shows', 'bows', 'nods', 'cheers', 'handshakes', 'flaps',
    'moves left', 'moves right'
  ];

  var C_BLOCK = {
    repeat: true,
    repeatWhile: true,
    if: true,
    else: true,
    everyFrame: true,
    when: true,
    craw: true
  };

  var PALETTE = [
    { cat: 'Story', tone: 'story', items: [
      { id: 'scene', label: 'Scene', icon: '🎬' },
      { id: 'appears', label: 'Appears', icon: '✨' },
      { id: 'says', label: 'Says', icon: '💬' },
      { id: 'narrator', label: 'Narrator', icon: '📖' },
      { id: 'wave', label: 'Wave', icon: '👋' },
      { id: 'wait', label: 'Wait', icon: '⏸️' }
    ]},
    { cat: 'Logic', tone: 'logic', items: [
      { id: 'repeat', label: 'Repeat', icon: '🔁' },
      { id: 'if', label: 'If', icon: '🧠' },
      { id: 'quiz', label: 'Quiz', icon: '❓' },
      { id: 'set', label: 'Set', icon: '📦' }
    ]},
    { cat: 'Game', tone: 'game', items: [
      { id: 'game', label: 'Game', icon: '🎮' },
      { id: 'player', label: 'Player', icon: '👤' },
      { id: 'everyFrame', label: 'Every frame', icon: '🔄' },
      { id: 'spawn', label: 'Spawn coin', icon: '🪙' },
      { id: 'wall', label: 'Wall', icon: '🧱' },
      { id: 'move', label: 'Move', icon: '➡️' },
      { id: 'whenKey', label: 'When key', icon: '⌨️' },
      { id: 'touches', label: 'Touches coin', icon: '✨' }
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

    m = code.match(/^ask\s+"([^"]*)"\s*$/i);
    if (m) return create('ask', { text: m[1] });

    m = code.match(/^choice\s+"([^"]*)"\s+(correct|wrong)\s*$/i);
    if (m) return create('choice', { text: m[1], result: m[2].toLowerCase() });

    m = code.match(/^set\s+([A-Za-z_][\w]*)\s+to\s+(.*)$/i);
    if (m) {
      var packed = stringField(m[2].trim());
      return create('set', { name: m[1], value: packed.text, quoted: packed.quoted });
    }

    m = code.match(/^spawn\s+coin\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s*$/i);
    if (m) return create('spawnCoin', { x: m[1], y: m[2] });

    m = code.match(/^add\s+wall\s+at\s+x\s+(\S+)\s+y\s+(\S+)\s+width\s+(\S+)\s+height\s+(\S+)\s*$/i);
    if (m) return create('wall', { x: m[1], y: m[2], width: m[3], height: m[4] });

    m = code.match(/^move\s+([A-Za-z_][\w]*)\s+(left|right|up|down)\s+by\s+(\S+)\s*$/i);
    if (m) return create('move', { name: m[1], dir: m[2].toLowerCase(), by: m[3] });

    m = code.match(/^([A-Za-z_][\w]*)\s+is\s+player\s*$/i);
    if (m) return create('player', { name: m[1] });

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

    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (!trimmed) continue;
      var code = stripComment(trimmed);
      if (!code) {
        stack[stack.length - 1].children.push(create('raw', { raw: trimmed }));
        continue;
      }
      if (/^end\b/i.test(code)) {
        if (stack.length > 1) stack.pop();
        continue;
      }
      if (/^else\s*$/i.test(code) && stack.length > 1 && stack[stack.length - 1].kind === 'if') {
        stack.pop();
      }
      var node = classify(code);
      stack[stack.length - 1].children.push(node);
      if (node.cBlock) stack.push(node);
    }
    return root;
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
      case 'move':
        return 'move ' + ident(f.name, 'Rafi') + ' ' + (f.dir || 'right') + ' by ' + String(f.by || '4');
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
        return [
          create('ask', { text: '2 + 2?' }),
          create('choice', { text: '4', result: 'correct' }),
          create('choice', { text: '5', result: 'wrong' })
        ];
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
          create('raw', { raw: 'add 10 points' }),
          create('raw', { raw: 'remove coin' })
        ])];
      default:
        return [];
    }
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
    remove: remove,
    move: move,
    updateField: updateField,
    find: find,
    locate: locate,
    create: create,
    makeTemplate: makeTemplate,
    starterById: starterById,
    PALETTE: PALETTE,
    STARTERS: STARTERS,
    ACTIONS: ACTIONS
  };
})();
