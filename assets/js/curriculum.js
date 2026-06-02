/**
 * Phase B2 — Structured curriculum (lessons panel)
 */
(function () {
  'use strict';

  var data = null;
  var KEY = 'kf_curriculum_done';

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function saveDone(ids) {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* ignore */ }
  }

  function isDone(id) {
    return loadDone().indexOf(id) >= 0;
  }

  function markDone(id) {
    var d = loadDone();
    if (d.indexOf(id) < 0) {
      d.push(id);
      saveDone(d);
      if (window.KiddyGamification && KiddyGamification.addXp) KiddyGamification.addXp(25);
    }
  }

  function fetchData(cb) {
    if (data) { cb(data); return; }
    fetch('assets/data/curriculum.json')
      .then(function (r) { return r.json(); })
      .then(function (j) { data = j; cb(j); })
      .catch(function () {
        data = { levels: [] };
        cb(data);
      });
  }

  function buildPanel() {
    var el = document.getElementById('panel-lessons');
    if (!el) return;
    fetchData(function (cur) {
      var html = '<h6 class="ss-panel-title">📚 30-Lesson Path</h6>';
      html += '<p class="small text-muted">Complete lessons to unlock badges and XP.</p>';
      (cur.levels || []).forEach(function (lvl) {
        html += '<div class="kf-lesson-level mb-2"><div class="fw-bold small">Level ' + lvl.id + ': ' + lvl.title + '</div>';
        (lvl.lessons || []).forEach(function (les) {
          var done = isDone(les.id);
          html += '<div class="kf-lesson-card' + (done ? ' kf-lesson-done' : '') + '" data-lesson="' + les.id + '">';
          html += '<div class="d-flex justify-content-between"><span>' + (done ? '✅ ' : '🔒 ') + les.title + '</span>';
          html += '<span class="small text-muted">' + (done ? les.badge : '') + '</span></div>';
          html += '<p class="small mb-1">' + les.goal + '</p>';
          html += '<button type="button" class="btn btn-sm btn-outline-primary kf-lesson-start" data-starter="' + encodeURIComponent(les.starter) + '" data-id="' + les.id + '">Start</button>';
          html += '</div>';
        });
        html += '</div>';
      });
      el.innerHTML = html;
      el.querySelectorAll('.kf-lesson-start').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ed = document.getElementById('ss-editor');
          if (ed) {
            ed.value = decodeURIComponent(btn.getAttribute('data-starter') || '');
            if (window.SpeakStorage) SpeakStorage.saveLastCode(ed.value);
            if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
          }
          markDone(btn.getAttribute('data-id'));
          if (window.UI && UI.showToast) UI.showToast('📚 Lesson loaded — Run when ready!');
          buildPanel();
        });
      });
    });
  }

  window.KiddyCurriculum = { buildPanel: buildPanel, markDone: markDone, isDone: isDone };
})();
