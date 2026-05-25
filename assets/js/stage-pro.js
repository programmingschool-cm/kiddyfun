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

  function applyAmbient(stage, sceneKey) {
    if (!stage) return;
    clearAmbient(stage);
    var amb = document.createElement('div');
    amb.className = 'kf-stage-ambient';
    amb.setAttribute('aria-hidden', 'true');
    stage.appendChild(amb);

    if (sceneKey === 'space') {
      buildStars(amb, 48);
      buildShootingStars(amb);
      buildPlanets(amb);
    } else if (sceneKey === 'jungle') {
      buildSunRays(amb, '#86efac');
      buildSwayingPlants(amb);
      buildFireflies(amb, 12);
    } else if (sceneKey === 'school' || sceneKey === 'playground' || sceneKey === 'home') {
      buildSunRays(amb, '#fef9c3');
      buildDriftClouds(amb, 4);
      if (sceneKey === 'playground') buildPlayfulBirds(amb);
    } else if (sceneKey === 'classroom') {
      buildClassroomDust(amb);
      buildBlackboard(amb);
    } else if (sceneKey === 'restaurant') {
      buildSteamPuffs(amb);
      buildHangingLight(amb);
    } else {
      buildDriftClouds(amb, 3);
      buildSunRays(amb, '#e0e7ff');
    }
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

  function placeCharacter(stage, charEl, existingChars) {
    if (!stage || !charEl) return;
    var slots = [12, 32, 52, 72, 22, 42, 62, 82];
    var used = [];
    var existing = stage.querySelectorAll('.ss-character');
    existing.forEach(function (e) {
      if (e === charEl) return;
      var l = parseFloat(e.style.left) || 0;
      used.push(l);
    });
    var chosen = slots[0];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      var ok = true;
      for (var j = 0; j < used.length; j++) {
        if (Math.abs(used[j] - s) < 14) { ok = false; break; }
      }
      if (ok) { chosen = s; break; }
    }
    charEl.style.left = chosen + '%';
  }

  /* ------------------------------------------------------------------ */
  /*  Camera shake & flash                                              */
  /* ------------------------------------------------------------------ */

  function shake(stage, intensity) {
    if (!stage) return;
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
    placeCharacter: placeCharacter,
    shake: shake,
    flash: flash,
    emoteBurst: emoteBurst,
    showSceneTitle: showSceneTitle,
  };

  console.log('[KiddyFun] StagePro ready');
})();
