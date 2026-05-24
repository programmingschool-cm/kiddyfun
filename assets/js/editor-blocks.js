/**
 * KiddyFun block model — drag-drop, fold, line gutter
 */
(function () {
  'use strict';

  var INDENT_SIZE = 4;
  var BLOCK_START = /^(repeat\s+\d+\s+times|repeat\s+while\b|if\b|else\b|define\b|for\s+each\b)/i;
  var BLOCK_END = /^end\b/i;

  function getIndent(line) {
    var m = line.match(/^(\s*)/);
    if (!m) return 0;
    return m[1].replace(/\t/g, '    ').length;
  }

  function lineTrim(line) {
    return line.replace(/#.*$/, '').trim();
  }

  /** Movable line range: this line + deeper-indented followers */
  function getMovableRange(lines, lineIndex) {
    if (lineIndex < 0 || lineIndex >= lines.length) return null;
    var start = lineIndex;
    while (start > 0 && lines[start].trim() === '') start--;
    if (lines[start].trim() === '') return null;

    var baseIndent = getIndent(lines[start]);
    var end = start;
    for (var j = start + 1; j < lines.length; j++) {
      if (lines[j].trim() === '') {
        end = j;
        continue;
      }
      if (getIndent(lines[j]) > baseIndent) end = j;
      else break;
    }
    return { start: start, end: end, indent: baseIndent };
  }

  /** Block regions for visual markers (repeat/if/define … end) */
  function parseBlockRegions(lines) {
    var regions = [];
    var stack = [];
    for (var i = 0; i < lines.length; i++) {
      var t = lineTrim(lines[i]);
      if (!t) continue;
      if (BLOCK_END.test(t)) {
        if (stack.length) {
          var head = stack.pop();
          regions.push({
            start: head.line,
            end: i,
            type: head.type,
            header: lines[head.line].trim(),
          });
        }
      } else if (BLOCK_START.test(t)) {
        stack.push({ line: i, type: t.split(/\s/)[0].toLowerCase() });
      }
    }
    return regions;
  }

  function moveRange(lines, fromStart, fromEnd, toLine) {
    var block = lines.slice(fromStart, fromEnd + 1);
    var before = lines.slice(0, fromStart);
    var after = lines.slice(fromEnd + 1);
    var merged = before.concat(after);
    var insertAt = toLine;
    if (toLine > fromStart) insertAt = toLine - (fromEnd - fromStart + 1);
    insertAt = Math.max(0, Math.min(insertAt, merged.length));
    return merged.slice(0, insertAt).concat(block, merged.slice(insertAt));
  }

  function lineBlockInfo(lines, lineIndex) {
    var regions = parseBlockRegions(lines);
    for (var r = 0; r < regions.length; r++) {
      var reg = regions[r];
      if (lineIndex === reg.start) return { role: 'start', region: reg };
      if (lineIndex === reg.end) return { role: 'end', region: reg };
      if (lineIndex > reg.start && lineIndex < reg.end) return { role: 'inner', region: reg };
    }
    return { role: 'plain', region: null };
  }

  window.KiddyEditorBlocks = {
    getIndent: getIndent,
    getMovableRange: getMovableRange,
    parseBlockRegions: parseBlockRegions,
    moveRange: moveRange,
    lineBlockInfo: lineBlockInfo,
    INDENT_SIZE: INDENT_SIZE,
  };
})();
