/**
 * Animation director. Each limb rotates in its parent joint, angle 0 = rest.
 * Jump air poses follow rise / fall / land. Handshake locks two wrists to one point.
 */
(function () {
  'use strict';

  var loops = {};

  var AIR = {
    rise: {
      thighL: -18, shinL: 34, thighR: 16, shinR: 30,
      armUL: 155, armLL: -14, armUR: -155, armLR: 14,
      wristL: -10, wristR: 10, fingersL: -6, fingersR: 6,
      head: -8, torso: -5, bodyY: -4, lean: -5,
      scaleX: 0.92, scaleY: 1.12,
      thighFL: -24, shinFL: 28, thighFR: 18, shinFR: 22,
      thighBL: 12, shinBL: 8, thighBR: -14, shinBR: 10,
      wingL: -34, wingR: 34, tail: 16, face: 'open',
    },
    fall: {
      thighL: 8, shinL: 18, thighR: -6, shinR: 16,
      armUL: -28, armLL: 8, armUR: 26, armLR: -6,
      head: 6, torso: 8, bodyY: 3, lean: 4,
      scaleX: 1.06, scaleY: 0.92,
      thighFL: 10, shinFL: 16, thighFR: -8, shinFR: 14,
      wingL: 26, wingR: -26, tail: -8, face: 'open',
    },
    land: {
      thighL: -16, shinL: 32, thighR: 16, shinR: 32,
      armUL: 22, armLL: 8, armUR: -20, armLR: -6,
      head: 8, torso: 10, bodyY: 6, lean: 0,
      scaleX: 1.16, scaleY: 0.76,
      thighFL: -8, shinFL: 26, thighFR: 8, shinFR: 26,
      wingL: 8, wingR: -8, tail: 4, face: '',
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

  var NUM_KEYS = [
    'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR',
    'armUL', 'armLL', 'wristL', 'fingersL', 'clawL',
    'armUR', 'armLR', 'wristR', 'fingersR', 'clawR',
    'head', 'torso', 'bodyY', 'lean', 'scaleX', 'scaleY', 'blink',
    'wingL', 'wingR', 'wing', 'tail',
    'thighFL', 'shinFL', 'pawFL', 'thighFR', 'shinFR', 'pawFR',
    'thighBL', 'shinBL', 'pawBL', 'thighBR', 'shinBR', 'pawBR',
    'legL', 'legR',
  ];

  function lerpPose(a, b, t) {
    if (!b) return a;
    if (!a) return b;
    var o = {};
    NUM_KEYS.forEach(function (k) {
      if (a[k] != null || b[k] != null) o[k] = lerp(a[k] || 0, b[k] || 0, t);
    });
    o.face = t < 0.5 ? (a.face || '') : (b.face != null ? b.face : (a.face || ''));
    return o;
  }

  function angleFor(pose, name) {
    if (pose[name] != null) return pose[name];
    if (name === 'footL' && pose.thighL != null) return -(pose.thighL + (pose.shinL || 0));
    if (name === 'footR' && pose.thighR != null) return -(pose.thighR + (pose.shinR || 0));
    if (name === 'clawR') return -(pose.fingersR || 0);
    if (name === 'clawL') return -(pose.fingersL || 0);
    if (name.indexOf('paw') === 0) {
      var side = name.slice(3);
      if (pose['thigh' + side] != null) return -(pose['thigh' + side] + (pose['shin' + side] || 0));
    }
    if (name === 'wingL' && pose.wing != null) return pose.wing;
    if (name === 'wingR' && pose.wing != null) return -(pose.wingR != null ? pose.wingR : pose.wing);
    return 0;
  }

  function applyJoint(g, angle) {
    var ox = parseFloat(g.getAttribute('data-ox')) || 0;
    var oy = parseFloat(g.getAttribute('data-oy')) || 0;
    var a = angle || 0;
    if (g.getAttribute('data-mode') === 'pivot') {
      g.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + ox + ' ' + oy + ')');
    } else {
      g.setAttribute('transform', 'translate(' + ox + ',' + oy + ') rotate(' + a.toFixed(2) + ')');
    }
  }

  function applyPose(wrap, pose) {
    if (!wrap || !pose) return;
    var root = wrap.querySelector('.kf-char-root');
    if (!root) return;

    var nodes = root.querySelectorAll('[data-joint]');
    for (var i = 0; i < nodes.length; i++) {
      applyJoint(nodes[i], angleFor(pose, nodes[i].getAttribute('data-joint')));
    }

    var blink = pose.blink || 0;
    var lids = root.querySelectorAll('.kf-lid');
    for (var j = 0; j < lids.length; j++) {
      lids[j].setAttribute('transform', 'translate(0 ' + (blink * 10).toFixed(2) + ')');
    }

    var svg = wrap.querySelector('.kf-char-svg');
    if (svg) svg.setAttribute('data-face', pose.face || '');

    var lean = pose.lean || 0;
    var by = pose.bodyY || 0;
    var sx = pose.scaleX != null ? pose.scaleX : 1;
    var sy = pose.scaleY != null ? pose.scaleY : 1;
    var origin = (root.getAttribute('data-origin') || '70 174').split(' ');
    root.style.transformOrigin = origin[0] + 'px ' + origin[1] + 'px';
    root.style.transform = 'translateY(' + by.toFixed(1) + 'px) rotate(' + lean.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';

    var char = wrap.closest('.kf-char-pro');
    var sh = char && char.querySelector('.kf-char-shadow');
    if (sh) {
      var lift = Math.max(0, -by) + (sy < 1 ? (1 - sy) * 18 : 0);
      var scale = Math.max(0.45, 1 - lift * 0.012);
      sh.style.transform = 'translateX(-50%) scaleX(' + (scale * sx).toFixed(2) + ')';
      sh.style.opacity = String(Math.max(0.12, 0.42 - lift * 0.008));
    }
  }

  function basePose() {
    return {
      thighL: -2, shinL: 2, thighR: 2, shinR: 2,
      armUL: 14, armLL: 4, armUR: -14, armLR: -4,
      wristL: 0, wristR: 0, fingersL: 3, fingersR: 3,
      head: 0, torso: 0, bodyY: 0, lean: 0,
      scaleX: 1, scaleY: 1, blink: 0, face: '',
    };
  }

  function stop(el) {
    if (!el || !el.dataset) return;
    var key = el.dataset.key;
    Object.keys(loops).forEach(function (k) {
      var loop = loops[k];
      if (!loop) return;
      if (k === key || loop.partnerKey === key) {
        if (loop.raf) cancelAnimationFrame(loop.raf);
        delete loops[k];
      }
    });
  }

  function tickLoop(key) {
    function tick(now) {
      var loop = loops[key];
      if (!loop || loop.mode === 'air' || loop.mode === 'clasp') return;
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
      var phase = t % 5.4;
      var blink = 0;
      var bt = phase - 4.85;
      if (bt > 0 && bt < 0.22) blink = Math.sin((bt / 0.22) * Math.PI);
      var pose = Object.assign({}, base, {
        bodyY: Math.sin(t * 2.05) * -2.2,
        head: Math.sin(t * 0.65) * 2.4,
        torso: Math.sin(t * 2.05) * 0.8,
        armUL: 14 + Math.sin(t * 1.3) * 1.6,
        armUR: -14 - Math.sin(t * 1.3) * 1.6,
        blink: blink,
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

    if (loop && loop.state === state && loop.mode === 'loop') {
      if (opts.cycleMs) loop.cycleMs = opts.cycleMs;
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

    var looping = state === 'walk' || state === 'run' || state === 'fly' || state === 'dance';
    if (!sequence || sequence.length < 2) {
      stop(el);
      applyPose(wrap, (sequence && sequence[0]) || AIR[state] || basePose());
      loops[key] = { raf: 0, state: state, mode: 'hold', wrap: wrap, sequence: [] };
      return;
    }
    var cycle = opts.cycleMs || (state === 'run' ? 420 : state === 'fly' ? 520 : state === 'dance' ? 640 : state === 'wave' ? 980 : 720);
    start(el, wrap, sequence, cycle, looping, state);
  }

  function nudge(el, opts) {
    opts = opts || {};
    var loop = el && loops[el.dataset.key];
    if (!loop) return false;
    if (opts.cycleMs && loop.mode === 'loop') loop.cycleMs = opts.cycleMs;
    return true;
  }

  function clientToSvg(svg, x, y) {
    if (!svg || !svg.createSVGPoint || !svg.getScreenCTM) return null;
    var pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    var ctm = svg.getScreenCTM();
    if (!ctm) return null;
    try {
      return pt.matrixTransform(ctm.inverse());
    } catch (e) {
      return null;
    }
  }

  function solveIk(sx, sy, tx, ty, l1, l2) {
    function one(sign) {
      var dx = tx - sx;
      var dy = ty - sy;
      var dist = Math.hypot(dx, dy);
      var max = l1 + l2 - 0.4;
      var min = Math.abs(l1 - l2) + 0.4;
      if (dist < 0.001) dist = 0.001;
      dist = Math.max(min, Math.min(dist, max));
      var targetAng = Math.atan2(-dx, dy);
      var cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
      cosA = Math.max(-1, Math.min(1, cosA));
      var a1 = targetAng + sign * Math.acos(cosA);
      var cosB = (l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2);
      cosB = Math.max(-1, Math.min(1, cosB));
      var a2 = -sign * (Math.PI - Math.acos(cosB));
      return {
        a1: a1 * 180 / Math.PI,
        a2: a2 * 180 / Math.PI,
        ey: sy + Math.cos(a1) * l1,
      };
    }
    var up = one(1);
    var down = one(-1);
    return up.ey <= down.ey ? up : down;
  }

  function reachPose(wrap, otherWrap, pump) {
    var svg = wrap.querySelector('.kf-char-svg');
    var selfEl = wrap.closest('.kf-char-pro');
    var otherEl = otherWrap && otherWrap.closest('.kf-char-pro');
    var pose = { face: 'smile', head: -4, torso: 3, armUL: 14, armLL: 4, fingersR: 18 };
    if (!svg || !selfEl || !otherEl) return pose;
    var upper = svg.querySelector('[data-joint="armUR"]') || svg.querySelector('[data-joint="thighFR"]');
    if (!upper) return { face: 'smile', wingL: -24, wingR: 24, bodyY: -3, head: -4 };
    var joint = upper.getAttribute('data-joint');
    var childName = joint === 'armUR' ? 'armLR' : 'shinFR';
    var child = upper.querySelector('[data-joint="' + childName + '"]');
    var l1 = parseFloat(upper.getAttribute('data-len')) || 24;
    var l2 = child ? (parseFloat(child.getAttribute('data-len')) || 18) : 18;
    var sx = parseFloat(upper.getAttribute('data-ox')) || 0;
    var sy = parseFloat(upper.getAttribute('data-oy')) || 0;
    var ar = selfEl.getBoundingClientRect();
    var br = otherEl.getBoundingClientRect();
    var mx = (ar.left + ar.width / 2 + br.left + br.width / 2) / 2;
    var top = Math.min(ar.top, br.top);
    var h = Math.min(ar.height, br.height);
    var my = top + h * 0.42 + pump;
    var local = clientToSvg(svg, mx, my);
    if (!local) return pose;
    var sol = solveIk(sx, sy, local.x, local.y, l1, l2);
    pose[joint] = sol.a1;
    pose[childName] = sol.a2;
    if (joint === 'armUR') {
      pose.wristR = -6;
      pose.fingersR = 22;
    }
    return pose;
  }

  function clasp(el, wrap, partner, pwrap) {
    if (!el || !wrap || !partner || !pwrap) return;
    stop(el);
    stop(partner);
    var key = el.dataset.key || ('k' + Math.random());
    el.dataset.key = key;
    function tick(now) {
      var loop = loops[key];
      if (!loop || loop.mode !== 'clasp') return;
      var t = (now - loop.startTime) / 1000;
      var env = t < 1.2 ? 1 : Math.max(0, 1 - (t - 1.2) / 0.25);
      var pump = Math.sin(t * Math.PI * 3.1) * 8 * env;
      applyPose(wrap, reachPose(wrap, pwrap, pump));
      applyPose(pwrap, reachPose(pwrap, wrap, pump));
      loop.raf = requestAnimationFrame(tick);
    }
    loops[key] = {
      raf: 0,
      startTime: performance.now(),
      wrap: wrap,
      state: 'handshake',
      mode: 'clasp',
      partnerKey: partner.dataset.key || '',
      sequence: [],
    };
    loops[key].raf = requestAnimationFrame(tick);
  }

  window.StageAnimator = {
    applyPose: applyPose,
    start: start,
    stop: stop,
    idleBreath: idleBreath,
    lerpPose: lerpPose,
    play: play,
    nudge: nudge,
    clasp: clasp,
    reducedMotion: reducedMotion,
  };
})();
