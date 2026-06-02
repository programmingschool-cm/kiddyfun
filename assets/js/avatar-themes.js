/**
 * Phase B5 — Avatar / theme unlock (localStorage)
 */
(function () {
  'use strict';

  var KEY = 'kf_theme';
  var THEMES = [
    { id: 'emerald', name: 'Emerald', xp: 0, primary: '#10b981' },
    { id: 'sunset', name: 'Sunset', xp: 100, primary: '#f59e0b' },
    { id: 'ocean', name: 'Ocean', xp: 200, primary: '#3b82f6' },
    { id: 'grape', name: 'Grape', xp: 350, primary: '#8b5cf6' },
  ];

  function getXp() {
    var g = window.KiddyGamification && KiddyGamification.load ? KiddyGamification.load() : {};
    return g.xp || 0;
  }

  function applyTheme(id) {
    var th = THEMES.filter(function (t) { return t.id === id; })[0] || THEMES[0];
    try { localStorage.setItem(KEY, th.id); } catch (e) { /* ignore */ }
    document.documentElement.style.setProperty('--kf-primary', th.primary);
    document.documentElement.style.setProperty('--kf-primary-dark', th.primary);
    if (window.UI && UI.showToast) UI.showToast('🎨 Theme: ' + th.name);
  }

  function buildPanel() {
    var el = document.getElementById('panel-themes');
    if (!el) return;
    var xp = getXp();
    var cur = 'emerald';
    try { cur = localStorage.getItem(KEY) || 'emerald'; } catch (e) { /* ignore */ }
    var html = '<h6 class="ss-panel-title">🎨 Themes</h6><p class="small text-muted">Unlock with XP (' + xp + ')</p>';
    THEMES.forEach(function (t) {
      var locked = xp < t.xp;
      html += '<button type="button" class="btn btn-sm w-100 mb-1 ' + (cur === t.id ? 'btn-primary' : 'btn-outline-secondary') + '" data-theme="' + t.id + '" ' + (locked ? 'disabled' : '') + '>' +
        t.name + (locked ? ' 🔒 ' + t.xp + ' XP' : '') + '</button>';
    });
    el.innerHTML = html;
    el.querySelectorAll('[data-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(btn.getAttribute('data-theme'));
        buildPanel();
      });
    });
  }

  function init() {
    try {
      var id = localStorage.getItem(KEY);
      if (id) applyTheme(id);
    } catch (e) { /* ignore */ }
  }

  window.KiddyAvatarThemes = { init: init, buildPanel: buildPanel, THEMES: THEMES };
})();
