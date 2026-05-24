/**
 * KiddyFun Runtime / Visual Story Engine v1.0
 * Enhanced stage with particles, scene decorations, TTS hooks, and synthesized sounds.
 */
(function () {
  'use strict';

  var CHARACTER_DEFS = {
    rafi    : { type: 'human', color: '#4f8ef7', label: 'Rafi', pants: '#1e3a5f' },
    mina    : { type: 'human', color: '#f76fa8', label: 'Mina', pants: '#831843' },
    teacher : { type: 'human', color: '#9b59b6', label: 'Teacher', pants: '#4c1d95' },
    seller  : { type: 'human', color: '#e67e22', label: 'Seller', pants: '#78350f' },
    buyer   : { type: 'human', color: '#27ae60', label: 'Buyer', pants: '#14532d' },
    lion    : { type: 'lion', color: '#e8a317', label: 'Lion' },
    bird    : { type: 'bird', color: '#38bdf8', label: 'Bird' },
    monkey  : { type: 'monkey', color: '#a16207', label: 'Monkey' },
    robot   : { type: 'robot', color: '#64748b', label: 'Robot' },
    cat     : { type: 'cat', color: '#f97316', label: 'Cat' },
    dog     : { type: 'dog', color: '#a8a29e', label: 'Dog' },
    mostak  : { type: 'human', color: '#3b82f6', label: 'Mostak', pants: '#1e293b' },
    sagor   : { type: 'human', color: '#10b981', label: 'Sagor', pants: '#064e3b' },
    rabiul  : { type: 'human', color: '#f59e0b', label: 'Rabiul', pants: '#422006' },
    narrator: { type: 'human', color: '#546e7a', label: 'Narrator', pants: '#334155' },
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
    inputDock    : null,
    inputQuestion: null,
    inputField   : null,
    inputForm    : null,
    _inputCallback: null,
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
      this.inputDock     = document.getElementById('kf-input-dock');
      this.inputQuestion = document.getElementById('kf-input-question');
      this.inputField    = document.getElementById('kf-input-field');
      this.inputForm     = document.getElementById('kf-input-form');
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
        if (window.StageGraphics) StageGraphics.buildSceneLayers(this.stage);
        if (window.StageActions) StageActions.init(this.stage);
        this._startAmbientParticles();
        this._setScene('default');
      }
      if (this.logPanel)     this.logPanel.innerHTML = '';
      if (this.vocabPanel)   this.vocabPanel.innerHTML = '';
      if (this.scoreDisplay) this.scoreDisplay.innerHTML = '🏆 Score: <span>0</span>';
      this.hideUserInput(true);
      if (window.KiddyApp && window.KiddyApp.unlockMobileTab) {
        window.KiddyApp.unlockMobileTab();
      }
    },

    /* ── Scene ─────────────────────────────────────────────────────────── */
    setScene: function (name) {
      var key = name.toLowerCase();
      this._setScene(key);
      if (window.KiddyAudio) KiddyAudio.playSound('scene');
      this._addLog('🎬 Scene: ' + name);
    },

    _setScene: function (name) {
      var self = this;
      this.currentScene = name;
      var def = SCENE_DEFS[name] || SCENE_DEFS.default;

      function apply() {
        if (window.StageGraphics) {
          StageGraphics.buildSceneLayers(self.stage);
          StageGraphics.applySceneTheme(self.stage, name);
        }
        if (window.StageActions) StageActions.init(self.stage);
        if (window.StageActions) StageActions.showAction('Scene', 'scene', def.label);
        if (!window.StageGraphics) {
          self.stage.style.background = def.bg;
        }
        self._clearDecorations();
        self._addSceneDecorations(def.deco);

        var lbl = self.stage.querySelector('.ss-scene-label');
        if (!lbl) {
          lbl = document.createElement('div');
          lbl.className = 'ss-scene-label';
          self.stage.appendChild(lbl);
        }
        lbl.textContent = def.emoji + ' ' + def.label;
      }

      if (window.StageGraphics && StageGraphics.transitionScene) {
        StageGraphics.transitionScene(this.stage, apply);
      } else {
        apply();
      }
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
          var mid = self.stage.querySelector('.kf-layer-mid') || self.stage;
          mid.appendChild(cloud);
          self._decoEls.push(cloud);
        });
      } else if (type === 'stars') {
        for (var s = 0; s < 30; s++) {
          var star = document.createElement('div');
          star.className = 'kf-star';
          var size = 2 + Math.random() * 3;
          star.style.cssText = 'top:' + (Math.random() * 55) + '%;left:' + (Math.random() * 100) + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + (Math.random() * 2) + 's;';
          var midS = self.stage.querySelector('.kf-layer-mid') || self.stage;
          midS.appendChild(star);
          self._decoEls.push(star);
        }
      } else if (type === 'trees') {
        ['🌳','🌴','🌲'].forEach(function (tree, i) {
          var t = document.createElement('div');
          t.className = 'kf-scene-deco';
          t.textContent = tree;
          t.style.cssText = 'bottom:52%;left:' + (10 + i * 30) + '%;font-size:' + (1.8 + i * 0.3) + 'rem;opacity:0.85;';
          var mid = self.stage.querySelector('.kf-layer-mid') || self.stage;
          mid.appendChild(t);
          self._decoEls.push(t);
        });
      } else if (type === 'indoor') {
        var shelf = document.createElement('div');
        shelf.className = 'kf-scene-deco kf-deco-shelf';
        shelf.innerHTML = '📚🖼️🪴';
        shelf.style.cssText = 'bottom:54%;left:8%;font-size:1.4rem;opacity:0.9;';
        var mid2 = self.stage.querySelector('.kf-layer-mid') || self.stage;
        mid2.appendChild(shelf);
        self._decoEls.push(shelf);
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
        this._animateChar(key, 'shows');
        return;
      }
      if (window.KiddyAudio) KiddyAudio.playSound('appear');
      var def = CHARACTER_DEFS[key] || this._genericDef(name);
      var el  = this._createCharEl(key, def, name);
      this.stage.appendChild(el);
      this.characters[key] = { el: el, def: def };
      this.charPositions[key] = 0;
      this.charCount++;
      if (window.StageGraphics) {
        StageGraphics.spawnAppearFx(this.stage, parseFloat(el.style.left) || 20);
      }
      if (window.StageActions) {
        StageActions.playAction(this.stage, name, 'appears', el);
      }
      var self = this;
      setTimeout(function () {
        if (!self.characters[key] || !window.StageAnimator || !window.StageGraphics) return;
        var wrap = StageGraphics.getBodyWrap(el);
        var t = el.dataset.charType;
        if (wrap && (t === 'human' || t === 'robot')) StageAnimator.idleBreath(el, wrap);
      }, 750);
      this._addLog('✅ ' + name + ' appears');
    },

    _createCharEl: function (key, def, name) {
      var total   = Object.keys(this.characters).length;
      var leftPct = 8 + (total * 20) % 68;
      var el;
      if (window.StageGraphics) {
        el = StageGraphics.createCharacter(name, def);
        el.style.left = leftPct + '%';
      } else {
        el = document.createElement('div');
        el.className = 'ss-character ss-anim-enter';
        el.dataset.key = key;
        el.style.left = leftPct + '%';
        el.innerHTML =
          '<div class="ss-char-avatar" style="background:' + def.color + '22;border:3px solid ' + def.color + '">' +
            '<span class="ss-char-emoji">' + (def.emoji || '🧑') + '</span></div>' +
          '<div class="ss-char-label" style="color:' + def.color + '">' + escHtml(def.label || name) + '</div>';
      }
      return el;
    },

    _genericDef: function (name) {
      var palette = ['#e91e63', '#9c27b0', '#3f51b5', '#009688', '#ff5722', '#607d8b'];
      return {
        type: 'human',
        color: palette[name.charCodeAt(0) % palette.length],
        label: name,
        pants: '#334155',
      };
    },

    /* ── Actions ─────────────────────────────────────────────────────────── */
    applyAction: function (name, action) {
      var key = name.toLowerCase();
      if (!this.characters[key]) this.characterAppears(name);
      var el = this.characters[key].el;

      if (action === 'moves_right') {
        this._moveCharacter(key, 85, 'walk');
      } else if (action === 'moves_left') {
        this._moveCharacter(key, -85, 'walk');
      } else if (action === 'walks') {
        var dir = (el.dataset.facing === 'left') ? -60 : 60;
        this._moveCharacter(key, dir, 'walk');
        action = 'walks';
      } else if (action === 'runs') {
        var dirR = (el.dataset.facing === 'left') ? -100 : 100;
        this._moveCharacter(key, dirR, 'run');
        action = 'runs';
      } else {
        this._animateChar(key, action);
      }
      if (window.StageActions) {
        StageActions.playAction(this.stage, name, action, el);
      }
      this._addLog('🎭 ' + name + ' ' + action.replace(/_/g, ' '));
    },

    _moveCharacter: function (key, deltaPx, mode) {
      var ch = this.characters[key];
      if (!ch) return;
      var el = ch.el;
      var facing = deltaPx >= 0 ? 'right' : 'left';
      if (window.StageGraphics) {
        StageGraphics.setFacing(el, facing);
        StageGraphics.setMotion(el, mode === 'run' ? 'runs' : 'walks');
      }
      el.classList.add('kf-moving');
      el.classList.toggle('kf-moving-run', mode === 'run');
      this.charPositions[key] = (this.charPositions[key] || 0) + deltaPx;
      var dur = mode === 'run' ? 0.52 : 0.78;
      el.style.transition = 'transform ' + dur + 's cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translateX(' + this.charPositions[key] + 'px)';

      if (window.StageGraphics && this.stage) {
        var rect = el.getBoundingClientRect();
        var stageRect = this.stage.getBoundingClientRect();
        StageGraphics.spawnDust(
          this.stage,
          rect.left - stageRect.left + rect.width / 2,
          stageRect.height - 72,
          mode === 'run'
        );
      }
      if (mode === 'run' && window.KiddyAudio) KiddyAudio.playSound('pop');

      var self = this;
      setTimeout(function () {
        el.classList.remove('kf-moving', 'kf-moving-run');
        if (window.StageGraphics) StageGraphics.setMotion(el, 'idle');
      }, dur * 1000 + 80);
    },

    _animateChar: function (key, action) {
      var el = this.characters[key] && this.characters[key].el;
      if (!el) return;
      if (window.StageGraphics) {
        StageGraphics.setMotion(el, action);
        var dur = { hides: 600, flies: 1200, jumps: 700, bows: 800 }[action] || 1100;
        var self = this;
        setTimeout(function () {
          if (action !== 'hides' && window.StageGraphics) StageGraphics.setMotion(el, 'idle');
        }, dur);
        return;
      }
      var animMap = {
        waves: 'ss-anim-wave', smiles: 'ss-anim-smile', jumps: 'ss-anim-jump',
        flies: 'ss-anim-fly', flaps: 'ss-anim-fly', hides: 'ss-anim-hide',
        shows: 'ss-anim-fadein', runs: 'ss-anim-run', dances: 'ss-anim-wave', bows: 'ss-anim-bow',
        walks: 'ss-anim-walk', handshakes: 'ss-anim-handshake', nods: 'ss-anim-nod', cheers: 'ss-anim-jump',
      };
      var cls = animMap[action] || 'ss-anim-jump';
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
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

      if (window.StageActions) {
        StageActions.showAction(name, 'says', '"' + (text.length > 28 ? text.slice(0, 28) + '…' : text) + '"');
      }
      if (window.StageGraphics) StageGraphics.setTalking(charEl, true);

      var self = this;
      return this._speakWithIndicator(text, name).then(function () {
        if (window.StageGraphics) StageGraphics.setTalking(charEl, false);
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

    /* ── Keyboard input (ask user) ─────────────────────────────────────── */
    showUserInput: function (question, onAnswer) {
      var self = this;
      if (!this.inputDock || !this.inputField) {
        if (onAnswer) onAnswer('');
        return;
      }

      this.hideUserInput(true);
      this._inputCallback = onAnswer;

      if (window.KiddyApp && window.KiddyApp.lockMobileTab) {
        window.KiddyApp.lockMobileTab('output');
      } else if (window.KiddyApp && window.KiddyApp.setMobileTab) {
        window.KiddyApp.setMobileTab('output');
      }

      this.inputQuestion.textContent = question;
      this.inputField.value = '';
      this.inputDock.classList.remove('d-none');
      this.inputDock.classList.add('kf-input-visible');

      var panelBody = this.inputDock.closest('.kf-panel-body');
      if (panelBody) panelBody.classList.add('kf-waiting-input');

      this._addLog('⌨️ ' + question);

      var stageHint = document.createElement('div');
      stageHint.className = 'kf-input-stage-hint';
      stageHint.textContent = '⌨️ Type your answer below';
      this.stage.appendChild(stageHint);
      this._inputStageHint = stageHint;

      function finish() {
        var text = self.inputField.value;
        var cb = self._inputCallback;
        self._inputCallback = null;
        self.hideUserInput(true);
        self._addLog('✅ You typed: ' + (text.trim() ? text : '(empty)'));
        if (cb) cb(text);
      }

      this._inputFinish = finish;

      if (this.inputForm) {
        this.inputForm.onsubmit = function (e) {
          e.preventDefault();
          finish();
        };
      }

      setTimeout(function () {
        if (window.KiddyApp && window.KiddyApp.lockMobileTab) {
          window.KiddyApp.lockMobileTab('output');
        }
        self.inputField.focus({ preventScroll: false });
        if (window.KiddyAudio && KiddyAudio.speak) {
          KiddyAudio.speak(question, 'narrator');
        }
      }, 120);
    },

    hideUserInput: function (silent) {
      if (this.inputDock) {
        this.inputDock.classList.add('d-none');
        this.inputDock.classList.remove('kf-input-visible');
      }
      var panelBody = this.inputDock && this.inputDock.closest('.kf-panel-body');
      if (panelBody) panelBody.classList.remove('kf-waiting-input');

      if (this._inputStageHint && this._inputStageHint.parentNode) {
        this._inputStageHint.remove();
      }
      this._inputStageHint = null;

      if (this.inputForm) this.inputForm.onsubmit = null;
      this._inputFinish = null;

      if (!silent && this._inputCallback) {
        var cb = this._inputCallback;
        this._inputCallback = null;
        cb('');
      } else if (silent) {
        this._inputCallback = null;
      }
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
  console.log('[KiddyFun] Runtime v2 — pro stage graphics ready');
})();
