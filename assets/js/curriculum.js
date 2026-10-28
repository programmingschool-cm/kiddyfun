/**
 * Phase B2 — Structured curriculum (lessons panel)
 */
(function () {
  'use strict';

  var data = null;
  var KEY = 'kf_curriculum_done';
  var PENDING_KEY = 'kf_lesson_pending';

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

  function flattenLessons(levels) {
    var out = [];
    (levels || []).forEach(function (lvl) {
      (lvl.lessons || []).forEach(function (les) { out.push(les); });
    });
    return out;
  }

  function lessonUnlocked(levels, doneIds, lessonId) {
    var flat = flattenLessons(levels);
    var idx = -1;
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].id === lessonId) { idx = i; break; }
    }
    if (idx < 0) return false;
    if (idx === 0) return true;
    if (doneIds.indexOf(lessonId) >= 0) return true;
    return doneIds.indexOf(flat[idx - 1].id) >= 0;
  }

  function coreLines(src) {
    return String(src || '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) {
      return l && l.charAt(0) !== '#';
    });
  }

  function starterMatches(starter, code) {
    var need = coreLines(starter);
    if (!need.length) return false;
    var have = coreLines(code);
    for (var i = 0; i < need.length; i++) {
      if (have.indexOf(need[i]) === -1) return false;
    }
    return true;
  }

  function noteLessonStart(id, starter) {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id: id, starter: starter }));
    } catch (e) { /* ignore */ }
  }

  function completeIfMatches(code) {
    var pending = null;
    try { pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); } catch (e) { pending = null; }
    if (!pending || !pending.id) return false;
    if (!starterMatches(pending.starter, code)) return false;
    markDone(pending.id);
    try { sessionStorage.removeItem(PENDING_KEY); } catch (e2) { /* ignore */ }
    return true;
  }

  function embeddedCurriculum() {
    return window.KIDDY_CURRICULUM || null;
  }

  function fetchData(cb) {
    if (data) { cb(data); return; }
    var fileProtocol = window.location && window.location.protocol === 'file:';
    if (fileProtocol) {
      data = embeddedCurriculum() || { levels: [] };
      cb(data);
      return;
    }
    fetch('assets/data/curriculum.json')
      .then(function (r) {
        if (!r.ok) throw new Error('curriculum');
        return r.json();
      })
      .then(function (j) { data = j; cb(j); })
      .catch(function () {
        data = embeddedCurriculum() || { levels: [] };
        cb(data);
      });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function text(key, fallback) {
    if (window.KiddyLocale && KiddyLocale.text) return KiddyLocale.text(key, fallback);
    return fallback;
  }

  function buildPanel() {
    var el = document.getElementById('panel-lessons');
    if (!el) return;
    fetchData(function (cur) {
      var doneIds = loadDone();
      var html = '<h6 class="ss-panel-title">' + esc(text('lessonTitle', '📚 30-Lesson Path')) + '</h6>';
      html += '<p class="small text-muted">' + esc(text('lessonBlurb', 'Finish each lesson, then press Run. The next lesson unlocks after a successful run.')) + '</p>';
      (cur.levels || []).forEach(function (lvl) {
        html += '<div class="kf-lesson-level mb-2"><div class="fw-bold small">Level ' + esc(lvl.id) + ': ' + esc(lvl.title) + '</div>';
        (lvl.lessons || []).forEach(function (les) {
          var done = doneIds.indexOf(les.id) >= 0;
          var unlocked = lessonUnlocked(cur.levels, doneIds, les.id);
          html += '<div class="kf-lesson-card' + (done ? ' kf-lesson-done' : '') + (!unlocked ? ' kf-lesson-locked' : '') + '" data-lesson="' + esc(les.id) + '">';
          html += '<div class="d-flex justify-content-between"><span>' + (done ? '✅ ' : (unlocked ? '📖 ' : '🔒 ')) + esc(les.title) + '</span>';
          html += '<span class="small text-muted">' + (done ? esc(les.badge) : '') + '</span></div>';
          html += '<p class="small mb-1">' + esc(les.goal) + '</p>';
          html += '<button type="button" class="btn btn-sm btn-outline-primary kf-lesson-start" data-starter="' + encodeURIComponent(les.starter) + '" data-id="' + esc(les.id) + '"' + (unlocked ? '' : ' disabled') + '>' + esc(text('lessonStart', 'Start')) + '</button>';
          html += '</div>';
        });
        html += '</div>';
      });
      el.innerHTML = html;
      el.querySelectorAll('.kf-lesson-start').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ed = document.getElementById('ss-editor');
          var starter = decodeURIComponent(btn.getAttribute('data-starter') || '');
          if (ed) {
            ed.value = starter;
            if (window.SpeakStorage) SpeakStorage.saveLastCode(ed.value);
            if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
          }
          noteLessonStart(btn.getAttribute('data-id'), starter);
          if (window.UI && UI.showToast) UI.showToast(text('lessonLoaded', '📚 Lesson loaded — press Run when you are ready'));
        });
      });
    });
  }

  window.KiddyCurriculum = {
    buildPanel: buildPanel,
    markDone: markDone,
    isDone: isDone,
    lessonUnlocked: lessonUnlocked,
    starterMatches: starterMatches,
    noteLessonStart: noteLessonStart,
    completeIfMatches: completeIfMatches,
  };
})();
