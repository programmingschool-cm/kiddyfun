/**
 * KiddyFun Audio Engine v1.0
 * Synthesized sounds (Web Audio API) + English TTS (Speech Synthesis)
 * No external audio files — everything generated in code.
 */
(function () {
  'use strict';

  var AudioCtx = window.AudioContext || window.webkitAudioContext;

  /* ── Sound Engine (Web Audio API) ───────────────────────────────────── */
  function SoundEngine() {
    this.ctx = null;
    this.enabled = true;
    this._master = null;
  }

  SoundEngine.prototype._ensureCtx = function () {
    if (!this.ctx && AudioCtx) {
      this.ctx = new AudioCtx();
      this._master = this.ctx.createGain();
      this._master.gain.value = 0.35;
      this._master.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  };

  SoundEngine.prototype.setEnabled = function (on) { this.enabled = !!on; };

  SoundEngine.prototype._tone = function (freq, start, dur, type, vol) {
    var ctx = this._ensureCtx();
    if (!ctx || !this.enabled) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(vol || 0.3, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(this._master);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  };

  SoundEngine.prototype._noise = function (start, dur, vol) {
    var ctx = this._ensureCtx();
    if (!ctx || !this.enabled) return;
    var bufferSize = ctx.sampleRate * dur;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var gain = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);
    src.start(ctx.currentTime + start);
  };

  SoundEngine.prototype.play = function (name) {
    var n = (name || '').toLowerCase();
    switch (n) {
      case 'success':
        this._tone(523, 0, 0.15, 'sine', 0.25);
        this._tone(659, 0.12, 0.15, 'sine', 0.25);
        this._tone(784, 0.24, 0.25, 'sine', 0.3);
        break;
      case 'clap':
        for (var i = 0; i < 4; i++) this._noise(i * 0.08, 0.06, 0.2);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach(function (f, j) {
          this._tone(f, j * 0.1, 0.2, 'triangle', 0.28);
        }.bind(this));
        break;
      case 'cheer':
        [392, 494, 587, 698, 784].forEach(function (f, j) {
          this._tone(f, j * 0.07, 0.18, 'sine', 0.22);
        }.bind(this));
        break;
      case 'pop':
        this._tone(880, 0, 0.08, 'sine', 0.2);
        break;
      case 'appear':
        this._tone(440, 0, 0.1, 'sine', 0.15);
        this._tone(660, 0.08, 0.12, 'sine', 0.12);
        break;
      case 'wrong':
      case 'gameover':
        this._tone(220, 0, 0.3, 'sawtooth', 0.15);
        this._tone(180, 0.15, 0.35, 'sawtooth', 0.12);
        break;
      case 'correct':
        this._tone(587, 0, 0.12, 'sine', 0.25);
        this._tone(784, 0.1, 0.2, 'sine', 0.3);
        break;
      case 'scene':
        this._tone(330, 0, 0.2, 'triangle', 0.12);
        this._tone(440, 0.15, 0.25, 'triangle', 0.15);
        break;
      default:
        this._tone(440, 0, 0.15, 'sine', 0.2);
    }
  };

  /* ── TTS Engine (Speech Synthesis) ──────────────────────────────────── */
  /* Per-character voice profiles — pitch / rate variations so each
   * actor sounds different. Specific named characters map to a profile;
   * unknown actors get a profile picked by name-hash. */
  var VOICE_PROFILES = {
    /* gender hint: 'f' female, 'm' male, 'n' neutral/narrator, 'r' robot */
    rafi:     { gender: 'm', pitch: 1.10, rate: 0.95 },
    mostak:   { gender: 'm', pitch: 0.95, rate: 0.92 },
    sagor:    { gender: 'm', pitch: 1.00, rate: 0.94 },
    rabiul:   { gender: 'm', pitch: 0.92, rate: 0.90 },
    buyer:    { gender: 'm', pitch: 1.02, rate: 0.95 },
    mina:     { gender: 'f', pitch: 1.30, rate: 0.96 },
    teacher:  { gender: 'f', pitch: 1.15, rate: 0.92 },
    seller:   { gender: 'f', pitch: 1.20, rate: 0.98 },
    narrator: { gender: 'n', pitch: 0.92, rate: 0.88 },
    lion:     { gender: 'm', pitch: 0.65, rate: 0.82 },
    bird:     { gender: 'f', pitch: 1.60, rate: 1.05 },
    monkey:   { gender: 'm', pitch: 1.45, rate: 1.10 },
    cat:      { gender: 'f', pitch: 1.50, rate: 1.00 },
    dog:      { gender: 'm', pitch: 0.85, rate: 0.95 },
    robot:    { gender: 'r', pitch: 0.50, rate: 0.95 },
  };

  /* Voice name patterns (cross-platform) for each profile gender */
  var VOICE_PATTERNS = {
    f: [
      'Google UK English Female', 'Microsoft Aria', 'Microsoft Jenny',
      'Microsoft Zira', 'Samantha', 'Karen', 'Moira', 'Tessa',
      'Google US English', 'Joanna', 'Salli',
    ],
    m: [
      'Google UK English Male', 'Microsoft Guy', 'Microsoft Davis',
      'Microsoft David', 'Daniel', 'Alex', 'Fred', 'Aaron',
      'Joey', 'Matthew',
    ],
    n: [
      'Microsoft Aria', 'Google US English', 'Samantha', 'Daniel', 'Karen',
    ],
    r: [
      'Microsoft Mark', 'Microsoft David', 'Daniel', 'Alex',
    ],
  };

  function nameHash(s) {
    var h = 0;
    s = String(s || '').toLowerCase();
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h);
  }

  function TTSEngine() {
    this.enabled = true;
    this._voices = [];
    this._ready = false;
    this._current = null;
    this._voiceCache = {};
    this._unlocked = false;
    this._keepAliveTimer = null;
    this._loadVoices();
    this._installUnlock();
  }

  TTSEngine.prototype._loadVoices = function () {
    var self = this;
    function load() {
      self._voices = speechSynthesis.getVoices() || [];
      self._ready = self._voices.length > 0;
      /* Voice list changed — clear per-name cache so we re-pick */
      if (self._ready) self._voiceCache = {};
    }
    load();
    if ('onvoiceschanged' in speechSynthesis) {
      speechSynthesis.onvoiceschanged = load;
    }
    /* Some mobile browsers populate voices lazily — retry briefly */
    var tries = 0;
    var retry = setInterval(function () {
      if (self._ready || ++tries > 10) { clearInterval(retry); return; }
      load();
    }, 350);
  };

  /* Unlock speechSynthesis on the first user gesture. On iOS Safari and
   * some Android browsers, the first speak() must be inside a real user
   * interaction or it will be silently dropped. We fire an empty utter-
   * ance once on the first touch/click anywhere to prime the engine.   */
  TTSEngine.prototype._installUnlock = function () {
    if (!window.speechSynthesis) return;
    var self = this;
    function unlock() {
      if (self._unlocked) { detach(); return; }
      try {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.rate = 1;
        u.onend = function () { self._unlocked = true; };
        u.onerror = function () { self._unlocked = true; };
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
        self._unlocked = true; /* assume unlocked, fix later if it fails */
      } catch (e) { /* ignore */ }
      detach();
    }
    function detach() {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    }
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('click', unlock, true);
    document.addEventListener('keydown', unlock, true);
  };

  /* Chrome on Android pauses speechSynthesis after ~15s. Toggling
   * pause/resume on a timer keeps it alive for longer texts.           */
  TTSEngine.prototype._startKeepAlive = function () {
    var self = this;
    if (self._keepAliveTimer) return;
    self._keepAliveTimer = setInterval(function () {
      if (window.speechSynthesis && speechSynthesis.speaking) {
        try {
          speechSynthesis.pause();
          speechSynthesis.resume();
        } catch (e) { /* ignore */ }
      } else {
        self._stopKeepAlive();
      }
    }, 9000);
  };

  TTSEngine.prototype._stopKeepAlive = function () {
    if (this._keepAliveTimer) {
      clearInterval(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
  };

  TTSEngine.prototype._findVoiceByPatterns = function (patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var pat = patterns[i];
      for (var j = 0; j < this._voices.length; j++) {
        if (this._voices[j].name.indexOf(pat) !== -1) return this._voices[j];
      }
    }
    return null;
  };

  TTSEngine.prototype._fallbackEnglishVoice = function () {
    var en = this._voices.filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf('en') === 0;
    });
    return en[0] || this._voices[0] || null;
  };

  TTSEngine.prototype._getProfile = function (actor) {
    var key = String(actor || '').toLowerCase();
    if (VOICE_PROFILES[key]) return VOICE_PROFILES[key];
    /* Unknown actor: deterministic profile based on name hash */
    var h = nameHash(key);
    var gender = (h % 2 === 0) ? 'f' : 'm';
    var pitchVar = ((h % 25) - 12) / 100; // -0.12 .. +0.12
    var rateVar = ((h % 11) - 5) / 100;   // -0.05 .. +0.05
    return {
      gender: gender,
      pitch: 1.05 + pitchVar,
      rate: 0.92 + rateVar,
    };
  };

  TTSEngine.prototype._pickVoiceFor = function (actor) {
    if (!this._voices.length) return null;
    var key = String(actor || '').toLowerCase();
    if (this._voiceCache[key]) return this._voiceCache[key];

    var profile = this._getProfile(actor);
    var patterns = VOICE_PATTERNS[profile.gender] || VOICE_PATTERNS.n;

    /* Cycle among matching voices so different characters of same gender
     * still sound distinct.                                              */
    var matching = this._voices.filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf('en') === 0 &&
        patterns.some(function (p) { return v.name.indexOf(p) !== -1; });
    });

    if (!matching.length) {
      matching = this._voices.filter(function (v) {
        return v.lang && v.lang.toLowerCase().indexOf('en') === 0;
      });
    }
    if (!matching.length) matching = this._voices.slice();

    var pick = matching[nameHash(key) % matching.length] ||
      this._fallbackEnglishVoice();
    this._voiceCache[key] = pick;
    return pick;
  };

  TTSEngine.prototype.setEnabled = function (on) {
    this.enabled = !!on;
    if (!on) this.cancel();
  };

  TTSEngine.prototype.cancel = function () {
    if (window.speechSynthesis) {
      try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
    this._stopKeepAlive();
    this._current = null;
  };

  TTSEngine.prototype.estimateDuration = function (text, actor) {
    var profile = this._getProfile(actor);
    var rate = profile.rate || 0.92;
    var charMs = 55 / rate;
    return Math.min(Math.max(String(text || '').length * charMs, 800), 8000);
  };

  /* Detect platforms with stricter TTS quirks (iOS Safari, Chrome Android) */
  function isMobileLike() {
    var ua = navigator.userAgent || '';
    return /Mobi|Android|iPhone|iPad|iPod|webOS/i.test(ua);
  }
  var MOBILE_LIKE = isMobileLike();

  TTSEngine.prototype.speak = function (text, actor) {
    var self = this;
    text = String(text || '').trim();
    var fallbackMs = this.estimateDuration(text, actor);
    if (!this.enabled || !text || !window.speechSynthesis) {
      return Promise.resolve(fallbackMs);
    }

    return new Promise(function (resolve) {
      var done = false;
      function finish(ms) {
        if (done) return;
        done = true;
        self._stopKeepAlive();
        self._current = null;
        resolve(ms || fallbackMs);
      }

      function startSpeaking() {
        try {
          var utter = new SpeechSynthesisUtterance(text);
          var profile = self._getProfile(actor);
          utter.rate = profile.rate;
          utter.pitch = profile.pitch;
          utter.volume = 1;
          var voice = self._pickVoiceFor(actor);
          if (voice) {
            utter.voice = voice;
            utter.lang = voice.lang || 'en-US';
          } else {
            utter.lang = 'en-US';
          }
          utter.onend = function () { finish(fallbackMs); };
          utter.onerror = function (e) {
            /* Common harmless errors: 'interrupted', 'canceled' */
            var safe = (e && (e.error === 'interrupted' || e.error === 'canceled'));
            finish(safe ? Math.min(600, fallbackMs) : Math.min(1500, fallbackMs));
          };
          self._current = utter;
          speechSynthesis.speak(utter);
          self._startKeepAlive();
        } catch (e) {
          finish(fallbackMs);
        }
      }

      /* If something is still speaking, cancel + wait a tick. iOS
       * Safari's cancel() is asynchronous; speaking immediately after
       * it will silently drop the new utterance. A small delay fixes
       * this reliably across iOS / Android Chrome.                    */
      var needsDelay = MOBILE_LIKE && window.speechSynthesis &&
        (speechSynthesis.speaking || speechSynthesis.pending);
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      }

      if (needsDelay) {
        setTimeout(startSpeaking, 120);
      } else {
        startSpeaking();
      }

      /* Hard timeout — generous on mobile where some browsers never
       * fire onend (especially after the keep-alive workaround).      */
      var hardMax = Math.min(fallbackMs * 1.6 + 2500, 14000);
      setTimeout(function () { finish(fallbackMs + 400); }, hardMax);
    });
  };

  /* ── Public API ─────────────────────────────────────────────────────── */
  var sounds = new SoundEngine();
  var tts = new TTSEngine();

  window.KiddyAudio = {
    sounds: sounds,
    tts: tts,
    playSound: function (name) { sounds.play(name); },
    speak: function (text, actor) { return tts.speak(text, actor); },
    estimateSpeechMs: function (text, actor) { return tts.estimateDuration(text, actor); },
    cancelAll: function () { tts.cancel(); },
    setVoiceEnabled: function (on) { tts.setEnabled(on); },
    setSoundEnabled: function (on) { sounds.setEnabled(on); },
    isVoiceEnabled: function () { return tts.enabled; },
    isSoundEnabled: function () { return sounds.enabled; },
  };

  console.log('[KiddyFun] Audio engine ready');
})();
