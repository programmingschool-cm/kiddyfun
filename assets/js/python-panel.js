/**
 * Phase C3 — Side-by-side Python preview
 */
(function () {
  'use strict';

  function buildPanel() {
    var el = document.getElementById('panel-python');
    if (!el) return;
    var code = '';
    var ed = document.getElementById('ss-editor');
    if (ed) code = ed.value;
    var py = window.KiddyPythonExport ? KiddyPythonExport.transpile(code) : '# Python export not loaded';
    el.innerHTML =
      '<h6 class="ss-panel-title">🐍 Python Bridge</h6>' +
      '<p class="small text-muted">Your KiddyFun code → Python (subset). Loops in Python use <code>for</code>.</p>' +
      '<pre class="kf-python-preview font-monospace small">' + escapeHtml(py) + '</pre>' +
      '<button type="button" class="btn btn-sm btn-outline-primary w-100" id="kf-python-refresh">Refresh</button>' +
      '<button type="button" class="btn btn-sm btn-primary w-100 mt-2" id="kf-python-dl">Download .py</button>';
    document.getElementById('kf-python-refresh').addEventListener('click', buildPanel);
    document.getElementById('kf-python-dl').addEventListener('click', function () {
      if (window.KiddyPythonExport) KiddyPythonExport.exportPython();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.KiddyPythonPanel = { buildPanel: buildPanel };
})();
