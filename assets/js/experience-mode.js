/**
 * KiddyFun Experience Mode — Kid | Creator | Studio (E1 + E3)
 */
(function () {
  'use strict';

  var KEY = 'kf_experience_mode';
  var MODES = { kid: 'kid', creator: 'creator', studio: 'studio' };
  var CYCLE = [MODES.kid, MODES.creator, MODES.studio];

  function readUrlMode() {
    try {
      var m = new URLSearchParams(location.search).get('mode');
      if (m === 'creator' || m === 'kid' || m === 'studio') return m;
    } catch (e) { /* ignore */ }
    return null;
  }

  function loadStored() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'creator' || v === 'kid' || v === 'studio') return v;
    } catch (e) { /* ignore */ }
    return MODES.kid;
  }

  function saveStored(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
  }

  var current = readUrlMode() || loadStored();
  if (readUrlMode()) saveStored(current);

  function normalize(mode) {
    if (mode === MODES.creator || mode === MODES.studio) return mode;
    return MODES.kid;
  }

  function applyMode(mode) {
    current = normalize(mode);
    saveStored(current);
    var body = document.body;
    if (!body) return;
    body.classList.remove('kf-mode-kid', 'kf-mode-creator', 'kf-mode-studio');
    if (current === MODES.studio) body.classList.add('kf-mode-studio', 'kf-mode-creator');
    else if (current === MODES.creator) body.classList.add('kf-mode-creator');
    else body.classList.add('kf-mode-kid');

    var isPro = current === MODES.creator || current === MODES.studio;
    document.querySelectorAll('[data-creator-only]').forEach(function (el) {
      el.classList.toggle('d-none', !isPro);
    });
    document.querySelectorAll('[data-studio-only]').forEach(function (el) {
      el.classList.toggle('d-none', current !== MODES.studio);
    });
    document.querySelectorAll('[data-kid-only]').forEach(function (el) {
      el.classList.toggle('d-none', isPro);
    });
    var btn = document.getElementById('btn-experience-mode');
    if (btn) {
      var labels = { kid: '🧒', creator: '🎨', studio: '🖥️' };
      var names = { kid: 'Kid', creator: 'Creator', studio: 'Studio' };
      btn.title = names[current] + ' mode — click to switch';
      btn.setAttribute('aria-pressed', isPro ? 'true' : 'false');
      btn.innerHTML = labels[current] + ' <span class="d-none d-sm-inline">' + names[current] + '</span>';
      btn.classList.toggle('kf-mode-btn-active', isPro);
    }
    window.dispatchEvent(new CustomEvent('kf-experience-change', { detail: { mode: current } }));
  }

  window.KiddyExperience = {
    MODES: MODES,
    getMode: function () { return current; },
    isCreator: function () { return current === MODES.creator || current === MODES.studio; },
    isStudio: function () { return current === MODES.studio; },
    isKid: function () { return current === MODES.kid; },
    setMode: applyMode,
    toggle: function () {
      var i = CYCLE.indexOf(current);
      applyMode(CYCLE[(i + 1) % CYCLE.length]);
    },
    init: function () {
      applyMode(current);
    },
  };

  if (document.body) {
    KiddyExperience.init();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      KiddyExperience.init();
    });
  }
})();
