/**
 * Game debugger — step frame, watch vars (Creator/Studio)
 */
(function () {
  'use strict';

  var panelEl = null;
  var activeInterpreter = null;

  function isEnabled() {
    return (window.KiddyExperience && (KiddyExperience.isCreator() || KiddyExperience.isStudio())) ||
      /[?&]debug=1/i.test(location.search);
  }

  function buildPanel() {
    if (!isEnabled()) return;
    panelEl = document.getElementById('kf-game-debugger');
    if (!panelEl) {
      panelEl = document.createElement('div');
      panelEl.id = 'kf-game-debugger';
      panelEl.className = 'kf-game-debugger d-none';
      panelEl.innerHTML =
        '<div class="kf-game-debugger-title">🔧 Game Debug</div>' +
        '<div class="kf-game-debugger-actions">' +
        '<button type="button" class="btn btn-sm btn-outline-light" id="kf-debug-step">Step frame</button>' +
        '<button type="button" class="btn btn-sm btn-outline-light" id="kf-debug-pause">Pause</button>' +
        '<button type="button" class="btn btn-sm btn-outline-light" id="kf-debug-resume">Resume</button>' +
        '</div>' +
        '<pre class="kf-game-debugger-vars" id="kf-debug-vars">—</pre>';
      var stage = document.getElementById('ss-stage');
      if (stage && stage.parentElement) {
        stage.parentElement.appendChild(panelEl);
      }
    }
    if (!panelEl._bound) {
      panelEl._bound = true;
      document.getElementById('kf-debug-step').addEventListener('click', stepFrame);
      document.getElementById('kf-debug-pause').addEventListener('click', function () {
        var loop = window.KiddyGameRuntime && KiddyGameRuntime.loop;
        if (loop) loop.pause();
      });
      document.getElementById('kf-debug-resume').addEventListener('click', function () {
        var loop = window.KiddyGameRuntime && KiddyGameRuntime.loop;
        if (loop) loop.resume();
      });
    }
  }

  function attach(interpreter) {
    activeInterpreter = interpreter;
    if (!isEnabled()) return;
    buildPanel();
    if (panelEl) panelEl.classList.remove('d-none');
    refreshVars();
  }

  function detach() {
    activeInterpreter = null;
    if (panelEl) panelEl.classList.add('d-none');
  }

  function refreshVars() {
    var pre = document.getElementById('kf-debug-vars');
    if (!pre || !activeInterpreter) return;
    var lines = [];
    var gs = activeInterpreter.runtime.gameState;
    if (gs) {
      lines.push('status: ' + gs.status);
      if (gs.health != null) lines.push('health: ' + gs.health);
      if (gs.lives != null) lines.push('lives: ' + gs.lives);
      if (gs.timer != null) lines.push('timer: ' + gs.timer);
    }
    var env = activeInterpreter.env;
    if (env && env.vars) {
      Object.keys(env.vars).forEach(function (k) {
        var v = env.vars[k];
        lines.push(k + ': ' + (v && v.value != null ? v.value : JSON.stringify(v)));
      });
    }
    pre.textContent = lines.length ? lines.join('\n') : '(no vars)';
  }

  function stepFrame() {
    var R = window.KiddyGameRuntime;
    var interp = activeInterpreter;
    if (!R || !interp || !R.loop) return;
    R.loop.pause();
    var loop = R.loop;
    var world = R.world;
    if (loop.onUpdate) {
      try { loop.onUpdate(16.67); } catch (e) { console.error(e); }
    }
    if (loop.onRender) loop.onRender();
    refreshVars();
  }

  window.KiddyGameDebugger = {
    buildPanel: buildPanel,
    attach: attach,
    detach: detach,
    refresh: refreshVars,
  };
})();
