/**
 * KiddyFun Game Loop — fixed timestep rAF
 */
(function () {
  'use strict';

  var STEP_MS = 1000 / 60;
  var MAX_FRAME_MS = 50;

  function GameLoop() {
    this._raf = null;
    this._running = false;
    this._last = 0;
    this._accum = 0;
    this.onUpdate = null;
    this.onRender = null;
  }

  GameLoop.prototype.start = function () {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    this._accum = 0;
    var self = this;
    function frame(now) {
      if (!self._running) return;
      var delta = Math.min(now - self._last, MAX_FRAME_MS);
      self._last = now;
      self._accum += delta;
      while (self._accum >= STEP_MS) {
        if (self.onUpdate) {
          try { self.onUpdate(STEP_MS); }
          catch (e) { console.error('[KiddyFun][GameLoop] update error:', e); self.stop(); return; }
        }
        self._accum -= STEP_MS;
      }
      if (self.onRender) {
        try { self.onRender(); }
        catch (e2) { console.error('[KiddyFun][GameLoop] render error:', e2); self.stop(); return; }
      }
      self._raf = requestAnimationFrame(frame);
    }
    this._raf = requestAnimationFrame(frame);
  };

  GameLoop.prototype.stop = function () {
    this._running = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  };

  window.KiddyGameLoop = GameLoop;
})();
