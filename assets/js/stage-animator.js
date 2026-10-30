/**
 * Animation director — pose clips keep their phase until the state changes.
 * Jump poses follow rise / fall / land instead of looping a jump cycle.
 */
(function () {
  'use strict';

  var loops = {};

  var AIR = {
    rise: {
      thighL: -24, shinL: 30, thighR: 20, shinR: 28,
      armUL: -50, armLL: -16, armUR: 48, armLR: 14,
      legL: -22, legR: 18, head: -7, torso: -4, bodyY: -6, lean: -4,
      scaleX: 0.9, scaleY: 1.14, wing: -28, tail: 16,
    },
    fall: {
      thighL: 12, shinL: 16, thighR: -10, shinR: 14,
      armUL: -16, armLL: 6, armUR: 18, armLR: -4,
      legL: 14, legR: -12, head: 6, torso: 8, bodyY: 4, lean: 4,
      scaleX: 1.08, scaleY: 0.9, wing: 24, tail: -8,
    },
    land: {
      thighL: 18, shinL: 26, thighR: -16, shinR: 24,
      armUL: 24, armLL: 10, armUR: -22, armLR: -8,
      legL: 20, legR: -16, head: 7, torso: 9, bodyY: 8, lean: 0,
      scaleX: 1.18, scaleY: 0.74, wing: 6, tail: 4,
    },
  };

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function lerpPose(a, b, t) {
    if (!b) return a;
    if (!a) return b;
    var o = {};
    var keys = ['thighL', 'shinL', 'thighR', 'shinR', 'armUL', 'armLL', 'armUR', 'armLR',
      'head', 'torso', 'bodyY', 'lean', 'legL', 'legR', 'armL', 'armR',
      'scaleX', 'scaleY', 'wing', 'tail'];
    keys.forEach(function (k) {
      if (a[k] != null || b[k] != null) {
        o[k] = lerp(a[k] || 0, b[k] || 0, t);
      }
    });
    return o;
  }

  function rot(wrap, sel, deg, ox, oy) {
    var g = wrap.querySelector(sel);
    if (!g) return;
    if (deg == null) {
      g.removeAttribute('transform');
      return;
    }
    g.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' ' + ox + ' ' + oy + ')');
  }

  function applyPose(wrap, pose) {
    if (!wrap || !pose) return;
    var root = wrap.querySelector('.kf-char-root');
    if (!root) return;

    if (pose.thighL != null) {
      rot(wrap, '.kf-thigh-l', pose.thighL, 53, 98);
      rot(wrap, '.kf-shin-l', pose.shinL || 0, 53, 118);
      rot(wrap, '.kf-thigh-r', pose.thighR, 67, 98);
      rot(wrap, '.kf-shin-r', pose.shinR || 0, 67, 118);
      rot(wrap, '.kf-arm-ul', pose.armUL, 42, 78);
      rot(wrap, '.kf-arm-ll', pose.armLL || 0, 28, 95);
      rot(wrap, '.kf-arm-ur', pose.armUR, 78, 78);
      rot(wrap, '.kf-arm-lr', pose.armLR || 0, 92, 95);
    }
    if (pose.legL != null) {
      rot(wrap, '.kf-leg-l', pose.legL, 44, 96);
      rot(wrap, '.kf-leg-r', pose.legR || 0, 76, 96);
    } else if (pose.thighL == null) {
      rot(wrap, '.kf-leg-l', pose.legL, 58, 108);
      rot(wrap, '.kf-leg-r', pose.legR, 62, 108);
      rot(wrap, '.kf-arm-l', pose.armL, 42, 78);
      rot(wrap, '.kf-arm-r', pose.armR, 78, 78);
    }
    rot(wrap, '.kf-wing-l', pose.wing, 35, 70);
    rot(wrap, '.kf-wing-r', pose.wing != null ? -pose.wing : null, 85, 70);
    rot(wrap, '.kf-tail', pose.tail, 30, 78);

    rot(wrap, '.kf-head', pose.head || 0, 60, 52);
    rot(wrap, '.kf-torso', pose.torso || 0, 60, 85);
    var lean = pose.lean || 0;
    var by = pose.bodyY || 0;
    var sx = pose.scaleX != null ? pose.scaleX : 1;
    var sy = pose.scaleY != null ? pose.scaleY : 1;
    root.style.transformOrigin = '60px 130px';
    root.style.transform = 'translateY(' + by.toFixed(1) + 'px) rotate(' + lean.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';

    var char = wrap.closest('.kf-char-pro');
    var sh = char && char.querySelector('.kf-char-shadow');
    if (sh) {
      var lift = Math.abs(by) + (sy < 1 ? (1 - sy) * 18 : 0);
      var scale = Math.max(0.45, 1 - lift * 0.012);
      sh.style.transform = 'translateX(-50%) scaleX(' + (scale * sx).toFixed(2) + ')';
      sh.style.opacity = String(Math.max(0.12, 0.42 - lift * 0.01));
    }
  }

  function basePose() {
    return {
      thighL: 0, shinL: 0, thighR: 0, shinR: 0,
      armUL: 6, armLL: 0, armUR: -6, armLR: 0,
      legL: 0, legR: 0, head: 0, torso: 0, bodyY: 0, lean: 0,
      scaleX: 1, scaleY: 1,
    };
  }

  function stop(el) {
    var key = el && el.dataset && el.dataset.key;
    if (!key || !loops[key]) return;
    if (loops[key].raf) cancelAnimationFrame(loops[key].raf);
    delete loops[key];
  }

  function tickLoop(key) {
    function tick(now) {
      var loop = loops[key];
      if (!loop || loop.mode === 'air') return;
      var elapsed = now - loop.startTime;
      var dur = loop.cycleMs || 720;
      var span = Math.max(loop.sequence.length - 1, 1);
      var progress = loop.looping ? (elapsed % dur) / dur : Math.min(1, elapsed / dur);
      var pos = progress * (loop.looping ? loop.sequence.length : span);
      var i = Math.floor(pos) % loop.sequence.length;
      var next = loop.looping ? (i + 1) % loop.sequence.length : Math.min(i + 1, loop.sequence.length - 1);
      var frac = easeInOut(pos - Math.floor(pos));
      applyPose(loop.wrap, lerpPose(loop.sequence[i], loop.sequence[next], frac));
      if (!loop.looping && progress >= 1) {
        applyPose(loop.wrap, loop.sequence[loop.sequence.length - 1]);
        loop.mode = 'hold';
        loop.raf = 0;
        return;
      }
      loop.raf = requestAnimationFrame(tick);
    }
    return tick;
  }

  function start(el, wrap, sequence, cycleMs, looping, state) {
    if (!el || !wrap || !sequence || sequence.length < 2) return;
    stop(el);
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    loops[key] = {
      raf: 0,
      startTime: performance.now(),
      cycleMs: cycleMs || 720,
      sequence: sequence,
      wrap: wrap,
      looping: !!looping,
      state: state || '',
      mode: looping ? 'loop' : 'oneshot',
    };
    loops[key].raf = requestAnimationFrame(tickLoop(key));
  }

  function idleBreath(el, wrap) {
    stop(el);
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    var base = basePose();
    if (reducedMotion()) {
      applyPose(wrap, base);
      loops[key] = { raf: 0, state: 'idle', mode: 'hold', wrap: wrap, sequence: [] };
      return;
    }

    function tick(now) {
      var loop = loops[key];
      if (!loop) return;
      var t = (now - loop.startTime) / 1000;
      var pose = Object.assign({}, base, {
        bodyY: Math.sin(t * 2.1) * -2.4,
        head: Math.sin(t * 0.7) * 2.2,
        torso: Math.sin(t * 2.1) * 0.7,
        armUL: 6 + Math.sin(t * 1.4) * 2,
        armUR: -6 - Math.sin(t * 1.4) * 2,
      });
      applyPose(wrap, pose);
      loop.raf = requestAnimationFrame(tick);
    }
    loops[key] = {
      raf: 0,
      startTime: performance.now(),
      cycleMs: 0,
      sequence: [],
      wrap: wrap,
      state: 'idle',
      mode: 'loop',
      looping: true,
    };
    loops[key].raf = requestAnimationFrame(tick);
  }

  function play(el, wrap, state, sequence, opts) {
    opts = opts || {};
    if (!el || !wrap || !state) return;
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    var loop = loops[key];

    if (state === 'rise' || state === 'fall' || state === 'land') {
      if (loop && loop.raf) {
        cancelAnimationFrame(loop.raf);
        loop.raf = 0;
      }
      if (!loop) loop = loops[key] = { raf: 0, sequence: [] };
      loop.state = state;
      loop.mode = 'air';
      loop.wrap = wrap;
      applyPose(wrap, reducedMotion() ? basePose() : AIR[state]);
      return;
    }

    if (loop && loop.state === state && (loop.mode === 'loop' || loop.mode === 'hold' || loop.mode === 'oneshot')) {
      if (opts.cycleMs && loop.mode === 'loop') loop.cycleMs = opts.cycleMs;
      return;
    }

    if (reducedMotion()) {
      stop(el);
      applyPose(wrap, (sequence && sequence[0]) || basePose());
      loops[key] = { raf: 0, state: state, mode: 'hold', wrap: wrap, sequence: [] };
      return;
    }

    if (state === 'idle') {
      idleBreath(el, wrap);
      return;
    }

    var looping = state === 'walk' || state === 'run' || state === 'fly';
    if (!sequence || sequence.length < 2) {
      stop(el);
      applyPose(wrap, (sequence && sequence[0]) || AIR[state] || basePose());
      loops[key] = { raf: 0, state: state, mode: 'hold', wrap: wrap, sequence: [] };
      return;
    }
    var cycle = opts.cycleMs || (state === 'run' ? 420 : state === 'fly' ? 520 : 680);
    start(el, wrap, sequence, cycle, looping, state);
  }

  function nudge(el, opts) {
    opts = opts || {};
    var loop = el && loops[el.dataset.key];
    if (!loop) return false;
    if (opts.cycleMs && loop.mode === 'loop') loop.cycleMs = opts.cycleMs;
    return true;
  }

  window.StageAnimator = {
    applyPose: applyPose,
    start: start,
    stop: stop,
    idleBreath: idleBreath,
    lerpPose: lerpPose,
    play: play,
    nudge: nudge,
    reducedMotion: reducedMotion,
  };
})();
