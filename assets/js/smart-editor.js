/**
 * KiddyFun Smart Editor — autocomplete, ghost hints, auto-indent
 */
(function () {
  'use strict';

  var INDENT = '    ';
  var SCENES = ['school', 'classroom', 'jungle', 'restaurant', 'home', 'playground', 'space', 'default'];
  var ACTIONS = [
    'appears', 'says ""', 'waves', 'smiles', 'jumps', 'flies', 'runs', 'walks',
    'moves right', 'moves left', 'hides', 'shows', 'bows', 'nods', 'cheers', 'dances', 'claps', 'flaps'
  ];
  var SNIPPETS = [
    { k: 'scene', insert: 'scene "school"', label: 'scene "…"', detail: '🎬 Set background', score: 100 },
    { k: 'appears', insert: 'appears', label: 'appears', detail: '🧑 Character on stage', score: 95 },
    { k: 'says', insert: 'says "Hello!"', label: 'says "…"', detail: '💬 Speak aloud', score: 95 },
    { k: 'narrator says', insert: 'narrator says "Once upon a time..."', label: 'narrator says', detail: '📖 Story voice', score: 90 },
    { k: 'waves', insert: 'waves', label: 'waves', detail: '👋 Wave', score: 85 },
    { k: 'wait', insert: 'wait 1 second', label: 'wait … second', detail: '⏸️ Pause', score: 80 },
    { k: 'set', insert: 'set name to "Rafi"', label: 'set … to', detail: '📦 Variable', score: 92 },
    { k: 'const', insert: 'const maxScore to 100', label: 'const … to', detail: '🔒 Constant', score: 75 },
    { k: 'if', insert: 'if score is greater than 10\n    narrator says "High!"\nelse\n    narrator says "Try again"\nend', label: 'if … else … end', detail: '🧠 Condition', score: 88 },
    { k: 'repeat', insert: 'repeat 3 times\n    \nend', label: 'repeat N times', detail: '🔁 Loop', score: 88 },
    { k: 'repeat while', insert: 'repeat while i is less than 5\n    set i to i plus 1\nend', label: 'repeat while', detail: '🔁 While loop', score: 82 },
    { k: 'for each', insert: 'for each item in myList\n    narrator says item\nend', label: 'for each … in', detail: '📋 List loop', score: 80 },
    { k: 'define', insert: 'define myFunction\n    \nend', label: 'define … end', detail: '⚙️ Function', score: 85 },
    { k: 'call', insert: 'call myFunction', label: 'call …', detail: '▶️ Run function', score: 84 },
    { k: 'return', insert: 'return 0', label: 'return', detail: '↩️ Return value', score: 78 },
    { k: 'ask user', insert: 'ask user "What is your name?" as playerName', label: 'ask user', detail: '⌨️ Keyboard input', score: 86 },
    { k: 'ask', insert: 'ask "Question?"\nchoice "Yes" correct\nchoice "No" wrong', label: 'ask quiz', detail: '❓ Quiz', score: 84 },
    { k: 'show word', insert: 'show word "brave" means "সাহসী"', label: 'show word', detail: '📚 Vocabulary', score: 70 },
    { k: 'list', insert: 'list "a" and "b" and "c"', label: 'list … and …', detail: '📋 List literal', score: 76 },
    { k: 'add', insert: 'add 10 points', label: 'add points', detail: '🏆 Score', score: 72 },
    { k: 'score starts', insert: 'score starts at 0', label: 'score starts at', detail: '🏆 Start score', score: 72 },
    { k: 'play sound', insert: 'play sound "success"', label: 'play sound', detail: '🔊 Sound effect', score: 68 },
    { k: 'random', insert: 'random number from 1 to 6', label: 'random number', detail: '🎲 Dice', score: 74 },
    { k: 'break', insert: 'break', label: 'break', detail: '⏭️ Exit loop', score: 65 },
    { k: 'continue', insert: 'continue', label: 'continue', detail: '⏭️ Skip turn', score: 65 },
    { k: 'else', insert: 'else', label: 'else', detail: '🧠 Otherwise', score: 80 },
    { k: 'end', insert: 'end', label: 'end', detail: '✅ Close block', score: 78 },
    { k: 'true', insert: 'true', label: 'true', detail: '✓ Boolean', score: 60 },
    { k: 'false', insert: 'false', label: 'false', detail: '✗ Boolean', score: 60 },
    { k: 'plus', insert: 'plus', label: 'plus', detail: '➕ Math', score: 55 },
    { k: 'minus', insert: 'minus', label: 'minus', detail: '➖ Math', score: 55 },
    { k: 'times', insert: 'times', label: 'times', detail: '✖️ Math', score: 55 },
    { k: 'divided by', insert: 'divided by', label: 'divided by', detail: '➗ Math', score: 55 },
    { k: 'equals', insert: 'equals', label: 'equals', detail: '= compare', score: 58 },
    { k: 'is greater than', insert: 'is greater than', label: 'is greater than', detail: '> compare', score: 58 },
    { k: 'is less than', insert: 'is less than', label: 'is less than', detail: '< compare', score: 58 },
    { k: 'is empty', insert: 'is empty', label: 'is empty', detail: '📋 List check', score: 62 },
    { k: 'is in', insert: 'is in', label: 'is in', detail: '📋 Contains', score: 62 },
    { k: 'joined with', insert: 'joined with', label: 'joined with', detail: '🔗 Join text', score: 58 },
    { k: 'show type', insert: 'show type of name', label: 'show type of', detail: '🔍 Debug type', score: 50 },
    { k: 'show value', insert: 'show value of name', label: 'show value of', detail: '🔍 Debug value', score: 50 },
    { k: 'show score', insert: 'show score', label: 'show score', detail: '🏆 Display score', score: 65 },
    { k: '#', insert: '# ', label: '# comment', detail: '💡 Note', score: 40 },
  ];

  var BLOCK_START = /^(repeat\s+\d+\s+times|repeat\s+while\b|if\b|else\b|define\b|for\s+each\b)/i;
  var BLOCK_END = /^end\b/i;

  var state = {
    editor: null,
    acList: null,
    ghostBar: null,
    highlightEl: null,
    guidesEl: null,
    lineNosEl: null,
    chipsEl: null,
    onChange: null,
    onScroll: null,
    items: [],
    selected: 0,
    open: false,
    ghostText: '',
    ghostInsert: '',
    replaceStart: 0,
    replaceEnd: 0,
    debounce: null,
    drag: null,
    dropLine: null,
    gutterBound: false,
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getLines(text) { return text.split('\n'); }

  function getLineAt(text, pos) {
    var before = text.slice(0, pos);
    var lineStart = before.lastIndexOf('\n') + 1;
    var lineEnd = text.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = text.length;
    var line = text.slice(lineStart, lineEnd);
    var col = pos - lineStart;
    return { line: line, lineStart: lineStart, lineEnd: lineEnd, col: col, lineNo: before.split('\n').length - 1 };
  }

  function extractContext(code) {
    var chars = {};
    var vars = {};
    var scenes = {};
    var funcs = {};
    var reChar = /^([A-Za-z][\w]*)\s+(appears|says|waves|smiles|jumps|flies|runs|walks|moves|hides|shows|bows|nods|cheers|dances|claps|flaps)\b/gim;
    var reVar = /\b(?:set|const)\s+([A-Za-z][\w]*)\s+to\b/gi;
    var reScene = /\bscene\s+"([^"]+)"/gi;
    var reDef = /\bdefine\s+([A-Za-z][\w]*)\b/gi;
    var m;
    while ((m = reChar.exec(code))) chars[m[1]] = true;
    while ((m = reVar.exec(code))) vars[m[1]] = true;
    while ((m = reScene.exec(code))) scenes[m[1]] = true;
    while ((m = reDef.exec(code))) funcs[m[1]] = true;
    return {
      chars: Object.keys(chars),
      vars: Object.keys(vars),
      scenes: Object.keys(scenes),
      funcs: Object.keys(funcs),
    };
  }

  function wordBefore(text, pos) {
    var slice = text.slice(0, pos);
    var m = slice.match(/([A-Za-z#][\w\s]*)$/);
    if (!m) return { word: '', start: pos };
    return { word: m[1], start: pos - m[1].length };
  }

  function fuzzyScore(query, target) {
    if (!query) return 50;
    var q = query.toLowerCase().trim();
    var t = target.toLowerCase();
    if (t.indexOf(q) === 0) return 100 - t.length;
    if (t.indexOf(q) >= 0) return 70 - t.indexOf(q);
    var qi = 0;
    for (var i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    if (qi === q.length) return 40;
    return 0;
  }

  function getCompletions(text, pos) {
    var ctx = extractContext(text);
    var info = getLineAt(text, pos);
    var trimmed = info.line.replace(/^\s+/, '');
    var indent = info.line.match(/^(\s*)/)[1];
    var wb = wordBefore(text, pos);
    var word = wb.word;
    var results = [];
    var seen = {};

    function add(item) {
      var key = item.insert + '|' + item.label;
      if (seen[key]) return;
      seen[key] = true;
      results.push(item);
    }

    /* scene "…" */
    if (/scene\s+"[^"]*$/i.test(text.slice(info.lineStart, pos)) || /scene\s+"$/i.test(trimmed)) {
      SCENES.forEach(function (s) {
        add({ label: 'scene "' + s + '"', insert: 'scene "' + s + '"', detail: '🎬 Scene', score: 95,
          replaceStart: info.lineStart, replaceEnd: pos });
      });
    }

    /* Character at line start */
    if (/^\s*[A-Za-z][\w]*\s*$/i.test(info.line.slice(0, info.col)) && word.length >= 1) {
      ACTIONS.forEach(function (a) {
        var charMatch = trimmed.match(/^([A-Za-z][\w]*)\s*$/i);
        if (charMatch) {
          add({ label: charMatch[1] + ' ' + a, insert: a, detail: '🎭 Action', score: 90,
            replaceStart: pos, replaceEnd: pos });
        }
      });
    }

    /* New line — character name */
    if (/^\s*$/.test(trimmed) && word.length <= 2) {
      ctx.chars.forEach(function (c) {
        add({ label: c + ' appears', insert: c + ' appears', detail: '🧑 Your character', score: 88,
          replaceStart: wb.start, replaceEnd: pos });
      });
      ['Rafi', 'Mina', 'Lion', 'Bird', 'Robot', 'Teacher'].forEach(function (c) {
        if (ctx.chars.indexOf(c) < 0) {
          add({ label: c + ' appears', insert: c + ' appears', detail: '✨ Try this', score: 75,
            replaceStart: wb.start, replaceEnd: pos });
        }
      });
    }

    /* set / const name */
    if (/\b(?:set|const)\s+[A-Za-z][\w]*\s*$/i.test(trimmed) || /\b(?:set|const)\s+$/i.test(trimmed)) {
      add({ label: 'name to "…"', insert: 'name to ""', detail: '📦 Variable', score: 85,
        replaceStart: wb.start, replaceEnd: pos });
    }

    /* set x to — value / expression */
    if (/\bset\s+\w+\s+to\s+$/i.test(trimmed)) {
      add({ label: '"text"', insert: '""', detail: 'Text', score: 80, replaceStart: pos, replaceEnd: pos });
      add({ label: '0', insert: '0', detail: 'Number', score: 78, replaceStart: pos, replaceEnd: pos });
      add({ label: 'true', insert: 'true', detail: 'Boolean', score: 76, replaceStart: pos, replaceEnd: pos });
      add({ label: 'list …', insert: 'list "a" and "b"', detail: 'List', score: 74, replaceStart: pos, replaceEnd: pos });
    }

    /* if variable */
    if (/^\s*if\s+$/i.test(trimmed) || /^\s*if\s+\w*$/i.test(trimmed)) {
      ctx.vars.forEach(function (v) {
        add({ label: 'if ' + v + ' equals', insert: v + ' equals ', detail: '📦 Your variable', score: 86,
          replaceStart: wb.start, replaceEnd: pos });
      });
    }

    /* call */
    if (/\bcall\s*$/i.test(trimmed) || /\bcall\s+\w*$/i.test(trimmed)) {
      ctx.funcs.forEach(function (f) {
        add({ label: 'call ' + f, insert: 'call ' + f, detail: '⚙️ Your function', score: 90,
          replaceStart: wb.start, replaceEnd: pos });
      });
    }

    /* end — when inside block */
    if (/^\s+\S/.test(info.line) && !BLOCK_END.test(trimmed)) {
      var depth = blockDepthAt(text, info.lineNo);
      if (depth > 0 && (/^\s*$/.test(trimmed) || word === 'e' || word === 'en')) {
        add({ label: 'end', insert: 'end', detail: '✅ Close block', score: 92,
          replaceStart: wb.start, replaceEnd: pos });
      }
    }

    /* Snippets */
    SNIPPETS.forEach(function (sn) {
      var fs = fuzzyScore(word, sn.k);
      if (fs > 0 || fuzzyScore(word, sn.label) > 0) {
        add({
          label: sn.label,
          insert: sn.insert,
          detail: sn.detail,
          score: sn.score + fs,
          replaceStart: wb.start,
          replaceEnd: pos,
        });
      }
    });

    /* Variables */
    ctx.vars.forEach(function (v) {
      var fs = fuzzyScore(word, v);
      if (fs > 0) {
        add({ label: v, insert: v, detail: '📦 Variable', score: 60 + fs,
          replaceStart: wb.start, replaceEnd: pos });
      }
    });

    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 12);
  }

  function blockDepthAt(text, lineNo) {
    var lines = getLines(text);
    var depth = 0;
    for (var i = 0; i <= lineNo && i < lines.length; i++) {
      var t = lines[i].replace(/^\s+/, '').replace(/#.*$/, '').trim();
      if (!t) continue;
      if (BLOCK_END.test(t)) depth = Math.max(0, depth - 1);
      if (BLOCK_START.test(t)) depth++;
    }
    return depth;
  }

  function predictNextLine(text, lineNo) {
    var lines = getLines(text);
    if (lineNo < 0 || lineNo >= lines.length) return null;
    var line = lines[lineNo].replace(/#.*$/, '').trim();
    if (!line) return null;

    var charM = line.match(/^([A-Za-z][\w]*)\s+(appears|says)/i);
    if (charM && charM[2].toLowerCase() === 'appears') {
      return charM[1] + ' says "Hello!"';
    }
    if (/^scene\s+"/i.test(line)) {
      var ctx = extractContext(text);
      var name = ctx.chars[0] || 'Rafi';
      return name + ' appears';
    }
    if (/^set\s+\w+\s+to\s+/i.test(line) && !/ask user/i.test(line)) {
      return 'show value of ' + (line.match(/set\s+(\w+)/i) || [])[1];
    }
    if (BLOCK_START.test(line)) return INDENT + '# your code here';
    return null;
  }

  function getGhostSuggestion(text, pos) {
    var wb = wordBefore(text, pos);
    var word = wb.word;
    if (word.length < 1) {
      var info = getLineAt(text, pos);
      var next = predictNextLine(text, info.lineNo - 1);
      if (next && info.col <= 4) {
        return { suffix: next, insert: next, replaceStart: pos, replaceEnd: pos, type: 'line' };
      }
      return null;
    }

    var items = getCompletions(text, pos);
    if (!items.length) return null;
    var best = items[0];
    var insert = best.insert;
    var prefix = text.slice(best.replaceStart != null ? best.replaceStart : wb.start, pos);

    if (insert.toLowerCase().indexOf(word.toLowerCase()) === 0 && insert.length > word.length) {
      return {
        suffix: insert.slice(word.length),
        insert: insert,
        replaceStart: best.replaceStart != null ? best.replaceStart : wb.start,
        replaceEnd: pos,
        type: 'word',
      };
    }
    if (insert.length > prefix.length && insert.slice(0, prefix.length).toLowerCase() === prefix.toLowerCase()) {
      return {
        suffix: insert.slice(prefix.length),
        insert: insert,
        replaceStart: best.replaceStart != null ? best.replaceStart : wb.start,
        replaceEnd: pos,
        type: 'word',
      };
    }
    return null;
  }

  function insertText(replaceStart, replaceEnd, insert, cursorOffset) {
    var ed = state.editor;
    var v = ed.value;
    var before = v.slice(0, replaceStart);
    var after = v.slice(replaceEnd);
    ed.value = before + insert + after;
    var c = replaceStart + (cursorOffset != null ? cursorOffset : insert.length);
    ed.selectionStart = ed.selectionEnd = c;
    ed.focus();
    notifyChange();
  }

  function notifyChange() {
    syncHighlight();
    updateGutter();
    updateCurrentLine();
    if (state.onChange) state.onChange();
    refresh();
  }

  function syncHighlight() {
    var ed = state.editor;
    if (!ed || !state.highlightEl || !window.KiddyEditorHighlight) return;
    state.highlightEl.innerHTML = KiddyEditorHighlight.highlightCode(ed.value);
    if (state.guidesEl) {
      state.guidesEl.innerHTML = KiddyEditorHighlight.indentGuides(ed.value);
    }
    state.highlightEl.scrollTop = ed.scrollTop;
    state.highlightEl.scrollLeft = ed.scrollLeft;
    updateCurrentLine();
  }

  function updateCurrentLine() {
    var ed = state.editor;
    if (!ed || !state.highlightEl) return;
    var lines = ed.value.split('\n');
    var pos = ed.selectionStart;
    var lineNo = ed.value.slice(0, pos).split('\n').length - 1;
    var rows = state.highlightEl.querySelectorAll('.kf-hl-line');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('kf-hl-line-active', i === lineNo);
      rows[i].classList.remove('kf-hl-line-pair');
    }
    var lnRows = state.lineNosEl && state.lineNosEl.querySelectorAll('.kf-ln-row');
    if (lnRows) {
      for (var j = 0; j < lnRows.length; j++) {
        lnRows[j].classList.toggle('kf-ln-active', j === lineNo);
        lnRows[j].classList.remove('kf-ln-pair');
      }
    }

    if (window.KiddyEditorBlocks && lines[lineNo]) {
      var trim = lines[lineNo].replace(/^\s+/, '').replace(/#.*$/, '').trim();
      if (/^end\b/i.test(trim) || BLOCK_START.test(trim)) {
        var regions = KiddyEditorBlocks.parseBlockRegions(lines);
        for (var r = 0; r < regions.length; r++) {
          var reg = regions[r];
          if (lineNo === reg.start || lineNo === reg.end) {
            var pairLine = lineNo === reg.start ? reg.end : reg.start;
            if (rows[pairLine]) rows[pairLine].classList.add('kf-hl-line-pair');
            if (lnRows && lnRows[pairLine]) lnRows[pairLine].classList.add('kf-ln-pair');
            break;
          }
        }
      }
    }
  }

  function updateGutter() {
    var ed = state.editor;
    var lineNos = state.lineNosEl;
    if (!ed || !lineNos || !window.KiddyEditorBlocks) return;

    var lines = ed.value.split('\n');
    var html = '';
    for (var i = 0; i < lines.length; i++) {
      var info = KiddyEditorBlocks.lineBlockInfo(lines, i);
      var range = KiddyEditorBlocks.getMovableRange(lines, i);
      var canDrag = range && range.start === i && lines[i].trim() !== '';
      var roleCls = info.role === 'start' ? ' kf-ln-block-start' :
        info.role === 'end' ? ' kf-ln-block-end' :
        info.role === 'inner' ? ' kf-ln-block-inner' : '';
      html += '<div class="kf-ln-row' + roleCls + '" data-line="' + i + '">';
      html += canDrag
        ? '<span class="kf-ln-drag" draggable="true" title="Drag to move block" aria-label="Drag line">⠿</span>'
        : '<span class="kf-ln-drag-placeholder" aria-hidden="true"></span>';
      html += '<span class="kf-ln-num">' + (i + 1) + '</span></div>';
    }
    lineNos.innerHTML = html;
    lineNos.scrollTop = ed.scrollTop;
  }

  function bindGutterDrag() {
    if (state.gutterBound || !state.lineNosEl) return;
    state.gutterBound = true;
    var lineNos = state.lineNosEl;

    lineNos.addEventListener('dragstart', function (e) {
      var handle = e.target.closest('.kf-ln-drag');
      if (!handle || !state.editor) return;
      var row = handle.closest('.kf-ln-row');
      if (!row) return;
      var line = parseInt(row.getAttribute('data-line'), 10);
      var lines = state.editor.value.split('\n');
      var range = window.KiddyEditorBlocks.getMovableRange(lines, line);
      if (!range) return;
      state.drag = { fromStart: range.start, fromEnd: range.end };
      row.classList.add('kf-ln-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(line));
      if (window.KiddyAudio && KiddyAudio.playSound) KiddyAudio.playSound('pop');
    });

    lineNos.addEventListener('dragend', function () {
      state.drag = null;
      state.dropLine = null;
      lineNos.querySelectorAll('.kf-ln-dragging, .kf-ln-drop-target').forEach(function (el) {
        el.classList.remove('kf-ln-dragging', 'kf-ln-drop-target');
      });
    });

    lineNos.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var row = e.target.closest('.kf-ln-row');
      if (!row) return;
      lineNos.querySelectorAll('.kf-ln-drop-target').forEach(function (el) {
        el.classList.remove('kf-ln-drop-target');
      });
      row.classList.add('kf-ln-drop-target');
      state.dropLine = parseInt(row.getAttribute('data-line'), 10);
    });

    lineNos.addEventListener('dragleave', function (e) {
      if (!lineNos.contains(e.relatedTarget)) {
        lineNos.querySelectorAll('.kf-ln-drop-target').forEach(function (el) {
          el.classList.remove('kf-ln-drop-target');
        });
      }
    });

    lineNos.addEventListener('drop', function (e) {
      e.preventDefault();
      if (!state.drag || !state.editor || state.dropLine == null) return;
      var lines = state.editor.value.split('\n');
      var toLine = state.dropLine;
      if (toLine >= state.drag.fromStart && toLine <= state.drag.fromEnd) return;
      var moved = window.KiddyEditorBlocks.moveRange(
        lines, state.drag.fromStart, state.drag.fromEnd, toLine
      );
      state.editor.value = moved.join('\n');
      state.drag = null;
      state.dropLine = null;
      flashMagic();
      notifyChange();
      if (window.UI && UI.showToast) UI.showToast('↕️ Block moved!');
    });

    lineNos.addEventListener('click', function (e) {
      var row = e.target.closest('.kf-ln-row');
      if (!row || !state.editor) return;
      var line = parseInt(row.getAttribute('data-line'), 10);
      var lines = state.editor.value.split('\n');
      var pos = 0;
      for (var i = 0; i < line && i < lines.length; i++) pos += lines[i].length + 1;
      state.editor.focus();
      state.editor.selectionStart = state.editor.selectionEnd = pos;
      updateCurrentLine();
    });
  }

  function bindChips() {
    if (!state.chipsEl) return;
    state.chipsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.kf-chip');
      if (!btn) return;
      var snip = btn.getAttribute('data-snippet');
      if (!snip) return;
      snip = snip.replace(/&#10;/g, '\n').replace(/&quot;/g, '"');
      insertAtCursor(snip);
    });
  }

  function closeAutocomplete() {
    state.open = false;
    state.items = [];
    state.selected = 0;
    if (state.acList) {
      state.acList.classList.add('d-none');
      state.acList.innerHTML = '';
    }
  }

  function renderAutocomplete() {
    var list = state.acList;
    if (!list) return;
    if (!state.items.length) {
      closeAutocomplete();
      return;
    }
    state.open = true;
    list.classList.remove('d-none');
    var html = '';
    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      html += '<li class="kf-ac-item' + (i === state.selected ? ' active' : '') + '" data-idx="' + i + '">' +
        '<span class="kf-ac-label">' + esc(it.label) + '</span>' +
        '<span class="kf-ac-detail">' + esc(it.detail || '') + '</span></li>';
    }
    list.innerHTML = html;
    list.querySelectorAll('.kf-ac-item').forEach(function (el) {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        applyCompletion(state.items[+el.dataset.idx]);
      });
    });
    var active = list.querySelector('.kf-ac-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function applyCompletion(item) {
    if (!item) return;
    var rs = item.replaceStart != null ? item.replaceStart : state.replaceStart;
    var re = item.replaceEnd != null ? item.replaceEnd : state.replaceEnd;
    insertText(rs, re, item.insert);
    closeAutocomplete();
    hideGhost();
    flashMagic();
  }

  function acceptGhost() {
    if (!state.ghostInsert) return false;
    insertText(state.replaceStart, state.replaceEnd, state.ghostInsert);
    hideGhost();
    closeAutocomplete();
    flashMagic();
    return true;
  }

  function hideGhost() {
    state.ghostText = '';
    state.ghostInsert = '';
    if (state.ghostBar) {
      state.ghostBar.classList.add('d-none');
      state.ghostBar.textContent = '';
    }
  }

  function updateGhost() {
    var ed = state.editor;
    if (!ed) return;
    var pos = ed.selectionStart;
    if (ed.selectionStart !== ed.selectionEnd) {
      hideGhost();
      return;
    }
    var g = getGhostSuggestion(ed.value, pos);
    if (!g || !g.suffix) {
      hideGhost();
      return;
    }
    state.ghostText = g.suffix;
    state.ghostInsert = g.insert;
    state.replaceStart = g.replaceStart;
    state.replaceEnd = g.replaceEnd;
    if (state.ghostBar) {
      state.ghostBar.classList.remove('d-none');
      state.ghostBar.innerHTML = '✨ Tab → <kbd>' + esc(g.suffix.length > 40 ? g.insert.slice(0, 40) + '…' : g.insert) + '</kbd>';
    }
  }

  function refresh() {
    clearTimeout(state.debounce);
    state.debounce = setTimeout(function () {
      var ed = state.editor;
      if (!ed) return;
      var pos = ed.selectionStart;
      state.items = getCompletions(ed.value, pos);
      if (state.items.length && wordBefore(ed.value, pos).word.length >= 1) {
        state.selected = 0;
        var wb = wordBefore(ed.value, pos);
        state.replaceStart = state.items[0].replaceStart != null ? state.items[0].replaceStart : wb.start;
        state.replaceEnd = pos;
        renderAutocomplete();
      } else if (state.items.length >= 3 && ed.value.trim().length < 3) {
        state.selected = 0;
        renderAutocomplete();
      } else {
        closeAutocomplete();
      }
      updateGhost();
    }, 80);
  }

  function flashMagic() {
    var wrap = state.editor && state.editor.closest('.kf-editor-wrap');
    if (!wrap) return;
    wrap.classList.add('kf-editor-flash');
    setTimeout(function () { wrap.classList.remove('kf-editor-flash'); }, 400);
  }

  function handleEnter(e) {
    var ed = state.editor;
    var v = ed.value;
    var start = ed.selectionStart;
    var end = ed.selectionEnd;
    if (start !== end) return false;

    var info = getLineAt(v, start);
    var line = info.line;
    var trimmed = line.replace(/^\s+/, '');
    var indent = line.match(/^(\s*)/)[1];

    if (state.open && state.items.length) {
      e.preventDefault();
      applyCompletion(state.items[state.selected]);
      return true;
    }

    if (BLOCK_END.test(trimmed) && blockDepthAt(v, info.lineNo) === 0) {
      return false;
    }

    e.preventDefault();
    var insert = '\n';

    if (BLOCK_START.test(trimmed)) {
      insert += indent + INDENT;
    } else if (BLOCK_END.test(trimmed)) {
      var less = indent.length >= INDENT.length ? indent.slice(INDENT.length) : '';
      insert += less;
    } else {
      insert += indent;
    }

    var nextHint = predictNextLine(v, info.lineNo);
    if (BLOCK_START.test(trimmed) && nextHint) {
      /* only indent; hint shown as ghost on next line */
    }

    ed.value = v.slice(0, start) + insert + v.slice(end);
    ed.selectionStart = ed.selectionEnd = start + insert.length;
    notifyChange();
    return true;
  }

  function handleTab(e) {
    if (state.open && state.items.length) {
      e.preventDefault();
      applyCompletion(state.items[state.selected]);
      return true;
    }
    if (acceptGhost()) {
      e.preventDefault();
      return true;
    }
    return false;
  }

  function handleAutoPair(e) {
    if (e.key !== '"') return false;
    var ed = state.editor;
    var s = ed.selectionStart;
    var v = ed.value;
    if (v[s] === '"') {
      e.preventDefault();
      ed.selectionStart = ed.selectionEnd = s + 1;
      return true;
    }
  }

  function unindentSelection() {
    var ed = state.editor;
    var s = ed.selectionStart;
    var e = ed.selectionEnd;
    var v = ed.value;
    var lineStart = v.lastIndexOf('\n', s - 1) + 1;
    var lineEnd = v.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = v.length;
    var block = v.slice(lineStart, lineEnd);
    var lines = block.split('\n');
    var changed = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(INDENT) === 0) {
        lines[i] = lines[i].slice(INDENT.length);
        changed = true;
      } else if (lines[i].indexOf(' ') === 0) {
        lines[i] = lines[i].replace(/^ {1,4}/, '');
        changed = true;
      }
    }
    if (!changed) return;
    var newBlock = lines.join('\n');
    ed.value = v.slice(0, lineStart) + newBlock + v.slice(lineEnd);
    ed.selectionStart = lineStart;
    ed.selectionEnd = lineStart + newBlock.length;
    notifyChange();
  }

  function indentSelection() {
    var ed = state.editor;
    var s = ed.selectionStart;
    var e = ed.selectionEnd;
    var v = ed.value;
    var lineStart = v.lastIndexOf('\n', s - 1) + 1;
    var lineEnd = v.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = v.length;
    var block = v.slice(lineStart, lineEnd);
    var lines = block.split('\n').map(function (l) { return INDENT + l; });
    var newBlock = lines.join('\n');
    ed.value = v.slice(0, lineStart) + newBlock + v.slice(lineEnd);
    ed.selectionStart = s + INDENT.length;
    ed.selectionEnd = e + lines.length * INDENT.length;
    notifyChange();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeAutocomplete();
      hideGhost();
      return;
    }

    if (state.open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.selected = (state.selected + 1) % state.items.length;
        renderAutocomplete();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.selected = (state.selected - 1 + state.items.length) % state.items.length;
        renderAutocomplete();
        return;
      }
    }

    if (e.key === 'Enter') {
      if (handleEnter(e)) return;
    }

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        e.preventDefault();
        unindentSelection();
        return;
      }
      if (handleTab(e)) return;
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      indentSelection();
      return;
    }

    if (e.key === '"') {
      if (handleAutoPair(e)) return;
      var ed = state.editor;
      var s = ed.selectionStart;
      var v = ed.value;
      if (ed.selectionStart === ed.selectionEnd) {
        e.preventDefault();
        ed.value = v.slice(0, s) + '""' + v.slice(s);
        ed.selectionStart = ed.selectionEnd = s + 1;
        notifyChange();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault();
      var ed = state.editor;
      state.items = getCompletions(ed.value, ed.selectionStart);
      state.selected = 0;
      renderAutocomplete();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      toggleLineComment();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      duplicateLine();
    }
  }

  function toggleLineComment() {
    var ed = state.editor;
    if (!ed) return;
    var v = ed.value;
    var s = ed.selectionStart;
    var lineStart = v.lastIndexOf('\n', s - 1) + 1;
    var lineEnd = v.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = v.length;
    var line = v.slice(lineStart, lineEnd);
    var newLine;
    if (/^\s*#/.test(line)) {
      newLine = line.replace(/^(\s*)#\s?/, '$1');
    } else {
      newLine = line.replace(/^(\s*)/, '$1# ');
    }
    ed.value = v.slice(0, lineStart) + newLine + v.slice(lineEnd);
    ed.selectionStart = ed.selectionEnd = lineStart + newLine.length;
    notifyChange();
  }

  function duplicateLine() {
    var ed = state.editor;
    if (!ed) return;
    var v = ed.value;
    var s = ed.selectionStart;
    var lineStart = v.lastIndexOf('\n', s - 1) + 1;
    var lineEnd = v.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = v.length;
    var line = v.slice(lineStart, lineEnd);
    var insert = line + (lineEnd < v.length ? '\n' : '\n');
    ed.value = v.slice(0, lineEnd) + '\n' + line + v.slice(lineEnd);
    ed.selectionStart = ed.selectionEnd = lineEnd + 1 + line.length;
    notifyChange();
    flashMagic();
  }

  function init(editor, options) {
    if (!editor) return;
    state.editor = editor;
    state.onChange = options && options.onChange;
    state.onScroll = options && options.onScroll;

    var wrap = editor.closest('.kf-editor-wrap');
    if (!wrap) return;

    var stack = wrap.querySelector('.kf-editor-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'kf-editor-stack flex-grow-1 position-relative';
      editor.parentNode.insertBefore(stack, editor);
      stack.appendChild(editor);
    }

    state.acList = stack.querySelector('#kf-autocomplete') || document.getElementById('kf-autocomplete');
    if (!state.acList) {
      state.acList = document.createElement('ul');
      state.acList.id = 'kf-autocomplete';
      state.acList.className = 'kf-autocomplete d-none';
      state.acList.setAttribute('role', 'listbox');
      stack.appendChild(state.acList);
    }

    state.ghostBar = stack.querySelector('#kf-editor-ghost') || document.getElementById('kf-editor-ghost');
    if (!state.ghostBar) {
      state.ghostBar = document.createElement('div');
      state.ghostBar.id = 'kf-editor-ghost';
      state.ghostBar.className = 'kf-editor-ghost d-none';
      stack.appendChild(state.ghostBar);
    }

    state.chipsEl = stack.querySelector('#kf-editor-chips') || document.getElementById('kf-editor-chips');
    state.lineNosEl = wrap.querySelector('#ss-line-numbers');
    state.highlightEl = document.getElementById('kf-editor-highlight');
    state.guidesEl = document.getElementById('kf-editor-guides');

    var layer = document.getElementById('kf-editor-layer');
    if (!state.highlightEl && layer) {
      state.guidesEl = document.createElement('div');
      state.guidesEl.id = 'kf-editor-guides';
      state.guidesEl.className = 'kf-editor-guides';
      state.guidesEl.setAttribute('aria-hidden', 'true');
      state.highlightEl = document.createElement('pre');
      state.highlightEl.id = 'kf-editor-highlight';
      state.highlightEl.className = 'kf-editor-highlight';
      state.highlightEl.setAttribute('aria-hidden', 'true');
      layer.insertBefore(state.guidesEl, editor);
      layer.insertBefore(state.highlightEl, editor);
    }

    editor.classList.add('kf-editor-code-input');
    bindGutterDrag();
    bindChips();

    editor.setAttribute('autocomplete', 'off');
    editor.setAttribute('autocorrect', 'off');
    editor.setAttribute('autocapitalize', 'off');

    editor.addEventListener('input', function () {
      notifyChange();
    });
    editor.addEventListener('scroll', function () {
      syncHighlight();
      if (state.lineNosEl) state.lineNosEl.scrollTop = editor.scrollTop;
      if (state.onScroll) state.onScroll();
    });
    editor.addEventListener('keydown', onKeyDown);
    editor.addEventListener('keyup', updateCurrentLine);
    editor.addEventListener('click', function () {
      updateCurrentLine();
      refresh();
    });
    editor.addEventListener('select', updateCurrentLine);
    editor.addEventListener('blur', function () {
      setTimeout(function () {
        closeAutocomplete();
      }, 180);
    });

    syncHighlight();
    updateGutter();
    refresh();
  }

  function insertAtCursor(text) {
    var ed = state.editor;
    if (!ed) return;
    var pos = ed.selectionStart || ed.value.length;
    var prefix = ed.value.length > 0 && pos > 0 ? '\n' : '';
    var suffix = ed.value.length > 0 ? '\n' : '';
    insertText(pos, pos, prefix + text + suffix);
    flashMagic();
  }

  window.KiddySmartEditor = {
    init: init,
    refresh: refresh,
    insertAtCursor: insertAtCursor,
    notifyExternalChange: notifyChange,
    syncHighlight: syncHighlight,
    updateGutter: updateGutter,
  };
})();
