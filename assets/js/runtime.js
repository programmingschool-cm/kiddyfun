/**
 * SpeakScript Runtime / Visual Story Engine v0.1
 */
(function () {
  'use strict';

  /* ── Character Definitions ──────────────────────────────────────────── */
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
    narrator: { emoji: '📖', color: '#546e7a', label: 'Narrator' },
  };

  /* ── Scene Definitions ──────────────────────────────────────────────── */
  var SCENE_DEFS = {
    school    : { bg: 'linear-gradient(180deg,#87CEEB 0%,#87CEEB 60%,#90EE90 60%)', emoji:'🏫', label:'School' },
    classroom : { bg: 'linear-gradient(180deg,#fff9e6 0%,#fff9e6 60%,#c8b560 60%)', emoji:'📚', label:'Classroom' },
    jungle    : { bg: 'linear-gradient(180deg,#56ab2f 0%,#a8e063 50%,#4a7c1f 50%)', emoji:'🌿', label:'Jungle' },
    restaurant: { bg: 'linear-gradient(180deg,#fff3e0 0%,#fff3e0 65%,#a1887f 65%)', emoji:'🍽️', label:'Restaurant' },
    home      : { bg: 'linear-gradient(180deg,#e3f2fd 0%,#e3f2fd 60%,#8d6e63 60%)', emoji:'🏠', label:'Home' },
    playground: { bg: 'linear-gradient(180deg,#81d4fa 0%,#81d4fa 55%,#a5d6a7 55%)', emoji:'🛝', label:'Playground' },
    space     : { bg: 'linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 50%,#0d0d2b 100%)', emoji:'🚀', label:'Space' },
    default   : { bg: 'linear-gradient(180deg,#e8eaf6 0%,#e8eaf6 60%,#b0bec5 60%)', emoji:'🌍', label:'Scene' },
  };

  /* ── Runtime State ──────────────────────────────────────────────────── */
  var Runtime = {
    stage        : null,
    logPanel     : null,
    vocabPanel   : null,
    scoreDisplay : null,
    characters   : {},
    score        : 0,
    quizResult   : null,
    charPositions: {},
    charCount    : 0,

    init: function (stageEl, logEl, vocabEl, scoreEl) {
      this.stage        = stageEl;
      this.logPanel     = logEl;
      this.vocabPanel   = vocabEl;
      this.scoreDisplay = scoreEl;
      this.reset();
    },

    reset: function () {
      this.characters    = {};
      this.score         = 0;
      this.quizResult    = null;
      this.charPositions = {};
      this.charCount     = 0;
      if (this.stage)        { this.stage.innerHTML = ''; this._setScene('default'); }
      if (this.logPanel)     this.logPanel.innerHTML = '';
      if (this.vocabPanel)   this.vocabPanel.innerHTML = '';
      if (this.scoreDisplay) { this.scoreDisplay.textContent = '🏆 Score: 0'; }
    },

    /* ── Scene ─────────────────────────────────────────────────────────── */
    setScene: function (name) {
      this._setScene(name.toLowerCase());
      this._addLog('🎬 Scene: ' + name);
    },

    _setScene: function (name) {
      var def = SCENE_DEFS[name] || SCENE_DEFS['default'];
      this.stage.style.background = def.bg;
      var lbl = this.stage.querySelector('.ss-scene-label');
      if (!lbl) { lbl = document.createElement('div'); lbl.className = 'ss-scene-label'; this.stage.appendChild(lbl); }
      lbl.textContent = def.emoji + ' ' + def.label;
    },

    /* ── Characters ─────────────────────────────────────────────────────── */
    characterAppears: function (name) {
      var key = name.toLowerCase();
      if (this.characters[key]) { this._animateChar(key, 'ss-anim-fadein'); return; }
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
      var leftPct = 10 + (total * 18) % 72;
      var el      = document.createElement('div');
      el.className   = 'ss-character ss-anim-fadein';
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
      var color   = palette[name.charCodeAt(0) % palette.length];
      return { emoji: '🧑', color: color, label: name };
    },

    /* ── Actions ─────────────────────────────────────────────────────────── */
    applyAction: function (name, action) {
      var key = name.toLowerCase();
      if (!this.characters[key]) this.characterAppears(name);
      var el = this.characters[key].el;

      if (action === 'moves_right') {
        this.charPositions[key] = (this.charPositions[key] || 0) + 60;
        el.style.transform  = 'translateX(' + this.charPositions[key] + 'px)';
        el.style.transition = 'transform 0.5s ease';
      } else if (action === 'moves_left') {
        this.charPositions[key] = (this.charPositions[key] || 0) - 60;
        el.style.transform  = 'translateX(' + this.charPositions[key] + 'px)';
        el.style.transition = 'transform 0.5s ease';
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

    /* ── Dialogue ─────────────────────────────────────────────────────────── */
    showSpeech: function (name, text) {
      var key = name.toLowerCase();
      if (key === 'narrator') { this._showNarratorBox(text); return; }
      if (!this.characters[key]) this.characterAppears(name);

      var charEl = this.characters[key].el;
      var old    = charEl.querySelector('.ss-bubble');
      if (old) old.remove();

      var bubble = document.createElement('div');
      bubble.className   = 'ss-bubble ss-anim-popin';
      bubble.textContent = text;
      charEl.appendChild(bubble);

      setTimeout(function () { bubble.classList.add('ss-bubble-fade'); }, 3500);
      setTimeout(function () { if (bubble.parentNode) bubble.remove(); }, 4000);
      this._addLog('💬 ' + name + ': "' + text + '"');
    },

    _showNarratorBox: function (text) {
      var box = this.stage.querySelector('.ss-narrator-box');
      if (!box) { box = document.createElement('div'); box.className = 'ss-narrator-box'; this.stage.appendChild(box); }
      box.innerHTML = '<span>📖</span> ' + escHtml(text);
      box.classList.remove('ss-anim-slidein');
      void box.offsetWidth;
      box.classList.add('ss-anim-slidein');
      this._addLog('📖 Narrator: "' + text + '"');
    },

    /* ── Vocabulary ───────────────────────────────────────────────────────── */
    showVocab: function (word, meaning) {
      if (!this.vocabPanel) return;
      var card = document.createElement('div');
      card.className = 'ss-vocab-card ss-anim-popin';
      card.innerHTML =
        '<span class="ss-vocab-word">' + escHtml(word) + '</span>' +
        '<span class="ss-vocab-arrow">→</span>' +
        '<span class="ss-vocab-meaning">' + escHtml(meaning) + '</span>';
      this.vocabPanel.appendChild(card);
      this._addLog('📚 Vocab: ' + word + ' → ' + meaning);
    },

    /* ── Quiz ─────────────────────────────────────────────────────────────── */
    showQuiz: function (question, choices, onAnswer) {
      var old = this.stage.querySelector('.ss-quiz-box');
      if (old) old.remove();

      var self    = this;
      var box     = document.createElement('div');
      box.className = 'ss-quiz-box ss-anim-fadein';

      var q = document.createElement('div');
      q.className   = 'ss-quiz-question';
      q.textContent = '❓ ' + question;
      box.appendChild(q);

      var btnWrap = document.createElement('div');
      btnWrap.className = 'ss-quiz-choices';

      choices.forEach(function (ch) {
        var btn = document.createElement('button');
        btn.className   = 'ss-quiz-btn';
        btn.textContent = ch.text;
        btn.addEventListener('click', function () {
          btnWrap.querySelectorAll('.ss-quiz-btn').forEach(function (b) { b.disabled = true; });
          if (ch.result === 'correct') {
            btn.classList.add('ss-quiz-correct');
            self.quizResult = 'correct';
            self._showQuizFeedback(box, true);
          } else {
            btn.classList.add('ss-quiz-wrong');
            self.quizResult = 'wrong';
            self._showQuizFeedback(box, false);
            btnWrap.querySelectorAll('.ss-quiz-btn').forEach(function (b) {
              var correctChoice = choices.find(function(c){return c.result==='correct';});
              if (correctChoice && b.textContent === correctChoice.text) b.classList.add('ss-quiz-correct');
            });
          }
          self._addLog('📝 Answer: ' + ch.text + ' (' + ch.result + ')');
          setTimeout(function() {
            box.classList.add('ss-anim-hide');
            setTimeout(function() { if (box.parentNode) box.remove(); }, 500);
          }, 2000);
          if (onAnswer) onAnswer(ch.result);
        });
        btnWrap.appendChild(btn);
      });

      box.appendChild(btnWrap);
      this.stage.appendChild(box);
      this._addLog('📝 Quiz: ' + question);
    },

    _showQuizFeedback: function (box, correct) {
      var fb = document.createElement('div');
      fb.className   = correct ? 'ss-quiz-feedback ss-quiz-feedback-ok' : 'ss-quiz-feedback ss-quiz-feedback-err';
      fb.textContent = correct ? '🎉 Correct! Well done!' : '😅 Not quite — try again!';
      box.appendChild(fb);
    },

    /* ── Score ────────────────────────────────────────────────────────────── */
    setScore: function (val) { this.score = val; this._updateScoreEl(); },
    addScore: function (val) {
      this.score += val;
      this._updateScoreEl();
      this._addLog('🏆 Score +' + val + ' → ' + this.score);
    },
    _updateScoreEl: function () {
      if (!this.scoreDisplay) return;
      this.scoreDisplay.textContent = '🏆 Score: ' + this.score;
      this.scoreDisplay.classList.remove('ss-score-pulse');
      void this.scoreDisplay.offsetWidth;
      this.scoreDisplay.classList.add('ss-score-pulse');
    },
    showScore: function () {
      var toast = document.createElement('div');
      toast.className   = 'ss-score-toast';
      toast.textContent = '🏆 Current Score: ' + this.score;
      this.stage.appendChild(toast);
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 3000);
      this._addLog('🏆 Score: ' + this.score);
    },

    /* ── Sound ────────────────────────────────────────────────────────────── */
    playSound: function (name) {
      var emojis = { success:'🎉', clap:'👏', win:'🏆', cheer:'🥳' };
      var em     = emojis[name.toLowerCase()] || '🔊';
      var toast  = document.createElement('div');
      toast.className   = 'ss-sound-toast';
      toast.textContent = em + ' [sound: ' + name + ']';
      this.stage.appendChild(toast);
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 2000);
    },

    /* ── Log ──────────────────────────────────────────────────────────────── */
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
  console.log('[SpeakScript] Runtime ready');
})();
