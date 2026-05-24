/**
 * KiddyFun Code Builder — beginner click-to-write (below editor)
 */
(function () {
  'use strict';

  var CATEGORIES = [
    { id: 'start', label: '🚀 Start' },
    { id: 'character', label: '🧑 People' },
    { id: 'action', label: '🎭 Do' },
    { id: 'speak', label: '💬 Talk' },
    { id: 'logic', label: '🧠 Logic' },
    { id: 'data', label: '📦 Data' },
  ];

  var BLOCKS = [
    { id: 'scene-school', cat: 'start', icon: '🏫', label: 'School', insert: 'scene "school"', desc: 'Set background' },
    { id: 'scene-playground', cat: 'start', icon: '🛝', label: 'Playground', insert: 'scene "playground"', desc: 'Set background' },
    { id: 'scene-jungle', cat: 'start', icon: '🌿', label: 'Jungle', insert: 'scene "jungle"', desc: 'Set background' },
    { id: 'scene-space', cat: 'start', icon: '🚀', label: 'Space', insert: 'scene "space"', desc: 'Set background' },

    { id: 'raf-appears', cat: 'character', icon: '👦', label: 'Rafi', insert: 'Rafi appears', desc: 'Boy on stage', char: 'Rafi' },
    { id: 'mina-appears', cat: 'character', icon: '👧', label: 'Mina', insert: 'Mina appears', desc: 'Girl on stage', char: 'Mina' },
    { id: 'lion-appears', cat: 'character', icon: '🦁', label: 'Lion', insert: 'Lion appears', desc: 'Lion on stage', char: 'Lion' },
    { id: 'teacher-appears', cat: 'character', icon: '👩‍🏫', label: 'Teacher', insert: 'Teacher appears', desc: 'Teacher', char: 'Teacher' },
    { id: 'bird-appears', cat: 'character', icon: '🐦', label: 'Bird', insert: 'Bird appears', desc: 'Bird', char: 'Bird' },

    { id: 'waves', cat: 'action', icon: '👋', label: 'Wave', insert: 'waves', mode: 'afterChar', desc: 'Wave hand' },
    { id: 'walks', cat: 'action', icon: '🚶', label: 'Walk', insert: 'walks', mode: 'afterChar', desc: 'Walk' },
    { id: 'runs', cat: 'action', icon: '🏃', label: 'Run', insert: 'runs', mode: 'afterChar', desc: 'Run fast' },
    { id: 'jumps', cat: 'action', icon: '⬆️', label: 'Jump', insert: 'jumps', mode: 'afterChar', desc: 'Jump up' },
    { id: 'smiles', cat: 'action', icon: '😊', label: 'Smile', insert: 'smiles', mode: 'afterChar', desc: 'Smile' },
    { id: 'wait', cat: 'action', icon: '⏸️', label: 'Wait', insert: 'wait 1 second', mode: 'line', desc: 'Pause 1 second' },

    { id: 'says', cat: 'speak', icon: '💬', label: 'Say', insert: 'says "Hello!"', mode: 'afterChar', say: true, desc: 'Character speaks' },
    { id: 'narrator', cat: 'speak', icon: '📖', label: 'Narrator', insert: 'narrator says "Once upon a time..."', mode: 'line', desc: 'Story voice' },
    { id: 'ask-user', cat: 'speak', icon: '⌨️', label: 'Ask user', insert: 'ask user "What is your name?"', mode: 'line', desc: 'Ask a question' },

    { id: 'repeat', cat: 'logic', icon: '🔁', label: 'Repeat 3×', insert: 'repeat 3 times\n    \nend', mode: 'block', desc: 'Do again' },
    { id: 'if-else', cat: 'logic', icon: '🧠', label: 'If / else', insert: 'if score is greater than 5\n    \nelse\n    \nend', mode: 'block', desc: 'Make a choice' },
    { id: 'end', cat: 'logic', icon: '✅', label: 'end', insert: 'end', mode: 'line', desc: 'Close block' },

    { id: 'set-var', cat: 'data', icon: '📦', label: 'Variable', insert: 'set name to "Rafi"', mode: 'line', desc: 'Store a value' },
    { id: 'score', cat: 'data', icon: '🏆', label: '+10 points', insert: 'add 10 points', mode: 'line', desc: 'Add score' },
    { id: 'show-score', cat: 'data', icon: '📊', label: 'Show score', insert: 'show score', mode: 'line', desc: 'Show score on screen' },
  ];

  var MODE_KEY = 'kf-editor-mode';

  var state = {
    panel: null,
    slot: null,
    editor: null,
    activeCat: 'start',
    bound: false,
  };

  function getBlock(id) {
    for (var i = 0; i < BLOCKS.length; i++) {
      if (BLOCKS[i].id === id) return BLOCKS[i];
    }
    return null;
  }

  function getLastCharacter(code) {
    var m;
    var re = /\b([A-Z][A-Za-z0-9]*)\s+appears/g;
    var last = null;
    while ((m = re.exec(code))) last = m[1];
    return last;
  }

  function getLineContext(ed) {
    var v = ed.value;
    var pos = ed.selectionStart;
    var before = v.slice(0, pos);
    var lineStart = before.lastIndexOf('\n') + 1;
    var lineEnd = v.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = v.length;
    var line = v.slice(lineStart, lineEnd);
    var col = pos - lineStart;
    var indent = (line.match(/^(\s*)/) || ['', ''])[1];
    var trimmed = line.trim();
    var charOnLine = trimmed.match(/^([A-Z][A-Za-z0-9]*)\s*$/);
    return {
      pos: pos, lineStart: lineStart, lineEnd: lineEnd, line: line, col: col,
      indent: indent, trimmed: trimmed, isEmpty: trimmed === '',
      charName: charOnLine ? charOnLine[1] : null,
      blockIndent: indent.length >= 4 ? indent : '',
    };
  }

  function blockDepthAt(code, lineNo) {
    var lines = code.split('\n');
    var depth = 0;
    for (var i = 0; i <= lineNo && i < lines.length; i++) {
      var t = lines[i].replace(/^\s+/, '').replace(/#.*$/, '').trim();
      if (!t) continue;
      if (/^end\b/i.test(t)) depth = Math.max(0, depth - 1);
      if (/^(repeat|if|define|for\s+each)/i.test(t)) depth++;
    }
    return depth;
  }

  function getNextSteps(code, pos) {
    var ed = { value: code, selectionStart: pos };
    var ctx = getLineContext(ed);
    var hasScene = /\bscene\s+"/i.test(code);
    var lastChar = getLastCharacter(code);

    if (!code.trim()) return ['scene-school', 'raf-appears'];
    if (hasScene && !lastChar) return ['raf-appears', 'mina-appears', 'lion-appears'];
    if (ctx.charName) return ['says', 'waves', 'walks', 'runs'];
    if (lastChar && ctx.isEmpty) return ['says', 'waves', 'walks', 'wait'];
    if (/^\s+/.test(ctx.line) && ctx.isEmpty) return ['says', 'waves', 'end'];
    if (/\brepeat\s+\d+\s+times\s*$/i.test(ctx.trimmed) || /\bif\b/i.test(ctx.trimmed)) {
      return ['says', 'waves', 'end'];
    }
    return ['raf-appears', 'says', 'repeat'];
  }

  function ensureNewlineBefore(code, pos) {
    if (!code.length || pos === 0) return '';
    if (code[pos - 1] === '\n') return '';
    return '\n';
  }

  function smartInsert(blockId) {
    var block = getBlock(blockId);
    var ed = state.editor;
    if (!block || !ed) return;

    setMode('blocks');

    var ctx = getLineContext(ed);
    var code = ed.value;
    var insert = block.insert;
    var rs = ctx.pos;
    var re = ed.selectionEnd;
    var cursorAfter = null;

    if (block.mode === 'afterChar' || block.say) {
      var charName = ctx.charName || block.char || getLastCharacter(code) || 'Rafi';
      if (ctx.charName) {
        insert = ' ' + (block.say ? 'says "Hello!"' : block.insert);
        rs = ctx.lineStart + ctx.line.length;
        re = rs;
      } else if (ctx.isEmpty) {
        insert = charName + ' ' + (block.say ? 'says "Hello!"' : block.insert);
        rs = ctx.lineStart;
        re = ctx.lineEnd;
      } else {
        insert = ensureNewlineBefore(code, ctx.pos) + charName + ' ' + (block.say ? 'says "Hello!"' : block.insert);
        rs = ctx.pos;
        re = ctx.pos;
      }
      var q = insert.indexOf('"');
      if (q >= 0) cursorAfter = rs + q + 1;
    } else if (block.mode === 'block') {
      if (!ctx.isEmpty && ctx.col > 0) {
        insert = ensureNewlineBefore(code, ctx.pos) + insert;
        rs = ctx.pos;
        re = ctx.pos;
      } else {
        rs = ctx.lineStart;
        re = ctx.lineEnd;
        if (ctx.isEmpty && ctx.indent) {
          insert = insert.split('\n').map(function (l, i) {
            return i === 0 ? l : ctx.indent + l;
          }).join('\n');
        }
      }
      var inner = insert.indexOf('\n    \n');
      if (inner >= 0) cursorAfter = rs + inner + 5;
    } else {
      if (!ctx.isEmpty && ctx.col > 0) {
        insert = ensureNewlineBefore(code, ctx.pos) + insert;
        rs = ctx.pos;
        re = ctx.pos;
      } else {
        rs = ctx.lineStart;
        re = ctx.lineEnd;
      }
      var qs = insert.indexOf('"');
      if (qs >= 0) cursorAfter = rs + qs + 1;
    }

    ed.value = code.slice(0, rs) + insert + code.slice(re);
    var newPos = cursorAfter != null ? cursorAfter : rs + insert.length;
    ed.selectionStart = ed.selectionEnd = newPos;
    ed.focus();

    if (window.KiddySmartEditor) {
      if (KiddySmartEditor.notifyExternalChange) KiddySmartEditor.notifyExternalChange();
      if (KiddySmartEditor.flashMagic) KiddySmartEditor.flashMagic();
    }
    if (window.UI && UI.showToast) UI.showToast(block.icon + ' ' + block.label + ' added');
    if (window.KiddyAudio && KiddyAudio.playSound) KiddyAudio.playSound('pop');

    renderPanel();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderPanel() {
    if (!state.panel || !state.editor) return;

    var steps = getNextSteps(state.editor.value, state.editor.selectionStart);
    var nextHtml = '';
    steps.forEach(function (id) {
      var b = getBlock(id);
      if (!b) return;
      nextHtml += '<button type="button" class="kf-builder-next-btn" data-block="' + id + '">' +
        b.icon + ' ' + esc(b.label) + '</button>';
    });
    state.panel.querySelector('#kf-builder-next').innerHTML = nextHtml
      ? '<span class="kf-builder-next-label">Next step</span>' + nextHtml
      : '';

    var blocksHtml = '';
    BLOCKS.forEach(function (b) {
      if (b.cat !== state.activeCat) return;
      blocksHtml += '<button type="button" class="kf-builder-block" data-block="' + b.id + '" title="' + esc(b.desc) + '">' +
        '<span class="kf-builder-block-icon">' + b.icon + '</span>' +
        '<span class="kf-builder-block-label">' + esc(b.label) + '</span></button>';
    });
    state.panel.querySelector('#kf-builder-blocks').innerHTML = blocksHtml ||
      '<p class="kf-builder-empty">Pick a category</p>';

    var tabsHtml = '';
    CATEGORIES.forEach(function (c) {
      tabsHtml += '<button type="button" class="kf-builder-tab' + (c.id === state.activeCat ? ' active' : '') +
        '" data-cat="' + c.id + '">' + c.label + '</button>';
    });
    state.panel.querySelector('.kf-builder-tabs').innerHTML = tabsHtml;
  }

  function setMode(mode) {
    var isBlocks = mode === 'blocks';
    document.body.classList.toggle('kf-editor-mode-blocks', isBlocks);
    document.body.classList.toggle('kf-editor-mode-type', !isBlocks);

    var typeBtn = document.getElementById('kf-mode-type');
    var blocksBtn = document.getElementById('kf-mode-blocks');
    if (typeBtn) {
      typeBtn.classList.toggle('active', !isBlocks);
      typeBtn.setAttribute('aria-selected', !isBlocks ? 'true' : 'false');
    }
    if (blocksBtn) {
      blocksBtn.classList.toggle('active', isBlocks);
      blocksBtn.setAttribute('aria-selected', isBlocks ? 'true' : 'false');
    }

    var helper = document.getElementById('kf-editor-helper');
    if (helper) {
      helper.classList.toggle('d-none', isBlocks);
    }

    try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* ignore */ }
  }

  function bindModeBar() {
    if (state.bound) return;
    state.bound = true;

    document.querySelectorAll('.kf-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.getAttribute('data-mode'));
      });
    });

    var stack = document.getElementById('kf-editor-stack');
    if (stack) {
      stack.addEventListener('click', function (e) {
        var tab = e.target.closest('.kf-builder-tab');
        if (tab) {
          state.activeCat = tab.getAttribute('data-cat');
          renderPanel();
          return;
        }
        var blockBtn = e.target.closest('[data-block]');
        if (blockBtn && blockBtn.closest('.kf-code-builder')) {
          smartInsert(blockBtn.getAttribute('data-block'));
        }
      });
    }
  }

  function buildPanel(slot) {
    if (!slot || state.panel) return;
    slot.innerHTML =
      '<div class="kf-code-builder" id="kf-code-builder">' +
        '<p class="kf-builder-hint">Tap a block — we add spaces and new lines for you.</p>' +
        '<div class="kf-builder-next" id="kf-builder-next"></div>' +
        '<div class="kf-builder-tabs"></div>' +
        '<div class="kf-builder-blocks" id="kf-builder-blocks"></div>' +
      '</div>';
    state.panel = slot.querySelector('#kf-code-builder');
    renderPanel();
  }

  function pickInitialMode(editor) {
    try {
      var saved = localStorage.getItem(MODE_KEY);
      if (saved === 'type' || saved === 'blocks') return saved;
    } catch (e) { /* ignore */ }
    return editor && editor.value.trim() ? 'type' : 'blocks';
  }

  function init(editor, stackEl) {
    state.editor = editor;
    state.slot = document.getElementById('kf-builder-slot') ||
      (stackEl && stackEl.querySelector('#kf-builder-slot'));

    bindModeBar();
    if (state.slot) buildPanel(state.slot);

    if (editor) {
      editor.addEventListener('input', renderPanel);
      editor.addEventListener('click', renderPanel);
      editor.addEventListener('keyup', renderPanel);
    }

    setMode(pickInitialMode(editor));
  }

  window.KiddyCodeBuilder = {
    init: init,
    smartInsert: smartInsert,
    setMode: setMode,
    getNextSteps: getNextSteps,
    getBlock: getBlock,
    BLOCKS: BLOCKS,
  };
})();
