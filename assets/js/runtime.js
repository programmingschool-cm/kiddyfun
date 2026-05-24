/**
 * KiddyFun Runtime / Visual Story Engine v1.0
 * Enhanced stage with particles, scene decorations, TTS hooks, and synthesized sounds.
 */
(function () {
  'use strict';

  var CHARACTER_DEFS = {
    rafi    : { emoji: '👦', color: '#4f8ef7', label: 'Rafi' },
    mina    : { emoji: '👧', color: '#f76fa8', label: 'Mina' },
    teacher : { emoji: '👩‍🏫', color: '#9b59b6', label: 'Teacher' },
    seller  : { emoji: '🧑‍🍳', color: '#e67e22', label: 'Seller' },
    buyer   : { emoji: '🛍️', color: '#27ae60', label: 'Buyer' },
    lion    : { emoji: '🦁', color: '#f39c12', label: 'Lion' },
    bird    : { emoji: '🐦', color: '#1abc9c', label: 'Bird' },
    monkey  : { emoji: '🐒', color: '#8e44ad', label: 'Monkey' },
    robot   : { emoji: '🤖', color: '#2c3e50', label: 'Robot' },
    cat     : { emoji: '🐱', color: '#e74c3c', label: 'Cat' },
    dog     : { emoji: '🐶', color: '#795548', label: 'Dog' },
    mostak  : { emoji: '👨‍💻', color: '#3b82f6', label: 'Mostak' },
    sagor   : { emoji: '🧑‍💻', color: '#10b981', label: 'Sagor' },
    rabiul  : { emoji: '👨‍🎓', color: '#f59e0b', label: 'Rabiul' },
    narrator: { emoji: '📖', color: '#546e7a', label: 'Narrator' },
  };

  var SCENE_DEFS = {
    school    : { bg: 'linear-gradient(180deg,#87CEEB 0%,#87CEEB 55%,#90EE90 55%)', emoji:'🏫', label:'School', deco:'clouds' },
    classroom : { bg: 'linear-gradient(180deg,#fff9e6 0%,#fff9e6 55%,#c8b560 55%)', emoji:'📚', label:'Classroom', deco:'indoor' },
    jungle    : { bg: 'linear-gradient(180deg,#2d5016 0%,#56ab2f 40%,#4a7c1f 55%)', emoji:'🌿', label:'Jungle', deco:'trees' },
    restaurant: { bg: 'linear-gradient(180deg,#fff3e0 0%,#fff3e0 60%,#a1887f 60%)', emoji:'🍽️', label:'Restaurant', deco:'indoor' },
    home      : { bg: 'linear-gradient(180deg,#e3f2fd 0%,#e3f2fd 55%,#8d6e63 55%)', emoji:'🏠', label:'Home', deco:'clouds' },
    playground: { bg: 'linear-gradient(180deg,#81d4fa 0%,#81d4fa 50%,#a5d6a7 50%)', emoji:'🛝', label:'Playground', deco:'clouds' },
    space     : { bg: 'linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 50%,#0d0d2b 100%)', emoji:'🚀', label:'Space', deco:'stars' },
    default   : { bg: 'linear-gradient(180deg,#e8eaf6 0%,#e8eaf6 55%,#b0bec5 55%)', emoji:'🌍', label:'Scene', deco:'clouds' },
  };

  var CONFETTI_COLORS = ['#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899'];

  var Runtime = {
    stage        : null,
    particlesEl  : null,
    voiceIndicator: null,
    logPanel     : null,
    vocabPanel   : null,
    scoreDisplay : null,
    characters   : {},
    score        : 0,
    quizResult   : null,
    charPositions: {},
    charCount    : 0,
    currentScene : 'default',
    _decoEls     : [],

    init: function (stageEl, logEl, vocabEl, scoreEl) {
      this.stage         = stageEl;
      this.particlesEl   = document.getElementById('kf-particles');
      this.voiceIndicator = document.getElementById('kf-voice-indicator');
      this.logPanel      = logEl;
      this.vocabPanel    = vocabEl;
      this.scoreDisplay  = scoreEl;
      this.reset();
      this._startAmbientParticles();
    },

    reset: function () {
      this.characters    = {};
      this.score         = 0;
      this.quizResult    = null;
      this.charPositions = {};
      this.charCount     = 0;
      this.currentScene  = 'default';
      if (window.KiddyAudio) KiddyAudio.cancelAll();
      this._hideVoiceIndicator();
      if (this.stage) {
        this.stage.innerHTML = '';
        this.particlesEl = document.createElement('div');
        this.particlesEl.id = 'kf-particles';
        this.particlesEl.className = 'kf-stage-particles';
        this.particlesEl.setAttribute('aria-hidden', 'true');

        this.voiceIndicator = document.createElement('div');
        this.voiceIndicator.id = 'kf-voice-indicator';
        this.voiceIndicator.className = 'kf-voice-indicator';
        this.voiceIndicator.setAttribute('aria-live', 'polite');
        this.voiceIndicator.innerHTML = '<div class="kf-voice-bars"><span class="kf-voice-bar"></span><span class="kf-voice-bar"></span><span class="kf-voice-bar"></span></div>Speaking English…';

        this.stage.appendChild(this.particlesEl);
        this.stage.appendChild(this.voiceIndicator);
        this._startAmbientParticles();
        this._setScene('default');
      }
      if (this.logPanel)     this.logPanel.innerHTML = '';
      if (this.vocabPanel)   this.vocabPanel.innerHTML = '';
      if (this.scoreDisplay) this.scoreDisplay.innerHTML = '🏆 Score: <span>0</span>';
    },

    /* ── Scene ─────────────────────────────────────────────────────────── */
    setScene: function (name) {
      var key = name.toLowerCase();
      this._setScene(key);
      if (window.KiddyAudio) KiddyAudio.playSound('scene');
      this._addLog('🎬 Scene: ' + name);
    },

    _setScene: function (name) {
      this.currentScene = name;
      var def = SCENE_DEFS[name] || SCENE_DEFS.default;
      this.stage.style.background = def.bg;
      this._clearDecorations();
      this._addSceneDecorations(def.deco);

      var lbl = this.stage.querySelector('.ss-scene-label');
      if (!lbl) {
        lbl = document.createElement('div');
        lbl.className = 'ss-scene-label';
        this.stage.appendChild(lbl);
      }
      lbl.textContent = def.emoji + ' ' + def.label;
    },

    _clearDecorations: function () {
      this._decoEls.forEach(function (el) { if (el.parentNode) el.remove(); });
      this._decoEls = [];
    },

    _addSceneDecorations: function (type) {
      var self = this;
      if (type === 'clouds') {
        [15, 45, 75].forEach(function (left, i) {
          var cloud = document.createElement('div');
          cloud.className = 'kf-cloud kf-scene-deco';
          cloud.style.cssText = 'top:' + (12 + i * 8) + '%;left:' + left + '%;width:' + (50 + i * 15) + 'px;height:' + (22 + i * 4) + 'px;animation-delay:' + (i * 5) + 's;opacity:0.' + (7 + i) + ';';
          self.stage.insertBefore(cloud, self.particlesEl);
          self._decoEls.push(cloud);
        });
      } else if (type === 'stars') {
        for (var s = 0; s < 30; s++) {
          var star = document.createElement('div');
          star.className = 'kf-star';
          var size = 2 + Math.random() * 3;
          star.style.cssText = 'top:' + (Math.random() * 55) + '%;left:' + (Math.random() * 100) + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + (Math.random() * 2) + 's;';
          self.stage.insertBefore(star, self.particlesEl);
          self._decoEls.push(star);
        }
      } else if (type === 'trees') {
        ['🌳','🌴','🌲'].forEach(function (tree, i) {
          var t = document.createElement('div');
          t.className = 'kf-scene-deco';
          t.textContent = tree;
          t.style.cssText = 'bottom:52%;left:' + (10 + i * 30) + '%;font-size:' + (1.8 + i * 0.3) + 'rem;opacity:0.85;';
          self.stage.insertBefore(t, self.particlesEl);
          self._decoEls.push(t);
        });
      }
    },

    _startAmbientParticles: function () {
      if (!this.particlesEl) return;
      var colors = ['rgba(16,185,129,0.4)','rgba(245,158,11,0.35)','rgba(59,130,246,0.3)'];
      for (var i = 0; i < 8; i++) {
        var p = document.createElement('div');
        p.className = 'kf-particle';
        var size = 4 + Math.random() * 6;
        p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random() * 100) + '%;background:' + colors[i % 3] + ';animation-duration:' + (8 + Math.random() * 12) + 's;animation-delay:' + (Math.random() * 10) + 's;';
        this.particlesEl.appendChild(p);
      }
    },

    /* ── Characters ─────────────────────────────────────────────────────── */
    characterAppears: function (name) {
      var key = name.toLowerCase();
      if (this.characters[key]) {
        this._animateChar(key, 'ss-anim-fadein');
        return;
      }
      if (window.KiddyAudio) KiddyAudio.playSound('appear');
      var def = CHARACTER_DEFS[key] || this._genericDef(name);
      var el  = this._createCharEl(key, def, name);
      this.stage.appendChild(el);
      this.characters[key] = { el: el, def: def };
      this.charPositions[key] = 0;
      this.charCount++;
      this._addLog('✅ ' + name + ' appears');
    },

    _createCharEl: function (key, def, name) {
      var total   = Object.keys(this.characters).length;
      var leftPct = 8 + (total * 20) % 68;
      var el      = document.createElement('div');
      el.className   = 'ss-character ss-anim-enter';
      el.dataset.key = key;
      el.style.left  = leftPct + '%';
      el.innerHTML   =
        '<div class="ss-char-avatar" style="background:' + def.color + '22;border:3px solid ' + def.color + '">' +
          '<span class="ss-char-emoji">' + def.emoji + '</span>' +
        '</div>' +
        '<div class="ss-char-label" style="color:' + def.color + '">' + escHtml(def.label || name) + '</div>';
      return el;
    },

    _genericDef: function (name) {
      var palette = ['#e91e63','#9c27b0','#3f51b5','#009688','#ff5722','#607d8b'];
      var emojis  = ['🧑','👤','🧒','👨','👩','🦸'];
      return {
        emoji: emojis[name.charCodeAt(0) % emojis.length],
        color: palette[name.charCodeAt(0) % palette.length],
        label: name,
      };
    },

    /* ── Actions ─────────────────────────────────────────────────────────── */
    applyAction: function (name, action) {
      var key = name.toLowerCase();
      if (!this.characters[key]) this.characterAppears(name);
      var el = this.characters[key].el;

      if (action === 'moves_right') {
        this.charPositions[key] = (this.charPositions[key] || 0) + 70;
        el.style.transform  = 'translateX(' + this.charPositions[key] + 'px)';
        el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      } else if (action === 'moves_left') {
        this.charPositions[key] = (this.charPositions[key] || 0) - 70;
        el.style.transform  = 'translateX(' + this.charPositions[key] + 'px)';
        el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      } else {
        var animMap = {
          waves: 'ss-anim-wave', smiles: 'ss-anim-smile', jumps: 'ss-anim-jump',
          flies: 'ss-anim-fly', flaps: 'ss-anim-fly', hides: 'ss-anim-hide',
          shows: 'ss-anim-fadein', runs: 'ss-anim-run', dances: 'ss-anim-wave', bows: 'ss-anim-bow',
          walks: 'ss-anim-walk', handshakes: 'ss-anim-handshake', nods: 'ss-anim-nod', cheers: 'ss-anim-jump',
        };
        this._animateChar(key, animMap[action] || 'ss-anim-jump');
      }
      this._addLog('🎭 ' + name + ' ' + action.replace(/_/g, ' '));
    },

    _animateChar: function (key, cls) {
      var el = this.characters[key] && this.characters[key].el;
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      var self = this;
      setTimeout(function () { el.classList.remove(cls); }, 1200);
    },

    /* ── Dialogue + TTS ──────────────────────────────────────────────────── */
    showSpeech: function (name, text) {
      var key = name.toLowerCase();
      if (key === 'narrator') {
        this._showNarratorBox(text);
        this._addLog('📖 Narrator: "' + text + '"');
        return this._speakWithIndicator(text, 'narrator');
      }
      if (!this.characters[key]) this.characterAppears(name);

      var charEl = this.characters[key].el;
      var old    = charEl.querySelector('.ss-bubble');
      if (old) old.remove();

      var bubble = document.createElement('div');
      bubble.className   = 'ss-bubble ss-anim-popin ss-bubble-speaking';
      bubble.textContent = text;
      charEl.appendChild(bubble);
      this._addLog('💬 ' + name + ': "' + text + '"');

      var self = this;
      return this._speakWithIndicator(text, name).then(function () {
        bubble.classList.remove('ss-bubble-speaking');
        bubble.classList.add('ss-bubble-fade');
        setTimeout(function () { if (bubble.parentNode) bubble.remove(); }, 600);
      });
    },

    _showNarratorBox: function (text) {
      var box = this.stage.querySelector('.ss-narrator-box');
      if (!box) {
        box = document.createElement('div');
        box.className = 'ss-narrator-box';
        this.stage.appendChild(box);
      }
      box.innerHTML = '<span>📖</span> ' + escHtml(text);
      box.classList.remove('ss-anim-slidein');
      void box.offsetWidth;
      box.classList.add('ss-anim-slidein');
    },

    _speakWithIndicator: function (text, actor) {
      var self = this;
      this._showVoiceIndicator();
      var promise = window.KiddyAudio
        ? KiddyAudio.speak(text, actor)
        : Promise.resolve(Math.min(text.length * 55, 3500));
      return promise.finally(function () { self._hideVoiceIndicator(); });
    },

    _showVoiceIndicator: function () {
      if (this.voiceIndicator && window.KiddyAudio && KiddyAudio.isVoiceEnabled()) {
        this.voiceIndicator.classList.add('active');
      }
    },

    _hideVoiceIndicator: function () {
      if (this.voiceIndicator) this.voiceIndicator.classList.remove('active');
    },

    /* ── Vocabulary ───────────────────────────────────────────────────────── */
    showVocab: function (word, meaning) {
      if (!this.vocabPanel) return;
      var card = document.createElement('div');
      card.className = 'ss-vocab-card ss-anim-popin';
      card.innerHTML =
        '<span class="ss-vocab-word">📖 ' + escHtml(word) + '</span>' +
        '<span class="ss-vocab-arrow">→</span>' +
        '<span class="ss-vocab-meaning">' + escHtml(meaning) + '</span>';
      this.vocabPanel.insertBefore(card, this.vocabPanel.firstChild);
      if (window.KiddyAudio) KiddyAudio.playSound('pop');
      this._addLog('📚 Vocab: ' + word + ' → ' + meaning);
    },

    /* ── Quiz ─────────────────────────────────────────────────────────────── */
    showQuiz: function (question, choices, onAnswer) {
      var old = this.stage.querySelector('.ss-quiz-box');
      if (old) old.remove();

      var self = this;
      var box  = document.createElement('div');
      box.className = 'ss-quiz-box';

      var icon = document.createElement('div');
      icon.className = 'ss-quiz-icon';
      icon.textContent = '❓';
      box.appendChild(icon);

      var q = document.createElement('div');
      q.className   = 'ss-quiz-question';
      q.textContent = question;
      box.appendChild(q);

      var btnWrap = document.createElement('div');
      btnWrap.className = 'ss-quiz-choices';

      choices.forEach(function (ch, idx) {
        var btn = document.createElement('button');
        btn.className   = 'ss-quiz-btn';
        btn.textContent = ch.text;
        btn.addEventListener('click', function () {
          btnWrap.querySelectorAll('.ss-quiz-btn').forEach(function (b) { b.disabled = true; });
          if (ch.result === 'correct') {
            btn.classList.add('ss-quiz-correct');
            self.quizResult = 'correct';
            if (window.KiddyAudio) KiddyAudio.playSound('correct');
            self._burstConfetti(box);
            self._showQuizFeedback(box, true);
          } else {
            btn.classList.add('ss-quiz-wrong');
            self.quizResult = 'wrong';
            if (window.KiddyAudio) KiddyAudio.playSound('wrong');
            self._showQuizFeedback(box, false);
            btnWrap.querySelectorAll('.ss-quiz-btn').forEach(function (b) {
              var correctChoice = choices.find(function (c) { return c.result === 'correct'; });
              if (correctChoice && b.textContent === correctChoice.text) b.classList.add('ss-quiz-correct');
            });
          }
          self._addLog('📝 Answer: ' + ch.text + ' (' + ch.result + ')');
          setTimeout(function () {
            box.style.transition = 'opacity 0.4s, transform 0.4s';
            box.style.opacity = '0';
            box.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(function () { if (box.parentNode) box.remove(); }, 400);
          }, 2200);
          if (onAnswer) onAnswer(ch.result);
        });
        btnWrap.appendChild(btn);
      });

      box.appendChild(btnWrap);
      this.stage.appendChild(box);
      this._addLog('📝 Quiz: ' + question);

      if (window.KiddyAudio) {
        KiddyAudio.speak(question, 'narrator');
      }
    },

    _showQuizFeedback: function (box, correct) {
      var fb = document.createElement('div');
      fb.className   = correct ? 'ss-quiz-feedback ss-quiz-feedback-ok' : 'ss-quiz-feedback ss-quiz-feedback-err';
      fb.textContent = correct ? '🎉 Correct! Well done!' : '😅 Not quite — keep learning!';
      box.appendChild(fb);
    },

    _burstConfetti: function (originEl) {
      var rect = originEl.getBoundingClientRect();
      var stageRect = this.stage.getBoundingClientRect();
      var cx = rect.left - stageRect.left + rect.width / 2;
      var cy = rect.top - stageRect.top + rect.height / 2;
      for (var i = 0; i < 24; i++) {
        var c = document.createElement('div');
        c.className = 'kf-confetti';
        c.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;background:' + CONFETTI_COLORS[i % CONFETTI_COLORS.length] + ';transform:rotate(' + (Math.random() * 360) + 'deg);animation-delay:' + (Math.random() * 0.2) + 's;';
        this.stage.appendChild(c);
        setTimeout(function (el) { return function () { if (el.parentNode) el.remove(); }; }(c), 1400);
      }
    },

    /* ── Score ────────────────────────────────────────────────────────────── */
    setScore: function (val) { this.score = val; this._updateScoreEl(); },
    addScore: function (val) {
      this.score += val;
      this._updateScoreEl(true);
      this._addLog('🏆 Score +' + val + ' → ' + this.score);
    },
    _updateScoreEl: function (animate) {
      if (!this.scoreDisplay) return;
      this.scoreDisplay.innerHTML = '🏆 Score: <span>' + this.score + '</span>';
      if (animate) {
        this.scoreDisplay.classList.remove('ss-score-pulse');
        void this.scoreDisplay.offsetWidth;
        this.scoreDisplay.classList.add('ss-score-pulse');
      }
    },
    showScore: function () {
      var toast = document.createElement('div');
      toast.className   = 'ss-score-toast';
      toast.textContent = '🏆 Score: ' + this.score;
      this.stage.appendChild(toast);
      if (window.KiddyAudio) KiddyAudio.playSound('win');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 2800);
      this._addLog('🏆 Score: ' + this.score);
    },

    /* ── Sound ────────────────────────────────────────────────────────────── */
    playSound: function (name) {
      if (window.KiddyAudio) {
        KiddyAudio.playSound(name);
      }
      var emojis = { success:'🎉', clap:'👏', win:'🏆', cheer:'🥳' };
      var toast  = document.createElement('div');
      toast.className   = 'ss-sound-toast';
      toast.textContent = (emojis[name.toLowerCase()] || '🔊') + ' ' + name + '!';
      this.stage.appendChild(toast);
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 1800);
    },

    /* ── Log ──────────────────────────────────────────────────────────────── */
    logMessage: function (msg) {
      this._addLog(msg);
    },

    _addLog: function (msg) {
      if (!this.logPanel) return;
      var item = document.createElement('div');
      item.className   = 'ss-log-item';
      item.textContent = msg;
      this.logPanel.appendChild(item);
      this.logPanel.scrollTop = this.logPanel.scrollHeight;
    },
  };

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  window.SpeakRuntime = Runtime;
  console.log('[KiddyFun] Runtime ready');
})();
