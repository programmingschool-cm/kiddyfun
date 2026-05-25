/**
 * KiddyFun Editor Linter — live syntax check, friendly hints, auto-corrections
 */
(function () {
  'use strict';

  var KNOWN_CHARS = ['Rafi', 'Mina', 'Lion', 'Bird', 'Teacher', 'Robot', 'Cat', 'Dog'];
  var ACTION_WORDS = [
    'appears', 'says', 'waves', 'smiles', 'jumps', 'flies', 'runs', 'walks',
    'moves', 'hides', 'shows', 'bows', 'nods', 'cheers', 'dances', 'claps', 'flaps'
  ];

  var TYPOS = {
    'say': 'says',
    'sayes': 'says',
    'wave': 'waves',
    'jump': 'jumps',
    'run': 'runs',
    'walk': 'walks',
    'fly': 'flies',
    'smile': 'smiles',
    'sceen': 'scene',
    'scen': 'scene',
    'sence': 'scene',
    'apear': 'appears',
    'appear': 'appears',
    'apears': 'appears',
    'reapeat': 'repeat',
    'repate': 'repeat',
    'repeats': 'repeat',
    'tims': 'times',
    'narator': 'narrator',
    'narrater': 'narrator',
  };

  var BLOCK_STARTERS = /^(repeat\s+\d+\s+times|repeat\s+while\b|if\b|else\b|define\b|for\s+each\b)/i;

  function lintCode(code) {
    var diagnostics = [];

    if (!code || !code.trim()) return diagnostics;

    var lines = code.split('\n');
    var blockStack = [];

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var trimmed = raw.replace(/^\s+/, '').replace(/#.*$/, '').trim();
      if (!trimmed) continue;

      var openQuotes = 0;
      for (var c = 0; c < raw.length; c++) {
        if (raw[c] === '"') openQuotes++;
        if (raw[c] === '#') break;
      }
      if (openQuotes % 2 !== 0) {
        diagnostics.push({
          line: i,
          severity: 'error',
          title: '✏️ Missing closing "',
          message: 'You opened a quote but never closed it.',
          fix: 'Add a closing " at the end of the text.',
        });
      }

      var firstWord = (trimmed.match(/^([A-Za-z]+)/) || [, ''])[1].toLowerCase();
      if (TYPOS[firstWord]) {
        diagnostics.push({
          line: i,
          severity: 'warning',
          title: '🤔 Did you mean "' + TYPOS[firstWord] + '"?',
          message: '"' + firstWord + '" might be a typo.',
          fix: 'Try: ' + TYPOS[firstWord],
          autoFix: { from: firstWord, to: TYPOS[firstWord] },
        });
      }

      var secondMatch = trimmed.match(/^([A-Za-z]+)\s+([A-Za-z]+)/);
      if (secondMatch) {
        var second = secondMatch[2].toLowerCase();
        if (TYPOS[second] && ACTION_WORDS.indexOf(TYPOS[second]) >= 0) {
          diagnostics.push({
            line: i,
            severity: 'warning',
            title: '🤔 Did you mean "' + TYPOS[second] + '"?',
            message: '"' + second + '" looks like a typo.',
            fix: 'Try: ' + TYPOS[second],
            autoFix: { from: second, to: TYPOS[second] },
          });
        }
      }

      if (/^scene\b/i.test(trimmed) && !/scene\s+"[^"]*"/i.test(trimmed)) {
        diagnostics.push({
          line: i,
          severity: 'error',
          title: '🎬 Scene needs quotes',
          message: 'Scene name must be in quotes.',
          fix: 'Try: scene "school"',
        });
      }

      if (/^repeat\b/i.test(trimmed)) {
        if (!/^repeat\s+(\d+\s+times|while\b)/i.test(trimmed)) {
          diagnostics.push({
            line: i,
            severity: 'error',
            title: '🔁 Repeat needs a count',
            message: 'Use: repeat N times, or repeat while …',
            fix: 'Try: repeat 3 times',
          });
        }
        blockStack.push({ type: 'repeat', line: i });
      } else if (/^if\b/i.test(trimmed)) {
        blockStack.push({ type: 'if', line: i });
      } else if (/^define\b/i.test(trimmed)) {
        if (!/^define\s+[A-Za-z][\w]*/i.test(trimmed)) {
          diagnostics.push({
            line: i,
            severity: 'error',
            title: '⚙️ Define needs a name',
            message: 'Function name is missing.',
            fix: 'Try: define myFunction',
          });
        }
        blockStack.push({ type: 'define', line: i });
      } else if (/^for\s+each\b/i.test(trimmed)) {
        blockStack.push({ type: 'for', line: i });
      } else if (/^end\b/i.test(trimmed)) {
        if (!blockStack.length) {
          diagnostics.push({
            line: i,
            severity: 'error',
            title: '⚠️ Extra "end"',
            message: 'No open block here — remove this end.',
            fix: 'Delete this line.',
          });
        } else {
          blockStack.pop();
        }
      } else if (/^set\b/i.test(trimmed) && !/^set\s+[A-Za-z]\w*\s+to\b/i.test(trimmed)) {
        diagnostics.push({
          line: i,
          severity: 'error',
          title: '📦 Use "set … to …"',
          message: 'set needs a variable name and "to".',
          fix: 'Try: set name to "Rafi"',
        });
      }

      var charLine = trimmed.match(/^([a-z][\w]*)\s+(appears|says|waves|smiles|jumps|flies|runs|walks|moves|hides|shows|bows|nods|cheers|dances|claps|flaps)\b/);
      if (charLine) {
        var name = charLine[1];
        if (name !== name.toLowerCase() || /^[a-z]/.test(name)) {
          diagnostics.push({
            line: i,
            severity: 'info',
            title: '🧑 Capitalize "' + name + '"',
            message: 'Character names start with a capital letter.',
            fix: 'Try: ' + (name.charAt(0).toUpperCase() + name.slice(1)) + ' ' + charLine[2],
            autoFix: { fromLine: i, raw: raw, capitalize: name },
          });
        }
      }
    }

    blockStack.forEach(function (b) {
      diagnostics.push({
        line: b.line,
        severity: 'error',
        title: '🔚 Block needs "end"',
        message: 'This ' + b.type + ' block is not closed.',
        fix: 'Add "end" on a new line after the block.',
      });
    });

    return diagnostics;
  }

  function autoCorrectOnEnter(lineText) {
    if (!lineText) return null;
    var indent = (lineText.match(/^(\s*)/) || ['', ''])[1];
    var rest = lineText.slice(indent.length);

    var charLine = rest.match(/^([a-z][\w]*)(\s+)(appears|says|waves|smiles|jumps|flies|runs|walks|moves|hides|shows|bows|nods|cheers|dances|claps|flaps)\b(.*)$/);
    if (charLine) {
      var name = charLine[1].charAt(0).toUpperCase() + charLine[1].slice(1);
      return indent + name + charLine[2] + charLine[3] + charLine[4];
    }

    var firstWord = (rest.match(/^([A-Za-z]+)/) || [, ''])[1].toLowerCase();
    if (firstWord && TYPOS[firstWord]) {
      var replaced = rest.replace(new RegExp('^' + firstWord, 'i'), TYPOS[firstWord]);
      return indent + replaced;
    }

    var twoWords = rest.match(/^([A-Z][\w]*\s+)([a-z][\w]*)(.*)$/);
    if (twoWords) {
      var second = twoWords[2].toLowerCase();
      if (TYPOS[second] && ACTION_WORDS.indexOf(TYPOS[second]) >= 0) {
        return indent + twoWords[1] + TYPOS[second] + twoWords[3];
      }
    }

    return null;
  }

  function summarize(diagnostics) {
    var errors = 0, warnings = 0, infos = 0;
    diagnostics.forEach(function (d) {
      if (d.severity === 'error') errors++;
      else if (d.severity === 'warning') warnings++;
      else infos++;
    });
    return { errors: errors, warnings: warnings, infos: infos, total: diagnostics.length };
  }

  window.KiddyEditorLinter = {
    lintCode: lintCode,
    autoCorrectOnEnter: autoCorrectOnEnter,
    summarize: summarize,
    KNOWN_CHARS: KNOWN_CHARS,
  };
})();
