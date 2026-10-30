/**
 * KiddyFun Stage Pro — gaming-zone polish
 *  • Premium speech bubbles (character color, tail, typewriter, anti-overlap)
 *  • Ambient stage life (twinkle stars, drift clouds, sway trees, sun rays, fireflies)
 *  • Camera shake on big actions
 *  • Anti-overlap character placement & smooth movement easing
 *  • Emote bursts (❤️ 💭 ⭐) over character heads
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Speech bubble system                                              */
  /* ------------------------------------------------------------------ */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getStageRect(stage) {
    return stage.getBoundingClientRect();
  }

  function getCharColor(charEl) {
    if (!charEl) return '#4f8ef7';
    var label = charEl.querySelector('.ss-char-label');
    if (label) {
      var c = label.style.color;
      if (c) return c;
    }
    return '#4f8ef7';
  }

  function initial(name) {
    if (!name) return '?';
    var s = String(name).trim();
    return s.charAt(0).toUpperCase();
  }

  function typewrite(textEl, fullText, ms) {
    var perChar = Math.max(20, Math.min(70, ms / Math.max(fullText.length, 1)));
    var i = 0;
    var done = false;
    var timer = null;
    return new Promise(function (resolve) {
      function tick() {
        if (done) return;
        if (i >= fullText.length) {
          done = true;
          textEl.classList.add('kf-pro-bubble-text-done');
          resolve();
          return;
        }
        textEl.textContent = fullText.slice(0, ++i);
        timer = setTimeout(tick, perChar);
      }
      tick();
      setTimeout(function () {
        if (!done) {
          textEl.textContent = fullText;
          done = true;
          clearTimeout(timer);
          textEl.classList.add('kf-pro-bubble-text-done');
          resolve();
        }
      }, ms + 800);
    });
  }

  /**
   * Show a premium speech bubble attached to a character.
   * Reuses an existing bubble for the same character (same position),
   * otherwise creates a new one with smart positioning.
   */
  function showBubble(stage, charEl, text, options) {
    options = options || {};
    if (!stage || !charEl || !text) return Promise.resolve();

    var color = options.color || getCharColor(charEl);
    var charType = charEl.dataset.charType || 'human';
    var speakerName = options.speakerName || charEl.dataset.key || '';
    var fullText = String(text);
    var spokenMs = options.spokenMs ||
      Math.min(Math.max(fullText.length * 55, 900), 4500);

    /* ── Reuse path: same character, same position ─────────────────── */
    var existing = charEl.querySelector('.kf-pro-bubble');
    if (existing) {
      /* Cancel any pending fade-out + remove timer */
      existing.classList.remove('kf-pro-bubble-fade');
      if (existing._removeTimer) {
        clearTimeout(existing._removeTimer);
        existing._removeTimer = null;
      }
      /* Update color in case it changed (defensive) */
      existing.style.setProperty('--bub-color', color);
      /* Refresh text element — clear + retype */
      var oldText = existing.querySelector('.kf-pro-bubble-text');
      if (oldText) {
        oldText.textContent = '';
        oldText.classList.remove('kf-pro-bubble-text-done');
      }
      /* Tiny "speak again" pulse so the user sees it's a new line */
      existing.classList.remove('kf-pro-bubble-repeat');
      void existing.offsetWidth;
      existing.classList.add('kf-pro-bubble-repeat');
      setTimeout(function () { existing.classList.remove('kf-pro-bubble-repeat'); }, 360);
      return typewrite(oldText, fullText, spokenMs);
    }

    /* ── New bubble path ───────────────────────────────────────────── */
    var bubble = document.createElement('div');
    bubble.className = 'kf-pro-bubble';
    bubble.setAttribute('data-char-type', charType);
    bubble.style.setProperty('--bub-color', color);

    var inner = document.createElement('div');
    inner.className = 'kf-pro-bubble-inner';

    /* Name chip header — clearly shows who is speaking */
    if (speakerName) {
      var nameRow = document.createElement('div');
      nameRow.className = 'kf-pro-bubble-name';
      nameRow.innerHTML =
        '<span class="kf-pro-bubble-avatar" style="background:' + color + '">' +
          esc(initial(speakerName)) +
        '</span>' +
        '<span class="kf-pro-bubble-who">' + esc(speakerName) + '</span>';
      inner.appendChild(nameRow);
    }

    var textEl = document.createElement('span');
    textEl.className = 'kf-pro-bubble-text';
    textEl.textContent = '';
    inner.appendChild(textEl);

    var tail = document.createElement('span');
    tail.className = 'kf-pro-bubble-tail';
    bubble.appendChild(inner);
    bubble.appendChild(tail);

    charEl.appendChild(bubble);

    /* Pop in + smart positioning */
    requestAnimationFrame(function () {
      bubble.classList.add('kf-pro-bubble-in');

      var rect = bubble.getBoundingClientRect();
      var stageRect = getStageRect(stage);

      /* Check narrator box presence — protect the top zone if narrator
       * is currently shown so character bubble doesn't slide UNDER it. */
      var narratorBox = stage.querySelector('.ss-narrator-box.kf-narrator-active');
      var narratorBottom = narratorBox
        ? narratorBox.getBoundingClientRect().bottom
        : stageRect.top;

      /* If bubble top overlaps narrator OR top of stage, flip below char */
      var safeTop = narratorBottom + 8;
      if (rect.top < safeTop) {
        bubble.classList.add('kf-pro-bubble-below');
      }

      /* Re-measure after potential flip, then clamp horizontally */
      var rect2 = bubble.getBoundingClientRect();
      var bubbleCx = rect2.left + rect2.width / 2;
      var stageLeft = stageRect.left + 12;
      var stageRight = stageRect.right - 12;
      var shift = 0;
      if (bubbleCx < stageLeft) shift = stageLeft - bubbleCx;
      else if (bubbleCx > stageRight) shift = stageRight - bubbleCx;
      if (Math.abs(shift) > 1) {
        bubble.style.setProperty('--bub-shift', shift.toFixed(0) + 'px');
        tail.style.setProperty('--tail-shift', (-shift).toFixed(0) + 'px');
      }

      /* Avoid overlap with OTHER characters' active bubbles only.
       * Bubbles inside the same character are reused above, never
       * stacked, so skip same-char and fading bubbles here. */
      var others = stage.querySelectorAll('.kf-pro-bubble.kf-pro-bubble-in');
      var r3 = bubble.getBoundingClientRect();
      for (var i = 0; i < others.length; i++) {
        var ob = others[i];
        if (ob === bubble) continue;
        if (charEl.contains(ob)) continue;
        if (ob.classList.contains('kf-pro-bubble-fade')) continue;
        if (ob._removeTimer) continue;
        var or = ob.getBoundingClientRect();
        var overlapX = !(r3.right < or.left || r3.left > or.right);
        var overlapY = !(r3.bottom < or.top || r3.top > or.bottom);
        if (overlapX && overlapY) {
          /* Push this bubble up by the overlap amount */
          var lift = (r3.bottom - or.top) + 8;
          bubble.style.setProperty('--bub-lift', lift.toFixed(0) + 'px');
          bubble.classList.add('kf-pro-bubble-lifted');
          break;
        }
      }
    });

    return typewrite(textEl, fullText, spokenMs);
  }

  function fadeBubble(charEl, delay) {
    if (!charEl) return;
    var bubble = charEl.querySelector('.kf-pro-bubble');
    if (!bubble) return;
    /* If a previous remove is already pending, cancel it */
    if (bubble._removeTimer) {
      clearTimeout(bubble._removeTimer);
      bubble._removeTimer = null;
    }
    var fadeTimer = setTimeout(function () {
      bubble.classList.add('kf-pro-bubble-fade');
      bubble._removeTimer = setTimeout(function () {
        if (bubble.parentNode) bubble.remove();
        bubble._removeTimer = null;
      }, 450);
    }, delay || 0);
    bubble._removeTimer = fadeTimer;
  }

  /* Narrator typewriter — same effect as character bubbles */
  function typeIntoNarrator(textEl, text, ms) {
    if (!textEl) return Promise.resolve();
    textEl.textContent = '';
    textEl.classList.remove('kf-pro-bubble-text-done');
    textEl.classList.add('kf-pro-bubble-text');
    return typewrite(textEl, String(text), ms || 1500);
  }

  /* ------------------------------------------------------------------ */
  /*  Ambient stage life                                                */
  /* ------------------------------------------------------------------ */

  function clearAmbient(stage) {
    if (!stage) return;
    var amb = stage.querySelector('.kf-stage-ambient');
    if (amb) amb.remove();
  }

  function para(parent, depth, extra) {
    var el = document.createElement('div');
    el.className = 'kf-para ' + (extra || '');
    el.dataset.depth = String(depth);
    parent.appendChild(el);
    return el;
  }

  function svgMount(html, className, style) {
    var d = document.createElement('div');
    d.className = className || 'kf-svg-prop';
    if (style) d.style.cssText = style;
    d.innerHTML = html;
    return d;
  }

  function applyAmbient(stage, sceneKey) {
    if (!stage) return;
    clearAmbient(stage);
    var key = sceneKey || 'default';
    var amb = document.createElement('div');
    amb.className = 'kf-stage-ambient';
    amb.setAttribute('aria-hidden', 'true');
    amb.dataset.scene = key;
    stage.appendChild(amb);

    var sky = para(amb, 0.15, 'kf-para-sky');
    var far = para(amb, 0.4, 'kf-para-far');
    var near = para(amb, 0.72, 'kf-para-near');

    if (key === 'space') {
      buildStars(sky, 48);
      buildShootingStars(sky);
      buildPlanets(sky);
      far.appendChild(svgMount(svgHills('#312e81', '#1e1b4b'), 'kf-svg-prop kf-prop-hills'));
    } else if (key === 'jungle') {
      buildSunRays(sky, '#86efac');
      sky.appendChild(svgMount(svgCanopy(), 'kf-svg-prop kf-prop-canopy'));
      far.appendChild(svgMount(svgJungleTrees(), 'kf-svg-prop kf-prop-trees'));
      near.appendChild(svgMount(svgBushes('#166534', '#14532d'), 'kf-svg-prop kf-prop-bushes'));
      buildFireflies(near, 10);
    } else if (key === 'school') {
      buildSunRays(sky, '#fef9c3');
      buildDriftClouds(sky, 4);
      far.appendChild(svgMount(svgSchool(), 'kf-svg-prop kf-prop-school'));
      near.appendChild(svgMount(svgBushes('#22c55e', '#15803d'), 'kf-svg-prop kf-prop-bushes'));
    } else if (key === 'playground') {
      buildSunRays(sky, '#fef9c3');
      buildDriftClouds(sky, 4);
      far.appendChild(svgMount(svgHills('#4ade80', '#16a34a'), 'kf-svg-prop kf-prop-hills'));
      near.appendChild(svgMount(svgSwing(), 'kf-svg-prop kf-prop-swing', 'left:8%;bottom:18%;width:120px;height:90px;'));
      near.appendChild(svgMount(svgBird(), 'kf-amb-bird kf-svg-bird', 'top:14%;'));
    } else if (key === 'home') {
      buildSunRays(sky, '#fef9c3');
      buildDriftClouds(sky, 3);
      far.appendChild(svgMount(svgHome(), 'kf-svg-prop kf-prop-home'));
    } else if (key === 'classroom') {
      buildClassroomDust(sky);
      far.appendChild(svgMount(svgClassroom(), 'kf-svg-prop kf-prop-class'));
    } else if (key === 'restaurant') {
      buildSteamPuffs(near);
      near.appendChild(svgMount(svgLamp(), 'kf-svg-prop kf-prop-lamp', 'left:16%;top:0;width:36px;height:78px;'));
      far.appendChild(svgMount(svgCounter(), 'kf-svg-prop kf-prop-counter'));
    } else {
      buildDriftClouds(sky, 3);
      buildSunRays(sky, '#e0e7ff');
      far.appendChild(svgMount(svgHills('#c7d2fe', '#94a3b8'), 'kf-svg-prop kf-prop-hills'));
    }
  }

  function setParallax(stage, camX) {
    if (!stage) return;
    var nodes = stage.querySelectorAll('.kf-para');
    var x = camX || 0;
    for (var i = 0; i < nodes.length; i++) {
      var depth = parseFloat(nodes[i].dataset.depth);
      if (isNaN(depth)) depth = 0;
      nodes[i].style.transform = 'translate3d(' + (-x * depth).toFixed(1) + 'px,0,0)';
    }
  }

  function svgHills(a, b) {
    return '<svg viewBox="0 0 600 160" preserveAspectRatio="none" class="kf-fill-svg">' +
      '<path d="M0 110 C80 40 140 90 220 70 C300 48 360 100 440 64 C500 40 560 80 600 50 L600 160 L0 160 Z" fill="' + a + '"/>' +
      '<path d="M0 130 C100 90 180 140 280 110 C380 80 460 130 600 100 L600 160 L0 160 Z" fill="' + b + '" opacity="0.9"/>' +
      '</svg>';
  }

  function svgCanopy() {
    return '<svg viewBox="0 0 600 120" preserveAspectRatio="none" class="kf-fill-svg">' +
      '<ellipse cx="80" cy="40" rx="90" ry="36" fill="#14532d"/>' +
      '<ellipse cx="220" cy="28" rx="110" ry="40" fill="#166534"/>' +
      '<ellipse cx="380" cy="36" rx="100" ry="38" fill="#14532d"/>' +
      '<ellipse cx="530" cy="30" rx="90" ry="34" fill="#15803d"/>' +
      '</svg>';
  }

  function svgJungleTrees() {
    return '<svg viewBox="0 0 600 200" preserveAspectRatio="none" class="kf-fill-svg">' +
      '<rect x="70" y="70" width="14" height="130" rx="4" fill="#3f2a1d"/>' +
      '<circle cx="77" cy="60" r="36" fill="#166534" stroke="#052e16" stroke-width="3"/>' +
      '<rect x="250" y="40" width="16" height="160" rx="4" fill="#3f2a1d"/>' +
      '<circle cx="258" cy="36" r="44" fill="#15803d" stroke="#052e16" stroke-width="3"/>' +
      '<rect x="460" y="80" width="12" height="120" rx="4" fill="#3f2a1d"/>' +
      '<circle cx="466" cy="70" r="32" fill="#166534" stroke="#052e16" stroke-width="3"/>' +
      '</svg>';
  }

  function svgBushes(a, b) {
    return '<svg viewBox="0 0 600 80" preserveAspectRatio="none" class="kf-fill-svg">' +
      '<ellipse cx="40" cy="50" rx="46" ry="22" fill="' + a + '" stroke="' + b + '" stroke-width="3"/>' +
      '<ellipse cx="200" cy="54" rx="54" ry="20" fill="' + b + '"/>' +
      '<ellipse cx="420" cy="50" rx="50" ry="22" fill="' + a + '" stroke="' + b + '" stroke-width="3"/>' +
      '<ellipse cx="560" cy="56" rx="40" ry="18" fill="' + b + '"/>' +
      '</svg>';
  }

  function svgSchool() {
    return '<svg viewBox="0 0 220 120" class="kf-spot-svg">' +
      '<rect x="30" y="40" width="160" height="70" rx="4" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>' +
      '<polygon points="20,44 110,8 200,44" fill="#ef4444" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="96" y="72" width="28" height="38" fill="#93c5fd" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="46" y="58" width="28" height="22" fill="#7dd3fc" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="146" y="58" width="28" height="22" fill="#7dd3fc" stroke="#1e293b" stroke-width="3"/>' +
      '</svg>';
  }

  function svgHome() {
    return '<svg viewBox="0 0 200 110" class="kf-spot-svg">' +
      '<polygon points="16,52 100,12 184,52" fill="#f59e0b" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="40" y="50" width="120" height="52" fill="#ffedd5" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="86" y="68" width="26" height="34" fill="#b45309" stroke="#1e293b" stroke-width="3"/>' +
      '<rect x="54" y="64" width="22" height="18" fill="#7dd3fc" stroke="#1e293b" stroke-width="3"/>' +
      '</svg>';
  }

  function svgSwing() {
    return '<svg viewBox="0 0 120 90">' +
      '<path d="M16 80 L30 16 L46 80" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M74 80 L90 16 L106 80" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M30 16 L90 16" stroke="#78350f" stroke-width="4"/>' +
      '<path class="kf-swing-seat" d="M48 16 L44 52 L76 52 L72 16" fill="none" stroke="#1e293b" stroke-width="2"/>' +
      '<rect class="kf-swing-seat" x="42" y="50" width="36" height="6" rx="2" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>' +
      '</svg>';
  }

  function svgBird() {
    return '<svg viewBox="0 0 48 20" width="42" height="18">' +
      '<path d="M2 12 Q14 2 24 10 Q34 2 46 12" fill="none" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round"/>' +
      '</svg>';
  }

  function svgClassroom() {
    return '<svg viewBox="0 0 240 140" class="kf-spot-svg">' +
      '<rect x="16" y="16" width="120" height="78" rx="4" fill="#166534" stroke="#78350f" stroke-width="6"/>' +
      '<text x="76" y="52" text-anchor="middle" fill="#ecfccb" font-size="18" font-family="sans-serif">ABC</text>' +
      '<text x="76" y="74" text-anchor="middle" fill="#ecfccb" font-size="16" font-family="sans-serif">123</text>' +
      '<rect x="160" y="70" width="64" height="28" rx="3" fill="#d6d3d1" stroke="#1e293b" stroke-width="3"/>' +
      '</svg>';
  }

  function svgLamp() {
    return '<svg viewBox="0 0 36 78">' +
      '<path d="M18 0 V28" stroke="#44403c" stroke-width="2"/>' +
      '<path d="M6 28 H30 L24 48 H12 Z" fill="#fde68a" stroke="#1e293b" stroke-width="2"/>' +
      '<ellipse cx="18" cy="52" rx="14" ry="6" fill="#fde68a" opacity="0.45"/>' +
      '</svg>';
  }

  function svgCounter() {
    return '<svg viewBox="0 0 600 80" preserveAspectRatio="none" class="kf-fill-svg">' +
      '<rect x="0" y="36" width="600" height="28" fill="#b45309"/>' +
      '<rect x="0" y="28" width="600" height="10" fill="#fde68a"/>' +
      '</svg>';
  }

  function buildStars(parent, n) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement('div');
      s.className = 'kf-amb-star';
      var size = 1 + Math.random() * 3;
      s.style.cssText =
        'top:' + (Math.random() * 55) + '%;' +
        'left:' + (Math.random() * 100) + '%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'animation-delay:' + (Math.random() * 3).toFixed(2) + 's;' +
        'animation-duration:' + (1.4 + Math.random() * 2.4).toFixed(2) + 's;';
      parent.appendChild(s);
    }
  }

  function buildShootingStars(parent) {
    for (var k = 0; k < 2; k++) {
      var ss = document.createElement('div');
      ss.className = 'kf-amb-shoot';
      ss.style.cssText =
        'top:' + (5 + Math.random() * 25) + '%;' +
        'left:' + (-10 + Math.random() * 40) + '%;' +
        'animation-delay:' + (4 + k * 7) + 's;';
      parent.appendChild(ss);
    }
  }

  function buildPlanets(parent) {
    var p1 = document.createElement('div');
    p1.className = 'kf-amb-planet kf-amb-planet-a';
    parent.appendChild(p1);
    var p2 = document.createElement('div');
    p2.className = 'kf-amb-planet kf-amb-planet-b';
    parent.appendChild(p2);
  }

  function buildDriftClouds(parent, n) {
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'kf-amb-cloud';
      var top = 6 + i * 12;
      var scale = 0.7 + Math.random() * 0.7;
      var dur = 35 + Math.random() * 30;
      var delay = -Math.random() * dur;
      c.style.cssText =
        'top:' + top + '%;' +
        'transform: scale(' + scale.toFixed(2) + ');' +
        'animation-duration:' + dur.toFixed(0) + 's;' +
        'animation-delay:' + delay.toFixed(0) + 's;' +
        'opacity:' + (0.5 + Math.random() * 0.4).toFixed(2) + ';';
      parent.appendChild(c);
    }
  }

  function buildSunRays(parent, color) {
    var sun = document.createElement('div');
    sun.className = 'kf-amb-sun';
    sun.style.background =
      'radial-gradient(circle at center,' + color + ' 0%,' + color + '90 30%, transparent 65%)';
    parent.appendChild(sun);
    var ray = document.createElement('div');
    ray.className = 'kf-amb-rays';
    parent.appendChild(ray);
  }

  function buildSwayingPlants(parent) {
    var emojis = ['🌿', '🌱', '🍃', '🌴', '🌳'];
    for (var i = 0; i < 5; i++) {
      var p = document.createElement('div');
      p.className = 'kf-amb-plant';
      p.textContent = emojis[i % emojis.length];
      p.style.cssText =
        'left:' + (5 + i * 19 + Math.random() * 5) + '%;' +
        'bottom:' + (48 + Math.random() * 8) + '%;' +
        'font-size:' + (1.4 + Math.random() * 1.1).toFixed(2) + 'rem;' +
        'animation-delay:' + (i * 0.3).toFixed(2) + 's;' +
        'animation-duration:' + (3.2 + Math.random() * 1.4).toFixed(2) + 's;';
      parent.appendChild(p);
    }
  }

  function buildFireflies(parent, n) {
    for (var i = 0; i < n; i++) {
      var f = document.createElement('div');
      f.className = 'kf-amb-firefly';
      f.style.cssText =
        'top:' + (15 + Math.random() * 45) + '%;' +
        'left:' + (Math.random() * 100) + '%;' +
        'animation-delay:' + (Math.random() * 4).toFixed(2) + 's;' +
        'animation-duration:' + (5 + Math.random() * 5).toFixed(2) + 's;';
      parent.appendChild(f);
    }
  }

  function buildPlayfulBirds(parent) {
    for (var i = 0; i < 2; i++) {
      var b = document.createElement('div');
      b.className = 'kf-amb-bird';
      b.textContent = '🕊️';
      b.style.cssText =
        'top:' + (10 + i * 8) + '%;' +
        'animation-delay:' + (i * 6) + 's;' +
        'font-size:' + (0.8 + i * 0.2) + 'rem;';
      parent.appendChild(b);
    }
  }

  function buildClassroomDust(parent) {
    for (var i = 0; i < 14; i++) {
      var d = document.createElement('div');
      d.className = 'kf-amb-dustmote';
      d.style.cssText =
        'top:' + (Math.random() * 60) + '%;' +
        'left:' + (Math.random() * 100) + '%;' +
        'animation-delay:' + (Math.random() * 5).toFixed(2) + 's;' +
        'animation-duration:' + (8 + Math.random() * 6).toFixed(2) + 's;';
      parent.appendChild(d);
    }
  }

  function buildBlackboard(parent) {
    var bb = document.createElement('div');
    bb.className = 'kf-amb-blackboard';
    bb.innerHTML = '<span>ABC</span><span>123</span>';
    parent.appendChild(bb);
  }

  function buildSteamPuffs(parent) {
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('div');
      s.className = 'kf-amb-steam';
      s.style.cssText =
        'left:' + (60 + i * 6) + '%;' +
        'animation-delay:' + (i * 1.1) + 's;';
      parent.appendChild(s);
    }
  }

  function buildHangingLight(parent) {
    var l = document.createElement('div');
    l.className = 'kf-amb-hanglight';
    parent.appendChild(l);
  }

  /* ------------------------------------------------------------------ */
  /*  Anti-overlap placement                                            */
  /* ------------------------------------------------------------------ */

  function placeCharacter(stage, charEl) {
    if (!stage || !charEl) return;
    var all = stage.querySelectorAll('.ss-character');
    var n = all.length;
    if (!n) return;
    var span = n === 1 ? 0 : Math.min(86, 16 + (n - 1) * 14);
    var start = (100 - span) / 2;
    for (var i = 0; i < n; i++) {
      var pct = n === 1 ? 42 : start + (i * span / (n - 1));
      all[i].style.left = pct + '%';
      if (!all[i].dataset.baseLeftPct) all[i].dataset.baseLeftPct = String(Math.round(pct));
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Camera shake & flash                                              */
  /* ------------------------------------------------------------------ */

  function shake(stage, intensity) {
    if (!stage) return;
    if (window.StageAnimator && StageAnimator.reducedMotion && StageAnimator.reducedMotion()) return;
    var cls = intensity === 'big' ? 'kf-stage-shake-big' : 'kf-stage-shake';
    stage.classList.remove(cls);
    void stage.offsetWidth;
    stage.classList.add(cls);
    setTimeout(function () { stage.classList.remove(cls); }, 600);
  }

  function flash(stage, color) {
    if (!stage) return;
    var f = document.createElement('div');
    f.className = 'kf-stage-flash';
    if (color) f.style.background = color;
    stage.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.remove(); }, 600);
  }

  /* ------------------------------------------------------------------ */
  /*  Emote burst                                                       */
  /* ------------------------------------------------------------------ */

  var EMOTE_MAP = {
    waves: '👋', smiles: '😊', laughs: '😄', cheers: '🎉', claps: '👏',
    dances: '💃', jumps: '⭐', bows: '🙇', nods: '👍', hides: '💨',
    flies: '✈️', flaps: '✈️', runs: '💨', walks: '👣',
    handshakes: '🤝', loves: '❤️', thinks: '💭',
  };

  function emoteBurst(stage, charEl, action) {
    if (!stage || !charEl) return;
    var emoji = EMOTE_MAP[action];
    if (!emoji) return;
    var rect = charEl.getBoundingClientRect();
    var sRect = stage.getBoundingClientRect();
    var x = rect.left - sRect.left + rect.width / 2;
    var y = rect.top - sRect.top - 4;
    var burst = document.createElement('div');
    burst.className = 'kf-emote-burst';
    burst.textContent = emoji;
    burst.style.cssText = 'left:' + x + 'px;top:' + y + 'px;';
    stage.appendChild(burst);
    setTimeout(function () { if (burst.parentNode) burst.remove(); }, 1400);
  }

  /* ------------------------------------------------------------------ */
  /*  Scene title card                                                  */
  /* ------------------------------------------------------------------ */

  function showSceneTitle(stage, emoji, label) {
    if (!stage) return;
    var old = stage.querySelector('.kf-scene-title');
    if (old) old.remove();
    var card = document.createElement('div');
    card.className = 'kf-scene-title';
    card.innerHTML =
      '<span class="kf-scene-title-emoji">' + esc(emoji || '🎬') + '</span>' +
      '<span class="kf-scene-title-label">' + esc(label || 'Scene') + '</span>';
    stage.appendChild(card);
    requestAnimationFrame(function () { card.classList.add('kf-scene-title-in'); });
    setTimeout(function () { card.classList.add('kf-scene-title-out'); }, 1700);
    setTimeout(function () { if (card.parentNode) card.remove(); }, 2400);
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  window.StagePro = {
    showBubble: showBubble,
    fadeBubble: fadeBubble,
    typeIntoNarrator: typeIntoNarrator,
    applyAmbient: applyAmbient,
    clearAmbient: clearAmbient,
    setParallax: setParallax,
    placeCharacter: placeCharacter,
    shake: shake,
    flash: flash,
    emoteBurst: emoteBurst,
    showSceneTitle: showSceneTitle,
  };

  console.log('[KiddyFun] StagePro ready');
})();
