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
      var missions = JSON.parse(localStorage.getItem('ss_completed_missions') || '[]');
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
      '<p class="small text-muted">This code lives on this device. A cloud class is created only for a teacher account in the Supabase dashboard.</p>' +
      '<div class="alert alert-secondary py-2 small mb-2">Class code: <strong id="kf-class-code">' + getClassCode() + '</strong></div>' +
      '<button type="button" class="btn btn-sm btn-outline-primary w-100 mb-2" id="kf-export-csv">📊 Export progress CSV</button>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-2" id="kf-print-worksheet">🖨️ Print worksheet</button>' +
      '<div id="kf-worksheet-print" class="kf-worksheet-box d-none"><h6>KiddyFun Worksheet</h6><p>1. scene "school" + Rafi appears</p><p>2. Rafi says "Hello!"</p><p>Class: <strong>' + getClassCode() + '</strong></p></div>' +
      '<p class="small text-muted mb-0">Parent summary: menu → Parent panel.</p>';
    document.getElementById('kf-export-csv').addEventListener('click', exportProgressCsv);
    document.getElementById('kf-print-worksheet').addEventListener('click', function () {
      var w = document.getElementById('kf-worksheet-print');
      if (w) { w.classList.remove('d-none'); window.print(); setTimeout(function () { w.classList.add('d-none'); }, 500); }
    });
  }

  window.KiddyTeacher = { buildPanel: buildPanel, getClassCode: getClassCode };
})();
