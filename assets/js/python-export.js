/**
 * E3 — Export KiddyFun code to Python (subset transpiler)
 */
(function () {
  'use strict';

  function transpile(code) {
    var lines = (code || '').split('\n');
    var out = ['# Generated from KiddyFun Code', 'import time', ''];
    var indent = 0;

    function emit(text) {
      var pad = '';
      for (var i = 0; i < indent; i++) pad += '    ';
      out.push(pad + text);
    }

    lines.forEach(function (line) {
      var t = line.trim();
      if (!t) {
        out.push('');
        return;
      }
      if (t.indexOf('#') === 0) {
        emit(t);
        return;
      }
      if (/^end\b/i.test(t)) {
        if (indent > 0) indent -= 1;
        return;
      }
      if (/^else\b/i.test(t)) {
        if (indent > 0) indent -= 1;
        emit('else:');
        indent += 1;
        return;
      }
      var m;
      if ((m = t.match(/^scene\s+"([^"]+)"/i))) {
        emit('print("Scene: ' + m[1] + '")');
      } else if ((m = t.match(/^narrator\s+says\s+"([^"]*)"/i))) {
        emit('print("[Narrator] ' + m[1].replace(/"/g, '\\"') + '")');
      } else if ((m = t.match(/^(\w+)\s+says\s+"([^"]*)"/i))) {
        emit('print("' + m[1] + ': ' + m[2].replace(/"/g, '\\"') + '")');
      } else if ((m = t.match(/^repeat\s+(\d+)\s+times/i))) {
        emit('for _ in range(' + m[1] + '):');
        indent += 1;
      } else if ((m = t.match(/^set\s+(\w+)\s+to\s+(.+)/i))) {
        emit(m[1] + ' = ' + pyExpr(m[2]));
      } else if ((m = t.match(/^if\s+(.+)/i))) {
        emit('if ' + pyCond(m[1]) + ':');
        indent += 1;
      } else if ((m = t.match(/^game\s+"([^"]*)"/i))) {
        emit('# Game: ' + m[1] + ' (run in KiddyFun game mode)');
      } else {
        emit('# ' + t);
      }
    });
    return out.join('\n');
  }

  function pyExpr(s) {
    s = s.trim();
    if (/^".*"$/.test(s)) return s;
    if (/^\d+(\.\d+)?$/.test(s)) return s;
    if (s === 'true' || s === 'false') return s.charAt(0).toUpperCase() + s.slice(1);
    return s.replace(/\bplus\b/gi, '+').replace(/\bminus\b/gi, '-')
      .replace(/\btimes\b/gi, '*').replace(/\bdivided by\b/gi, '/');
  }

  function pyCond(s) {
    return s.replace(/\bequals\b/gi, '==').replace(/\bis greater than\b/gi, '>')
      .replace(/\bis less than\b/gi, '<').replace(/\band\b/gi, 'and').replace(/\bor\b/gi, 'or');
  }

  function exportPython() {
    var ed = document.getElementById('ss-editor');
    if (!ed || !ed.value.trim()) {
      if (window.UI && UI.showAlert) UI.showAlert('Write code first!', { title: 'Export', icon: '🐍' });
      return;
    }
    var py = transpile(ed.value);
    var blob = new Blob([py], { type: 'text/x-python' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kiddyfun-export.py';
    a.click();
    URL.revokeObjectURL(url);
    if (window.UI && UI.showToast) UI.showToast('🐍 Python file downloaded');
  }

  window.KiddyPythonExport = { transpile: transpile, exportPython: exportPython };
})();
