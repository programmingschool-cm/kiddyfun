/**
 * Phase B1 — Speech practice (Web Speech Recognition, optional)
 */
(function () {
  'use strict';

  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var KEY_SPEED = 'kf_tts_speed';

  function getTtsRate() {
    try {
      var s = localStorage.getItem(KEY_SPEED);
      if (s === 'slow') return 0.75;
      if (s === 'fast') return 1.15;
    } catch (e) { /* ignore */ }
    return 1;
  }

  function setTtsSpeed(mode) {
    try { localStorage.setItem(KEY_SPEED, mode); } catch (e) { /* ignore */ }
    if (window.UI && UI.showToast) UI.showToast('🔊 Voice speed: ' + mode);
  }

  function fuzzyMatch(expected, heard) {
    var a = (expected || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    var b = (heard || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (b.indexOf(a) >= 0 || a.indexOf(b) >= 0) return 0.85;
    var aw = a.split(/\s+/);
    var hit = 0;
    aw.forEach(function (w) {
      if (b.indexOf(w) >= 0) hit++;
    });
    return hit / aw.length;
  }

  function listenOnce(onResult) {
    if (!SpeechRec) {
      if (window.UI && UI.showToast) UI.showToast('🎤 Speech not supported in this browser');
      return;
    }
    var rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function (ev) {
      var text = ev.results[0][0].transcript;
      onResult(text, ev.results[0][0].confidence);
    };
    rec.onerror = function () {
      if (window.UI && UI.showToast) UI.showToast('🎤 Could not hear — try again');
    };
    rec.start();
    if (window.UI && UI.showToast) UI.showToast('🎤 Your turn — speak now!');
  }

  function addRepeatButton(bubbleEl, expectedText) {
    if (!bubbleEl || bubbleEl.querySelector('.kf-repeat-say')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-secondary kf-repeat-say mt-1';
    btn.textContent = '🎤 Repeat after me';
    btn.addEventListener('click', function () {
      listenOnce(function (heard) {
        var score = fuzzyMatch(expectedText, heard);
        if (score >= 0.6) {
          if (window.UI && UI.showToast) UI.showToast('✅ Great! You said: ' + heard);
          if (window.KiddyGamification) KiddyGamification.addXp(10);
        } else {
          if (window.UI && UI.showToast) UI.showToast('Try again — say: ' + expectedText);
        }
      });
    });
    bubbleEl.appendChild(btn);
  }

  function initTtsSpeedToggle() {
    var ids = ['btn-tts-speed', 'btn-tts-speed-mobile'];
    var modes = ['normal', 'slow', 'fast'];
    var idx = 0;
    try {
      var s = localStorage.getItem(KEY_SPEED);
      idx = Math.max(0, modes.indexOf(s));
    } catch (e) { /* ignore */ }
    function cycle() {
      idx = (idx + 1) % modes.length;
      setTtsSpeed(modes[idx]);
    }
    ids.forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', cycle);
    });
  }

  window.KiddySpeechPractice = {
    fuzzyMatch: fuzzyMatch,
    listenOnce: listenOnce,
    addRepeatButton: addRepeatButton,
    getTtsRate: getTtsRate,
    setTtsSpeed: setTtsSpeed,
    init: initTtsSpeedToggle,
  };
})();
