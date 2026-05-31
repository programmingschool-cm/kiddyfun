/**
 * KiddyFun Game Input — keyboard + on-screen touch pad
 */
(function () {
  'use strict';

  var KEY_MAP = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    a: 'left', A: 'left', d: 'right', D: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down',
    ' ': 'jump', Space: 'jump', Spacebar: 'jump',
  };

  function GameInput() {
    this.keys = { left: false, right: false, up: false, down: false, jump: false };
    this._pressed = { left: false, right: false, up: false, down: false, jump: false };
    this._justPressed = {};
    this._active = false;
    this._sessionActive = false;
    this._handlers = { down: null, up: null };
    this._padEl = null;
    this._stageClick = null;
  }

  GameInput.prototype.start = function () {
    this._sessionActive = true;
    this.keys = { left: false, right: false, up: false, down: false, jump: false };
    this._justPressed = {};
    if (!this._active) {
      this._active = true;
      var self = this;
      this._handlers.down = function (e) { self._onKeyDown(e); };
      this._handlers.up = function (e) { self._onKeyUp(e); };
      window.addEventListener('keydown', this._handlers.down, true);
      window.addEventListener('keyup', this._handlers.up, true);
    }
    this._mountTouchPad();
    this._bindStageFocus();
  };

  GameInput.prototype.stop = function () {
    this._sessionActive = false;
    if (!this._active) return;
    this._active = false;
    window.removeEventListener('keydown', this._handlers.down, true);
    window.removeEventListener('keyup', this._handlers.up, true);
    this._unbindStageFocus();
  };

  GameInput.prototype._bindStageFocus = function () {
    var stage = document.getElementById('ss-stage');
    if (!stage || this._stageClick) return;
    var self = this;
    this._stageClick = function () {
      if (self._sessionActive && stage.focus) {
        try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); }
      }
    };
    stage.addEventListener('pointerdown', this._stageClick);
    stage.setAttribute('tabindex', '-1');
    try { stage.focus({ preventScroll: true }); } catch (e2) { stage.focus(); }
  };

  GameInput.prototype._unbindStageFocus = function () {
    var stage = document.getElementById('ss-stage');
    if (stage && this._stageClick) {
      stage.removeEventListener('pointerdown', this._stageClick);
    }
    this._stageClick = null;
  };

  GameInput.prototype._gameActive = function () {
    return !!this._sessionActive;
  };

  GameInput.prototype._onKeyDown = function (e) {
    if (!this._gameActive()) return;
    var k = KEY_MAP[e.key] || KEY_MAP[e.code];
    if (!k) return;
    if (['left', 'right', 'up', 'down', 'jump'].indexOf(k) >= 0) {
      e.preventDefault();
      this.keys[k] = true;
      if (!e.repeat) this._justPressed[k] = true;
    }
  };

  GameInput.prototype._onKeyUp = function (e) {
    if (!this._gameActive()) return;
    var k = KEY_MAP[e.key] || KEY_MAP[e.code];
    if (!k) return;
    if (['left', 'right', 'up', 'down', 'jump'].indexOf(k) >= 0) {
      e.preventDefault();
      this.keys[k] = false;
    }
  };

  GameInput.prototype.consumePressed = function (key) {
    if (this._justPressed[key]) {
      this._justPressed[key] = false;
      return true;
    }
    return false;
  };

  GameInput.prototype.isHeld = function (key) {
    return !!this.keys[key];
  };

  GameInput.prototype.matchKey = function (syntaxKey) {
    var k = String(syntaxKey).toLowerCase();
    if (k === 'space') return 'jump';
    if (k.indexOf('arrow') >= 0) return k.replace(/\s*arrow\s*/g, '').trim();
    if (k === 'left' || k === 'right' || k === 'up' || k === 'down' || k === 'jump') return k;
    return k;
  };

  GameInput.prototype._mountTouchPad = function () {
    var stage = document.getElementById('ss-stage');
    if (!stage || this._padEl) return;

    var pad = document.createElement('div');
    pad.className = 'kf-game-touchpad';
    pad.setAttribute('aria-hidden', 'true');
    pad.innerHTML =
      '<button type="button" class="kf-game-btn kf-game-btn-up" data-dir="up">▲</button>' +
      '<button type="button" class="kf-game-btn kf-game-btn-left" data-dir="left">◀</button>' +
      '<button type="button" class="kf-game-btn kf-game-btn-right" data-dir="right">▶</button>' +
      '<button type="button" class="kf-game-btn kf-game-btn-down" data-dir="down">▼</button>' +
      '<button type="button" class="kf-game-btn kf-game-btn-jump" data-dir="jump">⤒</button>';

    var self = this;
    pad.querySelectorAll('.kf-game-btn').forEach(function (btn) {
      var dir = btn.dataset.dir;
      function press(e) {
        e.preventDefault();
        self.keys[dir] = true;
        self._justPressed[dir] = true;
        btn.classList.add('kf-game-btn-active');
      }
      function release(e) {
        e.preventDefault();
        self.keys[dir] = false;
        btn.classList.remove('kf-game-btn-active');
      }
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
    });

    stage.appendChild(pad);
    this._padEl = pad;
  };

  GameInput.prototype.removeTouchPad = function () {
    if (this._padEl && this._padEl.parentNode) {
      this._padEl.parentNode.removeChild(this._padEl);
    }
    this._padEl = null;
  };

  GameInput.prototype.resetFrame = function () {
    this._justPressed = {};
  };

  window.KiddyGameInput = GameInput;
})();
