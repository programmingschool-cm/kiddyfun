/**
 * KiddyFun Stage Graphics — jointed SVG characters, scenes, effects.
 * Angle 0 is the rest pose. Each limb's pivot is the start of that limb.
 */
(function () {
  'use strict';

  var SKINS = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
  var HAIRS = ['#2C1810', '#4A3728', '#1a1a1a', '#6B4423', '#D4A574'];

  var UPPER = 24;
  var FORE = 20;
  var THIGH = 26;
  var SHIN = 22;
  var SH_L = [46, 84];
  var SH_R = [94, 84];
  var HIP_L = [56, 120];
  var HIP_R = [84, 120];

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function shade(hex, pct) {
    var n = parseInt(String(hex).replace('#', ''), 16);
    if (isNaN(n)) return hex;
    var r = Math.max(0, Math.min(255, (n >> 16) + pct));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct));
    var b = Math.max(0, Math.min(255, (n & 0xff) + pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function grp(cls, joint, ox, oy, len, inner, rest) {
    var lenAttr = len != null ? ' data-len="' + len + '"' : '';
    var rot = rest ? ' rotate(' + rest + ')' : '';
    return '<g class="' + cls + '" data-joint="' + joint + '" data-ox="' + ox + '" data-oy="' + oy + '"' + lenAttr +
      ' transform="translate(' + ox + ',' + oy + ')' + rot + '">' + inner + '</g>';
  }

  function pivot(cls, joint, ox, oy, inner) {
    return '<g class="' + cls + '" data-joint="' + joint + '" data-mode="pivot" data-ox="' + ox + '" data-oy="' + oy +
      '" transform="rotate(0 ' + ox + ' ' + oy + ')">' + inner + '</g>';
  }

  function bone(len, w, fill) {
    var r = w / 2;
    return '<circle class="kf-ink" cx="0" cy="0" r="' + r + '" fill="' + fill + '"/>' +
      '<rect class="kf-ink" x="' + (-w / 2) + '" y="-1.2" width="' + w + '" height="' + (len + 1.2) + '" rx="' + r + '" fill="' + fill + '"/>';
  }

  function handSvg(side, skin, foreLen) {
    var wrist = side === 'r' ? 'wristR' : 'wristL';
    var fingers = side === 'r' ? 'fingersR' : 'fingersL';
    var dir = side === 'r' ? 1 : -1;
    var lobes =
      '<rect class="kf-ink-soft" x="-6.4" y="0" width="4.3" height="8.6" rx="2.1" fill="' + skin + '"/>' +
      '<rect class="kf-ink-soft" x="-2.15" y="0" width="4.3" height="9.4" rx="2.1" fill="' + skin + '"/>' +
      '<rect class="kf-ink-soft" x="2.15" y="0" width="4.3" height="8.2" rx="2.1" fill="' + skin + '"/>';
    return grp(side === 'r' ? 'kf-hand-r' : 'kf-hand-l', wrist, 0, foreLen, null,
      '<circle class="kf-ink" cx="0" cy="0" r="5.6" fill="' + skin + '"/>' +
      '<rect class="kf-ink" x="-7.2" y="0.5" width="14.4" height="12" rx="6" fill="' + skin + '"/>' +
      grp(side === 'r' ? 'kf-fingers-r' : 'kf-fingers-l', fingers, 0, 11, null, lobes) +
      '<ellipse class="kf-ink-soft" cx="' + (dir * 7.4) + '" cy="3" rx="3.4" ry="4.6" transform="rotate(' + (dir * 36) + ' ' + (dir * 7.4) + ' 3)" fill="' + skin + '"/>'
    );
  }

  function clawSvg(side, color, foreLen) {
    var wrist = side === 'r' ? 'wristR' : 'wristL';
    var finger = side === 'r' ? 'fingersR' : 'fingersL';
    var claw = side === 'r' ? 'clawR' : 'clawL';
    var metal = shade(color, 16);
    return grp(side === 'r' ? 'kf-hand-r' : 'kf-hand-l', wrist, 0, foreLen, null,
      '<rect class="kf-ink" x="-6" y="-2" width="12" height="8" rx="2" fill="' + color + '"/>' +
      grp('', finger, -3.2, 5, null, '<rect class="kf-ink" x="-2.1" y="0" width="4.2" height="11" rx="2" fill="' + metal + '"/>') +
      grp('', claw, 3.2, 5, null, '<rect class="kf-ink" x="-2.1" y="0" width="4.2" height="11" rx="2" fill="' + shade(color, 4) + '"/>')
    );
  }

  function armSvg(side, x, y, sleeve, skin, foreLen, handHtml) {
    var upper = side === 'r' ? 'armUR' : 'armUL';
    var fore = side === 'r' ? 'armLR' : 'armLL';
    return grp(side === 'r' ? 'kf-arm-ur' : 'kf-arm-ul', upper, x, y, UPPER,
      bone(UPPER, 12, sleeve) +
      grp(side === 'r' ? 'kf-arm-lr' : 'kf-arm-ll', fore, 0, UPPER, foreLen,
        bone(foreLen, 9.2, skin) + handHtml
      ),
      side === 'r' ? -14 : 14
    );
  }

  function legSvg(side, x, y, fill, shoe) {
    var thigh = side === 'r' ? 'thighR' : 'thighL';
    var shin = side === 'r' ? 'shinR' : 'shinL';
    var foot = side === 'r' ? 'footR' : 'footL';
    var toe = side === 'r' ? 7 : -7;
    return grp(side === 'r' ? 'kf-thigh-r' : 'kf-thigh-l', thigh, x, y, THIGH,
      bone(THIGH, side === 'r' ? 13 : 12, fill) +
      grp(side === 'r' ? 'kf-shin-r' : 'kf-shin-l', shin, 0, THIGH, SHIN,
        bone(SHIN, 10, shade(fill, -14)) +
        grp(side === 'r' ? 'kf-foot-r' : 'kf-foot-l', foot, 0, SHIN, null,
          '<ellipse class="kf-ink" cx="' + toe + '" cy="4.6" rx="13" ry="5.2" fill="' + shoe + '"/>' +
          '<rect x="' + (toe - 5) + '" y="2.2" width="9" height="2.2" rx="1" fill="#e2e8f0"/>'
        )
      )
    );
  }

  function faceBits(skin, yMouth) {
    return (
      '<ellipse class="kf-eye kf-eye-l" cx="57" cy="46" rx="6.5" ry="7.1" fill="#fff"/>' +
      '<circle class="kf-pupil kf-pupil-l" cx="58.5" cy="47.1" r="3.15" fill="#0f172a"/>' +
      '<circle cx="59.6" cy="45.7" r="1.2" fill="#fff"/>' +
      '<ellipse class="kf-eye kf-eye-r" cx="83" cy="46" rx="6.5" ry="7.1" fill="#fff"/>' +
      '<circle class="kf-pupil kf-pupil-r" cx="84.5" cy="47.1" r="3.15" fill="#0f172a"/>' +
      '<circle cx="85.6" cy="45.7" r="1.2" fill="#fff"/>' +
      '<path d="M49 37.5 Q57 34.5 64 38" fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M76 38 Q83 34.5 91 37.5" fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/>' +
      '<ellipse cx="47" cy="55" rx="5.6" ry="3.2" fill="rgba(255,110,110,0.28)"/>' +
      '<ellipse cx="93" cy="55" rx="5.6" ry="3.2" fill="rgba(255,110,110,0.28)"/>' +
      '<ellipse cx="70" cy="52" rx="2.2" ry="1.4" fill="rgba(180,80,70,0.35)"/>' +
      '<g class="kf-mouth-rest"><ellipse class="kf-mouth" cx="70" cy="' + yMouth + '" rx="5.4" ry="3.3" fill="#c45c64"/></g>' +
      '<g class="kf-mouth-smile"><path class="kf-mouth" d="M57 ' + (yMouth - 1) + ' Q70 ' + (yMouth + 11) + ' 83 ' + (yMouth - 1) + ' Q70 ' + (yMouth + 4) + ' 57 ' + (yMouth - 1) + '" fill="#c45c64"/></g>' +
      '<g class="kf-mouth-open"><ellipse cx="70" cy="' + (yMouth + 1) + '" rx="6.2" ry="7.2" fill="#7f1d1d"/><ellipse cx="70" cy="' + (yMouth + 4.5) + '" rx="4" ry="2" fill="#fecdd3"/></g>' +
      '<g class="kf-mouth-talk"><ellipse class="kf-mouth-a" cx="70" cy="' + yMouth + '" rx="5.2" ry="5.6" fill="#9f1239"/><ellipse class="kf-mouth-b" cx="70" cy="' + yMouth + '" rx="6.6" ry="3.1" fill="#9f1239"/></g>' +
      '<rect class="kf-lid kf-lid-l" x="49" y="33" width="16.5" height="11" rx="5" fill="' + skin + '"/>' +
      '<rect class="kf-lid kf-lid-r" x="74.5" y="33" width="16.5" height="11" rx="5" fill="' + skin + '"/>'
    );
  }

  function humanSvg(opts) {
    var monkey = opts.variant === 'monkey';
    var skin = opts.skin;
    var hair = opts.hair;
    var shirt = opts.shirt;
    var pants = opts.pants || '#334155';
    var sleeve = monkey ? skin : shirt;
    var fore = monkey ? shade(skin, -10) : shade(skin, -8);
    var shoe = '#1e293b';
    var id = opts.id;
    var ears = monkey
      ? '<ellipse class="kf-ink" cx="38" cy="50" rx="10" ry="12" fill="' + skin + '"/><ellipse class="kf-ink" cx="102" cy="50" rx="10" ry="12" fill="' + skin + '"/>' +
        '<ellipse cx="38" cy="52" rx="5" ry="7" fill="' + shade(skin, 18) + '"/><ellipse cx="102" cy="52" rx="5" ry="7" fill="' + shade(skin, 18) + '"/>'
      : '';
    var hairPath = monkey
      ? '<path class="kf-hair kf-ink" d="M52 40 Q58 22 70 20 Q82 22 88 40 Q78 30 70 30 Q62 30 52 40" fill="' + hair + '"/>'
      : '<path class="kf-hair kf-ink" d="M40 50 Q34 16 70 12 Q106 16 100 50 Q90 28 70 24 Q50 28 40 50" fill="' + hair + '"/>';
    var belly = monkey
      ? '<ellipse cx="70" cy="104" rx="16" ry="14" fill="' + shade(skin, 16) + '"/>'
      : '<path d="M54 90 Q70 84 86 90" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="3" stroke-linecap="round"/>';
    var tail = monkey
      ? grp('kf-tail', 'tail', 40, 112, null, '<path d="M0 0 Q-22 6 -16 -24" fill="none" stroke="' + shade(skin, -24) + '" stroke-width="7" stroke-linecap="round"/>')
      : '';
    var headInner = ears + hairPath +
      '<ellipse class="kf-ink" cx="70" cy="48" rx="28" ry="30" fill="url(#kg-skin-' + id + ')"/>' +
      (monkey ? '<ellipse cx="70" cy="58" rx="14" ry="10" fill="' + shade(skin, 14) + '"/>' : '') +
      faceBits(skin, monkey ? 62 : 60);

    return (
      '<svg class="kf-char-svg" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="kg-skin-' + id + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + shade(skin, 12) + '"/><stop offset="100%" stop-color="' + shade(skin, -16) + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="kg-shirt-' + id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + shade(shirt, 18) + '"/><stop offset="100%" stop-color="' + shade(shirt, -22) + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="kf-char-root" data-origin="70 174">' +
        legSvg('l', HIP_L[0], HIP_L[1], shade(pants, -16), shoe) +
        pivot('kf-torso', 'torso', 70, 116,
          '<ellipse cx="70" cy="78" rx="12" ry="8" fill="url(#kg-skin-' + id + ')"/>' +
          '<path class="kf-ink" d="M44 82 Q70 70 96 82 L102 118 Q70 134 38 118 Z" fill="url(#kg-shirt-' + id + ')"/>' +
          belly
        ) +
        legSvg('r', HIP_R[0], HIP_R[1], pants, shoe) +
        armSvg('l', SH_L[0], SH_L[1], sleeve, fore, FORE, handSvg('l', skin, FORE)) +
        tail +
        pivot('kf-head', 'head', 70, 78, headInner) +
        armSvg('r', SH_R[0], SH_R[1], sleeve, fore, FORE, handSvg('r', skin, FORE)) +
      '</g></svg>'
    );
  }

  function robotSvg(color, id) {
    var c = color || '#64748b';
    var dark = shade(c, -24);
    var arm = function (side, x, y) {
      return armSvg(side, x, y, c, shade(c, -8), FORE, clawSvg(side, c, FORE));
    };
    var leg = function (side, x, y, fill) {
      return legSvg(side, x, y, fill, shade(c, -36));
    };
    return (
      '<svg class="kf-char-svg" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g class="kf-char-root" data-origin="70 174">' +
        leg('l', HIP_L[0], HIP_L[1], dark) +
        pivot('kf-torso', 'torso', 70, 116,
          '<rect class="kf-ink" x="46" y="78" width="48" height="46" rx="8" fill="' + c + '"/>' +
          '<rect x="62" y="88" width="16" height="10" rx="2" fill="' + shade(c, 24) + '"/>' +
          '<circle cx="70" cy="108" r="3" fill="#22d3ee"/>'
        ) +
        leg('r', HIP_R[0], HIP_R[1], shade(c, -12)) +
        arm('l', SH_L[0], SH_L[1]) +
        pivot('kf-head', 'head', 70, 78,
          '<rect x="62" y="18" width="6" height="12" rx="2" fill="' + dark + '"/>' +
          '<circle cx="65" cy="16" r="4" fill="#f59e0b"/>' +
          '<rect class="kf-ink" x="44" y="28" width="52" height="40" rx="10" fill="' + shade(c, 8) + '"/>' +
          '<circle class="kf-eye kf-eye-l kf-led" cx="58" cy="46" r="6" fill="#22d3ee"/><circle cx="58" cy="46" r="2.4" fill="#fff"/>' +
          '<circle class="kf-eye kf-eye-r kf-led" cx="82" cy="46" r="6" fill="#22d3ee"/><circle cx="82" cy="46" r="2.4" fill="#fff"/>' +
          '<g class="kf-mouth-rest"><rect class="kf-mouth" x="58" y="58" width="24" height="5" rx="2" fill="#f59e0b"/></g>' +
          '<g class="kf-mouth-smile"><path d="M58 58 Q70 68 82 58" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/></g>' +
          '<g class="kf-mouth-open"><rect x="60" y="56" width="20" height="10" rx="3" fill="#f59e0b"/></g>' +
          '<g class="kf-mouth-talk"><rect class="kf-mouth-a" x="60" y="57" width="20" height="8" rx="2" fill="#f59e0b"/><rect class="kf-mouth-b" x="62" y="59" width="16" height="4" rx="2" fill="#fde68a"/></g>' +
          '<rect class="kf-lid kf-lid-l" x="50" y="34" width="16" height="10" rx="3" fill="' + shade(c, 8) + '"/>' +
          '<rect class="kf-lid kf-lid-r" x="74" y="34" width="16" height="10" rx="3" fill="' + shade(c, 8) + '"/>'
        ) +
        arm('r', SH_R[0], SH_R[1]) +
      '</g></svg>'
    );
  }

  function quadLeg(jointT, jointS, jointP, x, y, tLen, sLen, w, color) {
    return grp('', jointT, x, y, tLen,
      bone(tLen, w, color) +
      grp('', jointS, 0, tLen, sLen,
        bone(sLen, w - 2, shade(color, -16)) +
        grp('', jointP, 0, sLen, null,
          '<ellipse class="kf-ink" cx="0" cy="3.5" rx="' + (w * 0.72) + '" ry="4.2" fill="' + shade(color, -28) + '"/>' +
          '<circle cx="-3" cy="1.2" r="1.7" fill="' + shade(color, -36) + '"/>' +
          '<circle cx="0" cy="0.6" r="1.7" fill="' + shade(color, -36) + '"/>' +
          '<circle cx="3" cy="1.2" r="1.7" fill="' + shade(color, -36) + '"/>'
        )
      )
    );
  }

  function animalFace(yMouth) {
    return (
      '<circle class="kf-eye kf-eye-l" cx="58" cy="44" r="5" fill="#fff"/><circle class="kf-pupil kf-pupil-l" cx="59.2" cy="44.6" r="2.4" fill="#0f172a"/>' +
      '<circle cx="60" cy="43.6" r="1" fill="#fff"/>' +
      '<circle class="kf-eye kf-eye-r" cx="82" cy="44" r="5" fill="#fff"/><circle class="kf-pupil kf-pupil-r" cx="83.2" cy="44.6" r="2.4" fill="#0f172a"/>' +
      '<circle cx="84" cy="43.6" r="1" fill="#fff"/>' +
      '<ellipse cx="70" cy="52" rx="3" ry="2" fill="#7f1d1d" opacity="0.55"/>' +
      '<g class="kf-mouth-rest"><ellipse class="kf-mouth" cx="70" cy="' + yMouth + '" rx="5" ry="3" fill="#c45c64"/></g>' +
      '<g class="kf-mouth-smile"><path d="M60 ' + yMouth + ' Q70 ' + (yMouth + 8) + ' 80 ' + yMouth + '" fill="none" stroke="#c45c64" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="kf-mouth-open"><ellipse cx="70" cy="' + (yMouth + 1) + '" rx="5" ry="4.5" fill="#7f1d1d"/></g>' +
      '<g class="kf-mouth-talk"><ellipse class="kf-mouth-a" cx="70" cy="' + yMouth + '" rx="4.5" ry="3.6" fill="#9f1239"/><ellipse class="kf-mouth-b" cx="70" cy="' + yMouth + '" rx="5.5" ry="2.2" fill="#9f1239"/></g>'
    );
  }

  function animalSvg(type, color, id) {
    var c = color || '#f59e0b';
    if (type === 'bird') {
      return (
        '<svg class="kf-char-svg" viewBox="0 0 140 168" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<g class="kf-char-root" data-origin="70 142">' +
          quadLeg('thighFL', 'shinFL', 'pawFL', 56, 108, 14, 12, 7, '#e67e22') +
          quadLeg('thighFR', 'shinFR', 'pawFR', 84, 108, 14, 12, 7, '#d35400') +
          grp('kf-wing-l', 'wingL', 38, 86, null, '<ellipse class="kf-ink" cx="-20" cy="0" rx="22" ry="10" fill="' + shade(c, 16) + '"/>') +
          '<ellipse class="kf-ink" cx="70" cy="92" rx="30" ry="24" fill="' + c + '"/>' +
          grp('kf-wing-r', 'wingR', 102, 86, null, '<ellipse class="kf-ink" cx="20" cy="0" rx="22" ry="10" fill="' + shade(c, 6) + '"/>') +
          pivot('kf-head', 'head', 70, 70,
            '<circle class="kf-ink" cx="70" cy="46" r="22" fill="' + shade(c, 12) + '"/>' +
            animalFace(58) +
            '<polygon points="86,48 112,42 90,58" fill="#f59e0b"/>'
          ) +
        '</g></svg>'
      );
    }

    var ears = '';
    if (type === 'cat') {
      ears = '<polygon points="50,34 58,12 68,34" fill="' + c + '"/><polygon points="72,34 82,12 90,34" fill="' + c + '"/>' +
        '<polygon points="54,32 58,18 64,32" fill="#fda4af"/><polygon points="76,32 82,18 86,32" fill="#fda4af"/>';
    } else if (type === 'dog') {
      ears = '<ellipse cx="48" cy="36" rx="12" ry="18" fill="' + shade(c, -12) + '"/><ellipse cx="92" cy="36" rx="12" ry="18" fill="' + shade(c, -18) + '"/>';
    }
    var mane = type === 'lion'
      ? '<circle cx="70" cy="46" r="34" fill="' + shade(c, 18) + '" opacity="0.9"/>'
      : '';
    var legC = shade(c, -8);
    return (
      '<svg class="kf-char-svg" viewBox="0 0 140 168" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g class="kf-char-root" data-origin="70 146">' +
        quadLeg('thighBL', 'shinBL', 'pawBL', 52, 102, 20, 16, 11, shade(c, -20)) +
        quadLeg('thighBR', 'shinBR', 'pawBR', 88, 102, 20, 16, 11, shade(c, -26)) +
        grp('kf-tail', 'tail', 30, 90, null, '<path d="M0 0 Q-24 8 -18 -22" fill="none" stroke="' + shade(c, -30) + '" stroke-width="8" stroke-linecap="round"/>') +
        pivot('kf-torso', 'torso', 70, 108,
          '<ellipse class="kf-ink" cx="70" cy="96" rx="40" ry="28" fill="' + c + '"/>' +
          '<ellipse cx="70" cy="104" rx="18" ry="14" fill="' + shade(c, 18) + '"/>'
        ) +
        quadLeg('thighFL', 'shinFL', 'pawFL', 36, 108, 16, 14, 12, legC) +
        quadLeg('thighFR', 'shinFR', 'pawFR', 104, 108, 16, 14, 12, shade(c, -14)) +
        pivot('kf-head', 'head', 70, 72,
          mane + ears +
          '<circle class="kf-ink" cx="70" cy="46" r="24" fill="' + shade(c, 8) + '"/>' +
          animalFace(58)
        ) +
      '</g></svg>'
    );
  }

  var POSE_BASE = {
    thighL: 0, shinL: 0, footL: 0, thighR: 0, shinR: 0, footR: 0,
    armUL: 14, armLL: 4, wristL: 0, fingersL: 3, clawL: -3,
    armUR: -14, armLR: -4, wristR: 0, fingersR: 3, clawR: -3,
    head: 0, torso: 0, bodyY: 0, lean: 0, scaleX: 1, scaleY: 1, blink: 0,
    wingL: 0, wingR: 0, tail: 0,
    thighFL: 0, shinFL: 0, pawFL: 0, thighFR: 0, shinFR: 0, pawFR: 0,
    thighBL: 0, shinBL: 0, pawBL: 0, thighBR: 0, shinBR: 0, pawBR: 0,
    face: '',
  };

  function P(partial) {
    var o = {};
    var k;
    for (k in POSE_BASE) o[k] = POSE_BASE[k];
    for (k in partial) if (partial[k] != null) o[k] = partial[k];
    if (partial.footL == null) o.footL = -(o.thighL + o.shinL);
    if (partial.footR == null) o.footR = -(o.thighR + o.shinR);
    if (partial.clawR == null) o.clawR = -o.fingersR;
    if (partial.clawL == null) o.clawL = -o.fingersL;
    return o;
  }

  /* Stance foot stays down; the swinging knee bends so that foot lifts. */
  var WALK_CYCLE = [
    P({ thighL: -22, shinL: 6, thighR: 18, shinR: 48, armUL: -22, armLL: 20, armUR: -36, armLR: 8, bodyY: 3, lean: -2, torso: -2, head: 2, tail: 10 }),
    P({ thighL: -8, shinL: 10, thighR: 8, shinR: 22, armUL: -8, armLL: 8, armUR: -18, armLR: 4, bodyY: 0, tail: -4 }),
    P({ thighL: 4, shinL: 36, thighR: -6, shinR: 8, armUL: 12, armLL: 6, armUR: 8, armLR: -8, bodyY: -2, tail: 8 }),
    P({ thighL: 20, shinL: 50, thighR: -20, shinR: 4, armUL: 34, armLL: 8, armUR: 24, armLR: -18, bodyY: 2.4, lean: 2, torso: 2, head: -2, tail: -10 }),
    P({ thighL: 10, shinL: 18, thighR: -4, shinR: 8, armUL: 16, armLL: 6, armUR: 6, armLR: -6, bodyY: 0, tail: 4 }),
    P({ thighL: -6, shinL: 8, thighR: 6, shinR: 34, armUL: -6, armLL: 8, armUR: -14, armLR: 6, bodyY: -2, tail: -6 }),
    P({ thighL: -20, shinL: 4, thighR: 22, shinR: 52, armUL: -26, armLL: 18, armUR: -38, armLR: 8, bodyY: 2.4, lean: -2, head: 2, tail: 12 }),
    P({ thighL: -10, shinL: 6, thighR: 6, shinR: 16, armUL: -10, armLL: 6, armUR: -16, armLR: 4, bodyY: 0.4, tail: -2 }),
  ];

  var RUN_CYCLE = [
    P({ thighL: -38, shinL: 14, thighR: 32, shinR: 62, armUL: -40, armLL: 28, armUR: -58, armLR: 12, bodyY: 4, lean: -8, torso: -4, head: 3, scaleY: 1.04, tail: 16 }),
    P({ thighL: -12, shinL: 22, thighR: 10, shinR: 28, armUL: -12, armLL: 10, armUR: -24, armLR: 6, bodyY: -8, lean: -6, tail: -8 }),
    P({ thighL: 8, shinL: 48, thighR: -14, shinR: 12, armUL: 18, armLL: 8, armUR: 10, armLR: -10, bodyY: -4, lean: 4, tail: 10 }),
    P({ thighL: 36, shinL: 64, thighR: -36, shinR: 10, armUL: 56, armLL: 12, armUR: 42, armLR: -24, bodyY: 3, lean: 8, torso: 4, head: -2, tail: -14 }),
    P({ thighL: 14, shinL: 26, thighR: -8, shinR: 14, armUL: 22, armLL: 8, armUR: 8, armLR: -8, bodyY: -8, lean: 5, tail: 6 }),
    P({ thighL: -10, shinL: 16, thighR: 12, shinR: 46, armUL: -10, armLL: 10, armUR: -22, armLR: 8, bodyY: -3, lean: -4, tail: -6 }),
    P({ thighL: -36, shinL: 10, thighR: 38, shinR: 66, armUL: -48, armLL: 26, armUR: -62, armLR: 12, bodyY: 4, lean: -9, head: 3, tail: 14 }),
    P({ thighL: -14, shinL: 12, thighR: 8, shinR: 20, armUL: -16, armLL: 8, armUR: -20, armLR: 6, bodyY: -6, lean: -4, tail: -4 }),
  ];

  var ANIMAL_WALK = [
    P({ thighFL: -18, shinFL: 8, thighFR: 14, shinFR: 26, thighBL: 12, shinBL: 18, thighBR: -14, shinBR: 6, bodyY: 2, tail: 14, lean: -2 }),
    P({ thighFL: -4, shinFL: 6, thighFR: 4, shinFR: 8, thighBL: 2, shinBL: 4, thighBR: -2, shinBR: 4, bodyY: -3, tail: -6 }),
    P({ thighFL: 16, shinFL: 28, thighFR: -16, shinFR: 6, thighBL: -12, shinBL: 6, thighBR: 14, shinBR: 20, bodyY: 2, tail: -12, lean: 2 }),
    P({ thighFL: 4, shinFL: 8, thighFR: -4, shinFR: 6, thighBL: -2, shinBL: 4, thighBR: 4, shinBR: 6, bodyY: -3, tail: 8 }),
  ];

  var FLY_CYCLE = [
    P({ wingL: -32, wingR: 30, bodyY: -6, lean: -3, thighFL: 6, shinFL: 8, thighFR: -6, shinFR: 8 }),
    P({ wingL: 16, wingR: -14, bodyY: -14, thighFL: -4, shinFL: 4, thighFR: 4, shinFR: 4 }),
    P({ wingL: 34, wingR: -32, bodyY: -8, lean: 3, thighFL: 4, shinFL: 6, thighFR: -4, shinFR: 6 }),
    P({ wingL: -10, wingR: 12, bodyY: -12, lean: -1 }),
  ];

  var WAVE = [
    P({ armUR: -30, armLR: 8, head: -2, torso: -1 }),
    P({ armUR: -150, armLR: 34, wristR: -20, fingersR: -8, head: -5, torso: -2, face: 'smile', blink: 1 }),
    P({ armUR: -156, armLR: 30, wristR: 26, fingersR: 16, head: -4, torso: -2, face: 'smile' }),
    P({ armUR: -148, armLR: 36, wristR: -24, fingersR: -12, head: -6, torso: -1, face: 'smile' }),
    P({ armUR: -154, armLR: 32, wristR: 18, fingersR: 10, head: -4, face: 'smile' }),
    P({ armUR: -36, armLR: 12, wristR: 4, head: -2, face: 'smile' }),
  ];

  var CLAP = [
    P({ armUL: -48, armLL: 70, armUR: 48, armLR: -70, torso: 2 }),
    P({ armUL: -86, armLL: 110, armUR: 86, armLR: -110, wristL: 8, wristR: -8, fingersL: 14, fingersR: 14, bodyY: -2, face: 'smile', head: -2 }),
    P({ armUL: -60, armLL: 90, armUR: 60, armLR: -90, bodyY: 1, face: 'smile' }),
    P({ armUL: -86, armLL: 110, armUR: 86, armLR: -110, fingersL: 16, fingersR: 16, bodyY: -3, face: 'smile' }),
    P({ face: 'smile' }),
  ];

  var CHEER = [
    P({ armUL: 155, armLL: -16, armUR: -155, armLR: 16, wristL: 10, wristR: -10, fingersL: -6, fingersR: 6, bodyY: -4, scaleY: 1.04, head: -4, face: 'smile' }),
    P({ armUL: 164, armLL: -12, armUR: -164, armLR: 12, bodyY: -13, scaleY: 1.07, head: -6, face: 'open' }),
    P({ armUL: 150, armLL: -18, armUR: -150, armLR: 18, bodyY: -3, scaleY: 1.03, face: 'smile' }),
    P({ armUL: 162, armLL: -14, armUR: -162, armLR: 14, bodyY: -11, scaleY: 1.06, face: 'smile' }),
    P({ face: 'smile' }),
  ];

  var DANCE = [
    P({ lean: -8, thighL: -8, shinL: 26, thighR: 10, shinR: 18, armUL: 128, armLL: -8, armUR: -22, armLR: 10, bodyY: -2, head: -4, face: 'smile', tail: 12 }),
    P({ lean: 8, thighL: 10, shinL: 16, thighR: -8, shinR: 26, armUL: 18, armLL: 8, armUR: -128, armLR: 10, bodyY: -5, head: 4, face: 'smile', tail: -12 }),
    P({ lean: -6, thighL: -4, shinL: 20, thighR: 6, shinR: 14, armUL: 100, armLL: -6, armUR: 18, armLR: -12, bodyY: -1, head: -6, face: 'smile', tail: 8 }),
    P({ lean: 7, thighL: 8, shinL: 18, thighR: -6, shinR: 24, armUL: -14, armLL: 12, armUR: -108, armLR: 8, bodyY: -6, head: 5, face: 'smile', tail: -8 }),
  ];

  var HAND_SOLO = [
    P({ armUR: -78, armLR: 24, wristR: 8, fingersR: 6, torso: -3, head: -3, face: 'smile' }),
    P({ armUR: -70, armLR: 18, wristR: -4, fingersR: 14, bodyY: -2, head: -4, face: 'smile' }),
    P({ armUR: -82, armLR: 26, wristR: 10, fingersR: 8, bodyY: 1, face: 'smile' }),
    P({ armUR: -68, armLR: 16, fingersR: 16, bodyY: -3, face: 'smile' }),
    P({ face: 'smile' }),
  ];

  var JUMP = [
    P({ thighL: -18, shinL: 42, thighR: 18, shinR: 42, armUL: 18, armUR: -18, bodyY: 6, scaleX: 1.08, scaleY: 0.86, torso: 8, head: 6 }),
    P({ thighL: -12, shinL: 18, thighR: 14, shinR: 16, armUL: 150, armLL: -12, armUR: -150, armLR: 12, bodyY: -36, scaleX: 0.94, scaleY: 1.12, head: -8, torso: -4, face: 'open' }),
    P({ thighL: -6, shinL: 10, thighR: 8, shinR: 8, armUL: 96, armUR: -96, bodyY: -16, scaleX: 0.98, scaleY: 1.04, head: -3 }),
    P({ thighL: -20, shinL: 36, thighR: 20, shinR: 36, armUL: 26, armUR: -24, bodyY: 8, scaleX: 1.16, scaleY: 0.74, head: 7, torso: 9 }),
    P({ bodyY: 0, face: 'smile', head: -2 }),
  ];

  var BOW = [
    P({ torso: 8, head: 6, armUL: 10, armUR: -10 }),
    P({ torso: 28, head: 18, armUL: 16, armUR: -16, bodyY: 2 }),
    P({ torso: 4, head: 2, face: 'smile' }),
  ];

  var NOD = [
    P({ head: 4 }),
    P({ head: 14, torso: 3 }),
    P({ head: -6 }),
    P({ head: 12, torso: 2 }),
    P({ head: 0, face: 'smile' }),
  ];

  var SMILE = [
    P({ face: 'smile', head: -3, scaleY: 1.03, armUR: 12, armUL: -12 }),
    P({ face: 'smile', head: -1, scaleY: 1 }),
  ];

  var PAW_WAVE = [
    P({ thighFR: -16, shinFR: 8 }),
    P({ thighFR: -78, shinFR: 24, head: -4, face: 'smile' }),
    P({ thighFR: -68, shinFR: 16, pawFR: 18, face: 'smile' }),
    P({ thighFR: -82, shinFR: 26, pawFR: -14, head: -5, face: 'smile' }),
    P({ thighFR: -10, shinFR: 4, face: 'smile' }),
  ];

  var ANIMAL_JUMP = [
    P({ thighFL: 8, shinFL: 20, thighFR: -8, shinFR: 20, thighBL: -6, shinBL: 16, thighBR: 6, shinBR: 16, bodyY: 3, scaleY: 0.9 }),
    P({ bodyY: -18, scaleY: 1.08, wingL: -20, wingR: 20, face: 'open' }),
    P({ thighFL: -8, shinFL: 18, thighFR: 8, shinFR: 18, bodyY: 4, scaleX: 1.08, scaleY: 0.82 }),
    P({ face: 'smile' }),
  ];

  function stopPoseLoop(el) {
    if (window.StageAnimator) StageAnimator.stop(el);
  }

  function isHumanoid(type) {
    return type === 'human' || type === 'robot' || type === 'monkey';
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
    if (type === 'human' || type === 'monkey') {
      svg = humanSvg({
        id: id,
        variant: type === 'monkey' ? 'monkey' : 'human',
        skin: type === 'monkey' ? '#E0AC69' : (def.skin || SKINS[h % SKINS.length]),
        hair: type === 'monkey' ? '#6B3E26' : (def.hair || HAIRS[h % HAIRS.length]),
        shirt: type === 'monkey' ? '#C68642' : color,
        pants: type === 'monkey' ? '#A16207' : def.pants,
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

  var STATE_ALIAS = {
    walks: 'walk', moves_right: 'walk', moves_left: 'walk', walk: 'walk',
    runs: 'run', run: 'run',
    jumps: 'jump', jump: 'jump',
    rise: 'rise', fall: 'fall', land: 'land',
    waves: 'wave', wave: 'wave',
    bows: 'bow', bow: 'bow', nods: 'nod', nod: 'nod',
    cheers: 'cheer', cheer: 'cheer', dances: 'dance', dance: 'dance',
    smiles: 'smile', smile: 'smile', laughs: 'smile',
    handshakes: 'handshake', handshake: 'handshake',
    claps: 'clap', clap: 'clap',
    hides: 'hide', hide: 'hide', shows: 'idle',
    flies: 'fly', flaps: 'fly', fly: 'fly',
    idle: 'idle',
  };

  function toState(motion) {
    return STATE_ALIAS[motion] || 'idle';
  }

  function clipFor(el, state) {
    var type = (el && el.dataset.charType) || 'human';
    var human = isHumanoid(type);
    if (state === 'walk') return human ? WALK_CYCLE : ANIMAL_WALK;
    if (state === 'run') return human ? RUN_CYCLE : ANIMAL_WALK;
    if (state === 'fly') return FLY_CYCLE;
    if (human) {
      if (state === 'wave') return WAVE;
      if (state === 'clap') return CLAP;
      if (state === 'cheer') return CHEER;
      if (state === 'dance') return DANCE;
      if (state === 'handshake') return HAND_SOLO;
      if (state === 'jump') return JUMP;
      if (state === 'bow') return BOW;
      if (state === 'nod') return NOD;
      if (state === 'smile') return SMILE;
      return null;
    }
    if (state === 'wave' || state === 'handshake') return PAW_WAVE;
    if (state === 'clap' || state === 'cheer') return PAW_WAVE;
    if (state === 'dance') return ANIMAL_WALK;
    if (state === 'jump') return ANIMAL_JUMP;
    if (state === 'bow' || state === 'nod') return NOD;
    if (state === 'smile') return SMILE;
    return null;
  }

  var ACT_CLASSES = [
    'kf-act-idle', 'kf-act-walk', 'kf-act-run', 'kf-act-wave', 'kf-act-jump',
    'kf-act-bow', 'kf-act-fly', 'kf-act-hide', 'kf-act-smile', 'kf-act-nod',
    'kf-act-cheer', 'kf-act-handshake', 'kf-act-dance', 'kf-act-clap', 'kf-sprite-active',
  ];

  function markAct(el, state) {
    var wrap = getBodyWrap(el);
    if (!wrap) return;
    ACT_CLASSES.forEach(function (c) { wrap.classList.remove(c); });
    var cls = {
      walk: 'kf-act-walk', run: 'kf-act-run', wave: 'kf-act-wave', jump: 'kf-act-jump',
      rise: 'kf-act-jump', fall: 'kf-act-jump', land: 'kf-act-jump',
      bow: 'kf-act-bow', fly: 'kf-act-fly', hide: 'kf-act-hide',
      smile: 'kf-act-smile', nod: 'kf-act-nod', cheer: 'kf-act-cheer',
      dance: 'kf-act-dance', handshake: 'kf-act-handshake', clap: 'kf-act-clap',
      idle: 'kf-act-idle',
    };
    wrap.classList.add(cls[state] || 'kf-act-idle');
    wrap.classList.add('kf-sprite-active');
  }

  function setMotion(el, motion, opts) {
    var wrap = getBodyWrap(el);
    if (!wrap || !el) return;
    opts = opts || {};
    var state = toState(motion);
    var anim = window.StageAnimator;
    var loopingState = state === 'walk' || state === 'run' || state === 'fly' || state === 'dance';
    if (loopingState && el.dataset.animState === state && anim && anim.nudge) {
      anim.nudge(el, opts);
      return;
    }
    el.dataset.animState = state;
    markAct(el, state);
    el.classList.remove('ss-anim-walk', 'ss-anim-run', 'ss-anim-wave', 'ss-anim-jump');
    if (!anim || !anim.play) return;
    var cycle = opts.cycleMs;
    if (!cycle) {
      cycle = {
        walk: 680, run: 420, fly: 520, dance: 640,
        wave: 980, clap: 760, cheer: 880, handshake: 920,
        jump: 860, bow: 780, nod: 740, smile: 640,
      }[state];
    }
    anim.play(el, wrap, state, clipFor(el, state), { cycleMs: cycle });
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

  function playHandshake(el, partner) {
    if (!el) return;
    if (!partner || partner === el || !window.StageAnimator || !StageAnimator.clasp) {
      setMotion(el, 'handshake');
      return;
    }
    var er = el.getBoundingClientRect();
    var pr = partner.getBoundingClientRect();
    var ec = er.left + er.width / 2;
    var pc = pr.left + pr.width / 2;
    setFacing(el, ec <= pc ? 'right' : 'left');
    setFacing(partner, pc < ec ? 'right' : 'left');
    var dist = pc - ec;
    var want = dist >= 0 ? 136 : -136;
    var excess = dist - want;
    if (Math.abs(excess) > 24 && er.width > 0) {
      var move = excess * 0.5;
      var cur = parseFloat(el.style.marginLeft) || 0;
      var pcur = parseFloat(partner.style.marginLeft) || 0;
      el.style.transition = 'margin-left 0.4s ease';
      partner.style.transition = 'margin-left 0.4s ease';
      el.style.marginLeft = (cur + move) + 'px';
      partner.style.marginLeft = (pcur - move) + 'px';
    }
    el.dataset.animState = 'handshake';
    partner.dataset.animState = 'handshake';
    markAct(el, 'handshake');
    markAct(partner, 'handshake');
    StageAnimator.clasp(el, getBodyWrap(el), partner, getBodyWrap(partner));
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
    if (!stage) return null;
    var sky = stage.querySelector('.kf-layer-sky');
    if (sky) {
      sky.classList.add('kf-stage-layer');
      var ground = stage.querySelector('.kf-layer-ground');
      var floor = stage.querySelector('.kf-stage-floor');
      var mid = stage.querySelector('.kf-layer-mid');
      if (ground) ground.classList.add('kf-stage-layer');
      if (mid) mid.classList.add('kf-stage-layer');
      if (!floor) {
        floor = document.createElement('div');
        floor.className = 'kf-stage-floor';
        stage.insertBefore(floor, ground ? ground.nextSibling : sky.nextSibling);
      }
      if (!stage.querySelector('.kf-stage-vignette')) {
        var vignette = document.createElement('div');
        vignette.className = 'kf-stage-vignette';
        stage.appendChild(vignette);
      }
      if (!stage.querySelector('.kf-stage-light')) {
        var light = document.createElement('div');
        light.className = 'kf-stage-light';
        stage.appendChild(light);
      }
      return { sky: sky, ground: ground, floor: floor, mid: mid };
    }
    sky = document.createElement('div');
    sky.className = 'kf-stage-layer kf-layer-sky';
    var groundEl = document.createElement('div');
    groundEl.className = 'kf-stage-layer kf-layer-ground';
    var floorEl = document.createElement('div');
    floorEl.className = 'kf-stage-floor';
    var midEl = document.createElement('div');
    midEl.className = 'kf-stage-layer kf-layer-mid';
    var vignetteEl = document.createElement('div');
    vignetteEl.className = 'kf-stage-vignette';
    var lightEl = document.createElement('div');
    lightEl.className = 'kf-stage-light';
    stage.insertBefore(sky, stage.firstChild);
    stage.insertBefore(groundEl, sky.nextSibling);
    stage.insertBefore(floorEl, groundEl.nextSibling);
    stage.insertBefore(midEl, floorEl.nextSibling);
    stage.appendChild(lightEl);
    stage.appendChild(vignetteEl);
    return { sky: sky, ground: groundEl, floor: floorEl, mid: midEl };
  }

  function applySceneTheme(stage, sceneKey) {
    var layers = buildSceneLayers(stage);
    if (!layers || !layers.sky) return;
    var key = sceneKey || 'default';
    stage.dataset.sceneKey = key;
    var themes = {
      school: { sky: 'linear-gradient(180deg,#7dd3fc 0%,#bae6fd 38%,#d9f99d 62%,#4ade80 100%)', ground: '#22c55e' },
      classroom: { sky: 'linear-gradient(180deg,#fef9c3 0%,#fde68a 46%,#d6b896 70%,#a1887f 100%)', ground: '#8d6e63' },
      jungle: { sky: 'linear-gradient(180deg,#14532d 0%,#166534 36%,#3f6212 58%,#365314 100%)', ground: '#3f6212' },
      restaurant: { sky: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 42%,#e7d3b0 68%,#a1887f 100%)', ground: '#8d6e63' },
      home: { sky: 'linear-gradient(180deg,#e0f2fe 0%,#bae6fd 40%,#d6d3d1 64%,#78716c 100%)', ground: '#78716c' },
      playground: { sky: 'linear-gradient(180deg,#38bdf8 0%,#7dd3fc 36%,#bbf7d0 60%,#4ade80 100%)', ground: '#16a34a' },
      space: { sky: 'radial-gradient(ellipse at 50% 20%,#312e81 0%,#0f172a 55%,#020617 100%)', ground: '#1e1b4b' },
      default: { sky: 'linear-gradient(180deg,#c7d2fe 0%,#e0e7ff 40%,#cbd5e1 64%,#64748b 100%)', ground: '#64748b' },
    };
    var t = themes[key] || themes.default;
    layers.sky.style.background = t.sky;
    if (layers.ground) {
      var stripe = key === 'space' ? '' : 'repeating-linear-gradient(90deg, transparent 0 22px, rgba(0,0,0,0.05) 22px 24px), ';
      layers.ground.style.background = stripe + 'linear-gradient(180deg, transparent 0%, ' + t.ground + ' 14%, ' + shade(t.ground, -22) + ' 100%)';
    }
    stage.style.background = 'transparent';
  }

  function transitionScene(stage, cb) {
    if (!stage) { if (cb) cb(); return; }
    var veil = document.createElement('div');
    veil.className = 'kf-scene-veil kf-scene-wipe';
    stage.appendChild(veil);
    requestAnimationFrame(function () { veil.classList.add('active'); });
    setTimeout(function () {
      if (cb) cb();
      veil.classList.add('out');
      veil.classList.remove('active');
      setTimeout(function () { if (veil.parentNode) veil.remove(); }, 480);
    }, 280);
  }

  window.StageGraphics = {
    createCharacter: createCharacter,
    setMotion: setMotion,
    setFacing: setFacing,
    setTalking: setTalking,
    playHandshake: playHandshake,
    spawnAppearFx: spawnAppearFx,
    spawnDust: spawnDust,
    buildSceneLayers: buildSceneLayers,
    applySceneTheme: applySceneTheme,
    transitionScene: transitionScene,
    getBodyWrap: getBodyWrap,
    stopPoseLoop: stopPoseLoop,
  };
})();
