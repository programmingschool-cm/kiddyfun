/**
 * KiddyFun Stage Graphics — SVG characters, scenes, effects
 */
(function () {
  'use strict';

  var SKINS = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
  var HAIRS = ['#2C1810', '#4A3728', '#1a1a1a', '#6B4423', '#D4A574'];

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  var POSES = {
    idle: { legL: 0, legR: 0, armL: 8, armR: -8, bodyY: 0, torso: 0 },
    walk: [
      { legL: 28, legR: -22, armL: -28, armR: 28, bodyY: -4, torso: -2 },
      { legL: 8, legR: -8, armL: -8, armR: 8, bodyY: -7, torso: 0 },
      { legL: -22, legR: 28, armL: 28, armR: -28, bodyY: -4, torso: 2 },
      { legL: -8, legR: 8, armL: 8, armR: -8, bodyY: -7, torso: 0 },
    ],
    run: [
      { legL: 42, legR: -35, armL: -45, armR: 45, bodyY: -8, torso: -6 },
      { legL: 15, legR: -12, armL: -20, armR: 20, bodyY: -12, torso: -3 },
      { legL: -35, legR: 42, armL: 45, armR: -45, bodyY: -8, torso: 6 },
      { legL: -12, legR: 15, armL: 20, armR: -20, bodyY: -12, torso: 3 },
    ],
    wave: { legL: 0, legR: 0, armL: 8, armR: -55, bodyY: 0, torso: 0 },
    jump: { legL: -15, legR: 15, armL: -40, armR: 40, bodyY: -18, torso: 0 },
  };

  var poseTimers = {};

  function applyPose(wrap, pose) {
    if (!wrap || !pose) return;
    var root = wrap.querySelector('.kf-char-root');
    if (!root) return;
    function rot(sel, deg, ox, oy) {
      var g = wrap.querySelector(sel);
      if (g) g.setAttribute('transform', 'rotate(' + (deg || 0) + ' ' + ox + ' ' + oy + ')');
    }
    rot('.kf-leg-l', pose.legL, 58, 108);
    rot('.kf-leg-r', pose.legR, 62, 108);
    rot('.kf-arm-l', pose.armL, 42, 78);
    rot('.kf-arm-r', pose.armR, 78, 78);
    rot('.kf-torso', pose.torso || 0, 60, 85);
    root.style.transform = 'translateY(' + (pose.bodyY || 0) + 'px)';
  }

  function stopPoseLoop(el) {
    var key = el && el.dataset && el.dataset.key;
    if (key && poseTimers[key]) {
      clearInterval(poseTimers[key]);
      delete poseTimers[key];
    }
  }

  function startPoseLoop(el, seq, speedMs) {
    var wrap = getBodyWrap(el);
    if (!wrap || !seq || !seq.length) return;
    stopPoseLoop(el);
    var key = el.dataset.key || String(Math.random());
    el.dataset.key = key;
    var i = 0;
    applyPose(wrap, seq[0]);
    poseTimers[key] = setInterval(function () {
      i = (i + 1) % seq.length;
      applyPose(wrap, seq[i]);
    }, speedMs || 130);
  }

  function humanSvg(opts) {
    var skin = opts.skin;
    var hair = opts.hair;
    var shirt = opts.shirt;
    var pants = opts.pants || '#334155';
    return (
      '<svg class="kf-char-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="kg-skin-' + opts.id + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="' + skin + '"/><stop offset="100%" stop-color="' + shade(skin, -18) + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="kg-shirt-' + opts.id + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="' + shirt + '"/><stop offset="100%" stop-color="' + shade(shirt, -25) + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="kf-char-root">' +
        '<g class="kf-legs">' +
          '<g class="kf-leg kf-leg-l" transform-origin="58 108">' +
            '<rect x="46" y="98" width="14" height="36" rx="6" fill="' + pants + '"/>' +
            '<ellipse cx="53" cy="136" rx="12" ry="5" fill="#1e293b"/>' +
          '</g>' +
          '<g class="kf-leg kf-leg-r" transform-origin="62 108">' +
            '<rect x="60" y="98" width="14" height="36" rx="6" fill="' + shade(pants, -12) + '"/>' +
            '<ellipse cx="67" cy="136" rx="12" ry="5" fill="#1e293b"/>' +
          '</g>' +
        '</g>' +
        '<g class="kf-torso">' +
          '<path d="M38 72 Q60 64 82 72 L86 98 Q60 104 34 98 Z" fill="url(#kg-shirt-' + opts.id + ')"/>' +
          '<path d="M42 98 Q60 102 78 98" stroke="' + shade(shirt, -30) + '" stroke-width="2" fill="none"/>' +
        '</g>' +
        '<g class="kf-arms">' +
          '<g class="kf-arm kf-arm-l" transform-origin="42 78">' +
            '<path d="M38 76 Q28 88 24 102" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="10" stroke-linecap="round" fill="none"/>' +
            '<circle cx="24" cy="104" r="6" fill="url(#kg-skin-' + opts.id + ')"/>' +
          '</g>' +
          '<g class="kf-arm kf-arm-r" transform-origin="78 78">' +
            '<path d="M82 76 Q92 88 96 102" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="10" stroke-linecap="round" fill="none"/>' +
            '<circle cx="96" cy="104" r="6" fill="url(#kg-skin-' + opts.id + ')"/>' +
          '</g>' +
        '</g>' +
        '<g class="kf-head" transform-origin="60 52">' +
          '<ellipse cx="60" cy="48" rx="28" ry="30" fill="url(#kg-skin-' + opts.id + ')"/>' +
          '<path d="M34 38 Q60 18 86 38 Q88 28 60 22 Q32 28 34 38" fill="' + hair + '"/>' +
          '<g class="kf-eyes">' +
            '<ellipse class="kf-eye kf-eye-l" cx="50" cy="46" rx="5" ry="6" fill="#fff"/>' +
            '<circle class="kf-pupil" cx="51" cy="47" r="2.5" fill="#1e293b"/>' +
            '<ellipse class="kf-eye kf-eye-r" cx="70" cy="46" rx="5" ry="6" fill="#fff"/>' +
            '<circle class="kf-pupil" cx="71" cy="47" r="2.5" fill="#1e293b"/>' +
            '<path class="kf-brow" d="M44 38 Q50 34 56 38" stroke="' + hair + '" stroke-width="2" fill="none"/>' +
            '<path class="kf-brow" d="M64 38 Q70 34 76 38" stroke="' + hair + '" stroke-width="2" fill="none"/>' +
          '</g>' +
          '<ellipse class="kf-mouth" cx="60" cy="58" rx="7" ry="4" fill="#c97b7b"/>' +
          '<ellipse cx="42" cy="52" rx="5" ry="3" fill="rgba(255,120,120,0.25)"/>' +
          '<ellipse cx="78" cy="52" rx="5" ry="3" fill="rgba(255,120,120,0.25)"/>' +
        '</g>' +
      '</g></svg>'
    );
  }

  function animalSvg(type, color, id) {
    var c = color || '#f39c12';
    if (type === 'bird') {
      return '<svg class="kf-char-svg" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="kf-char-root">' +
        '<ellipse class="kf-leg-l" cx="45" cy="118" rx="4" ry="14" fill="#e67e22"/>' +
        '<ellipse class="kf-leg-r" cx="75" cy="118" rx="4" ry="14" fill="#d35400"/>' +
        '<ellipse cx="60" cy="75" rx="32" ry="28" fill="' + c + '"/>' +
        '<g class="kf-wing-l" transform-origin="35 70"><ellipse cx="28" cy="68" rx="18" ry="10" fill="' + shade(c, 20) + '"/></g>' +
        '<g class="kf-wing-r" transform-origin="85 70"><ellipse cx="92" cy="68" rx="18" ry="10" fill="' + shade(c, 10) + '"/></g>' +
        '<circle cx="60" cy="55" r="22" fill="' + shade(c, 15) + '"/>' +
        '<circle class="kf-eye-l" cx="52" cy="52" r="5" fill="#fff"/><circle cx="53" cy="53" r="2.5" fill="#1e293b"/>' +
        '<circle class="kf-eye-r" cx="68" cy="52" r="5" fill="#fff"/><circle cx="69" cy="53" r="2.5" fill="#1e293b"/>' +
        '<path class="kf-mouth" d="M55 62 Q60 68 65 62" stroke="#e67e22" stroke-width="2" fill="none"/>' +
        '<polygon points="72,48 95,42 88,55" fill="#f39c12"/>' +
        '</g></svg>';
    }
    if (type === 'cat' || type === 'dog') {
      var ears = type === 'cat'
        ? '<polygon points="38,35 48,12 58,35"/><polygon points="62,35 72,12 82,35"/>'
        : '<ellipse cx="42" cy="28" rx="12" ry="18" fill="' + c + '"/><ellipse cx="78" cy="28" rx="12" ry="18" fill="' + c + '"/>';
      return '<svg class="kf-char-svg" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="kf-char-root">' +
        '<g class="kf-legs"><rect class="kf-leg-l" x="38" y="95" width="12" height="28" rx="5" fill="' + shade(c, -20) + '"/>' +
        '<rect class="kf-leg-r" x="70" y="95" width="12" height="28" rx="5" fill="' + shade(c, -30) + '"/></g>' +
        '<ellipse cx="60" cy="78" rx="34" ry="26" fill="' + c + '"/>' +
        '<circle cx="60" cy="52" r="24" fill="' + shade(c, 10) + '"/>' + ears +
        '<circle class="kf-eye-l" cx="50" cy="50" r="5" fill="#fff"/><circle cx="51" cy="51" r="2" fill="#1e293b"/>' +
        '<circle class="kf-eye-r" cx="70" cy="50" r="5" fill="#fff"/><circle cx="71" cy="51" r="2" fill="#1e293b"/>' +
        '<ellipse class="kf-mouth" cx="60" cy="58" rx="5" ry="3" fill="#c97b7b"/>' +
        '<ellipse cx="60" cy="62" rx="3" ry="2" fill="#fff" opacity="0.5"/>' +
        '</g></svg>';
    }
    /* lion / monkey default quadruped */
    return '<svg class="kf-char-svg" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="kf-char-root">' +
      '<g class="kf-legs">' +
      '<rect class="kf-leg-l" x="32" y="88" width="16" height="38" rx="7" fill="' + shade(c, -15) + '"/>' +
      '<rect class="kf-leg-r" x="72" y="88" width="16" height="38" rx="7" fill="' + shade(c, -25) + '"/>' +
      '</g>' +
      '<ellipse cx="60" cy="72" rx="38" ry="30" fill="' + c + '"/>' +
      (type === 'lion' ? '<circle cx="60" cy="48" r="32" fill="' + shade(c, 15) + '" opacity="0.85"/>' : '') +
      '<circle cx="60" cy="48" r="22" fill="' + c + '"/>' +
      '<circle class="kf-eye-l" cx="50" cy="46" r="5" fill="#fff"/><circle cx="51" cy="47" r="2.5" fill="#1e293b"/>' +
      '<circle class="kf-eye-r" cx="70" cy="46" r="5" fill="#fff"/><circle cx="71" cy="47" r="2.5" fill="#1e293b"/>' +
      '<ellipse class="kf-mouth" cx="60" cy="56" rx="8" ry="5" fill="#5c3d2e"/>' +
      '</g></svg>';
  }

  function robotSvg(color, id) {
    var c = color || '#64748b';
    return '<svg class="kf-char-svg" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="kf-char-root">' +
      '<rect class="kf-leg-l" x="42" y="100" width="14" height="32" rx="4" fill="' + shade(c, -20) + '"/>' +
      '<rect class="kf-leg-r" x="64" y="100" width="14" height="32" rx="4" fill="' + shade(c, -30) + '"/>' +
      '<rect x="34" y="58" width="52" height="48" rx="8" fill="url(#kg-robot-' + id + ')"/>' +
      '<defs><linearGradient id="kg-robot-' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + c + '"/><stop offset="100%" stop-color="' + shade(c, -35) + '"/></linearGradient></defs>' +
      '<rect x="38" y="30" width="44" height="32" rx="10" fill="' + shade(c, 10) + '"/>' +
      '<circle class="kf-eye-l kf-led" cx="50" cy="44" r="6" fill="#22d3ee"/><circle cx="50" cy="44" r="3" fill="#fff" opacity="0.9"/>' +
      '<circle class="kf-eye-r kf-led" cx="70" cy="44" r="6" fill="#22d3ee"/><circle cx="70" cy="44" r="3" fill="#fff" opacity="0.9"/>' +
      '<rect class="kf-mouth" x="48" y="54" width="24" height="4" rx="2" fill="#f59e0b"/>' +
      '<g class="kf-arm-l" transform-origin="34 72"><rect x="18" y="64" width="18" height="8" rx="4" fill="' + c + '"/></g>' +
      '<g class="kf-arm-r" transform-origin="86 72"><rect x="84" y="64" width="18" height="8" rx="4" fill="' + c + '"/></g>' +
      '</g></svg>';
  }

  function shade(hex, pct) {
    var n = parseInt(hex.replace('#', ''), 16);
    if (isNaN(n)) return hex;
    var r = Math.max(0, Math.min(255, (n >> 16) + pct));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct));
    var b = Math.max(0, Math.min(255, (n & 0xff) + pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function resolveType(key, def) {
    if (def.type) return def.type;
    if (['lion', 'bird', 'monkey', 'cat', 'dog'].indexOf(key) >= 0) return key;
    if (key === 'robot') return 'robot';
    return 'human';
  }

  function createCharacter(name, def) {
    var key = name.toLowerCase();
    var h = hash(name);
    var type = resolveType(key, def);
    var id = key.replace(/\W/g, '') + h;
    var color = def.color || '#4f8ef7';

    var svg = '';
    if (type === 'human') {
      svg = humanSvg({
        id: id,
        skin: def.skin || SKINS[h % SKINS.length],
        hair: def.hair || HAIRS[h % HAIRS.length],
        shirt: color,
        pants: def.pants,
      });
    } else if (type === 'robot') {
      svg = robotSvg(color, id);
    } else {
      svg = animalSvg(type, color, id);
    }

    var el = document.createElement('div');
    el.className = 'ss-character kf-char-pro ss-anim-enter';
    el.dataset.key = key;
    el.dataset.charType = type;
    el.dataset.facing = 'right';
    el.innerHTML =
      '<div class="kf-appear-ring" aria-hidden="true"></div>' +
      '<div class="kf-char-shadow"></div>' +
      '<div class="kf-char-body-wrap kf-act-idle">' + svg + '</div>' +
      '<div class="ss-char-label" style="color:' + color + ';border-color:' + color + '40">' +
        esc(def.label || name) + '</div>';

    return el;
  }

  function getBodyWrap(el) {
    return el && el.querySelector('.kf-char-body-wrap');
  }

  function setMotion(el, motion) {
    var wrap = getBodyWrap(el);
    if (!wrap) return;
    stopPoseLoop(el);
    wrap.classList.remove(
      'kf-act-idle', 'kf-act-walk', 'kf-act-run', 'kf-act-wave', 'kf-act-jump',
      'kf-act-bow', 'kf-act-fly', 'kf-act-hide', 'kf-act-smile', 'kf-act-nod',
      'kf-act-cheer', 'kf-act-handshake', 'kf-act-dance', 'kf-sprite-active'
    );
    var map = {
      walks: 'kf-act-walk', runs: 'kf-act-run', waves: 'kf-act-wave', jumps: 'kf-act-jump',
      bows: 'kf-act-bow', flies: 'kf-act-fly', flaps: 'kf-act-fly', hides: 'kf-act-hide',
      smiles: 'kf-act-smile', nods: 'kf-act-nod', cheers: 'kf-act-cheer',
      handshakes: 'kf-act-handshake', dances: 'kf-act-dance', shows: 'kf-act-idle',
      idle: 'kf-act-idle',
    };
    wrap.classList.add(map[motion] || 'kf-act-jump');
    wrap.classList.add('kf-sprite-active');

    var type = el.dataset.charType || 'human';
    if (type === 'human' || type === 'robot') {
      if (motion === 'walks' || motion === 'moves_right' || motion === 'moves_left') {
        startPoseLoop(el, POSES.walk, 140);
      } else if (motion === 'runs') {
        startPoseLoop(el, POSES.run, 95);
      } else if (motion === 'waves') {
        applyPose(wrap, POSES.wave);
      } else if (motion === 'jumps') {
        applyPose(wrap, POSES.jump);
      } else if (motion === 'idle' || motion === 'shows') {
        applyPose(wrap, POSES.idle);
      }
    }
    el.classList.remove('ss-anim-walk', 'ss-anim-run', 'ss-anim-wave', 'ss-anim-jump');
  }

  function setFacing(el, facing) {
    if (!el) return;
    el.dataset.facing = facing === 'left' ? 'left' : 'right';
    var wrap = getBodyWrap(el);
    if (wrap) wrap.style.transform = facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
  }

  function setTalking(el, on) {
    if (!el) return;
    el.classList.toggle('kf-talking', !!on);
  }

  function spawnAppearFx(stage, xPct) {
    if (!stage) return;
    var fx = document.createElement('div');
    fx.className = 'kf-appear-burst';
    fx.style.left = xPct + '%';
    stage.appendChild(fx);
    setTimeout(function () { if (fx.parentNode) fx.remove(); }, 900);
  }

  function spawnDust(stage, x, y, intense) {
    if (!stage) return;
    var n = intense ? 8 : 4;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('div');
      d.className = 'kf-dust-puff';
      d.style.cssText = 'left:' + (x + (Math.random() - 0.5) * 30) + 'px;bottom:' + (y + Math.random() * 10) + 'px;animation-delay:' + (i * 0.04) + 's;';
      stage.appendChild(d);
      setTimeout(function (el) { return function () { if (el.parentNode) el.remove(); }; }(d), 700);
    }
  }

  function buildSceneLayers(stage) {
    if (!stage || stage.querySelector('.kf-layer-sky')) return;
    var sky = document.createElement('div');
    sky.className = 'kf-stage-layer kf-layer-sky';
    var ground = document.createElement('div');
    ground.className = 'kf-stage-layer kf-layer-ground';
    var mid = document.createElement('div');
    mid.className = 'kf-stage-layer kf-layer-mid';
    var vignette = document.createElement('div');
    vignette.className = 'kf-stage-vignette';
    stage.insertBefore(sky, stage.firstChild);
    stage.insertBefore(ground, sky.nextSibling);
    stage.insertBefore(mid, ground.nextSibling);
    stage.appendChild(vignette);
    return { sky: sky, ground: ground, mid: mid };
  }

  function applySceneTheme(stage, sceneKey) {
    var layers = buildSceneLayers(stage);
    if (!layers) return;
    var themes = {
      school: { sky: 'linear-gradient(180deg,#7dd3fc 0%,#bae6fd 55%,#86efac 55%,#4ade80 100%)', ground: '#22c55e' },
      classroom: { sky: 'linear-gradient(180deg,#fef9c3 0%,#fef08a 70%,#d4a574 70%,#a1887f 100%)', ground: '#8d6e63' },
      jungle: { sky: 'linear-gradient(180deg,#14532d 0%,#166534 45%,#3f6212 55%,#365314 100%)', ground: '#3f6212' },
      restaurant: { sky: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 65%,#d6b896 65%,#a1887f 100%)', ground: '#8d6e63' },
      home: { sky: 'linear-gradient(180deg,#e0f2fe 0%,#bae6fd 55%,#a8a29e 55%,#78716c 100%)', ground: '#78716c' },
      playground: { sky: 'linear-gradient(180deg,#38bdf8 0%,#7dd3fc 50%,#86efac 50%,#4ade80 100%)', ground: '#22c55e' },
      space: { sky: 'radial-gradient(ellipse at 50% 30%,#312e81 0%,#0f172a 60%,#020617 100%)', ground: '#1e1b4b' },
      default: { sky: 'linear-gradient(180deg,#c7d2fe 0%,#e0e7ff 55%,#94a3b8 55%,#64748b 100%)', ground: '#64748b' },
    };
    var t = themes[sceneKey] || themes.default;
    if (layers.sky) layers.sky.style.background = t.sky;
    if (layers.ground) layers.ground.style.background = 'linear-gradient(180deg, transparent 0%, ' + t.ground + ' 40%)';
    stage.style.background = 'transparent';
  }

  function transitionScene(stage, cb) {
    if (!stage) { if (cb) cb(); return; }
    var veil = document.createElement('div');
    veil.className = 'kf-scene-veil';
    stage.appendChild(veil);
    requestAnimationFrame(function () { veil.classList.add('active'); });
    setTimeout(function () {
      if (cb) cb();
      veil.classList.remove('active');
      setTimeout(function () { if (veil.parentNode) veil.remove(); }, 500);
    }, 350);
  }

  window.StageGraphics = {
    createCharacter: createCharacter,
    setMotion: setMotion,
    setFacing: setFacing,
    setTalking: setTalking,
    spawnAppearFx: spawnAppearFx,
    spawnDust: spawnDust,
    buildSceneLayers: buildSceneLayers,
    applySceneTheme: applySceneTheme,
    transitionScene: transitionScene,
    getBodyWrap: getBodyWrap,
    stopPoseLoop: stopPoseLoop,
    applyPose: applyPose,
  };
})();
