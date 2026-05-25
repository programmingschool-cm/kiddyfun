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

  var LINE_ACTION_ICONS = {
    appears: '✨', says: '💬', waves: '👋', walks: '🚶', runs: '🏃', jumps: '⬆️',
    flies: '🪽', hides: '👻', shows: '👀', bows: '🙇', smiles: '😊', nods: '🙂', cheers: '🎉',
    dances: '💃', claps: '👏', scene: '🎬', wait: '⏸️',
  };

  var state = {
    editor: null,
    acList: null,
    ghostBar: null,
    highlightEl: null,
    guidesEl: null,
    lineNosEl: null,
    onChange: null,
    beginner: true,
    onScroll: null,
    items: [],
    selected: 0,
    open: false,
    ghostText: '',
    ghostInsert: '',
    replaceStart: 0,
    replaceEnd: 0,
    debounce: null,
    acLocked: false,
    acClickBound: false,
    drag: null,
    dropLine: null,
    gutterBound: false,
    foldedStore: {},
    touchDrag: null,
    touchGhost: null,
    diagnostics: [],
    lintDebounce: null,
    statusEls: null,
    suggestBtn: null,
  };

  var FOLD_STORAGE_PREFIX = 'kf-fold-';

  function foldStoreGet(id) {
    if (state.foldedStore[id]) return state.foldedStore[id];
    try {
      var raw = sessionStorage.getItem(FOLD_STORAGE_PREFIX + id);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function foldStoreSet(id, lines) {
    state.foldedStore[id] = lines;
    try {
      sessionStorage.setItem(FOLD_STORAGE_PREFIX + id, JSON.stringify(lines));
    } catch (e) { /* ignore */ }
  }

  function foldStoreDel(id) {
    delete state.foldedStore[id];
    try { sessionStorage.removeItem(FOLD_STORAGE_PREFIX + id); } catch (e) { /* ignore */ }
  }

  function restoreFoldsFromCode(code) {
    var lines = code.split('\n');
    lines.forEach(function (line) {
      var m = window.KiddyEditorBlocks && KiddyEditorBlocks.parseFoldMarker(line);
      if (m && !state.foldedStore[m.id]) {
        var stored = foldStoreGet(m.id);
        if (stored) state.foldedStore[m.id] = stored;
      }
    });
  }

  function expandForRun(code) {
    if (!window.KiddyEditorBlocks) return code;
    var lines = code.split('\n');
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var m = KiddyEditorBlocks.parseFoldMarker(lines[i]);
      if (m) {
        var hidden = foldStoreGet(m.id);
        if (hidden && hidden.length) out = out.concat(hidden);
      } else {
        out.push(lines[i]);
      }
    }
    return out.join('\n');
  }

  function foldBlockAt(startLine) {
    var ed = state.editor;
    if (!ed || !window.KiddyEditorBlocks) return;
    var lines = ed.value.split('\n');
    var regions = KiddyEditorBlocks.parseBlockRegions(lines);
    var reg = KiddyEditorBlocks.findRegionAtStart(regions, startLine);
    if (!reg || reg.end <= reg.start) return;

    var hidden = lines.slice(reg.start + 1, reg.end);
    if (!hidden.length) return;

    var id = 'b' + reg.start + 'n' + hidden.length;
    var headIndent = (lines[reg.start].match(/^(\s*)/) || ['', ''])[1];
    var marker = KiddyEditorBlocks.makeFoldMarker(id, hidden.length, headIndent);
    foldStoreSet(id, hidden);

    var newLines = lines.slice(0, reg.start + 1).concat([marker], lines.slice(reg.end));
    ed.value = newLines.join('\n');
    notifyChange();
    if (window.UI && UI.showToast) UI.showToast('▼ Block folded');
    if (window.KiddyAudio && KiddyAudio.playSound) KiddyAudio.playSound('pop');
  }

  function unfoldBlockAt(lineIndex) {
    var ed = state.editor;
    if (!ed || !window.KiddyEditorBlocks) return;
    var lines = ed.value.split('\n');
    var m = KiddyEditorBlocks.parseFoldMarker(lines[lineIndex]);
    if (!m) return;

    var hidden = foldStoreGet(m.id);
    if (!hidden) {
      if (window.UI && UI.showToast) UI.showToast('⚠️ Fold data missing — edit manually');
      return;
    }

    foldStoreDel(m.id);
    var newLines = lines.slice(0, lineIndex).concat(hidden, lines.slice(lineIndex + 1));
    ed.value = newLines.join('\n');
    notifyChange();
    if (window.UI && UI.showToast) UI.showToast('▶ Block expanded');
    if (window.KiddyAudio && KiddyAudio.playSound) KiddyAudio.playSound('pop');
  }

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
    var m = slice.match(/(#?[A-Za-z][\w]*)$/);
    if (!m) return { word: '', start: pos };
    return { word: m[1], start: pos - m[1].length };
  }

  function phraseBefore(text, pos) {
    var slice = text.slice(0, pos);
    var lineStart = slice.lastIndexOf('\n') + 1;
    var lineText = slice.slice(lineStart);
    var m = lineText.match(/([A-Za-z][\w]*(?:\s+[A-Za-z][\w]*)*)$/);
    if (!m) return { phrase: '', start: pos };
    return { phrase: m[1], start: pos - m[1].length };
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
      var key = (item.blockId || item.insert) + '|' + item.label;
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

    /* Character + space → suggest actions */
    var charSpaceMatch = info.line.slice(0, info.col).match(/^\s*([A-Z][\w]*)\s+$/);
    if (charSpaceMatch) {
      var charNm = charSpaceMatch[1];
      ACTIONS.forEach(function (a) {
        add({
          label: charNm + ' ' + a,
          insert: a,
          detail: '🎭 Action',
          score: 95,
          replaceStart: pos,
          replaceEnd: pos,
        });
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

    /* Snippets — also match multi-word keys against the phrase */
    var phrase = phraseBefore(text, pos).phrase.toLowerCase();
    SNIPPETS.forEach(function (sn) {
      var fs = fuzzyScore(word, sn.k);
      if (sn.k.indexOf(' ') >= 0 && phrase) {
        var pf = fuzzyScore(phrase, sn.k);
        if (pf > fs) fs = pf;
      }
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
    scheduleLint();
    updateStatusBar();
    if (state.onChange) state.onChange();
    refresh();
  }

  function scheduleLint() {
    clearTimeout(state.lintDebounce);
    state.lintDebounce = setTimeout(function () {
      runLint();
    }, 300);
  }

  function runLint() {
    if (!window.KiddyEditorLinter || !state.editor) {
      state.diagnostics = [];
      return;
    }
    state.diagnostics = KiddyEditorLinter.lintCode(state.editor.value);
    decorateGutterDiagnostics();
    updateStatusBar();
  }

  function decorateGutterDiagnostics() {
    var lineNos = state.lineNosEl;
    if (!lineNos) return;
    var byLine = {};
    state.diagnostics.forEach(function (d) {
      if (!byLine[d.line] || severityWeight(d.severity) > severityWeight(byLine[d.line].severity)) {
        byLine[d.line] = d;
      }
    });
    var rows = lineNos.querySelectorAll('.kf-ln-row');
    rows.forEach(function (row) {
      row.classList.remove('kf-ln-error', 'kf-ln-warn', 'kf-ln-info');
      row.removeAttribute('data-lint');
      var line = parseInt(row.getAttribute('data-line'), 10);
      var d = byLine[line];
      if (!d) return;
      var cls = d.severity === 'error' ? 'kf-ln-error'
        : d.severity === 'warning' ? 'kf-ln-warn' : 'kf-ln-info';
      row.classList.add(cls);
      row.setAttribute('data-lint', d.title + ' — ' + (d.fix || ''));
      row.setAttribute('title', d.title + '\n' + d.message + '\n💡 ' + (d.fix || ''));
    });
  }

  function severityWeight(s) {
    return s === 'error' ? 3 : s === 'warning' ? 2 : 1;
  }

  function updateStatusBar() {
    if (!state.statusEls || !state.editor) return;
    var ed = state.editor;
    var pos = ed.selectionStart;
    var before = ed.value.slice(0, pos);
    var lineNo = before.split('\n').length;
    var col = pos - (before.lastIndexOf('\n') + 1) + 1;

    if (state.statusEls.pos) {
      state.statusEls.pos.textContent = 'Ln ' + lineNo + ', Col ' + col;
    }

    if (state.statusEls.block) {
      var depth = blockDepthAt(ed.value, lineNo - 1);
      var ctx = currentBlockContext(ed.value, lineNo - 1);
      state.statusEls.block.textContent = ctx || (depth > 0 ? 'In block' : 'Top level');
    }

    if (state.statusEls.health && window.KiddyEditorLinter) {
      var sum = KiddyEditorLinter.summarize(state.diagnostics);
      var el = state.statusEls.health;
      el.classList.remove('kf-status-health-ok', 'kf-status-health-warn', 'kf-status-health-err');
      if (sum.errors > 0) {
        el.classList.add('kf-status-health-err');
        el.textContent = '⚠ ' + sum.errors + ' problem' + (sum.errors > 1 ? 's' : '');
        el.title = 'Click a red dot in the gutter for details';
      } else if (sum.warnings > 0) {
        el.classList.add('kf-status-health-warn');
        el.textContent = '! ' + sum.warnings + ' tip' + (sum.warnings > 1 ? 's' : '');
        el.title = 'Hover the yellow dot for a hint';
      } else {
        el.classList.add('kf-status-health-ok');
        el.textContent = '✓ Clean';
        el.title = 'No problems';
      }
    }
  }

  function currentBlockContext(code, lineNo) {
    var lines = code.split('\n');
    var stack = [];
    for (var i = 0; i <= lineNo && i < lines.length; i++) {
      var t = lines[i].replace(/^\s+/, '').replace(/#.*$/, '').trim();
      if (!t) continue;
      if (/^end\b/i.test(t)) stack.pop();
      else if (/^repeat\s+(\d+)\s+times/i.test(t)) {
        var n = (t.match(/repeat\s+(\d+)/i) || [, ''])[1];
        stack.push('🔁 repeat ' + n + '×');
      } else if (/^repeat\s+while/i.test(t)) stack.push('🔁 while');
      else if (/^if\b/i.test(t)) stack.push('🧠 if');
      else if (/^else\b/i.test(t)) { stack.pop(); stack.push('🧠 else'); }
      else if (/^define\s+([A-Za-z][\w]*)/i.test(t)) {
        var name = t.match(/define\s+([A-Za-z][\w]*)/i)[1];
        stack.push('⚙️ ' + name);
      } else if (/^for\s+each\b/i.test(t)) stack.push('📋 for each');
    }
    return stack.length ? stack.join(' › ') : '';
  }

  function syncHighlight() {
    var ed = state.editor;
    if (!ed || !state.highlightEl || !window.KiddyEditorHighlight || state.beginner) return;
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
    if (!ed || !lineNos) return;

    var lines = ed.value.split('\n');

    if (state.beginner) {
      var simple = '';
      for (var s = 0; s < lines.length; s++) {
        simple += '<div class="kf-ln-row kf-ln-simple" data-line="' + s + '">' +
          '<span class="kf-ln-num">' + (s + 1) + '</span></div>';
      }
      if (!lines.length) {
        simple = '<div class="kf-ln-row kf-ln-simple" data-line="0"><span class="kf-ln-num">1</span></div>';
      }
      lineNos.innerHTML = simple;
      lineNos.scrollTop = ed.scrollTop;
      decorateGutterDiagnostics();
      return;
    }

    if (!window.KiddyEditorBlocks) return;

    var regions = KiddyEditorBlocks.parseBlockRegions(lines);
    var html = '';
    for (var i = 0; i < lines.length; i++) {
      var info = KiddyEditorBlocks.lineBlockInfo(lines, i);
      var range = KiddyEditorBlocks.getMovableRange(lines, i);
      var isFoldLine = KiddyEditorBlocks.isFoldMarker(lines[i]);
      var canDrag = range && range.start === i && lines[i].trim() !== '' && !isFoldLine;
      var roleCls = info.role === 'start' ? ' kf-ln-block-start' :
        info.role === 'end' ? ' kf-ln-block-end' :
        info.role === 'inner' ? ' kf-ln-block-inner' : '';
      if (isFoldLine) roleCls += ' kf-ln-folded-line';

      var actM = lines[i].match(/^\s*[A-Za-z][\w]*\s+(\w+)/);
      var actIcon = actM && LINE_ACTION_ICONS[actM[1].toLowerCase()] ? LINE_ACTION_ICONS[actM[1].toLowerCase()] : '';
      if (actIcon) roleCls += ' kf-ln-action-line';

      var reg = info.role === 'start' ? KiddyEditorBlocks.findRegionAtStart(regions, i) : null;
      var nextIsFold = reg && lines[i + 1] && KiddyEditorBlocks.isFoldMarker(lines[i + 1]);
      var canFold = reg && reg.end > reg.start && !nextIsFold;

      html += '<div class="kf-ln-row' + roleCls + '" data-line="' + i + '">';
      html += canDrag
        ? '<span class="kf-ln-drag" draggable="true" title="Drag to move" aria-label="Drag">⠿</span>'
        : '<span class="kf-ln-drag-placeholder" aria-hidden="true"></span>';
      if (canFold) {
        html += '<span class="kf-ln-fold" data-fold="' + i + '" title="Fold block" aria-label="Fold">▼</span>';
      } else if (isFoldLine) {
        html += '<span class="kf-ln-unfold" data-unfold="' + i + '" title="Expand block" aria-label="Expand">▶</span>';
      } else if (actIcon) {
        html += '<span class="kf-ln-act-icon" title="Stage action">' + actIcon + '</span>';
      } else {
        html += '<span class="kf-ln-fold-placeholder" aria-hidden="true"></span>';
      }
      html += '<span class="kf-ln-num">' + (i + 1) + '</span></div>';
    }
    lineNos.innerHTML = html;
    lineNos.scrollTop = ed.scrollTop;
    decorateGutterDiagnostics();
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
      var foldBtn = e.target.closest('.kf-ln-fold');
      if (foldBtn) {
        e.preventDefault();
        e.stopPropagation();
        foldBlockAt(parseInt(foldBtn.getAttribute('data-fold'), 10));
        return;
      }
      var unfoldBtn = e.target.closest('.kf-ln-unfold');
      if (unfoldBtn) {
        e.preventDefault();
        e.stopPropagation();
        unfoldBlockAt(parseInt(unfoldBtn.getAttribute('data-unfold'), 10));
        return;
      }
      var dragHandle = e.target.closest('.kf-ln-drag');
      if (dragHandle) return;

      var row = e.target.closest('.kf-ln-row');
      if (!row || !state.editor) return;
      var line = parseInt(row.getAttribute('data-line'), 10);
      if (window.KiddyEditorBlocks.isFoldMarker(state.editor.value.split('\n')[line])) {
        unfoldBlockAt(line);
        return;
      }
      var lines = state.editor.value.split('\n');
      var pos = 0;
      for (var i = 0; i < line && i < lines.length; i++) pos += lines[i].length + 1;
      state.editor.focus();
      state.editor.selectionStart = state.editor.selectionEnd = pos;
      updateCurrentLine();
    });

    bindTouchDrag(lineNos);
  }

  function bindTouchDrag(lineNos) {
    function clearTouchUI() {
      if (state.touchGhost && state.touchGhost.parentNode) state.touchGhost.remove();
      state.touchGhost = null;
      state.touchDrag = null;
      lineNos.querySelectorAll('.kf-ln-dragging, .kf-ln-drop-target').forEach(function (el) {
        el.classList.remove('kf-ln-dragging', 'kf-ln-drop-target');
      });
    }

    function rowAtTouch(touch) {
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      return el && el.closest('.kf-ln-row');
    }

    lineNos.addEventListener('touchstart', function (e) {
      var handle = e.target.closest('.kf-ln-drag');
      if (!handle || !state.editor) return;
      var row = handle.closest('.kf-ln-row');
      if (!row) return;
      var line = parseInt(row.getAttribute('data-line'), 10);
      var lines = state.editor.value.split('\n');
      var range = KiddyEditorBlocks.getMovableRange(lines, line);
      if (!range) return;

      state.touchDrag = { fromStart: range.start, fromEnd: range.end };
      row.classList.add('kf-ln-dragging');

      state.touchGhost = document.createElement('div');
      state.touchGhost.className = 'kf-touch-drag-ghost';
      state.touchGhost.textContent = '↕ Moving ' + (range.end - range.start + 1) + ' lines';
      document.body.appendChild(state.touchGhost);

      var t = e.touches[0];
      state.touchGhost.style.left = (t.clientX + 12) + 'px';
      state.touchGhost.style.top = (t.clientY - 20) + 'px';

      if (window.KiddyAudio && KiddyAudio.playSound) KiddyAudio.playSound('pop');
    }, { passive: true });

    lineNos.addEventListener('touchmove', function (e) {
      if (!state.touchDrag) return;
      e.preventDefault();
      var t = e.touches[0];
      if (state.touchGhost) {
        state.touchGhost.style.left = (t.clientX + 12) + 'px';
        state.touchGhost.style.top = (t.clientY - 20) + 'px';
      }
      lineNos.querySelectorAll('.kf-ln-drop-target').forEach(function (el) {
        el.classList.remove('kf-ln-drop-target');
      });
      var row = rowAtTouch(t);
      if (row) {
        row.classList.add('kf-ln-drop-target');
        state.dropLine = parseInt(row.getAttribute('data-line'), 10);
      }
    }, { passive: false });

    lineNos.addEventListener('touchend', function (e) {
      if (!state.touchDrag || !state.editor) {
        clearTouchUI();
        return;
      }
      var t = e.changedTouches[0];
      var row = rowAtTouch(t);
      var toLine = row ? parseInt(row.getAttribute('data-line'), 10) : state.dropLine;
      if (toLine != null && !(toLine >= state.touchDrag.fromStart && toLine <= state.touchDrag.fromEnd)) {
        var lines = state.editor.value.split('\n');
        var moved = KiddyEditorBlocks.moveRange(
          lines, state.touchDrag.fromStart, state.touchDrag.fromEnd, toLine
        );
        state.editor.value = moved.join('\n');
        flashMagic();
        notifyChange();
        if (window.UI && UI.showToast) UI.showToast('↕️ Block moved!');
      }
      clearTouchUI();
      state.dropLine = null;
    });

    lineNos.addEventListener('touchcancel', clearTouchUI);
  }


  function closeAutocomplete() {
    state.open = false;
    state.items = [];
    state.selected = 0;
    if (state.acList) {
      state.acList.classList.add('d-none');
      state.acList.classList.remove('kf-ac-above');
      state.acList.innerHTML = '';
      state.acList.style.top = '';
      state.acList.style.left = '';
    }
  }

  function lockAutocomplete() {
    state.acLocked = true;
    clearTimeout(state.debounce);
    closeAutocomplete();
  }

  function unlockAutocomplete() {
    state.acLocked = false;
  }

  function bindAutocompleteClicks() {
    if (!state.acList || state.acClickBound) return;
    state.acClickBound = true;
    state.acList.addEventListener('mousedown', function (e) {
      var item = e.target.closest('.kf-ac-item');
      if (!item || !state.items.length) return;
      e.preventDefault();
      e.stopPropagation();
      var idx = parseInt(item.getAttribute('data-idx'), 10);
      if (!isNaN(idx) && state.items[idx]) applyCompletion(state.items[idx]);
    });
    state.acList.addEventListener('touchstart', function (e) {
      var item = e.target.closest('.kf-ac-item');
      if (!item || !state.items.length) return;
      e.preventDefault();
      var idx = parseInt(item.getAttribute('data-idx'), 10);
      if (!isNaN(idx) && state.items[idx]) applyCompletion(state.items[idx]);
    }, { passive: false });
  }

  var CARET_MIRROR_PROPS = [
    'direction', 'boxSizing',
    'width', 'height',
    'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
    'lineHeight', 'fontFamily',
    'textAlign', 'textTransform', 'textIndent', 'textDecoration',
    'letterSpacing', 'wordSpacing',
    'tabSize', 'MozTabSize',
    'whiteSpace', 'wordWrap', 'overflowWrap',
  ];

  function getCaretCoords(textarea, position) {
    var div = document.createElement('div');
    div.setAttribute('aria-hidden', 'true');
    var style = div.style;
    var computed = window.getComputedStyle(textarea);

    style.position = 'absolute';
    style.visibility = 'hidden';
    style.top = '0';
    style.left = '-9999px';
    style.whiteSpace = 'pre';
    style.wordWrap = 'normal';
    style.overflowWrap = 'normal';
    style.overflow = 'hidden';

    CARET_MIRROR_PROPS.forEach(function (prop) {
      try { style[prop] = computed[prop]; } catch (e) { /* ignore */ }
    });

    document.body.appendChild(div);

    var value = textarea.value.substring(0, position);
    var rest = textarea.value.substring(position) || '.';
    div.textContent = value;
    var span = document.createElement('span');
    span.textContent = rest;
    div.appendChild(span);

    var lineHeight = parseInt(computed.lineHeight, 10) || 28;
    var rect = {
      top: span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0),
      left: span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0),
      height: lineHeight,
    };

    document.body.removeChild(div);
    return rect;
  }

  function positionAutocomplete() {
    var list = state.acList;
    var ed = state.editor;
    if (!list || !ed || list.classList.contains('d-none')) return;
    var parent = list.offsetParent;
    if (!parent) return;

    var coords;
    try { coords = getCaretCoords(ed, ed.selectionStart); }
    catch (e) { return; }

    var edRect = ed.getBoundingClientRect();
    var parentRect = parent.getBoundingClientRect();

    var caretViewportTop = edRect.top + coords.top - ed.scrollTop;
    var caretViewportLeft = edRect.left + coords.left - ed.scrollLeft;

    var listWidth = list.offsetWidth || 280;
    var listHeight = list.offsetHeight || 180;

    var top = caretViewportTop - parentRect.top + coords.height + 8;
    var left = caretViewportLeft - parentRect.left;

    if (left + listWidth > parentRect.width - 8) {
      left = Math.max(8, parentRect.width - listWidth - 8);
    }
    if (left < 8) left = 8;

    var viewportH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    var viewportOffset = (window.visualViewport && window.visualViewport.offsetTop) || 0;
    var caretFromVisualTop = caretViewportTop - viewportOffset;
    var above = false;
    var spaceBelow = viewportH - (caretFromVisualTop + coords.height + 8);
    var spaceAbove = caretFromVisualTop - 8;
    if (spaceBelow < listHeight + 16 && spaceAbove > spaceBelow) {
      top = caretViewportTop - parentRect.top - listHeight - 8;
      above = true;
    }

    list.classList.toggle('kf-ac-above', above);
    list.style.left = left + 'px';
    list.style.top = Math.max(0, top) + 'px';
    list.style.right = 'auto';
    list.style.bottom = 'auto';
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
    var html = '<li class="kf-ac-hint">↑↓ choose · ⏎ pick · Esc close</li>';
    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      html += '<li class="kf-ac-item' + (i === state.selected ? ' active' : '') + '" data-idx="' + i + '">' +
        '<span class="kf-ac-label">' + esc(it.label) + '</span>' +
        '<span class="kf-ac-detail">' + esc(it.detail || '') + '</span></li>';
    }
    list.innerHTML = html;
    var active = list.querySelector('.kf-ac-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
    positionAutocomplete();
  }

  function applyCompletion(item) {
    if (!item) return;
    lockAutocomplete();
    hideGhost();
    var rs = item.replaceStart != null ? item.replaceStart : state.replaceStart;
    var re = item.replaceEnd != null ? item.replaceEnd : state.replaceEnd;
    insertText(rs, re, item.insert);
    flashMagic();
  }

  function acceptGhost() {
    if (!state.ghostInsert) return false;
    lockAutocomplete();
    insertText(state.replaceStart, state.replaceEnd, state.ghostInsert);
    hideGhost();
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
      if (state.acLocked) {
        closeAutocomplete();
        return;
      }
      var ed = state.editor;
      if (!ed) return;
      var pos = ed.selectionStart;
      var wb = wordBefore(ed.value, pos);
      var wordLen = wb.word.trim().length;
      state.items = getCompletions(ed.value, pos);

      var minWord = 1;
      if (state.items.length && wordLen >= minWord) {
        state.selected = 0;
        state.replaceStart = state.items[0].replaceStart != null ? state.items[0].replaceStart : wb.start;
        state.replaceEnd = pos;
        renderAutocomplete();
      } else {
        closeAutocomplete();
      }

      if (state.beginner) {
        hideGhost();
      } else {
        updateGhost();
      }
    }, 120);
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

    var atLineEnd = start === info.lineEnd;
    if (atLineEnd && window.KiddyEditorLinter && KiddyEditorLinter.autoCorrectOnEnter) {
      var corrected = KiddyEditorLinter.autoCorrectOnEnter(line);
      if (corrected && corrected !== line) {
        v = v.slice(0, info.lineStart) + corrected + v.slice(info.lineEnd);
        start = info.lineStart + corrected.length;
        end = start;
        ed.value = v;
        ed.selectionStart = ed.selectionEnd = start;
        line = corrected;
        trimmed = line.replace(/^\s+/, '');
        indent = line.match(/^(\s*)/)[1];
        flashMagic();
      }
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
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      var typing = e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete';
      if (typing && e.key !== 'Enter') unlockAutocomplete();
    }

    if (e.key === 'Escape') {
      unlockAutocomplete();
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
      unlockAutocomplete();
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
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === '[' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      var ln = state.editor.value.slice(0, state.editor.selectionStart).split('\n').length - 1;
      foldBlockAt(ln);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === ']' || e.key === 'ArrowRight')) {
      e.preventDefault();
      var ln2 = state.editor.value.slice(0, state.editor.selectionStart).split('\n').length - 1;
      var lns = state.editor.value.split('\n');
      if (window.KiddyEditorBlocks.isFoldMarker(lns[ln2])) unfoldBlockAt(ln2);
      else {
        var regions = window.KiddyEditorBlocks.parseBlockRegions(lns);
        var reg = window.KiddyEditorBlocks.findRegionAtStart(regions, ln2);
        if (reg && lns[reg.start + 1] && window.KiddyEditorBlocks.isFoldMarker(lns[reg.start + 1])) {
          unfoldBlockAt(reg.start + 1);
        }
      }
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
    bindAutocompleteClicks();

    state.ghostBar = stack.querySelector('#kf-editor-ghost') || document.getElementById('kf-editor-ghost');
    if (!state.ghostBar) {
      state.ghostBar = document.createElement('div');
      state.ghostBar.id = 'kf-editor-ghost';
      state.ghostBar.className = 'kf-editor-ghost d-none';
      stack.appendChild(state.ghostBar);
    }

    state.lineNosEl = wrap.querySelector('#ss-line-numbers');
    state.highlightEl = document.getElementById('kf-editor-highlight');
    state.guidesEl = document.getElementById('kf-editor-guides');

    state.statusEls = {
      pos: document.getElementById('kf-status-pos'),
      block: document.getElementById('kf-status-block'),
      health: document.getElementById('kf-status-health'),
    };
    state.suggestBtn = document.getElementById('btn-suggest');
    if (state.suggestBtn) {
      state.suggestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        editor.focus();
        unlockAutocomplete();
        state.items = getCompletions(editor.value, editor.selectionStart);
        state.selected = 0;
        renderAutocomplete();
      });
    }

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

    state.beginner = !(options && options.beginner === false);
    wrap.classList.add('kf-beginner');
    if (state.beginner) wrap.classList.add('kf-editor-simple');

    bindGutterDrag();

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
      if (state.open) positionAutocomplete();
    });
    window.addEventListener('resize', function () {
      if (state.open) positionAutocomplete();
    });
    editor.addEventListener('keydown', onKeyDown);
    editor.addEventListener('keyup', function () {
      updateCurrentLine();
      updateStatusBar();
    });
    editor.addEventListener('click', function () {
      updateCurrentLine();
      updateStatusBar();
      if (!state.acLocked) refresh();
    });
    editor.addEventListener('select', updateCurrentLine);
    editor.addEventListener('blur', function () {
      setTimeout(function () {
        closeAutocomplete();
      }, 180);
    });

    restoreFoldsFromCode(editor.value);
    syncHighlight();
    updateGutter();
    runLint();
    updateStatusBar();
    refresh();
  }

  function insertAtCursor(text) {
    var ed = state.editor;
    if (!ed) return;
    var pos = ed.selectionStart || ed.value.length;
    var needsNl = ed.value.length > 0 && pos > 0 && ed.value[pos - 1] !== '\n';
    var prefix = needsNl ? '\n' : '';
    insertText(pos, pos, prefix + text);
    flashMagic();
    notifyChange();
  }

  window.KiddySmartEditor = {
    init: init,
    refresh: refresh,
    insertAtCursor: insertAtCursor,
    notifyExternalChange: notifyChange,
    flashMagic: flashMagic,
    syncHighlight: syncHighlight,
    updateGutter: updateGutter,
    expandForRun: expandForRun,
    foldBlockAt: foldBlockAt,
    unfoldBlockAt: unfoldBlockAt,
  };
})();
