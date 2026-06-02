/**
 * KiddyFun Map Helper — Creator mode (G7a starter)
 * Click the stage to insert spawn coin / wall lines into the editor.
 */
(function () {
  'use strict';

  var REF_W = 600;
  var REF_H = 360;
  var active = false;
  var tool = 'coin';
  var overlay = null;

  function isCreator() {
    return window.KiddyExperience && KiddyExperience.isCreator();
  }

  function stageEl() {
    return document.getElementById('ss-stage');
  }

  function editorEl() {
    return document.getElementById('ss-editor');
  }

  function toGameCoords(clientX, clientY) {
    var stage = stageEl();
    if (!stage) return { x: 0, y: 0 };
    var r = stage.getBoundingClientRect();
    var x = Math.round(((clientX - r.left) / r.width) * REF_W);
    var y = Math.round(((clientY - r.top) / r.height) * REF_H);
    x = Math.max(0, Math.min(REF_W - 20, x));
    y = Math.max(0, Math.min(REF_H - 20, y));
    return { x: x, y: y };
  }

  function insertLine(line) {
    var ed = editorEl();
    if (!ed) return;
    var val = ed.value;
    if (val.length && !val.endsWith('\n')) val += '\n';
    ed.value = val + line + '\n';
    if (window.SpeakStorage) SpeakStorage.saveLastCode(ed.value);
    if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
    if (window.KiddySmartEditor && KiddySmartEditor.notifyExternalChange) {
      KiddySmartEditor.notifyExternalChange();
    }
    if (window.UI && UI.showToast) UI.showToast('Inserted: ' + line);
  }

  function onStageClick(e) {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();
    var c = toGameCoords(e.clientX, e.clientY);
    if (tool === 'wall') {
      insertLine('add wall at x ' + c.x + ' y ' + c.y + ' width 80 height 40');
    } else {
      insertLine('spawn coin at x ' + c.x + ' y ' + c.y);
    }
  }

  function ensureOverlay() {
    var stage = stageEl();
    if (!stage || overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'kf-map-helper-overlay';
    overlay.className = 'kf-map-helper-overlay d-none';
    overlay.innerHTML =
      '<div class="kf-map-helper-hint">🗺️ Map Helper — click to place ' +
      '<span id="kf-map-helper-tool-label">coin</span></div>';
    stage.appendChild(overlay);
    overlay.addEventListener('click', onStageClick);
  }

  function setActive(on) {
    active = !!on;
    ensureOverlay();
    if (overlay) {
      overlay.classList.toggle('d-none', !active);
      overlay.classList.toggle('kf-map-helper-active', active);
    }
    var stage = stageEl();
    if (stage) stage.classList.toggle('kf-map-helper-stage', active);
    var btn = document.getElementById('btn-map-helper');
    if (btn) btn.classList.toggle('kf-mode-btn-active', active);
    var lbl = document.getElementById('kf-map-helper-tool-label');
    if (lbl) lbl.textContent = tool === 'wall' ? 'wall' : 'coin';
  }

  function bindControls() {
    var btn = document.getElementById('btn-map-helper');
    if (btn) {
      btn.addEventListener('click', function () {
        if (!isCreator()) {
          if (window.UI && UI.showToast) {
            UI.showToast('Map Helper is in Creator mode — switch mode in the navbar.');
          }
          return;
        }
        setActive(!active);
      });
    }
    document.querySelectorAll('[data-map-tool]').forEach(function (b) {
      b.addEventListener('click', function () {
        tool = b.getAttribute('data-map-tool') === 'wall' ? 'wall' : 'coin';
        document.querySelectorAll('[data-map-tool]').forEach(function (x) {
          x.classList.toggle('active', x === b);
        });
        var lbl = document.getElementById('kf-map-helper-tool-label');
        if (lbl) lbl.textContent = tool;
      });
    });
    window.addEventListener('kf-experience-change', function () {
      if (!isCreator()) setActive(false);
    });
  }

  window.KiddyMapHelper = {
    init: function () {
      bindControls();
      ensureOverlay();
    },
    stop: function () { setActive(false); },
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.KiddyMapHelper) KiddyMapHelper.init();
  });
})();
