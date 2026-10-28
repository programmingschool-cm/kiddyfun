/**
 * Visual blocks workspace — palette plus a script stack that edits the text program.
 */
(function () {
  'use strict';

  var KEY_VIEW = 'kf_editor_view';
  var NAMES = [
    'Rafi', 'Mina', 'Teacher', 'Lion', 'Bird', 'Monkey', 'Robot', 'Cat', 'Dog',
    'Seller', 'Buyer', 'Mostak', 'Sagor', 'Rabiul'
  ];
  var KEYS = ['space', 'left arrow', 'right arrow', 'up arrow', 'down arrow'];
  var DIRS = ['left', 'right', 'up', 'down'];

  var tree = null;
  var selectedId = null;
  var pulseId = null;
  var writing = false;
  var hooked = false;
  var showAllBlocks = false;
  var STORY_CHIPS = { appears: 1, says: 1, narrator: 1, action: 1, wait: 1, word: 1, choose: 1, quiz: 1 };
  var GAME_CHIPS = {
    player: 1, everyFrame: 1, spawn: 1, wall: 1, move: 1, whenKey: 1, whileKey: 1, jump: 1,
    touches: 1, lives: 1, timer: 1, goal: 1, loseLife: 1, message: 1, removeCoin: 1,
    enemy: 1, isEnemy: 1, patrol: 1, map: 1, speed: 1, camera: 1, pause: 1, level: 1,
    nextLevel: 1, health: 1, chase: 1, hazard: 1, shoot: 1, give: 1, damage: 1
  };

  function scriptApi() {
    return window.KiddyBlocksScript;
  }

  function getView() {
    try { return localStorage.getItem(KEY_VIEW) || 'text'; } catch (e) { return 'text'; }
  }

  function setView(v) {
    try { localStorage.setItem(KEY_VIEW, v); } catch (e) { /* ignore */ }
    applyView(v);
  }

  function editorEl() {
    return document.getElementById('ss-editor');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var GAME_KINDS = {
    game: 1, gameView: 1, player: 1, everyFrame: 1, when: 1, spawnCoin: 1, wall: 1, move: 1,
    jump: 1, whileKey: 1, lives: 1, timer: 1, goal: 1, loseLife: 1, showMessage: 1,
    removeEntity: 1, spawnEnemy: 1, patrol: 1, loadMap: 1, speed: 1, camera: 1,
    isEnemy: 1, chase: 1, gameFlow: 1, levelSet: 1, nextLevel: 1, health: 1, hazard: 1, shoot: 1, give: 1, damage: 1
  };
  var LOGIC_KINDS = {
    repeat: 1, repeatWhile: 1, if: 1, else: 1, set: 1, ask: 1, choice: 1, quiz: 1, const: 1,
    askUser: 1, define: 1, call: 1, return: 1, forEach: 1, break: 1, continue: 1,
    addToList: 1, removeItem: 1, showValue: 1, showType: 1, scoreSet: 1, scoreAdd: 1, showScore: 1
  };

  function toneOf(kind) {
    if (kind === 'raw' || kind === 'craw') return 'raw';
    if (GAME_KINDS[kind]) return 'game';
    if (LOGIC_KINDS[kind]) return 'logic';
    return 'story';
  }

  function labelOf(kind) {
    var labels = {
      scene: 'Scene',
      appears: 'Appears',
      says: 'Says',
      narrator: 'Narrator',
      action: 'Action',
      wait: 'Wait',
      set: 'Set',
      const: 'Const',
      repeat: 'Repeat',
      repeatWhile: 'Repeat while',
      if: 'If',
      else: 'Else',
      everyFrame: 'Every frame',
      when: 'When',
      game: 'Game',
      gameView: 'View',
      player: 'Player',
      spawnCoin: 'Coin',
      wall: 'Wall',
      ask: 'Ask',
      quiz: 'Quiz',
      askUser: 'Ask',
      choice: 'Choice',
      move: 'Move',
      comment: 'Note',
      playSound: 'Sound',
      choose: 'Choose',
      speed: 'Speed',
      scoreSet: 'Score',
      scoreAdd: 'Points',
      showScore: 'Score',
      showMessage: 'Message',
      showWord: 'Word',
      showType: 'Type',
      showValue: 'Value',
      addToList: 'Add',
      removeItem: 'Remove',
      removeEntity: 'Remove',
      lives: 'Lives',
      timer: 'Timer',
      goal: 'Goal',
      loseLife: 'Life',
      loadMap: 'Map',
      camera: 'Camera',
      isEnemy: 'Enemy',
      chase: 'Chase',
      gameFlow: 'Game',
      levelSet: 'Level',
      nextLevel: 'Next',
      health: 'Health',
      hazard: 'Hazard',
      shoot: 'Shoot',
      give: 'Give',
      jump: 'Jump',
      spawnEnemy: 'Enemy',
      patrol: 'Patrol',
      forEach: 'For each',
      whileKey: 'While',
      define: 'Define',
      call: 'Call',
      return: 'Return',
      break: 'Break',
      continue: 'Continue',
      damage: 'Damage',
      raw: 'Code',
      craw: 'Block'
    };
    return labels[kind] || 'Block';
  }

  function applyView(v) {
    var wrap = document.getElementById('kf-blocks-wrap');
    var stack = document.getElementById('kf-editor-stack');
    var editorWrap = document.querySelector('.kf-editor-wrap');
    var btnT = document.getElementById('btn-view-text');
    var btnB = document.getElementById('btn-view-blocks');
    if (wrap) wrap.classList.toggle('d-none', v !== 'blocks');
    if (stack) stack.classList.toggle('d-none', v === 'blocks');
    if (editorWrap) editorWrap.classList.toggle('kf-view-blocks', v === 'blocks');
    if (btnT) btnT.classList.toggle('active', v === 'text');
    if (btnB) btnB.classList.toggle('active', v === 'blocks');
    if (v === 'blocks') reloadFromEditor();
  }

  function catalog() {
    return window.KiddyCatalog || null;
  }

  function characterNames() {
    var c = catalog();
    return c && c.characters ? c.characters : NAMES;
  }

  function nameListHtml() {
    var names = characterNames();
    var html = '';
    for (var i = 0; i < names.length; i++) html += '<option value="' + esc(names[i]) + '"></option>';
    return '<datalist id="kf-block-names">' + html + '</datalist>' +
      '<datalist id="kf-block-vars"></datalist>' +
      '<datalist id="kf-choice-opts"></datalist>';
  }

  function ensureWorkspace() {
    var wrap = document.getElementById('kf-blocks-wrap');
    if (!wrap) return;
    if (!wrap.querySelector('#kf-blocks-canvas')) {
      wrap.innerHTML =
        '<div class="kf-blocks-workspace">' +
          '<div class="kf-blocks-palette" id="kf-blocks-palette"></div>' +
          '<div class="kf-blocks-script">' +
            '<div class="kf-blocks-script-head">' +
              '<span id="kf-blocks-title">My story</span>' +
              '<span class="kf-blocks-target" id="kf-blocks-target">New blocks go at the end</span>' +
            '</div>' +
            '<div class="kf-blocks-canvas" id="kf-blocks-canvas" aria-label="Your story blocks"></div>' +
          '</div>' +
        '</div>';
    }
    if (!document.getElementById('kf-block-names')) {
      wrap.insertAdjacentHTML('beforeend', nameListHtml());
    }
  }

  function buildPalette() {
    ensureWorkspace();
    var api = scriptApi();
    var palette = document.getElementById('kf-blocks-palette');
    if (!palette || !api) return;
    var html = '<div class="kf-blocks-modebar" id="kf-blocks-modebar" hidden>' +
      '<p class="kf-blocks-mode-note" id="kf-blocks-mode-note"></p>' +
      '<button type="button" class="kf-blocks-mode-btn" id="kf-blocks-show-all" hidden>Show all</button></div>';
    api.PALETTE.forEach(function (cat) {
      html += '<div class="kf-blocks-cat"><div class="kf-blocks-cat-title">' + esc(cat.cat) + '</div><div class="kf-blocks-row">';
      cat.items.forEach(function (item) {
        var scope = STORY_CHIPS[item.id] ? 'story' : (GAME_CHIPS[item.id] ? 'game' : '');
        html += '<button type="button" class="kf-block-chip kf-chip-' + cat.tone + '" data-template="' + esc(item.id) + '"' +
          (scope ? ' data-scope="' + scope + '"' : '') + '>' +
          item.icon + ' ' + esc(item.label) + '</button>';
      });
      html += '</div></div>';
    });
    html += '<p class="kf-blocks-help">Tap a block. Math, random, and list values have their own slots. A game file tucks story blocks away.</p>';
    palette.innerHTML = html;
  }

  function optionList(values, current) {
    var html = '';
    var found = false;
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      var sel = v === current ? ' selected' : '';
      if (v === current) found = true;
      html += '<option value="' + esc(v) + '"' + sel + '>' + esc(v) + '</option>';
    }
    if (!found && current) {
      html = '<option value="' + esc(current) + '" selected>' + esc(current) + '</option>' + html;
    }
    return html;
  }

  function nameInput(field, value, label) {
    return '<input data-field="' + field + '" list="kf-block-names" value="' + esc(value || '') + '" aria-label="' + esc(label || 'Name') + '" autocomplete="off">';
  }

  function textInput(field, value, label, grow) {
    var cls = '';
    if (grow === 'line') cls = ' class="kf-bcard-grow kf-bcard-line"';
    else if (grow) cls = ' class="kf-bcard-grow"';
    return '<input data-field="' + field + '" value="' + esc(value || '') + '" aria-label="' + esc(label) + '"' +
      cls + ' autocomplete="off">';
  }

  function removeBtn(act, index, label) {
    return '<button type="button" class="kf-bcard-del" data-act="' + act + '" data-index="' + index + '" aria-label="' + esc(label) + '">×</button>';
  }

  function numInput(field, value, label) {
    return '<input data-field="' + field + '" type="number" min="0" step="1" value="' + esc(value || '') + '" aria-label="' + esc(label) + '" class="kf-bcard-num">';
  }

  function whenClauses() {
    var c = catalog();
    if (c && c.whenClauses) return c.whenClauses;
    var out = [];
    for (var i = 0; i < KEYS.length; i++) out.push(KEYS[i] + ' is pressed');
    return out;
  }

  function heldKeys() {
    var c = catalog();
    return c && c.heldKeys ? c.heldKeys : ['left', 'right', 'up', 'down', 'space'];
  }

  function touchTargets() {
    var c = catalog();
    return c && c.touchTargets ? c.touchTargets : ['coin', 'enemy', 'wall'];
  }

  function compareOps() {
    var c = catalog();
    return c && c.compareOps ? c.compareOps : ['is greater than', 'is less than', 'equals'];
  }

  function sceneChoices() {
    var c = catalog();
    if (c && c.scenes) return c.scenes;
    return [
      { id: 'school', label: 'School' },
      { id: 'classroom', label: 'Classroom' },
      { id: 'jungle', label: 'Jungle' },
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'home', label: 'Home' },
      { id: 'playground', label: 'Playground' },
      { id: 'space', label: 'Space' },
      { id: 'default', label: 'Default' }
    ];
  }

  function sceneSelect(current) {
    var scenes = sceneChoices();
    var html = '';
    var found = false;
    for (var i = 0; i < scenes.length; i++) {
      var sel = scenes[i].id === current ? ' selected' : '';
      if (scenes[i].id === current) found = true;
      html += '<option value="' + esc(scenes[i].id) + '"' + sel + '>' + esc(scenes[i].label) + '</option>';
    }
    if (!found && current) {
      html = '<option value="' + esc(current) + '" selected>' + esc(current) + '</option>' + html;
    }
    return '<select data-field="name" aria-label="Scene">' + html + '</select>';
  }

  function sceneHint(name) {
    var c = catalog();
    if (!c || !name) return '';
    var known = false;
    var norm = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (var i = 0; i < c.sceneIds.length; i++) {
      if (c.sceneIds[i] === name || c.sceneIds[i] === norm) known = true;
    }
    if (known) return '';
    var guess = c.suggestScene(name);
    if (guess) {
      return '<button type="button" class="kf-bcard-hint" data-act="suggest" data-key="name" data-value="' +
        esc(guess) + '">Try ' + esc(guess) + '</button>';
    }
    return '<span class="kf-bcard-hint kf-bcard-hint-static">Not a built-in background</span>';
  }

  function readStored(node) {
    var f = node.fields || {};
    if (node.kind === 'return') {
      var expr = String(f.expr || '');
      var wrapped = expr.match(/^"([^"]*)"$/);
      if (wrapped) return { text: wrapped[1], quoted: true };
      return { text: expr, quoted: false };
    }
    if (node.kind === 'says' || node.kind === 'narrator') {
      return { text: String(f.text == null ? '' : f.text), quoted: f.quoted !== false };
    }
    return { text: String(f.value == null ? '' : f.value), quoted: !!f.quoted };
  }

  function writeStored(id, node, built) {
    var api = scriptApi();
    if (node.kind === 'return') {
      var expr = built.quoted ? '"' + String(built.text).replace(/"/g, '') + '"' : String(built.text);
      api.updateField(tree, id, 'expr', expr);
      return;
    }
    if (node.kind === 'says' || node.kind === 'narrator') {
      api.updateField(tree, id, 'text', built.text);
      api.updateField(tree, id, 'quoted', !!built.quoted);
      return;
    }
    api.updateField(tree, id, 'value', built.text);
    api.updateField(tree, id, 'quoted', !!built.quoted);
  }

  function mathOps() {
    var c = catalog();
    return (c && c.mathOps) ? c.mathOps : ['plus', 'minus', 'times', 'divided by', 'remainder', 'joined with'];
  }

  function valueModes() {
    return [
      ['words', 'Words'],
      ['number', 'Number'],
      ['name', 'Name'],
      ['bool', 'True/false'],
      ['math', 'Math'],
      ['random', 'Random'],
      ['list', 'List'],
      ['item', 'Item'],
      ['length', 'Length'],
      ['ask', 'Ask'],
      ['call', 'Call'],
      ['not', 'Not'],
      ['value', 'Write it']
    ];
  }

  function quoteKindSelect(field, quoted) {
    return '<select data-field="' + field + '" aria-label="Item kind">' +
      '<option value="1"' + (quoted ? ' selected' : '') + '>Words</option>' +
      '<option value="0"' + (!quoted ? ' selected' : '') + '>Value</option>' +
      '</select>';
  }

  function valueFields(text, quoted) {
    var api = scriptApi();
    var described = api.describeValue(text, quoted);
    var kind = described.kind;
    var modes = valueModes();
    var html = '<select data-field="valMode" aria-label="Value kind" class="kf-bcard-kind">';
    var i;
    for (i = 0; i < modes.length; i++) {
      html += '<option value="' + modes[i][0] + '"' + (modes[i][0] === kind ? ' selected' : '') + '>' + esc(modes[i][1]) + '</option>';
    }
    html += '</select>';
    if (kind === 'name') {
      html += '<input data-field="valText" list="kf-block-vars" value="' + esc(described.text || '') + '" aria-label="Name" class="kf-bcard-grow kf-bcard-line" autocomplete="off">';
    } else if (kind === 'bool') {
      html += '<select data-field="valText" aria-label="True or false">' + optionList(['true', 'false'], described.text || 'true') + '</select>';
    } else if (kind === 'math') {
      html += textInput('valLeft', described.left, 'Left') +
        '<select data-field="valOp" aria-label="Math">' + optionList(mathOps(), described.op || 'plus') + '</select>' +
        textInput('valRight', described.right, 'Right', true);
    } else if (kind === 'random') {
      html += '<span>from</span>' + textInput('valLow', described.low, 'From') +
        '<span>to</span>' + textInput('valHigh', described.high, 'To');
    } else if (kind === 'list') {
      var items = described.items || [];
      for (i = 0; i < items.length; i++) {
        if (i) html += '<span>and</span>';
        html += '<span class="kf-bcard-pair">' + quoteKindSelect('valItemKind' + i, items[i].quoted) +
          textInput('valItem' + i, items[i].text, 'Item') +
          (items.length > 1 ? removeBtn('del-val', i, 'Remove item') : '') + '</span>';
      }
      html += '<button type="button" data-act="add-val">Add item</button>';
    } else if (kind === 'item') {
      html += textInput('valIndex', described.index, 'Position') + '<span>in</span>' + textInput('valList', described.name, 'List');
    } else if (kind === 'length') {
      html += '<span>of</span>' + textInput('valName', described.name, 'Name');
    } else if (kind === 'ask') {
      html += textInput('valText', described.text, 'Question', 'line');
    } else if (kind === 'call') {
      html += textInput('valName', described.name, 'Function');
      var args = described.args || [];
      if (args.length) html += '<span>with</span>';
      for (i = 0; i < args.length; i++) {
        if (i) html += '<span>and</span>';
        html += quoteKindSelect('valArgKind' + i, args[i].quoted) + textInput('valArg' + i, args[i].text, 'Argument');
      }
      html += '<button type="button" data-act="add-arg">Add argument</button>';
    } else if (kind === 'not') {
      html += textInput('valText', described.text, 'Value', 'line');
    } else {
      html += textInput('valText', described.text, kind === 'number' ? 'Number' : (kind === 'words' ? 'Words' : 'Value'), 'line');
    }
    return html;
  }

  function valueFieldsFor(node) {
    var stored = readStored(node);
    return valueFields(stored.text, stored.quoted);
  }

  function defaultValue(kind, previous) {
    var prev = String(previous == null ? '' : previous);
    if (kind === 'words') return { kind: 'words', text: prev || 'Hello' };
    if (kind === 'number') return { kind: 'number', text: '0' };
    if (kind === 'name') return { kind: 'name', text: 'score' };
    if (kind === 'bool') return { kind: 'bool', text: 'true' };
    if (kind === 'math') return { kind: 'math', left: prev && !/\s/.test(prev) ? prev : '0', op: 'plus', right: '1' };
    if (kind === 'random') return { kind: 'random', low: '1', high: '6' };
    if (kind === 'list') return { kind: 'list', items: [{ text: 'apple', quoted: true }, { text: 'banana', quoted: true }] };
    if (kind === 'item') return { kind: 'item', index: '1', name: 'items' };
    if (kind === 'length') return { kind: 'length', name: 'name' };
    if (kind === 'ask') return { kind: 'ask', text: 'Your name?' };
    if (kind === 'call') return { kind: 'call', name: 'greet', args: [] };
    if (kind === 'not') return { kind: 'not', text: 'true' };
    return { kind: 'value', text: prev };
  }

  function valueParts(card) {
    var kind = cardValue(card, 'valMode');
    var i;
    if (kind === 'math') {
      return { kind: 'math', left: cardValue(card, 'valLeft'), op: cardValue(card, 'valOp'), right: cardValue(card, 'valRight') };
    }
    if (kind === 'random') return { kind: 'random', low: cardValue(card, 'valLow'), high: cardValue(card, 'valHigh') };
    if (kind === 'list') {
      var items = [];
      i = 0;
      while (cardField(card, 'valItem' + i)) {
        items.push({ text: cardValue(card, 'valItem' + i), quoted: cardValue(card, 'valItemKind' + i) === '1' });
        i++;
      }
      return { kind: 'list', items: items };
    }
    if (kind === 'item') return { kind: 'item', index: cardValue(card, 'valIndex'), name: cardValue(card, 'valList') };
    if (kind === 'length') return { kind: 'length', name: cardValue(card, 'valName') };
    if (kind === 'call') {
      var args = [];
      i = 0;
      while (cardField(card, 'valArg' + i)) {
        args.push({ text: cardValue(card, 'valArg' + i), quoted: cardValue(card, 'valArgKind' + i) === '1' });
        i++;
      }
      return { kind: 'call', name: cardValue(card, 'valName'), args: args };
    }
    return { kind: kind || 'value', text: cardValue(card, 'valText') };
  }

  function conditionFields(node) {
    var api = scriptApi();
    var f = node.fields || {};
    var described = api.describeCondition(f.condition);
    if (f.condWrite) described = { kind: 'custom', text: f.condition || '' };
    var kind = described.kind;
    var options = [
      ['compare', 'Compare'],
      ['answer', 'Quiz answer'],
      ['choice', 'Choice'],
      ['keyHeld', 'Key held'],
      ['touches', 'Touches'],
      ['has', 'Has item'],
      ['empty', 'Is empty'],
      ['in', 'Is in list'],
      ['custom', 'Write it']
    ];
    var html = '<select data-field="condKind" aria-label="Condition kind" class="kf-bcard-kind">';
    for (var i = 0; i < options.length; i++) {
      html += '<option value="' + options[i][0] + '"' + (options[i][0] === kind ? ' selected' : '') + '>' + esc(options[i][1]) + '</option>';
    }
    html += '</select>';
    if (kind === 'answer') {
      html += '<span>answer is</span><select data-field="condResult" aria-label="Answer">' +
        optionList(['correct', 'wrong'], described.result || 'correct') + '</select>';
    } else if (kind === 'choice') {
      html += '<span>choice equals</span><input data-field="condText" list="kf-choice-opts" value="' + esc(described.text || '') + '" aria-label="Choice" class="kf-bcard-grow" autocomplete="off">';
    } else if (kind === 'keyHeld') {
      html += '<select data-field="condKey" aria-label="Key">' + optionList(heldKeys(), described.key || 'right') + '</select><span>key is held</span>';
    } else if (kind === 'touches') {
      html += nameInput('condName', described.name) + '<span>touches</span>' +
        '<select data-field="condTarget" aria-label="Target">' + optionList(touchTargets(), described.target || 'coin') + '</select>';
    } else if (kind === 'has') {
      html += nameInput('condName', described.name) + '<span>has</span>' + textInput('condItem', described.item, 'Item');
    } else if (kind === 'empty') {
      html += textInput('condName', described.name, 'List') + '<span>is empty</span>';
    } else if (kind === 'in') {
      html += '<input data-field="condInText" data-quote="' + (described.quoted ? '1' : '0') + '" value="' + esc(described.text || '') + '" aria-label="Item" class="kf-bcard-grow" autocomplete="off">' +
        '<span>is in</span>' + textInput('condList', described.list, 'List');
    } else if (kind === 'compare') {
      html += textInput('condLeft', described.left, 'Left') +
        '<select data-field="condOp" aria-label="Comparison">' + optionList(compareOps(), described.op || 'is greater than') + '</select>' +
        textInput('condRight', described.right, 'Right', true);
    } else {
      html += textInput('condText', described.text, 'Condition', true);
    }
    return html;
  }

  function assignFields(verb, node) {
    var f = node.fields || {};
    return '<span>' + esc(verb) + '</span>' + textInput('name', f.name, 'Name') + '<span>to</span>' +
      valueFieldsFor(node);
  }

  function namedSelect(field, label, rows, current) {
    var html = '';
    var found = false;
    for (var i = 0; i < rows.length; i++) {
      var sel = rows[i].id === current ? ' selected' : '';
      if (rows[i].id === current) found = true;
      html += '<option value="' + esc(rows[i].id) + '"' + sel + '>' + esc(rows[i].label) + '</option>';
    }
    if (!found && current) {
      html = '<option value="' + esc(current) + '" selected>' + esc(current) + '</option>' + html;
    }
    return '<select data-field="' + field + '" aria-label="' + esc(label) + '">' + html + '</select>';
  }

  function knownHint(field, value, ids, guess, missing) {
    if (!value) return '';
    for (var i = 0; i < ids.length; i++) if (ids[i] === value) return '';
    if (guess) {
      return '<button type="button" class="kf-bcard-hint" data-act="suggest" data-key="' + esc(field) + '" data-value="' +
        esc(guess) + '">Try ' + esc(guess) + '</button>';
    }
    return '<span class="kf-bcard-hint kf-bcard-hint-static">' + esc(missing) + '</span>';
  }

  function fieldsHtml(node) {
    var f = node.fields || {};
    var api = scriptApi();
    switch (node.kind) {
      case 'scene':
        return sceneSelect(f.name) +
          '<label class="kf-bcard-check"><input type="checkbox" data-field="withWalls"' + (f.withWalls ? ' checked' : '') + '> walls</label>' +
          sceneHint(f.name);
      case 'appears':
        return nameInput('name', f.name) + '<span>appears</span>';
      case 'says':
        return nameInput('name', f.name) + '<span>says</span>' + valueFieldsFor(node);
      case 'narrator':
        return '<span>says</span>' + valueFieldsFor(node);
      case 'action':
        return nameInput('name', f.name) +
          '<select data-field="action" aria-label="Action">' + optionList(api.ACTIONS, f.action || 'waves') + '</select>';
      case 'wait':
        return numInput('seconds', f.seconds, 'Seconds') + '<span>seconds</span>';
      case 'set':
        return assignFields('set', node);
      case 'const':
        return assignFields('const', node);
      case 'repeat':
        return numInput('times', f.times, 'Times') + '<span>times</span>';
      case 'repeatWhile':
        return conditionFields(node);
      case 'if':
        return conditionFields(node);
      case 'else':
        return '<span>otherwise</span>';
      case 'everyFrame':
        return '<span>runs again and again</span>';
      case 'when':
        var clauses = whenClauses();
        var writeIt = !!f.whenWrite || clauses.indexOf(String(f.clause || '')) < 0;
        var whenHtml = '<select data-field="whenPick" aria-label="When" class="kf-bcard-kind">' +
          optionList(clauses, writeIt ? '' : f.clause) +
          '<option value="__custom__"' + (writeIt ? ' selected' : '') + '>Write it</option></select>';
        if (writeIt) whenHtml += textInput('clause', f.clause, 'When', true);
        return whenHtml;
      case 'game':
        return textInput('title', f.title, 'Title', true);
      case 'gameView':
        return '<select data-field="view" aria-label="View">' +
          '<option value="top"' + (f.view !== 'side' ? ' selected' : '') + '>top</option>' +
          '<option value="side"' + (f.view === 'side' ? ' selected' : '') + '>side</option>' +
          '</select>';
      case 'player':
        return nameInput('name', f.name) + '<span>is the player</span>';
      case 'spawnCoin':
        return '<span>x</span>' + numInput('x', f.x, 'X') + '<span>y</span>' + numInput('y', f.y, 'Y');
      case 'wall':
        return '<span>x</span>' + numInput('x', f.x, 'X') + '<span>y</span>' + numInput('y', f.y, 'Y') +
          '<span>w</span>' + numInput('width', f.width, 'Width') + '<span>h</span>' + numInput('height', f.height, 'Height');
      case 'ask':
        return textInput('text', f.text, 'Question', true);
      case 'quiz':
        var answers = f.choices && f.choices.length ? f.choices : [{ text: '4', result: 'correct' }, { text: '5', result: 'wrong' }];
        var quizHtml = textInput('text', f.text, 'Question', 'line');
        var qi;
        for (qi = 0; qi < answers.length; qi++) {
          quizHtml += '<span class="kf-bcard-pair">' + textInput('ans' + qi, answers[qi].text, 'Answer', true) +
            '<select data-field="ansResult' + qi + '" aria-label="Answer ' + (qi + 1) + '">' +
              '<option value="correct"' + (answers[qi].result !== 'wrong' ? ' selected' : '') + '>correct</option>' +
              '<option value="wrong"' + (answers[qi].result === 'wrong' ? ' selected' : '') + '>wrong</option>' +
            '</select>' +
            (answers.length > 1 ? removeBtn('del-ans', qi, 'Remove answer') : '') + '</span>';
        }
        quizHtml += '<button type="button" data-act="add-ans">Add answer</button>';
        return quizHtml;
      case 'choice':
        return textInput('text', f.text, 'Choice', true) +
          '<select data-field="result" aria-label="Result">' +
            '<option value="correct"' + (f.result !== 'wrong' ? ' selected' : '') + '>correct</option>' +
            '<option value="wrong"' + (f.result === 'wrong' ? ' selected' : '') + '>wrong</option>' +
          '</select>';
      case 'move':
        return nameInput('name', f.name) +
          '<select data-field="dir" aria-label="Direction">' + optionList(DIRS, f.dir || 'right') + '</select>' +
          '<span>by</span>' + numInput('by', f.by, 'Steps');
      case 'comment':
        return textInput('text', f.text, 'Note', true);
      case 'playSound':
        var sounds = (catalog() && catalog().sounds) || ['success', 'clap', 'win', 'cheer', 'pop', 'wrong', 'gameover'];
        var soundRows = [];
        for (var si = 0; si < sounds.length; si++) soundRows.push({ id: sounds[si], label: sounds[si] });
        return namedSelect('sound', 'Sound', soundRows, f.sound) +
          knownHint('sound', f.sound, sounds, catalog() && catalog().suggestSound(f.sound), 'Not a built-in sound');
      case 'choose':
        var options = f.options && f.options.length ? f.options : ['Go left', 'Go right'];
        var chooseHtml = '';
        for (var ci = 0; ci < options.length; ci++) {
          if (ci) chooseHtml += '<span>or</span>';
          chooseHtml += '<span class="kf-bcard-pair">' + textInput('opt' + ci, options[ci], 'Path', true) +
            (options.length > 1 ? removeBtn('del-opt', ci, 'Remove path') : '') + '</span>';
        }
        chooseHtml += '<button type="button" data-act="add-opt">Add path</button>';
        return chooseHtml;
      case 'speed':
        return nameInput('name', f.name) + '<span>speed</span>' + numInput('value', f.value, 'Speed');
      case 'askUser':
        return textInput('text', f.text, 'Question', true) + '<span>as</span>' + textInput('storeAs', f.storeAs, 'Save as');
      case 'scoreSet':
        return '<span>starts at</span>' + numInput('value', f.value, 'Score');
      case 'scoreAdd':
        return numInput('value', f.value, 'Points') + '<span>points</span>';
      case 'showScore':
        return '<span>on the stage</span>';
      case 'showMessage':
        return textInput('text', f.text, 'Message', true);
      case 'showWord':
        return textInput('word', f.word, 'Word') + '<span>means</span>' + textInput('meaning', f.meaning, 'Meaning', true);
      case 'showType':
        return '<span>of</span>' + textInput('name', f.name, 'Name');
      case 'showValue':
        return '<span>of</span>' + textInput('name', f.name, 'Name');
      case 'addToList':
        return valueFieldsFor(node) + '<span>to</span>' + textInput('list', f.list, 'List');
      case 'removeItem':
        return '<span>item</span>' + numInput('index', f.index, 'Position') + '<span>from</span>' + textInput('list', f.list, 'List');
      case 'removeEntity':
        return '<select data-field="target" aria-label="Remove">' + optionList(['coin', 'enemy'], f.target || 'coin') + '</select>';
      case 'lives':
        return '<span>start at</span>' + numInput('value', f.value, 'Lives');
      case 'timer':
        return '<span>starts at</span>' + numInput('value', f.value, 'Seconds');
      case 'goal':
        return '<span>collect</span>' + numInput('value', f.value, 'Coins') + '<span>coins</span>';
      case 'loseLife':
        return numInput('value', f.value, 'Lives') + '<span>life</span>';
      case 'loadMap':
        var maps = (catalog() && catalog().maps) || [{ id: 'school_maze', label: 'School maze' }];
        var mapIds = [];
        for (var mi = 0; mi < maps.length; mi++) mapIds.push(maps[mi].id);
        return namedSelect('name', 'Map', maps, f.name) +
          knownHint('name', f.name, mapIds, catalog() && catalog().suggestMap(f.name), 'Not a built-in map');
      case 'camera':
        return '<span>follows</span>' + nameInput('name', f.name);
      case 'jump':
        return nameInput('name', f.name) + '<span>power</span>' + numInput('power', f.power, 'Power');
      case 'spawnEnemy':
        return nameInput('name', f.name) + '<span>x</span>' + textInput('x', f.x, 'X') + '<span>y</span>' + textInput('y', f.y, 'Y');
      case 'patrol':
        return nameInput('name', f.name) + '<span>from</span>' + textInput('min', f.min, 'From') + '<span>to</span>' + textInput('max', f.max, 'To');
      case 'forEach':
        return textInput('item', f.item, 'Item') + '<span>in</span>' + textInput('list', f.list, 'List');
      case 'whileKey':
        return '<select data-field="key" aria-label="Key">' + optionList(heldKeys(), f.key || 'right') + '</select><span>key is held</span>';
      case 'define':
        return textInput('name', f.name, 'Function') + '<span>with</span>' + textInput('params', f.params, 'Parameters', true);
      case 'call':
        return textInput('name', f.name, 'Function') +
          '<select data-field="withArgs" aria-label="Arguments">' +
            '<option value="0"' + (!f.withArgs ? ' selected' : '') + '>alone</option>' +
            '<option value="1"' + (f.withArgs ? ' selected' : '') + '>with</option>' +
          '</select>' +
          (f.withArgs ? textInput('args', f.args, 'Arguments', true) : '');
      case 'return':
        return valueFieldsFor(node);
      case 'isEnemy':
        return nameInput('name', f.name) + '<span>is an enemy</span>';
      case 'chase':
        return nameInput('name', f.name) + '<span>chases</span>' + nameInput('target', f.target, 'Target');
      case 'gameFlow':
        return '<select data-field="action" aria-label="Game flow">' +
          optionList(['pause', 'resume', 'stop', 'restart'], f.action || 'pause') + '</select><span>game</span>';
      case 'levelSet':
        return '<span>starts at</span>' + numInput('value', f.value, 'Level');
      case 'nextLevel':
        return '<span>go to the next level</span>';
      case 'health':
        return '<span>starts at</span>' + numInput('value', f.value, 'Health');
      case 'hazard':
        return textInput('name', f.name, 'Hazard') + '<span>x</span>' + textInput('x', f.x, 'X') +
          '<span>y</span>' + textInput('y', f.y, 'Y') + '<span>w</span>' + textInput('width', f.width, 'Width') +
          '<span>h</span>' + textInput('height', f.height, 'Height');
      case 'shoot':
        return nameInput('name', f.name) +
          '<select data-field="dir" aria-label="Direction">' + optionList(DIRS, f.dir || 'right') + '</select>' +
          '<span>speed</span>' + numInput('speed', f.speed, 'Speed');
      case 'give':
        return nameInput('name', f.name) + textInput('item', f.item, 'Item');
      case 'damage':
        return '<select data-field="verb" aria-label="Action">' +
          optionList(['damage', 'hurt'], f.verb === 'hurt' ? 'hurt' : 'damage') + '</select>' +
          nameInput('name', f.name) + '<span>by</span>' + numInput('value', f.value, 'Amount');
      case 'break':
        return '<span>leave the loop</span>';
      case 'continue':
        return '<span>skip this turn</span>';
      case 'raw':
      case 'craw':
        return textInput('raw', node.raw || f.raw || '', 'Code', true);
      default:
        return '';
    }
  }

  function cardHtml(node, ancestors) {
    ancestors = ancestors || [];
    var tone = toneOf(node.kind);
    var cls = 'kf-bcard kf-bcard-' + tone;
    if (node.id === selectedId) cls += ' selected';
    if (node.id === pulseId) cls += ' kf-bcard-pulse';
    var html = '<div class="' + cls + '" data-id="' + esc(node.id) + '"' + (node.cBlock ? ' data-cblock="1"' : '') + '>';
    html += '<div class="kf-bcard-row">';
    html += '<span class="kf-bcard-label">' + esc(labelOf(node.kind)) + '</span>';
    html += fieldsHtml(node);
    var warn = cardWarning(node, ancestors);
    if (warn) html += '<span class="kf-bcard-hint kf-bcard-hint-static">' + esc(warn) + '</span>';
    html += '<span class="kf-bcard-actions">';
    html += '<button type="button" data-act="up" aria-label="Move up">↑</button>';
    html += '<button type="button" data-act="down" aria-label="Move down">↓</button>';
    html += '<button type="button" data-act="del" aria-label="Delete block">✕</button>';
    html += '</span></div>';
    if (node.cBlock) {
      html += '<div class="kf-bcard-children">';
      if (!node.children || !node.children.length) {
        html += '<div class="kf-bcard-slot">Tap this block, then tap a block on the left</div>';
      } else {
        for (var i = 0; i < node.children.length; i++) html += cardHtml(node.children[i], ancestors.concat([node]));
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderCanvas() {
    var canvas = document.getElementById('kf-blocks-canvas');
    var api = scriptApi();
    if (!canvas || !api || !tree) return;
    if (!tree.children.length) {
      var html = '<div class="kf-blocks-empty"><p>Tap a block on the left and it will show up here.</p>';
      api.STARTERS.forEach(function (starter) {
        html += '<button type="button" class="kf-starter" data-starter="' + esc(starter.id) + '">' +
          '<strong>' + esc(starter.label) + '</strong><span>' + esc(starter.hint) + '</span></button>';
      });
      html += '</div>';
      canvas.innerHTML = html;
    } else {
      var cards = '';
      for (var i = 0; i < tree.children.length; i++) cards += cardHtml(tree.children[i]);
      canvas.innerHTML = cards;
      var pulse = canvas.querySelector('.kf-bcard-pulse');
      if (pulse && pulse.scrollIntoView) pulse.scrollIntoView({ block: 'nearest' });
    }
    pulseId = null;
    syncVarList();
    syncChoiceList();
    applyPaletteMode();
    updateTargetHint();
  }

  function fileMode() {
    var api = scriptApi();
    if (api && api.programMode) return api.programMode(tree);
    return 'empty';
  }

  function cardWarning(node, ancestors) {
    var api = scriptApi();
    if (!api || !api.placementWarning) return '';
    return api.placementWarning(node, ancestors, fileMode());
  }

  function applyPaletteMode() {
    var palette = document.getElementById('kf-blocks-palette');
    if (!palette) return;
    var mode = fileMode();
    var filter = showAllBlocks || mode === 'empty' || mode === 'open' || mode === 'mixed' ? 'all' : mode;
    var chips = palette.querySelectorAll('.kf-block-chip');
    var i;
    for (i = 0; i < chips.length; i++) {
      var scope = chips[i].getAttribute('data-scope');
      chips[i].hidden = (filter === 'game' && scope === 'story') || (filter === 'story' && scope === 'game');
    }
    var cats = palette.querySelectorAll('.kf-blocks-cat');
    for (i = 0; i < cats.length; i++) {
      cats[i].hidden = !cats[i].querySelector('.kf-block-chip:not([hidden])');
    }
    var note = document.getElementById('kf-blocks-mode-note');
    var btn = document.getElementById('kf-blocks-show-all');
    var noteText = '';
    if (mode === 'game' && !showAllBlocks) noteText = 'This is a game. Story blocks are tucked away.';
    else if (mode === 'story' && !showAllBlocks) noteText = 'This is a story. Game blocks are tucked away.';
    else if (mode === 'mixed') noteText = 'Story blocks do not run inside a game.';
    if (note) {
      note.textContent = noteText;
      note.hidden = !noteText;
    }
    if (btn) {
      btn.hidden = mode === 'empty' || mode === 'open' || mode === 'mixed';
      btn.textContent = showAllBlocks ? 'Match this file' : (mode === 'game' ? 'Show story blocks' : 'Show game blocks');
    }
    var bar = document.getElementById('kf-blocks-modebar');
    if (bar) bar.hidden = !noteText && (!btn || btn.hidden);
    var title = document.getElementById('kf-blocks-title');
    if (title) title.textContent = (mode === 'game' || mode === 'mixed') ? 'My game' : 'My story';
  }

  function collectVars(node, out) {
    if (!node) return;
    if (node.kind === 'set' && node.fields && node.fields.name) out.push(node.fields.name);
    var raw = node.raw || (node.fields && node.fields.raw) || '';
    var found = String(raw).match(/^(?:set|const)\s+([A-Za-z_][\w]*)\s+to\b/i);
    if (!found) found = String(raw).match(/^for each\s+([A-Za-z_][\w]*)\s+in\b/i);
    if (!found) found = String(raw).match(/\bas\s+([A-Za-z_][\w]*)\s*$/i);
    if (found) out.push(found[1]);
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) collectVars(kids[i], out);
  }

  function syncVarList() {
    var list = document.getElementById('kf-block-vars');
    if (!list || !tree) return;
    var names = [];
    collectVars(tree, names);
    var seen = {};
    var html = '';
    for (var i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      seen[names[i]] = true;
      html += '<option value="' + esc(names[i]) + '"></option>';
    }
    list.innerHTML = html;
  }

  function collectChoices(node, out) {
    if (!node) return;
    if (node.kind === 'choose' && node.fields && node.fields.options) {
      var i;
      for (i = 0; i < node.fields.options.length; i++) out.push(node.fields.options[i]);
    }
    var kids = node.children || [];
    var k;
    for (k = 0; k < kids.length; k++) collectChoices(kids[k], out);
  }

  function syncChoiceList() {
    var list = document.getElementById('kf-choice-opts');
    if (!list || !tree) return;
    var names = [];
    collectChoices(tree, names);
    var seen = {};
    var html = '';
    var i;
    for (i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      seen[names[i]] = true;
      html += '<option value="' + esc(names[i]) + '"></option>';
    }
    list.innerHTML = html;
  }

  function updateTargetHint() {
    var el = document.getElementById('kf-blocks-target');
    var api = scriptApi();
    if (!el || !api) return;
    var node = selectedId ? api.find(tree, selectedId) : null;
    if (node && node.cBlock) el.textContent = 'New blocks go inside ' + labelOf(node.kind);
    else el.textContent = 'New blocks go at the end';
  }

  function setSelected(id) {
    if (selectedId === id) selectedId = null;
    else selectedId = id;
    var canvas = document.getElementById('kf-blocks-canvas');
    if (!canvas) return;
    var cards = canvas.querySelectorAll('.kf-bcard');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('selected', cards[i].getAttribute('data-id') === selectedId);
    }
    updateTargetHint();
  }

  function writeSource() {
    var api = scriptApi();
    var editor = editorEl();
    if (!api || !editor || !tree) return;
    writing = true;
    editor.value = api.serialize(tree);
    editor.selectionStart = editor.selectionEnd = 0;
    try {
      if (window.KiddySmartEditor && KiddySmartEditor.notifyExternalChange) {
        KiddySmartEditor.notifyExternalChange();
      }
    } finally {
      writing = false;
    }
    setTimeout(function () {
      if (getView() !== 'blocks') return;
      var ac = document.getElementById('kf-autocomplete');
      if (ac) ac.classList.add('d-none');
    }, 180);
    if (window.SpeakStorage && SpeakStorage.saveLastCode) SpeakStorage.saveLastCode(editor.value);
  }

  function reloadFromEditor() {
    if (writing) return;
    var api = scriptApi();
    if (!api) return;
    var editor = editorEl();
    tree = api.parse(editor ? editor.value : '');
    if (selectedId && !api.find(tree, selectedId)) selectedId = null;
    renderCanvas();
  }

  function toast(msg) {
    if (window.UI && UI.showToast) UI.showToast(msg);
  }

  function addTemplate(id) {
    var api = scriptApi();
    if (!api) return;
    if (!tree) tree = api.parse('');
    var nodes = api.makeTemplate(id);
    if (!nodes.length) return;
    if (id === 'else' && selectedId) {
      var selectedIf = api.find(tree, selectedId);
      if (selectedIf && selectedIf.kind === 'if') {
        api.insertAfter(tree, selectedId, nodes);
        pulseId = nodes[nodes.length - 1].id;
        renderCanvas();
        writeSource();
        toast('Added to your story');
        return;
      }
    }
    var parentId = null;
    if (selectedId) {
      var sel = api.find(tree, selectedId);
      if (sel && sel.cBlock) parentId = selectedId;
    }
    api.insert(tree, parentId, nodes);
    pulseId = nodes[nodes.length - 1].id;
    renderCanvas();
    writeSource();
    toast('Added to your story');
  }

  function applyStarter(id) {
    var api = scriptApi();
    var starter = api && api.starterById(id);
    if (!starter) return;
    tree = api.parse(starter.code);
    selectedId = null;
    pulseId = tree.children.length ? tree.children[0].id : null;
    renderCanvas();
    writeSource();
    toast(starter.label + ' added');
  }

  function onCanvasClick(e) {
    var starterBtn = e.target.closest('[data-starter]');
    if (starterBtn) {
      applyStarter(starterBtn.getAttribute('data-starter'));
      return;
    }
    var act = e.target.closest('[data-act]');
    if (act) {
      var card = act.closest('.kf-bcard');
      if (!card) return;
      var id = card.getAttribute('data-id');
      var api = scriptApi();
      var action = act.getAttribute('data-act');
      if (action === 'suggest') {
        api.updateField(tree, id, act.getAttribute('data-key'), act.getAttribute('data-value'));
        renderCanvas();
        writeSource();
        return;
      }
      if (action === 'add-opt') {
        var chooseNode = api.find(tree, id);
        var opts = chooseNode && chooseNode.fields.options ? chooseNode.fields.options.slice() : [];
        opts.push('Next');
        api.updateField(tree, id, 'options', opts);
        renderCanvas();
        writeSource();
        return;
      }
      if (action === 'add-ans') {
        var quizNode = api.find(tree, id);
        var answers = [];
        var existing = (quizNode && quizNode.fields && quizNode.fields.choices) || [];
        var ai;
        for (ai = 0; ai < existing.length; ai++) answers.push({ text: existing[ai].text, result: existing[ai].result });
        answers.push({ text: 'Next', result: 'wrong' });
        api.updateField(tree, id, 'choices', answers);
        renderCanvas();
        writeSource();
        return;
      }
      if (action === 'add-val' || action === 'add-arg') {
        var valueNode = api.find(tree, id);
        if (valueNode) {
          var described = api.describeValue(readStored(valueNode).text, readStored(valueNode).quoted);
          if (action === 'add-val' && described.kind === 'list') {
            described.items = (described.items || []).slice();
            described.items.push({ text: 'Next', quoted: true });
            writeStored(id, valueNode, api.buildValue(described));
          }
          if (action === 'add-arg' && described.kind === 'call') {
            described.args = (described.args || []).slice();
            described.args.push({ text: '1', quoted: false });
            writeStored(id, valueNode, api.buildValue(described));
          }
        }
        renderCanvas();
        writeSource();
        return;
      }
      if (action === 'del-ans' || action === 'del-opt' || action === 'del-val') {
        var rowIndex = parseInt(act.getAttribute('data-index'), 10);
        var rowNode = api.find(tree, id);
        if (action === 'del-ans' && rowNode && rowNode.fields.choices && rowNode.fields.choices.length > 1) {
          var kept = [];
          var ki;
          for (ki = 0; ki < rowNode.fields.choices.length; ki++) {
            if (ki !== rowIndex) kept.push({ text: rowNode.fields.choices[ki].text, result: rowNode.fields.choices[ki].result });
          }
          api.updateField(tree, id, 'choices', kept);
        }
        if (action === 'del-opt' && rowNode && rowNode.fields.options && rowNode.fields.options.length > 1) {
          var keptOpts = rowNode.fields.options.slice();
          keptOpts.splice(rowIndex, 1);
          api.updateField(tree, id, 'options', keptOpts);
        }
        if (action === 'del-val' && rowNode) {
          var listed = api.describeValue(readStored(rowNode).text, readStored(rowNode).quoted);
          if (listed.kind === 'list' && listed.items && listed.items.length > 1) {
            listed.items = listed.items.slice();
            listed.items.splice(rowIndex, 1);
            writeStored(id, rowNode, api.buildValue(listed));
          }
        }
        renderCanvas();
        writeSource();
        return;
      }
      if (action === 'del') {
        var removed = api.remove(tree, id);
        if (removed && (selectedId === id || api.find(removed, selectedId))) selectedId = null;
      } else if (action === 'up') {
        api.move(tree, id, -1);
      } else if (action === 'down') {
        api.move(tree, id, 1);
      }
      renderCanvas();
      writeSource();
      return;
    }
    if (e.target.closest('input, select, textarea, label')) return;
    var host = e.target.closest('.kf-bcard');
    if (!host || !host.getAttribute('data-cblock')) return;
    setSelected(host.getAttribute('data-id'));
  }

  function cardField(card, field) {
    return card.querySelector(':scope > .kf-bcard-row [data-field="' + field + '"]');
  }

  function cardValue(card, field) {
    var el = cardField(card, field);
    return el ? el.value : '';
  }

  function partsFromCard(card) {
    var kind = cardValue(card, 'condKind');
    if (kind === 'answer') return { kind: 'answer', result: cardValue(card, 'condResult') };
    if (kind === 'choice') return { kind: 'choice', text: cardValue(card, 'condText') };
    if (kind === 'keyHeld') return { kind: 'keyHeld', key: cardValue(card, 'condKey') };
    if (kind === 'touches') return { kind: 'touches', name: cardValue(card, 'condName'), target: cardValue(card, 'condTarget') };
    if (kind === 'has') return { kind: 'has', name: cardValue(card, 'condName'), item: cardValue(card, 'condItem') };
    if (kind === 'empty') return { kind: 'empty', name: cardValue(card, 'condName') };
    if (kind === 'in') {
      var el = cardField(card, 'condInText');
      var text = el ? el.value : '';
      return {
        kind: 'in',
        text: text,
        list: cardValue(card, 'condList'),
        quoted: !!(el && (el.getAttribute('data-quote') === '1' || /\s/.test(text)))
      };
    }
    if (kind === 'compare') {
      return {
        kind: 'compare',
        left: cardValue(card, 'condLeft'),
        op: cardValue(card, 'condOp'),
        right: cardValue(card, 'condRight')
      };
    }
    return { kind: 'custom', text: cardValue(card, 'condText') };
  }

  function defaultCondition(kind) {
    var api = scriptApi();
    var presets = {
      answer: { kind: 'answer', result: 'correct' },
      choice: { kind: 'choice', text: 'Go left' },
      keyHeld: { kind: 'keyHeld', key: 'right' },
      touches: { kind: 'touches', name: 'Rafi', target: 'coin' },
      has: { kind: 'has', name: 'Rafi', item: 'key' },
      empty: { kind: 'empty', name: 'items' },
      in: { kind: 'in', text: 'apple', list: 'fruits', quoted: true },
      compare: { kind: 'compare', left: 'score', op: 'is greater than', right: '10' },
      custom: { kind: 'custom', text: 'true' }
    };
    return api.buildCondition(presets[kind] || presets.custom);
  }

  function onField(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var key = el.getAttribute('data-field');
    if (!key) return;
    var card = el.closest('.kf-bcard');
    if (!card) return;
    var api = scriptApi();
    var id = card.getAttribute('data-id');
    var node = api.find(tree, id);
    if (!node) return;

    if (key === 'withArgs') {
      api.updateField(tree, id, 'withArgs', el.value === '1');
      renderCanvas();
      writeSource();
      return;
    }

    if (/^opt\d+$/.test(key)) {
      var opts = (node.fields.options || []).slice();
      opts[parseInt(key.slice(3), 10)] = el.value;
      api.updateField(tree, id, 'options', opts);
      writeSource();
      return;
    }

    if (/^ansResult(\d+)$/.test(key) || /^ans(\d+)$/.test(key)) {
      var quizChoices = [];
      var sourceChoices = node.fields.choices || [];
      var ci;
      for (ci = 0; ci < sourceChoices.length; ci++) {
        quizChoices.push({ text: sourceChoices[ci].text, result: sourceChoices[ci].result === 'wrong' ? 'wrong' : 'correct' });
      }
      var ansIndex = parseInt(key.replace(/\D/g, ''), 10);
      if (quizChoices[ansIndex]) {
        if (key.indexOf('ansResult') === 0) quizChoices[ansIndex].result = el.value === 'wrong' ? 'wrong' : 'correct';
        else quizChoices[ansIndex].text = el.value;
        api.updateField(tree, id, 'choices', quizChoices);
        writeSource();
      }
      return;
    }

    if (key.indexOf('val') === 0 && key !== 'value') {
      if (key === 'valMode') {
        var stored = readStored(node);
        var current = api.describeValue(stored.text, stored.quoted);
        if (current.kind !== el.value) writeStored(id, node, api.buildValue(defaultValue(el.value, stored.text)));
        renderCanvas();
        writeSource();
        return;
      }
      writeStored(id, node, api.buildValue(valueParts(card)));
      writeSource();
      return;
    }

    if (key === 'whenPick') {
      if (el.value === '__custom__') api.updateField(tree, id, 'whenWrite', true);
      else {
        api.updateField(tree, id, 'whenWrite', false);
        api.updateField(tree, id, 'clause', el.value);
      }
      renderCanvas();
      writeSource();
      return;
    }

    if (key === 'condKind') {
      if (el.value === 'custom') api.updateField(tree, id, 'condWrite', true);
      else {
        api.updateField(tree, id, 'condWrite', false);
        var current = api.describeCondition(node.fields.condition);
        if (current.kind !== el.value) api.updateField(tree, id, 'condition', defaultCondition(el.value));
      }
      renderCanvas();
      writeSource();
      return;
    }

    if (key.indexOf('cond') === 0) {
      api.updateField(tree, id, 'condition', api.buildCondition(partsFromCard(card)));
      writeSource();
      return;
    }

    var value;
    if (el.type === 'checkbox') value = !!el.checked;
    else if (key === 'quoted') value = el.value === '1';
    else value = el.value;
    api.updateField(tree, id, key, value);
    if ((node.kind === 'scene' && key === 'name') ||
        (node.kind === 'playSound' && key === 'sound') ||
        (node.kind === 'loadMap' && key === 'name')) renderCanvas();
    writeSource();
  }

  function hookExternal() {
    if (hooked || !window.KiddySmartEditor || !KiddySmartEditor.notifyExternalChange) return;
    var orig = KiddySmartEditor.notifyExternalChange;
    KiddySmartEditor.notifyExternalChange = function () {
      var result = orig.apply(this, arguments);
      if (!writing && getView() === 'blocks') reloadFromEditor();
      return result;
    };
    hooked = true;
  }

  function exportToText() {
    setView('text');
    if (window.UI && UI.showToast) UI.showToast('Text mode — your code is in the editor');
  }

  function init() {
    ensureWorkspace();
    buildPalette();
    var palette = document.getElementById('kf-blocks-palette');
    var canvas = document.getElementById('kf-blocks-canvas');
    if (palette) {
      palette.addEventListener('click', function (e) {
        if (e.target.closest('#kf-blocks-show-all')) {
          showAllBlocks = !showAllBlocks;
          applyPaletteMode();
          return;
        }
        var btn = e.target.closest('[data-template]');
        if (!btn) return;
        addTemplate(btn.getAttribute('data-template'));
      });
    }
    if (canvas) {
      canvas.addEventListener('click', onCanvasClick);
      canvas.addEventListener('input', onField);
      canvas.addEventListener('change', onField);
    }
    var editor = editorEl();
    if (editor) {
      editor.addEventListener('input', function () {
        if (writing) return;
        if (getView() === 'blocks') reloadFromEditor();
      });
    }
    hookExternal();
    setTimeout(hookExternal, 0);
    applyView(getView());
    var btnT = document.getElementById('btn-view-text');
    var btnB = document.getElementById('btn-view-blocks');
    if (btnT) btnT.addEventListener('click', function () { setView('text'); });
    if (btnB) btnB.addEventListener('click', function () { setView('blocks'); });
  }

  window.KiddyBlocksMode = {
    init: init,
    exportToText: exportToText,
    getView: getView,
    reloadFromEditor: reloadFromEditor,
    BLOCKS: (window.KiddyBlocksScript && KiddyBlocksScript.PALETTE) || []
  };
})();
