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

  /* 8-frame walk/run cycles — segmented thighs, shins, arms */
  var WALK_CYCLE = [
    { thighL: 22, shinL: 8, thighR: -18, shinR: 5, armUL: -32, armLL: -12, armUR: 28, armLR: 8, head: 1, torso: -1, bodyY: -3, lean: -1 },
    { thighL: 8, shinL: 15, thighR: -8, shinR: -5, armUL: -12, armLL: 0, armUR: 12, armLR: -5, head: 0, torso: 0, bodyY: -6, lean: 0 },
    { thighL: -5, shinL: 10, thighR: 18, shinR: 12, armUL: 8, armLL: 5, armUR: -25, armLR: -10, head: -1, torso: 1, bodyY: -4, lean: 1 },
    { thighL: -18, shinL: 5, thighR: 22, shinR: 8, armUL: 28, armLL: 10, armUR: -32, armLR: -12, head: 1, torso: 2, bodyY: -3, lean: 2 },
    { thighL: -8, shinL: -5, thighR: 8, shinR: 15, armUL: 12, armLL: -5, armUR: -12, armLR: 0, head: 0, torso: 0, bodyY: -6, lean: 0 },
    { thighL: 18, shinL: 12, thighR: -5, shinR: 10, armUL: -25, armLL: -10, armUR: 8, armLR: 5, head: -1, torso: -1, bodyY: -4, lean: -1 },
    { thighL: 22, shinL: 8, thighR: -18, shinR: 5, armUL: -28, armLL: -8, armUR: 32, armLR: 12, head: 1, torso: 1, bodyY: -3, lean: 1 },
    { thighL: 5, shinL: -2, thighR: -8, shinR: 0, armUL: -8, armLL: 0, armUR: 8, armLR: 0, head: 0, torso: 0, bodyY: -5, lean: 0 },
  ];

  var RUN_CYCLE = [
    { thighL: 45, shinL: 25, thighR: -30, shinR: 10, armUL: -55, armLL: -25, armUR: 50, armLR: 20, head: 3, torso: -8, bodyY: -10, lean: -8 },
    { thighL: 20, shinL: 35, thighR: -15, shinR: -10, armUL: -25, armLL: -15, armUR: 25, armLR: -10, head: 0, torso: -4, bodyY: -14, lean: -5 },
    { thighL: -10, shinL: 20, thighR: 40, shinR: 30, armUL: 15, armLL: 10, armUR: -45, armLR: -20, head: -2, torso: 5, bodyY: -8, lean: 6 },
    { thighL: -35, shinL: 10, thighR: 48, shinR: 28, armUL: 50, armLL: 22, armUR: -55, armLR: -25, head: 4, torso: 8, bodyY: -10, lean: 10 },
    { thighL: -15, shinR: 35, thighR: 15, shinL: -8, armUL: 30, armLL: 5, armUR: -30, armLR: -8, head: 0, torso: 2, bodyY: -14, lean: 4 },
    { thighL: 38, shinL: 28, thighR: -8, shinR: 18, armUL: -48, armLL: -18, armUR: 20, armLR: 12, head: -2, torso: -6, bodyY: -8, lean: -6 },
    { thighL: 48, shinL: 22, thighR: -28, shinR: 8, armUL: -52, armLL: -22, armUR: 48, armLR: 18, head: 3, torso: -7, bodyY: -10, lean: -9 },
    { thighL: 10, shinL: 5, thighR: -5, shinR: 0, armUL: -15, armLL: -5, armUR: 15, armLR: 0, head: 0, torso: 0, bodyY: -12, lean: -3 },
  ];

  var POSE_WAVE = { thighL: 0, shinL: 0, thighR: 0, shinR: 0, armUL: 5, armLL: 0, armUR: -62, armLR: -15, head: 4, torso: 2, bodyY: 0, lean: 0 };
  var POSE_JUMP = [
    { thighL: -8, shinL: 20, thighR: 8, shinR: 20, armUL: -25, armLL: -10, armUR: 25, armLR: 10, head: -5, torso: 5, bodyY: 0, lean: 0 },
    { thighL: -20, shinL: 35, thighR: 20, shinR: 35, armUL: -55, armLL: -20, armUR: 55, armLR: 20, head: -8, torso: -5, bodyY: -38, lean: -3 },
    { thighL: 5, shinL: 5, thighR: -5, shinR: 5, armUL: -15, armLL: 0, armUR: 15, armLR: 0, head: 2, torso: 8, bodyY: -5, lean: 5 },
    { thighL: 0, shinL: 0, thighR: 0, shinR: 0, armUL: 6, armLL: 0, armUR: -6, armLR: 0, head: 0, torso: 0, bodyY: 0, lean: 0 },
  ];

  function stopPoseLoop(el) {
    if (window.StageAnimator) StageAnimator.stop(el);
  }

  function startPoseLoop(el, seq, cycleMs) {
    var wrap = getBodyWrap(el);
    if (!wrap || !window.StageAnimator) return;
    StageAnimator.start(el, wrap, seq, cycleMs);
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
        '<ellipse class="kf-neck" cx="60" cy="68" rx="10" ry="6" fill="url(#kg-skin-' + opts.id + ')"/>' +
        '<g class="kf-legs">' +
          '<g class="kf-leg-l">' +
            '<g class="kf-thigh-l" transform-origin="53 98">' +
              '<path d="M46 98 L58 98 L56 118 L48 118 Z" fill="' + pants + '" rx="2"/>' +
              '<g class="kf-shin-l" transform-origin="53 118">' +
                '<path d="M48 118 L58 118 L56 132 L50 132 Z" fill="' + shade(pants, -15) + '"/>' +
                '<ellipse class="kf-foot-l" cx="53" cy="136" rx="11" ry="4" fill="#334155"/>' +
                '<rect x="48" y="133" width="10" height="3" rx="1" fill="#1e293b"/>' +
              '</g>' +
            '</g>' +
          '</g>' +
          '<g class="kf-leg-r">' +
            '<g class="kf-thigh-r" transform-origin="67 98">' +
              '<path d="M62 98 L74 98 L72 118 L64 118 Z" fill="' + shade(pants, -8) + '"/>' +
              '<g class="kf-shin-r" transform-origin="67 118">' +
                '<path d="M64 118 L74 118 L72 132 L66 132 Z" fill="' + shade(pants, -18) + '"/>' +
                '<ellipse class="kf-foot-r" cx="67" cy="136" rx="11" ry="4" fill="#334155"/>' +
                '<rect x="62" y="133" width="10" height="3" rx="1" fill="#1e293b"/>' +
              '</g>' +
            '</g>' +
          '</g>' +
        '</g>' +
        '<g class="kf-torso">' +
          '<path d="M36 70 Q60 60 84 70 L88 98 Q60 106 32 98 Z" fill="url(#kg-shirt-' + opts.id + ')"/>' +
          '<path d="M40 76 L80 76" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>' +
        '</g>' +
        '<g class="kf-arms">' +
          '<g class="kf-arm-l">' +
            '<g class="kf-arm-ul" transform-origin="42 78">' +
              '<path d="M38 76 L28 92" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="9" stroke-linecap="round"/>' +
              '<g class="kf-arm-ll" transform-origin="28 95">' +
                '<path d="M28 92 L22 108" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="8" stroke-linecap="round"/>' +
                '<circle cx="22" cy="110" r="5.5" fill="url(#kg-skin-' + opts.id + ')"/>' +
              '</g>' +
            '</g>' +
          '</g>' +
          '<g class="kf-arm-r">' +
            '<g class="kf-arm-ur" transform-origin="78 78">' +
              '<path d="M82 76 L92 92" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="9" stroke-linecap="round"/>' +
              '<g class="kf-arm-lr" transform-origin="92 95">' +
                '<path d="M92 92 L98 108" stroke="url(#kg-skin-' + opts.id + ')" stroke-width="8" stroke-linecap="round"/>' +
                '<circle cx="98" cy="110" r="5.5" fill="url(#kg-skin-' + opts.id + ')"/>' +
              '</g>' +
            '</g>' +
          '</g>' +
        '</g>' +
        '<g class="kf-head" transform-origin="60 52">' +
          '<ellipse cx="60" cy="48" rx="27" ry="29" fill="url(#kg-skin-' + opts.id + ')"/>' +
          '<path d="M33 36 Q60 14 87 36 Q90 24 60 18 Q30 24 33 36" fill="' + hair + '"/>' +
          '<g class="kf-eyes">' +
            '<ellipse class="kf-eye kf-eye-l" cx="50" cy="45" rx="6" ry="7" fill="#fff"/>' +
            '<circle class="kf-pupil kf-pupil-l" cx="51" cy="46" r="3" fill="#1e293b"/>' +
            '<circle cx="52" cy="45" r="1" fill="#fff" opacity="0.7"/>' +
            '<ellipse class="kf-eye kf-eye-r" cx="70" cy="45" rx="6" ry="7" fill="#fff"/>' +
            '<circle class="kf-pupil kf-pupil-r" cx="71" cy="46" r="3" fill="#1e293b"/>' +
            '<circle cx="72" cy="45" r="1" fill="#fff" opacity="0.7"/>' +
          '</g>' +
          '<ellipse class="kf-mouth" cx="60" cy="57" rx="6" ry="3.5" fill="#d4767a"/>' +
          '<ellipse cx="41" cy="51" rx="6" ry="3.5" fill="rgba(255,100,100,0.2)"/>' +
          '<ellipse cx="79" cy="51" rx="6" ry="3.5" fill="rgba(255,100,100,0.2)"/>' +
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
    var anim = window.StageAnimator;
    if (type === 'human' && anim) {
      if (motion === 'walks' || motion === 'moves_right' || motion === 'moves_left') {
        startPoseLoop(el, WALK_CYCLE, 680);
      } else if (motion === 'runs') {
        startPoseLoop(el, RUN_CYCLE, 480);
      } else if (motion === 'waves') {
        anim.stop(el);
        anim.applyPose(wrap, POSE_WAVE);
      } else if (motion === 'jumps') {
        startPoseLoop(el, POSE_JUMP, 650);
      } else if (motion === 'idle' || motion === 'shows') {
        anim.idleBreath(el, wrap);
      }
    } else if (type === 'robot') {
      if (motion === 'walks' || motion === 'moves_right' || motion === 'moves_left') {
        startPoseLoop(el, WALK_CYCLE, 680);
      } else if (motion === 'runs') {
        startPoseLoop(el, RUN_CYCLE, 480);
      }
    }
    el.classList.remove('ss-anim-walk', 'ss-anim-run', 'ss-anim-wave', 'ss-anim-jump');
  }

  function setFacing(el, facing) {
    if (!el) return;
    el.dataset.facing = facing === 'left' ? 'left' : 'right';
    var svg = el.querySelector('.kf-char-svg');
    if (svg) svg.style.transform = facing === 'left' ? 'scaleX(-1)' : '';
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
    var floor = document.createElement('div');
    floor.className = 'kf-stage-floor';
    var mid = document.createElement('div');
    mid.className = 'kf-stage-layer kf-layer-mid';
    var vignette = document.createElement('div');
    vignette.className = 'kf-stage-vignette';
    var light = document.createElement('div');
    light.className = 'kf-stage-light';
    stage.insertBefore(sky, stage.firstChild);
    stage.insertBefore(ground, sky.nextSibling);
    stage.insertBefore(floor, ground.nextSibling);
    stage.insertBefore(mid, floor.nextSibling);
    stage.appendChild(light);
    stage.appendChild(vignette);
    return { sky: sky, ground: ground, floor: floor, mid: mid };
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
  };
})();
