/**
 * Phase C1 — Parent summary (today's learning)
 */
(function () {
  'use strict';

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function buildSummary() {
    var lines = [];
    var g = window.KiddyGamification && KiddyGamification.load ? KiddyGamification.load() : {};
    lines.push('Today (' + todayKey() + ')');
    lines.push('⭐ XP: ' + (g.xp || 0) + ' · 🔥 Streak: ' + (g.streak || 0) + ' days');
    try {
      var missions = JSON.parse(localStorage.getItem('ss_missions_done') || '[]');
      if (missions.length) lines.push('🎯 Missions done: ' + missions.length);
    } catch (e) { /* ignore */ }
    try {
      var lessons = JSON.parse(localStorage.getItem('kf_curriculum_done') || '[]');
      if (lessons.length) lines.push('📚 Lessons started: ' + lessons.length);
    } catch (e) { /* ignore */ }
    try {
      var speech = JSON.parse(localStorage.getItem('kf_speech_stats') || '{}');
      if (speech.today === todayKey() && speech.attempts) {
        lines.push('🎤 Speaking practice: ' + speech.attempts + ' tries, ' + (speech.success || 0) + ' great');
      }
    } catch (e) { /* ignore */ }
    if (window.KiddyGamification && KiddyGamification.dailyChallenge) {
      lines.push('🎯 Challenge: ' + KiddyGamification.dailyChallenge());
    }
    return lines.join('\n');
  }

  function buildPanel() {
    var el = document.getElementById('panel-parent');
    if (!el) return;
    el.innerHTML =
      '<h6 class="ss-panel-title">👨‍👩‍👧 Parent Summary</h6>' +
      '<pre class="kf-parent-summary small">' + buildSummary() + '</pre>' +
      '<button type="button" class="btn btn-sm btn-outline-primary w-100" id="kf-parent-refresh">Refresh</button>';
    document.getElementById('kf-parent-refresh').addEventListener('click', buildPanel);
  }

  window.KiddyParentSummary = { buildPanel: buildPanel, buildSummary: buildSummary };
})();
