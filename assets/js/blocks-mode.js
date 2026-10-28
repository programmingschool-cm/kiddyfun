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

  function toneOf(kind) {
    if (kind === 'raw' || kind === 'craw') return 'raw';
    if (['game', 'gameView', 'player', 'everyFrame', 'when', 'spawnCoin', 'wall', 'move'].indexOf(kind) >= 0) return 'game';
    if (['repeat', 'repeatWhile', 'if', 'else', 'set', 'ask', 'choice'].indexOf(kind) >= 0) return 'logic';
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
      choice: 'Choice',
      move: 'Move',
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

  function nameListHtml() {
    var names = '';
    for (var i = 0; i < NAMES.length; i++) names += '<option value="' + esc(NAMES[i]) + '"></option>';
    return '<datalist id="kf-block-names">' + names + '</datalist>';
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
              '<span>My story</span>' +
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
    var html = '';
    api.PALETTE.forEach(function (cat) {
      html += '<div class="kf-blocks-cat"><div class="kf-blocks-cat-title">' + esc(cat.cat) + '</div><div class="kf-blocks-row">';
      cat.items.forEach(function (item) {
        html += '<button type="button" class="kf-block-chip kf-chip-' + cat.tone + '" data-template="' + esc(item.id) + '">' +
          item.icon + ' ' + esc(item.label) + '</button>';
      });
      html += '</div></div>';
    });
    html += '<p class="kf-blocks-help">Tap a block. It shows up in your story. Tap a pocket block to add inside it.</p>';
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

  function nameInput(field, value) {
    return '<input data-field="' + field + '" list="kf-block-names" value="' + esc(value || '') + '" aria-label="Name" autocomplete="off">';
  }

  function textInput(field, value, label, grow) {
    return '<input data-field="' + field + '" value="' + esc(value || '') + '" aria-label="' + esc(label) + '"' +
      (grow ? ' class="kf-bcard-grow"' : '') + ' autocomplete="off">';
  }

  function numInput(field, value, label) {
    return '<input data-field="' + field + '" type="number" min="0" step="1" value="' + esc(value || '') + '" aria-label="' + esc(label) + '" class="kf-bcard-num">';
  }

  function fieldsHtml(node) {
    var f = node.fields || {};
    var api = scriptApi();
    switch (node.kind) {
      case 'scene':
        return textInput('name', f.name, 'Scene') +
          '<label class="kf-bcard-check"><input type="checkbox" data-field="withWalls"' + (f.withWalls ? ' checked' : '') + '> walls</label>';
      case 'appears':
        return nameInput('name', f.name) + '<span>appears</span>';
      case 'says':
        return nameInput('name', f.name) + '<span>says</span>' + textInput('text', f.text, 'Words', true);
      case 'narrator':
        return '<span>says</span>' + textInput('text', f.text, 'Words', true);
      case 'action':
        return nameInput('name', f.name) +
          '<select data-field="action" aria-label="Action">' + optionList(api.ACTIONS, f.action || 'waves') + '</select>';
      case 'wait':
        return numInput('seconds', f.seconds, 'Seconds') + '<span>seconds</span>';
      case 'set':
        return '<span>set</span>' + textInput('name', f.name, 'Variable') + '<span>to</span>' +
          textInput('value', f.value, 'Value', true) +
          '<select data-field="quoted" aria-label="Value type">' +
            '<option value="1"' + (f.quoted ? ' selected' : '') + '>Words</option>' +
            '<option value="0"' + (!f.quoted ? ' selected' : '') + '>Value</option>' +
          '</select>';
      case 'repeat':
        return numInput('times', f.times, 'Times') + '<span>times</span>';
      case 'repeatWhile':
        return textInput('condition', f.condition, 'Condition', true);
      case 'if':
        return textInput('condition', f.condition, 'Condition', true);
      case 'else':
        return '<span>otherwise</span>';
      case 'everyFrame':
        return '<span>runs again and again</span>';
      case 'when':
        if (KEYS.indexOf(String(f.clause || '').replace(/ is pressed$/, '')) >= 0 || / is pressed$/.test(f.clause || '')) {
          var clauses = KEYS.map(function (k) { return k + ' is pressed'; });
          return '<select data-field="clause" aria-label="Key">' + optionList(clauses, f.clause) + '</select>';
        }
        return textInput('clause', f.clause, 'When', true);
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
      case 'raw':
      case 'craw':
        return textInput('raw', node.raw || f.raw || '', 'Code', true);
      default:
        return '';
    }
  }

  function cardHtml(node) {
    var tone = toneOf(node.kind);
    var cls = 'kf-bcard kf-bcard-' + tone;
    if (node.id === selectedId) cls += ' selected';
    if (node.id === pulseId) cls += ' kf-bcard-pulse';
    var html = '<div class="' + cls + '" data-id="' + esc(node.id) + '"' + (node.cBlock ? ' data-cblock="1"' : '') + '>';
    html += '<div class="kf-bcard-row">';
    html += '<span class="kf-bcard-label">' + esc(labelOf(node.kind)) + '</span>';
    html += fieldsHtml(node);
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
        for (var i = 0; i < node.children.length; i++) html += cardHtml(node.children[i]);
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
    updateTargetHint();
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

  function onField(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var key = el.getAttribute('data-field');
    if (!key) return;
    var card = el.closest('.kf-bcard');
    if (!card) return;
    var api = scriptApi();
    var value;
    if (el.type === 'checkbox') value = !!el.checked;
    else if (key === 'quoted') value = el.value === '1';
    else value = el.value;
    api.updateField(tree, card.getAttribute('data-id'), key, value);
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
