/**
 * Phase B5 — Badge gallery (missions + lessons + storage badges)
 */
(function () {
  'use strict';

  function collectBadges() {
    var list = [];
    if (window.SpeakMissions) {
      var done = [];
      try { done = JSON.parse(localStorage.getItem('ss_completed_missions') || '[]'); } catch (e) { /* ignore */ }
      SpeakMissions.forEach(function (m) {
        list.push({ name: m.badge, title: m.title, earned: done.indexOf(m.id) >= 0 });
      });
    }
    if (window.SpeakStorage && SpeakStorage.loadBadges) {
      (SpeakStorage.loadBadges() || []).forEach(function (b) {
        list.push({ name: b, title: b, earned: true });
      });
    }
    try {
      var cur = JSON.parse(localStorage.getItem('kf_curriculum_done') || '[]');
      /* badges from curriculum loaded async — skip duplicate */
    } catch (e) { /* ignore */ }
    return list;
  }

  function buildPanel() {
    var el = document.getElementById('panel-badges');
    if (!el) return;
    var badges = collectBadges();
    var html = '<h6 class="ss-panel-title">🏅 Badge Gallery</h6>';
    if (!badges.length) {
      html += '<p class="small text-muted">Complete missions to earn badges!</p>';
    } else {
      badges.forEach(function (b) {
        html += '<div class="kf-badge-item' + (b.earned ? '' : ' kf-badge-locked') + '">';
        html += '<span class="kf-badge-emoji">' + (b.earned ? b.name : '🔒') + '</span>';
        html += '<span class="kf-badge-label">' + b.title + '</span></div>';
      });
    }
    el.innerHTML = html;
  }

  window.KiddyBadgesGallery = { buildPanel: buildPanel };
})();
