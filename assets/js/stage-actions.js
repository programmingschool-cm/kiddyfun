/**
 * KiddyFun — action registry, HUD, and action-based VFX
 */
(function () {
  'use strict';

  var ACTIONS = {
    appears:       { icon: '✨', label: 'appears on stage',    fx: 'sparkle',  ms: 900 },
    says:          { icon: '💬', label: 'is speaking',         fx: 'speech',   ms: 0 },
    waves:         { icon: '👋', label: 'waves hello',         fx: 'wave',     ms: 1200 },
    smiles:        { icon: '😊', label: 'smiles',              fx: 'hearts',   ms: 1000 },
    jumps:         { icon: '⬆️', label: 'jumps',               fx: 'bounce',   ms: 700 },
    flies:         { icon: '🪽', label: 'flies',               fx: 'wind',     ms: 1200 },
    flaps:         { icon: '🪽', label: 'flaps wings',         fx: 'wind',     ms: 1200 },
    runs:          { icon: '🏃', label: 'runs',                fx: 'speed',    ms: 800 },
    walks:         { icon: '🚶', label: 'walks',               fx: 'dust',     ms: 800 },
    moves_right:   { icon: '➡️', label: 'moves right',         fx: 'dust',     ms: 800 },
    moves_left:    { icon: '⬅️', label: 'moves left',          fx: 'dust',     ms: 800 },
    hides:         { icon: '👻', label: 'hides',               fx: 'poof',     ms: 600 },
    shows:         { icon: '👀', label: 'shows again',         fx: 'sparkle',  ms: 700 },
    bows:          { icon: '🙇', label: 'bows politely',       fx: 'sparkle',  ms: 900 },
    nods:          { icon: '🙂', label: 'nods',                fx: 'none',     ms: 800 },
    cheers:        { icon: '🎉', label: 'cheers',              fx: 'confetti', ms: 1100 },
    dances:        { icon: '💃', label: 'dances',              fx: 'music',    ms: 1400 },
    claps:         { icon: '👏', label: 'claps',               fx: 'sparkle',  ms: 900 },
    handshakes:    { icon: '🤝', label: 'handshakes',          fx: 'sparkle',  ms: 900 },
    scene:         { icon: '🎬', label: 'new scene',           fx: 'scene',    ms: 1200 },
    wait:          { icon: '⏸️', label: 'waits',               fx: 'none',     ms: 0 },
    play_sound:    { icon: '🔊', label: 'plays sound',         fx: 'sound',    ms: 600 },
  };

  var hudEl = null;
  var hudTimer = null;

  function init(stage) {
    if (!stage || document.getElementById('kf-action-hud')) {
      hudEl = document.getElementById('kf-action-hud');
      return;
    }
    hudEl = document.createElement('div');
    hudEl.id = 'kf-action-hud';
    hudEl.className = 'kf-action-hud';
    hudEl.setAttribute('aria-live', 'polite');
    hudEl.innerHTML =
      '<div class="kf-action-hud-inner">' +
        '<span class="kf-action-hud-icon" id="kf-action-hud-icon">🎭</span>' +
        '<div class="kf-action-hud-text">' +
          '<span class="kf-action-hud-who" id="kf-action-hud-who">Stage</span>' +
          '<span class="kf-action-hud-what" id="kf-action-hud-what">Ready</span>' +
        '</div>' +
      '</div>';
    stage.appendChild(hudEl);
  }

  function showAction(actor, actionKey, extra) {
    if (!hudEl) hudEl = document.getElementById('kf-action-hud');
    if (!hudEl) return;

    var key = (actionKey || '').replace(/\s+/g, '_');
    var def = ACTIONS[key] || { icon: '🎭', label: key.replace(/_/g, ' '), fx: 'none', ms: 800 };
    var who = actor ? actor : 'Story';
    var what = def.label;
    if (extra) what = extra;

    hudEl.querySelector('#kf-action-hud-icon').textContent = def.icon;
    hudEl.querySelector('#kf-action-hud-who').textContent = who;
    hudEl.querySelector('#kf-action-hud-what').textContent = what;
    hudEl.classList.remove('kf-action-hud-pop');
    void hudEl.offsetWidth;
    hudEl.classList.add('kf-action-hud-active', 'kf-action-hud-pop');

    clearTimeout(hudTimer);
    if (def.ms > 0) {
      hudTimer = setTimeout(function () {
        hudEl.classList.remove('kf-action-hud-pop');
      }, def.ms);
    }
    return def;
  }

  function spawnFx(stage, charEl, fxType) {
    if (!stage || !fxType || fxType === 'none') return;
    var rect = charEl ? charEl.getBoundingClientRect() : null;
    var sRect = stage.getBoundingClientRect();
    var cx = rect ? rect.left - sRect.left + rect.width / 2 : sRect.width / 2;
    var cy = rect ? rect.top - sRect.top + rect.height * 0.4 : sRect.height * 0.5;

    if (fxType === 'hearts') {
      for (var h = 0; h < 5; h++) {
        spawnParticle(stage, '❤️', cx, cy, h * 0.08);
      }
    } else if (fxType === 'speed') {
      for (var s = 0; s < 4; s++) {
        var line = document.createElement('div');
        line.className = 'kf-speed-line';
        line.style.cssText = 'left:' + (cx - 40 - s * 12) + 'px;top:' + (cy + s * 8) + 'px;animation-delay:' + (s * 0.05) + 's;';
        stage.appendChild(line);
        removeLater(line, 500);
      }
    } else if (fxType === 'sparkle') {
      for (var i = 0; i < 8; i++) {
        spawnParticle(stage, '✨', cx, cy, i * 0.06);
      }
    } else if (fxType === 'poof') {
      var poof = document.createElement('div');
      poof.className = 'kf-poof-fx';
      poof.textContent = '💨';
      poof.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;';
      stage.appendChild(poof);
      removeLater(poof, 700);
    } else if (fxType === 'wind') {
      for (var w = 0; w < 3; w++) {
        spawnParticle(stage, '〜', cx - 20, cy - 10 + w * 15, w * 0.1);
      }
    } else if (fxType === 'music') {
      ['🎵', '🎶', '♪'].forEach(function (n, j) {
        spawnParticle(stage, n, cx + j * 18 - 18, cy - 30, j * 0.12);
      });
    }
  }

  function spawnParticle(stage, char, x, y, delay) {
    var p = document.createElement('div');
    p.className = 'kf-action-particle';
    p.textContent = char;
    p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;animation-delay:' + (delay || 0) + 's;';
    stage.appendChild(p);
    removeLater(p, 900);
  }

  function removeLater(el, ms) {
    setTimeout(function () { if (el.parentNode) el.remove(); }, ms);
  }

  function playAction(stage, actor, actionKey, charEl) {
    var def = showAction(actor, actionKey);
    if (def && stage) spawnFx(stage, charEl, def.fx);
    return def;
  }

  window.StageActions = {
    init: init,
    showAction: showAction,
    playAction: playAction,
    spawnFx: spawnFx,
    ACTIONS: ACTIONS,
  };
})();
