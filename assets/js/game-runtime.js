/**
 * KiddyFun Game Runtime — DOM sync for game mode (separate from story Runtime)
 */
(function () {
  'use strict';

  var CHARACTER_DEFS = {
    rafi: { type: 'human', color: '#4f8ef7', label: 'Rafi', pants: '#1e3a5f' },
    mina: { type: 'human', color: '#f76fa8', label: 'Mina', pants: '#831843' },
    teacher: { type: 'human', color: '#9b59b6', label: 'Teacher', pants: '#4c1d95' },
    lion: { type: 'lion', color: '#e8a317', label: 'Lion' },
    bird: { type: 'bird', color: '#38bdf8', label: 'Bird' },
    monkey: { type: 'monkey', color: '#a16207', label: 'Monkey' },
    robot: { type: 'robot', color: '#64748b', label: 'Robot' },
    cat: { type: 'cat', color: '#f97316', label: 'Cat' },
    dog: { type: 'dog', color: '#a8a29e', label: 'Dog' },
    mostak: { type: 'human', color: '#3b82f6', label: 'Mostak', pants: '#1e293b' },
    sagor: { type: 'human', color: '#10b981', label: 'Sagor', pants: '#064e3b' },
    rabiul: { type: 'human', color: '#f59e0b', label: 'Rabiul', pants: '#422006' },
    cow: { type: 'human', color: '#78716c', label: '🐄 Cow', pants: '#44403c' },
  };

  var SCENE_DEFS = {
    school: { bg: 'linear-gradient(180deg,#87CEEB 0%,#87CEEB 55%,#90EE90 55%)', emoji: '🏫', label: 'School', deco: 'clouds' },
    classroom: { bg: 'linear-gradient(180deg,#fff9e6 0%,#fff9e6 55%,#c8b560 55%)', emoji: '📚', label: 'Classroom', deco: 'indoor' },
    jungle: { bg: 'linear-gradient(180deg,#2d5016 0%,#56ab2f 40%,#4a7c1f 55%)', emoji: '🌿', label: 'Jungle', deco: 'trees' },
    playground: { bg: 'linear-gradient(180deg,#81d4fa 0%,#81d4fa 50%,#a5d6a7 50%)', emoji: '🛝', label: 'Playground', deco: 'clouds' },
    space: { bg: 'linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 50%,#0d0d2b 100%)', emoji: '🚀', label: 'Space', deco: 'stars' },
    default: { bg: 'linear-gradient(180deg,#e8eaf6 0%,#e8eaf6 55%,#b0bec5 55%)', emoji: '🌍', label: 'Scene', deco: 'clouds' },
  };

  var GameRuntime = {
    stage: null,
    logPanel: null,
    scoreDisplay: null,
    world: null,
    loop: null,
    input: null,
    score: 0,
    currentScene: 'default',
    gameState: null,
    _gameLayer: null,
    _debugLayer: null,
    _overlayEl: null,
    _statsHud: null,
    _camX: 0,
    _debug: false,

    init: function (stageEl, logEl, scoreEl) {
      this.stage = stageEl;
      this.logPanel = logEl;
      this.scoreDisplay = scoreEl;
      this.world = new window.KiddyGameWorld({ view: 'side' });
      this.loop = new window.KiddyGameLoop();
      this.input = new window.KiddyGameInput();
      this.gameState = window.KiddyGameState ? new window.KiddyGameState() : null;
    },

    reset: function () {
      if (this.loop) this.loop.stop();
      if (this.input) {
        this.input.stop();
        this.input.removeTouchPad();
      }
      this.score = 0;
      this._camX = 0;
      this._updateScore();
      if (this.gameState) this.gameState.reset();
      if (this.world) this.world.reset();
      if (this.stage) {
        this.stage.innerHTML = '';
        this.stage.classList.remove('kf-game-mode');
        this._debugLayer = null;
        this._buildStageShell();
      }
    },

    _buildStageShell: function () {
      var stage = this.stage;
      stage.classList.add('kf-game-mode');
      stage.innerHTML =
        '<div class="kf-layer-sky kf-layer"></div>' +
        '<div class="kf-layer-ground kf-layer"></div>' +
        '<div class="kf-stage-floor"></div>' +
        '<div class="kf-layer-mid kf-layer"></div>' +
        '<div class="kf-game-world-wrap" id="kf-game-world-wrap">' +
        '<div class="kf-game-layer" id="kf-game-layer"></div></div>' +
        '<div class="kf-game-stats" id="kf-game-stats"></div>' +
        '<div class="kf-game-hud" id="kf-game-hud"></div>' +
        '<div class="kf-game-overlay" id="kf-game-overlay" hidden></div>';
      this._gameLayer = document.getElementById('kf-game-layer');
      this._statsHud = document.getElementById('kf-game-stats');
      this._overlayEl = document.getElementById('kf-game-overlay');
    },

    setScene: function (name, withWalls) {
      this.currentScene = (name || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
      var def = SCENE_DEFS[this.currentScene] || SCENE_DEFS.default;
      if (this.stage) {
        this.stage.style.background = def.bg;
        var label = this.stage.querySelector('.kf-scene-label');
        if (!label) {
          label = document.createElement('div');
          label.className = 'kf-scene-label';
          this.stage.insertBefore(label, this.stage.firstChild);
        }
        label.textContent = def.emoji + ' ' + (def.label || name);
      }
      if (withWalls && this.world) {
        this.world.loadSceneData(this.currentScene);
      }
      this._addLog('Scene: ' + name);
    },

    setView: function (view) {
      if (this.world) this.world.setView(view);
      if (this.stage) {
        this.stage.classList.toggle('kf-game-view-top', view === 'top');
        this.stage.classList.toggle('kf-game-view-side', view !== 'top');
      }
    },

    resizeWorld: function () {
      if (!this.stage || !this.world) return;
      var w = this.stage.clientWidth || 600;
      var h = this.stage.clientHeight || 360;
      this.world.setBounds(w, h);
    },

    entityAppears: function (name, opts) {
      opts = opts || {};
      var key = name.toLowerCase();
      var def = CHARACTER_DEFS[key] || { type: 'human', color: '#6366f1', label: name };
      if (!this.world.entities[key]) {
        this.world.addEntity(key, {
          name: name,
          def: def,
          x: opts.x,
          y: opts.y,
          tags: opts.tags || [],
        });
      }
      var ent = this.world.entities[key];
      if (!ent.el && this._gameLayer) {
        var el;
        if (window.StageGraphics) {
          el = StageGraphics.createCharacter(name, def);
        } else {
          el = document.createElement('div');
          el.className = 'ss-character';
          el.innerHTML = '<span>' + name + '</span>';
        }
        el.classList.add('kf-game-entity');
        el.classList.remove('ss-anim-enter');
        el.dataset.key = key;
        el.style.position = 'absolute';
        el.style.bottom = 'auto';
        el.style.right = 'auto';
        el.style.marginLeft = '0';
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.style.willChange = 'left, top';
        this._gameLayer.appendChild(el);
        ent.el = el;
        if (window.StageAnimator && window.StageGraphics) {
          var wrap = StageGraphics.getBodyWrap(el);
          var t = el.dataset.charType;
          if (wrap && (t === 'human' || t === 'robot')) {
            StageAnimator.idleBreath(el, wrap);
          }
        }
      }
      ent.active = true;
      this._addLog(name + ' ready');
    },

    spawnCoin: function (x, y) {
      var refW = 600;
      var refH = 360;
      var bw = this.world.bounds.w || refW;
      var bh = this.world.bounds.h || refH;
      var refX = bw ? Math.round((x / bw) * refW) : x;
      var refY = bh ? Math.round((y / bh) * refH) : y;
      var id = 'coin_' + Date.now() + '_' + Math.floor(Math.random() * 999);
      this.world.addEntity(id, {
        name: 'Coin',
        x: x,
        y: y,
        refX: refX,
        refY: refY,
        w: 28,
        h: 28,
        tags: ['coin'],
        def: { type: 'human', color: '#fbbf24', label: 'Coin' },
      });
      var ent = this.world.entities[id];
      if (ent && this._gameLayer) {
        var el = document.createElement('div');
        el.className = 'kf-game-coin';
        el.innerHTML = '<span class="kf-game-coin-inner">🪙</span>';
        el.dataset.key = id;
        el.style.position = 'absolute';
        this._gameLayer.appendChild(el);
        ent.el = el;
      }
      return id;
    },

    addObstacleVisual: function (obs) {
      if (!this._gameLayer) return;
      var el = document.createElement('div');
      el.className = 'kf-game-obstacle kf-game-obstacle-' + (obs.tag || 'wall');
      el.style.cssText =
        'left:' + obs.x + 'px;top:' + obs.y + 'px;width:' + obs.w + 'px;height:' + obs.h + 'px;';
      el.dataset.tag = obs.tag || 'wall';
      this._gameLayer.appendChild(el);
      obs.el = el;
    },

    render: function () {
      if (!this.world) return;
      this._updateCamera();
      if (this.gameState) this.updateGameHud();
      var self = this;
      Object.keys(this.world.entities).forEach(function (key) {
        var e = self.world.entities[key];
        if (!e.el || !e.active) {
          if (e.el) e.el.style.display = 'none';
          return;
        }
        e.el.style.display = '';
        e.el.style.transform = 'none';
        e.el.style.left = Math.round(e.x) + 'px';
        e.el.style.top = Math.round(e.y) + 'px';

        if (e.tags.indexOf('coin') >= 0 || e.key.indexOf('coin') === 0) {
          e.el.style.width = e.w + 'px';
          e.el.style.height = e.h + 'px';
        }

        if (window.StageGraphics) {
          StageGraphics.setFacing(e.el, e.facing === 'left' ? 'left' : 'right');
          if (self.world.view === 'side') {
            if (!e.onGround && e.vy < 0) StageGraphics.setMotion(e.el, 'jumps');
            else if (!e.onGround) StageGraphics.setMotion(e.el, 'walks');
            else if (Math.abs(e.vx) > 0.5) StageGraphics.setMotion(e.el, 'runs');
            else StageGraphics.setMotion(e.el, 'idle');
          } else if (e.tags.indexOf('coin') < 0 && e.key.indexOf('coin') !== 0) {
            var moving = e._movedThisFrame;
            e.el.classList.toggle('kf-game-moving', !!moving);
            StageGraphics.setMotion(e.el, moving ? 'walks' : 'idle');
          }
        }
        e._movedThisFrame = false;
      });

      if (this._debug) this._renderDebug();
    },

    _renderDebug: function () {
      if (!this._gameLayer || !this.world) return;
      if (!this._debugLayer) {
        this._debugLayer = document.createElement('div');
        this._debugLayer.className = 'kf-game-debug-layer';
        this._debugLayer.setAttribute('aria-hidden', 'true');
        this._gameLayer.appendChild(this._debugLayer);
      }
      var html = '';
      var self = this;
      Object.keys(this.world.entities).forEach(function (key) {
        var e = self.world.entities[key];
        if (!e.active) return;
        html += '<div class="kf-debug-box kf-debug-entity" style="left:' + Math.round(e.x) +
          'px;top:' + Math.round(e.y) + 'px;width:' + e.w + 'px;height:' + e.h +
          'px" title="' + key + '"></div>';
      });
      this.world.obstacles.forEach(function (o) {
        html += '<div class="kf-debug-box kf-debug-obstacle" style="left:' + o.x +
          'px;top:' + o.y + 'px;width:' + o.w + 'px;height:' + o.h +
          'px" title="' + (o.tag || o.id) + '"></div>';
      });
      this._debugLayer.innerHTML = html;
    },

    addScore: function (n, opts) {
      opts = opts || {};
      this.score += n;
      this._updateScore();
      if (!opts.silent && window.KiddyGameFx && this.stage) {
        KiddyGameFx.scorePop(this.stage, '+' + n);
      }
    },

    setScore: function (n) {
      this.score = n;
      this._updateScore();
    },

    _updateScore: function () {
      if (this.scoreDisplay) {
        this.scoreDisplay.textContent = 'Score: ' + this.score;
      }
    },

    showHud: function (text) {
      var hud = document.getElementById('kf-game-hud');
      if (hud) hud.textContent = text || '';
    },

    showMessage: function (text) {
      if (this.gameState) this.gameState.banner = text || '';
      this.updateGameHud();
    },

    updateGameHud: function () {
      if (!this._statsHud || !this.gameState) return;
      var gs = this.gameState;
      var parts = [];
      if (gs.lives != null) {
        var hearts = '';
        for (var i = 0; i < gs.lives; i++) hearts += '❤️';
        parts.push(hearts || '💔');
      }
      if (gs.timer != null) parts.push('⏱️ ' + gs.timer);
      if (gs.goalCoins != null) {
        parts.push('🪙 ' + gs.collectedCoins + '/' + gs.goalCoins);
      }
      parts.push('Lv ' + gs.level);
      if (gs.banner) parts.push(gs.banner);
      this._statsHud.textContent = parts.join('  ');
    },

    showOverlay: function (kind, title, sub) {
      if (!this._overlayEl) return;
      this._overlayEl.hidden = false;
      this._overlayEl.className = 'kf-game-overlay kf-game-overlay-' + (kind || 'win');
      this._overlayEl.innerHTML =
        '<div class="kf-game-overlay-card">' +
        '<div class="kf-game-overlay-title">' + (title || '') + '</div>' +
        (sub ? '<div class="kf-game-overlay-sub">' + sub + '</div>' : '') +
        '</div>';
    },

    hideOverlay: function () {
      if (this._overlayEl) {
        this._overlayEl.hidden = true;
        this._overlayEl.innerHTML = '';
      }
    },

    spawnEnemy: function (name, x, y) {
      if (window.KiddyGameEnemies) {
        return KiddyGameEnemies.spawn(this, name, x, y, {});
      }
      return null;
    },

    setEnemyPatrol: function (name, minX, maxX) {
      var e = this.world && this.world.getEntity(name);
      if (!e) return;
      e.patrolMin = minX;
      e.patrolMax = maxX;
      e.patrolDir = 1;
      e.patrolSpeed = e.patrolSpeed || 2;
    },

    _updateCamera: function () {
      var wrap = document.getElementById('kf-game-world-wrap');
      if (!wrap || !this.world) return;
      wrap.style.width = this.world.bounds.w + 'px';
      wrap.style.height = this.world.bounds.h + 'px';
      if (!this.gameState || !this.gameState.cameraFollow) {
        wrap.style.transform = '';
        return;
      }
      var pk = this.gameState.cameraFollow.toLowerCase();
      var p = this.world.entities[pk];
      if (!p || !p.active) return;
      var stageW = this.stage ? this.stage.clientWidth : 600;
      var target = p.x + p.w / 2 - stageW / 2;
      var maxCam = Math.max(0, this.world.bounds.w - stageW);
      this._camX = Math.max(0, Math.min(maxCam, target));
      wrap.style.transform = 'translate(' + Math.round(-this._camX) + 'px, 0)';
    },

    _addLog: function (msg) {
      if (!this.logPanel) return;
      var item = document.createElement('div');
      item.className = 'ss-log-item';
      item.textContent = msg;
      this.logPanel.appendChild(item);
      this.logPanel.scrollTop = this.logPanel.scrollHeight;
    },

    log: function (msg) {
      this._addLog(msg);
    },
  };

  window.KiddyGameRuntime = GameRuntime;
})();
