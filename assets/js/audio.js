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
  function TTSEngine() {
    this.enabled = true;
    this.rate = 0.88;
    this.pitch = 1.05;
    this._voices = [];
    this._ready = false;
    this._current = null;
    this._loadVoices();
  }

  TTSEngine.prototype._loadVoices = function () {
    var self = this;
    function load() {
      self._voices = speechSynthesis.getVoices();
      self._ready = self._voices.length > 0;
    }
    load();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = load;
    }
  };

  TTSEngine.prototype._pickVoice = function () {
    if (!this._voices.length) return null;
    var preferred = ['Google UK English Female', 'Google US English', 'Samantha', 'Karen', 'Moira', 'Daniel'];
    for (var i = 0; i < preferred.length; i++) {
      var v = this._voices.find(function (vo) { return vo.name.indexOf(preferred[i]) !== -1; });
      if (v) return v;
    }
    var en = this._voices.find(function (v) { return v.lang && v.lang.indexOf('en') === 0; });
    return en || this._voices[0];
  };

  TTSEngine.prototype.setEnabled = function (on) {
    this.enabled = !!on;
    if (!on) this.cancel();
  };

  TTSEngine.prototype.cancel = function () {
    speechSynthesis.cancel();
    this._current = null;
  };

  TTSEngine.prototype.speak = function (text, actor) {
    var self = this;
    if (!this.enabled || !text || !window.speechSynthesis) {
      return Promise.resolve(Math.min(text.length * 55, 3500));
    }

    return new Promise(function (resolve) {
      self.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.rate = self.rate;
      utter.pitch = actor && actor.toLowerCase() === 'narrator' ? 0.95 : self.pitch;
      utter.volume = 1;
      var voice = self._pickVoice();
      if (voice) utter.voice = voice;

      var done = false;
      function finish(ms) {
        if (done) return;
        done = true;
        self._current = null;
        resolve(ms || Math.min(text.length * 55 + 400, 6000));
      }

      utter.onend = function () { finish(Math.min(text.length * 55 + 300, 6000)); };
      utter.onerror = function () { finish(1500); };

      self._current = utter;
      speechSynthesis.speak(utter);

      setTimeout(function () { finish(4000); }, Math.min(text.length * 80 + 2000, 8000));
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
    cancelAll: function () { tts.cancel(); },
    setVoiceEnabled: function (on) { tts.setEnabled(on); },
    setSoundEnabled: function (on) { sounds.setEnabled(on); },
    isVoiceEnabled: function () { return tts.enabled; },
    isSoundEnabled: function () { return sounds.enabled; },
  };

  console.log('[KiddyFun] Audio engine ready');
})();
