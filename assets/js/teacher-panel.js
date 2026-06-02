/**
 * Phase C1 — Teacher dashboard lite (class code + local progress export)
 */
(function () {
  'use strict';

  var KEY = 'kf_teacher_class';

  function getClassCode() {
    try {
      var c = localStorage.getItem(KEY);
      if (c) return c;
      c = 'KF-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem(KEY, c);
      return c;
    } catch (e) {
      return 'KF-DEMO';
    }
  }

  function exportProgressCsv() {
    var rows = [['type', 'key', 'value']];
    try {
      var missions = JSON.parse(localStorage.getItem('ss_missions_done') || '[]');
      missions.forEach(function (m) { rows.push(['mission', m, 'done']); });
    } catch (e) { /* ignore */ }
    try {
      var cur = JSON.parse(localStorage.getItem('kf_curriculum_done') || '[]');
      cur.forEach(function (l) { rows.push(['lesson', l, 'done']); });
    } catch (e) { /* ignore */ }
    try {
      var g = JSON.parse(localStorage.getItem('kf_gamification') || '{}');
      rows.push(['xp', 'total', String(g.xp || 0)]);
      rows.push(['streak', 'days', String(g.streak || 0)]);
    } catch (e) { /* ignore */ }
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kiddyfun-progress.csv';
    a.click();
    URL.revokeObjectURL(url);
    if (window.UI && UI.showToast) UI.showToast('📊 CSV downloaded');
  }

  function buildPanel() {
    var el = document.getElementById('panel-teacher');
    if (!el) return;
    el.innerHTML =
      '<h6 class="ss-panel-title">👩‍🏫 Teacher</h6>' +
      '<p class="small text-muted">Share this class code with students. Export progress from this device.</p>' +
      '<div class="alert alert-secondary py-2 small mb-2">Class code: <strong id="kf-class-code">' + getClassCode() + '</strong></div>' +
      '<button type="button" class="btn btn-sm btn-outline-primary w-100 mb-2" id="kf-export-csv">📊 Export progress CSV</button>' +
      '<p class="small text-muted mb-0">Parent summary: check XP and completed missions in the menu header.</p>';
    document.getElementById('kf-export-csv').addEventListener('click', exportProgressCsv);
  }

  window.KiddyTeacher = { buildPanel: buildPanel, getClassCode: getClassCode };
})();
