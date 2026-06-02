/**
 * KiddyFun Experience Mode — Phase E1 (All Ages Foundation)
 * Kid (default) | Creator — UI theme + optional tools
 */
(function () {
  'use strict';

  var KEY = 'kf_experience_mode';
  var MODES = { kid: 'kid', creator: 'creator' };

  function readUrlMode() {
    try {
      var m = new URLSearchParams(location.search).get('mode');
      if (m === 'creator' || m === 'kid') return m;
    } catch (e) { /* ignore */ }
    return null;
  }

  function loadStored() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'creator' || v === 'kid') return v;
    } catch (e) { /* ignore */ }
    return MODES.kid;
  }

  function saveStored(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
  }

  var current = readUrlMode() || loadStored();
  if (readUrlMode()) saveStored(current);

  function applyMode(mode) {
    current = mode === MODES.creator ? MODES.creator : MODES.kid;
    saveStored(current);
    var body = document.body;
    if (!body) return;
    body.classList.remove('kf-mode-kid', 'kf-mode-creator');
    body.classList.add(current === MODES.creator ? 'kf-mode-creator' : 'kf-mode-kid');
    document.querySelectorAll('[data-creator-only]').forEach(function (el) {
      el.classList.toggle('d-none', current !== MODES.creator);
    });
    document.querySelectorAll('[data-kid-only]').forEach(function (el) {
      el.classList.toggle('d-none', current === MODES.creator);
    });
    var btn = document.getElementById('btn-experience-mode');
    if (btn) {
      var isCreator = current === MODES.creator;
      btn.title = isCreator ? 'Creator mode — click for Kid mode' : 'Kid mode — click for Creator mode';
      btn.setAttribute('aria-pressed', isCreator ? 'true' : 'false');
      btn.innerHTML = isCreator
        ? '🎨 <span class="d-none d-sm-inline">Creator</span>'
        : '🧒 <span class="d-none d-sm-inline">Kid</span>';
      btn.classList.toggle('kf-mode-btn-active', isCreator);
    }
    window.dispatchEvent(new CustomEvent('kf-experience-change', { detail: { mode: current } }));
  }

  window.KiddyExperience = {
    MODES: MODES,
    getMode: function () { return current; },
    isCreator: function () { return current === MODES.creator; },
    isKid: function () { return current === MODES.kid; },
    setMode: applyMode,
    toggle: function () {
      applyMode(current === MODES.creator ? MODES.kid : MODES.creator);
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
