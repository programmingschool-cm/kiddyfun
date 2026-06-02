/**
 * Phase B5 — XP, streak, daily challenge (localStorage)
 */
(function () {
  'use strict';

  var KEY = 'kf_gamification';
  var CHALLENGES = [
    'Run any example from the menu',
    'Complete one mission',
    'Write a game with "game view top"',
    'Use repeat 3 times in a story',
    'Add narrator says to your code',
  ];

  function load() {
    try {
      var g = JSON.parse(localStorage.getItem(KEY) || '{}');
      g.xp = g.xp || 0;
      g.streak = g.streak || 0;
      g.lastDay = g.lastDay || '';
      g.badges = g.badges || [];
      return g;
    } catch (e) {
      return { xp: 0, streak: 0, lastDay: '', badges: [] };
    }
  }

  function save(g) {
    try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) { /* ignore */ }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function touchStreak() {
    var g = load();
    var t = todayKey();
    if (g.lastDay === t) return g;
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yk = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate();
    if (g.lastDay === yk) g.streak += 1;
    else g.streak = 1;
    g.lastDay = t;
    save(g);
    return g;
  }

  function addXp(n) {
    var g = touchStreak();
    g.xp += n || 10;
    save(g);
    updateHud();
  }

  function addBadge(name) {
    var g = load();
    if (g.badges.indexOf(name) < 0) g.badges.push(name);
    save(g);
    updateHud();
  }

  function dailyChallenge() {
    var day = new Date().getDate();
    return CHALLENGES[day % CHALLENGES.length];
  }

  function updateHud() {
    var el = document.getElementById('kf-gamification-hud');
    if (!el) return;
    var g = load();
    el.innerHTML = '⭐ ' + g.xp + ' XP · 🔥 ' + g.streak + ' day streak';
    var dc = document.getElementById('kf-daily-challenge');
    if (dc) dc.textContent = '🎯 Today: ' + dailyChallenge();
  }

  function buildMenuBlock() {
    var wrap = document.getElementById('kf-progress-wrap');
    if (!wrap || document.getElementById('kf-gamification-hud')) return;
    var div = document.createElement('div');
    div.className = 'px-3 py-2 border-bottom small';
    div.innerHTML =
      '<div id="kf-gamification-hud" class="fw-bold mb-1">⭐ 0 XP · 🔥 0 day streak</div>' +
      '<div id="kf-daily-challenge" class="text-muted">🎯 Today: …</div>';
    wrap.parentNode.insertBefore(div, wrap.nextSibling);
    updateHud();
  }

  window.KiddyGamification = {
    load: load,
    addXp: addXp,
    addBadge: addBadge,
    touchStreak: touchStreak,
    buildMenuBlock: buildMenuBlock,
    updateHud: updateHud,
    init: function () {
      buildMenuBlock();
      touchStreak();
    },
  };
})();
