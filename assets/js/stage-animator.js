/**
 * Smooth 60fps pose interpolation for stage characters
 */
(function () {
  'use strict';

  var loops = {};

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
      'head', 'torso', 'bodyY', 'lean', 'legL', 'legR', 'armL', 'armR'];
    keys.forEach(function (k) {
      if (a[k] != null || b[k] != null) {
        o[k] = lerp(a[k] || 0, b[k] || 0, t);
      }
    });
    return o;
  }

  function applyPose(wrap, pose) {
    if (!wrap || !pose) return;
    var root = wrap.querySelector('.kf-char-root');
    if (!root) return;

    function rot(sel, deg, ox, oy) {
      var g = wrap.querySelector(sel);
      if (g && deg != null) g.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' ' + ox + ' ' + oy + ')');
    }

    if (pose.thighL != null) {
      rot('.kf-thigh-l', pose.thighL, 53, 98);
      rot('.kf-shin-l', pose.shinL || 0, 53, 118);
      rot('.kf-thigh-r', pose.thighR, 67, 98);
      rot('.kf-shin-r', pose.shinR || 0, 67, 118);
      rot('.kf-arm-ul', pose.armUL, 42, 78);
      rot('.kf-arm-ll', pose.armLL || 0, 28, 95);
      rot('.kf-arm-ur', pose.armUR, 78, 78);
      rot('.kf-arm-lr', pose.armLR || 0, 92, 95);
    } else {
      rot('.kf-leg-l', pose.legL, 58, 108);
      rot('.kf-leg-r', pose.legR, 62, 108);
      rot('.kf-arm-l', pose.armL, 42, 78);
      rot('.kf-arm-r', pose.armR, 78, 78);
    }

    rot('.kf-head', pose.head || 0, 60, 52);
    rot('.kf-torso', pose.torso || 0, 60, 85);
    var lean = pose.lean || 0;
    var by = pose.bodyY || 0;
    root.style.transform = 'translateY(' + by.toFixed(1) + 'px) rotate(' + lean.toFixed(2) + 'deg)';

    var char = wrap.closest('.kf-char-pro');
    var sh = char && char.querySelector('.kf-char-shadow');
    if (sh) {
      var scale = 1 - Math.abs(by) * 0.008;
      sh.style.transform = 'translateX(-50%) scale(' + scale.toFixed(2) + ')';
      sh.style.opacity = String(0.35 + scale * 0.25);
    }
  }

  function stop(el) {
    var key = el && el.dataset && el.dataset.key;
    if (!key || !loops[key]) return;
    cancelAnimationFrame(loops[key].raf);
    delete loops[key];
  }

  function start(el, wrap, sequence, cycleMs) {
    if (!el || !wrap || !sequence || sequence.length < 2) return;
    stop(el);
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    var startTime = performance.now();

    function tick(now) {
      var loop = loops[key];
      if (!loop) return;
      var elapsed = now - loop.startTime;
      var progress = (elapsed % loop.cycleMs) / loop.cycleMs;
      var pos = progress * loop.sequence.length;
      var i = Math.floor(pos) % loop.sequence.length;
      var frac = easeInOut(pos - i);
      var pose = lerpPose(loop.sequence[i], loop.sequence[(i + 1) % loop.sequence.length], frac);
      applyPose(wrap, pose);
      loop.raf = requestAnimationFrame(tick);
    }

    loops[key] = { raf: 0, startTime: startTime, cycleMs: cycleMs || 720, sequence: sequence };
    loops[key].raf = requestAnimationFrame(tick);
  }

  function idleBreath(el, wrap) {
    stop(el);
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    var base = { thighL: 0, shinL: 0, thighR: 0, shinR: 0, armUL: 6, armLL: 0, armUR: -6, armLR: 0, head: 0, torso: 0, bodyY: 0, lean: 0 };

    function tick(now) {
      var loop = loops[key];
      if (!loop) return;
      var t = (now - loop.startTime) / 1000;
      var pose = Object.assign({}, base, {
        bodyY: Math.sin(t * 2.2) * -2.5,
        head: Math.sin(t * 1.8) * 1.5,
        torso: Math.sin(t * 2.2) * 0.8,
      });
      applyPose(wrap, pose);
      loop.raf = requestAnimationFrame(tick);
    }
    loops[key] = { raf: 0, startTime: performance.now(), cycleMs: 0, sequence: [] };
    loops[key].raf = requestAnimationFrame(tick);
  }

  window.StageAnimator = {
    applyPose: applyPose,
    start: start,
    stop: stop,
    idleBreath: idleBreath,
    lerpPose: lerpPose,
  };
})();
