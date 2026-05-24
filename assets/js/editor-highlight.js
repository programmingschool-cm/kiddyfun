/**
 * KiddyFun syntax highlighting (overlay layer)
 */
(function () {
  'use strict';

  var MULTI_KW = [
    'repeat while', 'repeat', 'for each', 'narrator says', 'ask user', 'play sound',
    'score starts at', 'score starts', 'show word', 'show type of', 'show value of', 'show score',
    'random number from', 'is greater than or equal to', 'is less than or equal to',
    'is greater than', 'is less than', 'is not equal to', 'joined with', 'divided by',
    'add to', 'remove item', 'times', 'choice', 'correct', 'wrong', 'appears', 'moves right', 'moves left',
  ].sort(function (a, b) { return b.length - a.length; });

  var CTRL_KW = /^(if|else|end|repeat|while|define|call|return|for|each|break|continue|and|or|not|with|as)$/i;
  var DATA_KW = /^(set|to|const|list|item|in|of|type|value|empty|true|false|answer|user)$/i;
  var STAGE_KW = /^(appears|says|waves|smiles|jumps|flies|runs|walks|hides|shows|bows|nods|cheers|dances|claps|flaps|moves|right|left|wait|scene|play|sound|word|means)$/i;
  var ACTION_KW = /^(plus|minus|equals|from|remainder|remove|add|points|show|score|starts|at|second|seconds|number)$/i;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function findCommentIndex(line) {
    var inStr = false;
    var q = '';
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inStr) {
        if (ch === q) inStr = false;
      } else {
        if (ch === '"' || ch === "'") { inStr = true; q = ch; }
        else if (ch === '#') return i;
      }
    }
    return -1;
  }

  function highlightString(str, cls) {
    return '<span class="' + cls + '">' + esc(str) + '</span>';
  }

  function classifyWord(word, isCharName) {
    if (isCharName) return 'hl-char';
    var w = word.toLowerCase();
    if (CTRL_KW.test(w)) return 'hl-control';
    if (DATA_KW.test(w)) return 'hl-data';
    if (STAGE_KW.test(w)) return 'hl-stage';
    if (ACTION_KW.test(w)) return 'hl-action';
    if (/^\d+(\.\d+)?$/.test(word)) return 'hl-number';
    return 'hl-name';
  }

  function highlightSegment(text) {
    if (!text) return '';
    var html = '';
    var i = 0;
    var charMatch = text.match(/^(\s*)([A-Z][A-Za-z0-9]*)(?=\s)/);
    if (charMatch && charMatch.index === 0) {
      html += esc(charMatch[1]);
      html += '<span class="hl-char">' + esc(charMatch[2]) + '</span>';
      i = charMatch[0].length;
    }

    while (i < text.length) {
      var rest = text.slice(i);

      var multi = null;
      for (var m = 0; m < MULTI_KW.length; m++) {
        var kw = MULTI_KW[m];
        var re = new RegExp('^' + kw.replace(/\s+/g, '\\s+') + '(?=\\s|$)', 'i');
        if (re.test(rest)) { multi = kw; break; }
      }
      if (multi) {
        html += '<span class="hl-keyword">' + esc(rest.slice(0, multi.length)) + '</span>';
        i += multi.length;
        continue;
      }

      var strM = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
      if (strM) {
        var inner = strM[0];
        var isScene = /^\s*scene\s*$/i.test(text.slice(0, i)) || (i > 0 && /scene\s*$/i.test(text.slice(0, i)));
        html += highlightString(inner, isScene ? 'hl-scene-str' : 'hl-string');
        i += inner.length;
        continue;
      }

      var numM = rest.match(/^\d+(\.\d+)?/);
      if (numM) {
        html += '<span class="hl-number">' + esc(numM[0]) + '</span>';
        i += numM[0].length;
        continue;
      }

      var wordM = rest.match(/^[A-Za-z][\w]*/);
      if (wordM) {
        html += '<span class="' + classifyWord(wordM[0], false) + '">' + esc(wordM[0]) + '</span>';
        i += wordM[0].length;
        continue;
      }

      html += esc(rest[0]);
      i += 1;
    }
    return html;
  }

  function highlightLine(line) {
    if (/^\s*# @fold:/.test(line)) {
      return '<span class="hl-fold">' + esc(line) + '</span>';
    }
    if (/^\s*[A-Z][A-Za-z0-9]*\s+(appears|says|waves|walks|runs|jumps|flies|hides|shows)/i.test(line)) {
      var m = line.match(/^(\s*)([A-Z][A-Za-z0-9]*)(\s+)(.+)$/);
      if (m) {
        return esc(m[1]) + '<span class="hl-char">' + esc(m[2]) + '</span>' + esc(m[3]) +
          '<span class="hl-stage-line">' + highlightSegment(m[4]) + '</span>';
      }
    }
    var ci = findCommentIndex(line);
    var code = ci >= 0 ? line.slice(0, ci) : line;
    var comment = ci >= 0 ? line.slice(ci) : '';
    var html = highlightSegment(code);
    if (comment) html += '<span class="hl-comment">' + esc(comment) + '</span>';
    return html;
  }

  function highlightCode(code) {
    var lines = code.split('\n');
    var html = '';
    for (var i = 0; i < lines.length; i++) {
      html += '<div class="kf-hl-line" data-hl-line="' + i + '">' + highlightLine(lines[i]) + '\n</div>';
    }
    return html;
  }

  function indentGuides(code) {
    var lines = code.split('\n');
    var max = 0;
    lines.forEach(function (l) {
      var m = l.match(/^(\s*)/);
      var n = m ? Math.floor(m[1].replace(/\t/g, '    ').length / 4) : 0;
      if (n > max) max = n;
    });
    if (max < 1) return '';
    var g = '';
    for (var d = 1; d <= max; d++) {
      g += '<div class="kf-indent-guide" style="left:' + (14 + d * 16) + 'px"></div>';
    }
    return g;
  }

  window.KiddyEditorHighlight = {
    highlightCode: highlightCode,
    indentGuides: indentGuides,
    highlightLine: highlightLine,
  };
})();
