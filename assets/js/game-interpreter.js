/**
 * KiddyFun Game Interpreter — real-time game mode execution (G6)
 */
(function () {
  'use strict';

  var Expr = function () { return window.KiddyExpr; };

  function GameInterpretError(message, line) {
    this.message = message;
    this.line = line;
    this.name = 'GameInterpretError';
  }
  GameInterpretError.prototype = Object.create(Error.prototype);

  function GameInterpreter(runtime) {
    this.runtime = runtime;
    this._stopped = false;
    this._running = false;
    this._program = null;
    this._eventState = {};
    var Env = window.SpeakInterpreter && window.SpeakInterpreter.Environment;
    this.env = Env ? new Env(null) : { vars: {}, get: function () {}, set: function (_, v) { this.vars[_] = v; } };
    this.handlers = {
      keyDown: [],
      keyHeld: [],
      everyFrame: [],
      touch: [],
      gameEvent: [],
      inventory: [],
    };
    this._touchState = {};
  }

  GameInterpreter.prototype.stop = function () {
    this._stopped = true;
    this._running = false;
    if (window.KiddyGameDebugger && KiddyGameDebugger.detach) KiddyGameDebugger.detach();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this.runtime.loop) this.runtime.loop.stop();
    if (this.runtime.input) this.runtime.input.stop();
  };

  GameInterpreter.prototype.run = function (program) {
    var self = this;
    this._program = program;
    this._stopped = false;
    this._eventState = {};
    this._wonHandled = false;
    this._lostHandled = false;
    this.runtime.reset();
    if (this.runtime.gameState) this.runtime.gameState.reset();
    this.runtime.resizeWorld();

    if (program.view) this.runtime.setView(program.view);
    if (program.title) this.runtime.showHud('🎮 ' + program.title);

    return this._runSetup(program.setup || []).then(function () {
      self._registerHandlers(program);
      self._spawnSceneEntities();
      self._layoutGameStage();
      self.runtime.updateGameHud();
      if (window.KiddyGameDebugger && KiddyGameDebugger.attach) KiddyGameDebugger.attach(self);
      return self._startLoop();
    });
  };

  GameInterpreter.prototype._layoutGameStage = function () {
    var R = this.runtime;
    var self = this;
    function applyLayout() {
      R.resizeWorld();
      if (R.world) R.world.scaleSceneLayout(600, 360);
      R.render();
    }
    applyLayout();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        applyLayout();
        requestAnimationFrame(applyLayout);
      });
    }
    if (R.stage) {
      R.stage.setAttribute('tabindex', '-1');
      try { R.stage.focus({ preventScroll: true }); } catch (e) { R.stage.focus(); }
    }
    if (!this._resizeHandler) {
      this._resizeHandler = function () { applyLayout(); };
      window.addEventListener('resize', this._resizeHandler);
    }
  };

  GameInterpreter.prototype._spawnSceneEntities = function () {
    var world = this.runtime.world;
    if (!world) return;
    var self = this;
    Object.keys(world.entities).forEach(function (key) {
      var e = world.entities[key];
      if (e.tags.indexOf('coin') >= 0) {
        if (!e.el && self.runtime._gameLayer) {
          var cel = document.createElement('div');
          cel.className = 'kf-game-coin';
          cel.innerHTML = '<span class="kf-game-coin-inner">🪙</span>';
          cel.dataset.key = key;
          cel.style.position = 'absolute';
          self.runtime._gameLayer.appendChild(cel);
          e.el = cel;
        }
      } else if (!e.el) {
        self.runtime.entityAppears(e.name, { tags: e.tags });
      }
    });
    world.obstacles.forEach(function (o) {
      if (!o.el) self.runtime.addObstacleVisual(o);
    });
  };

  GameInterpreter.prototype._runSetup = function (nodes) {
    var self = this;
    var i = 0;
    function next() {
      if (self._stopped || i >= nodes.length) return Promise.resolve();
      var node = nodes[i++];
      return self._execSetupNode(node).then(next);
    }
    return next();
  };

  GameInterpreter.prototype._registerHandlers = function (program) {
    this.handlers.keyDown = program.onKeyDown || [];
    this.handlers.keyHeld = program.onKeyHeld || [];
    this.handlers.everyFrame = program.everyFrame || [];
    this.handlers.touch = program.onTouch || [];
    this.handlers.gameEvent = program.onGameEvent || [];
    this.handlers.inventory = program.onInventory || [];
    this._invState = {};
  };

  GameInterpreter.prototype._startLoop = function () {
    var self = this;
    var R = this.runtime;
    var input = R.input;
    var loop = R.loop;
    var world = R.world;
    var gs = R.gameState;

    input.start();
    this._running = true;
    R.hideOverlay();

    loop.onUpdate = function (dt) {
      if (self._stopped) return;
      if (loop.isPaused && loop.isPaused()) return;
      if (gs && !gs.isPlaying()) {
        self._runGameEventHandlers(true);
        return;
      }

      self._runHandlers('keyHeld', input);
      self._runHandlers('keyDown', input, true);
      self._runEveryFrame();
      if (window.KiddyGameEnemies) KiddyGameEnemies.update(world, dt);
      if (window.KiddyGameCombat && KiddyGameCombat.updateProjectiles) {
        KiddyGameCombat.updateProjectiles(R, dt);
        KiddyGameCombat.checkHazardTouch(R);
      }
      world.integrate(dt);
      if (window.KiddyGameDebugger && KiddyGameDebugger.refresh) KiddyGameDebugger.refresh();
      self._runTouchHandlers();
      self._runInventoryHandlers();
      if (gs) gs.tickTimer(dt);
      self._runGameEventHandlers(false);
      input.resetFrame();
    };

    loop.onRender = function () {
      if (!self._stopped) R.render();
    };

    loop.start();
    return new Promise(function (resolve) {
      self._resolveGame = resolve;
    });
  };

  GameInterpreter.prototype._gameEventActive = function (event) {
    var gs = this.runtime.gameState;
    var world = this.runtime.world;
    if (!gs || !world) return false;
    switch (event) {
      case 'all_coins_collected':
        return gs.checkAllCoinsGone(world);
      case 'lives_zero':
        return gs.lives != null && gs.lives <= 0;
      case 'time_zero':
        return gs.timer != null && gs.timer <= 0;
      case 'health_zero':
        return gs.health != null && gs.health <= 0;
      default:
        return false;
    }
  };

  GameInterpreter.prototype._runGameEventHandlers = function (force) {
    var self = this;
    var gs = this.runtime.gameState;
    (this.handlers.gameEvent || []).forEach(function (h) {
      var active = self._gameEventActive(h.event);
      var id = h.event + ':' + (h.line || 0);
      if (active) {
        if (!self._eventState[id] || force) {
          if (!self._eventState[id]) {
            self._eventState[id] = true;
            self._execBlock(h.body || []);
          }
        }
      } else {
        self._eventState[id] = false;
      }
    });
    if (gs && gs.status === 'won') self._onGameWon();
    if (gs && gs.status === 'lost' && !this._lostHandled) self._onGameLost();
  };

  GameInterpreter.prototype._onGameWon = function () {
    if (this._wonHandled) return;
    this._wonHandled = true;
    var R = this.runtime;
    R.showOverlay('win', '🏆 You Win!', 'Score: ' + R.score);
    if (window.KiddyAudio) KiddyAudio.playSound('win');
    if (window.KiddyGameFx && R.stage) KiddyGameFx.stageShake(R.stage, true);
    this.stop();
    if (this._resolveGame) this._resolveGame();
  };

  GameInterpreter.prototype._onGameLost = function () {
    if (this._lostHandled) return;
    this._lostHandled = true;
    var R = this.runtime;
    R.showOverlay('lose', '💔 Game Over', 'Try again!');
    if (window.KiddyAudio) KiddyAudio.playSound('gameover');
    if (window.KiddyGameFx && R.stage) KiddyGameFx.stageShake(R.stage, false);
    this.stop();
    if (this._resolveGame) this._resolveGame();
  };

  GameInterpreter.prototype._runHandlers = function (kind, input, usePressed) {
    if (!this.runtime.gameState || !this.runtime.gameState.isPlaying()) return;
    var list = this.handlers[kind] || [];
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      var key = input.matchKey(h.key);
      var match = usePressed ? input.consumePressed(key) : input.isHeld(key);
      if (match) this._execBlock(h.body);
    }
  };

  GameInterpreter.prototype._runEveryFrame = function () {
    if (!this.runtime.gameState || !this.runtime.gameState.isPlaying()) return;
    var list = this.handlers.everyFrame || [];
    for (var i = 0; i < list.length; i++) {
      this._execBlock(list[i].body || []);
    }
  };

  GameInterpreter.prototype._touchStateId = function (node) {
    return String(node.actor).toLowerCase() + ':' + String(node.target).toLowerCase() +
      ':' + (node.line != null ? node.line : 0);
  };

  GameInterpreter.prototype._execIfTouch = function (node) {
    var world = this.runtime.world;
    if (!world) return;
    var id = this._touchStateId(node);
    var touching = world.isTouching(node.actor, node.target);
    if (touching) {
      if (!this._touchState[id]) {
        this._touchState[id] = true;
        this._execBlock(node.trueBranch || node.body || []);
      }
    } else {
      this._touchState[id] = false;
      if (node.falseBranch && node.falseBranch.length) {
        this._execBlock(node.falseBranch);
      }
    }
  };

  GameInterpreter.prototype._runInventoryHandlers = function () {
    var self = this;
    var gs = this.runtime.gameState;
    if (!gs) return;
    (this.handlers.inventory || []).forEach(function (h) {
      var has = gs.hasItem(h.actor, h.item);
      var id = h.actor + ':' + h.item + ':' + (h.line || 0);
      if (has) {
        if (!self._invState[id]) {
          self._invState[id] = true;
          self._execBlock(h.trueBranch || []);
        }
      } else {
        self._invState[id] = false;
        if (h.falseBranch && h.falseBranch.length) {
          self._execBlock(h.falseBranch);
        }
      }
    });
  };

  GameInterpreter.prototype._runTouchHandlers = function () {
    var self = this;
    (this.handlers.touch || []).forEach(function (h) {
      self._execIfTouch(h);
    });
  };

  GameInterpreter.prototype._execBlock = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
      if (this._stopped) return;
      if (this.runtime.gameState && !this.runtime.gameState.isPlaying()) return;
      this._execGameNode(nodes[i]);
    }
  };

  GameInterpreter.prototype._execSetupNode = function (node) {
    return Promise.resolve(this._execGameNode(node, true));
  };

  GameInterpreter.prototype._evalSpawnY = function (yExpr) {
    if (yExpr && yExpr.valueType === 'ground') {
      return this.runtime.world ? this.runtime.world.groundY : 0;
    }
    if (yExpr && yExpr.type === 'literal' && yExpr.value === 'ground') {
      return this.runtime.world ? this.runtime.world.groundY : 0;
    }
    return this._evalNumber(yExpr);
  };

  GameInterpreter.prototype._execGameNode = function (node, isSetup) {
    var R = this.runtime;
    var gs = R.gameState;
    var E = Expr();
    var input = R.input;
  if (!node) return;

    switch (node.type) {
      case 'scene':
        R.setScene(node.value, node.withWalls);
        R.resizeWorld();
        break;
      case 'load_map':
        R.resizeWorld();
        if (!R.loadMap(node.mapName)) {
          throw new GameInterpretError(
            'Unknown map "' + node.mapName + '". Try: school_maze, playground_extended, jungle_run, arena_coins',
            node.line
          );
        }
        break;
      case 'game_view':
        R.setView(node.view);
        if (R.world) R.world.setView(node.view);
        break;
      case 'character_appears':
        R.entityAppears(node.actor);
        break;
      case 'set_player':
        R.entityAppears(node.actor);
        R.world.setPlayer(node.actor);
        if (gs) gs.applyHealthToPlayer(node.actor);
        if (R.world) R.world.layoutPlayer();
        R.updateGameHud();
        R.render();
        break;
      case 'health_set':
        if (gs) {
          gs.setHealth(node.value);
          if (R.world && R.world.playerKey) gs.applyHealthToPlayer(R.world.playerKey);
          R.updateGameHud();
        }
        break;
      case 'damage_player':
        if (gs) {
          gs.damagePlayer(node.actor, node.amount);
          R.updateGameHud();
          if (gs.health <= 0) this._onGameLost();
        }
        break;
      case 'give_item':
        if (gs) gs.giveItem(node.actor, node.item);
        break;
      case 'enemy_chase':
        if (window.KiddyGameCombat) KiddyGameCombat.setChase(R.world, node.actor, node.target);
        break;
      case 'spawn_hazard': {
        if (window.KiddyGameCombat) {
          var hobs = KiddyGameCombat.spawnHazard(
            R,
            node.name,
            this._evalNumber(node.xExpr),
            this._evalNumber(node.yExpr),
            this._evalNumber(node.wExpr),
            this._evalNumber(node.hExpr)
          );
          if (hobs) R.addObstacleVisual(hobs);
        }
        break;
      }
      case 'shoot_bullet':
        if (window.KiddyGameCombat) {
          KiddyGameCombat.shootBullet(R, node.actor, node.direction, node.speed);
        }
        break;
      case 'set_entity_speed':
        R.world.setEntitySpeed(node.actor, this._evalNumber(node.speedExpr));
        break;
      case 'set_var':
        if (E) {
          var v = E.evaluate(node.expr, this.env);
          this.env.set(node.name, v, node.line);
        }
        break;
      case 'add_obstacle': {
        var obs = R.world.addObstacle({
          tag: node.tag,
          x: this._evalNumber(node.xExpr),
          y: this._evalNumber(node.yExpr),
          w: this._evalNumber(node.wExpr),
          h: this._evalNumber(node.hExpr),
        });
        R.addObstacleVisual(obs);
        break;
      }
      case 'score_set':
        R.setScore(node.value);
        break;
      case 'lives_set':
        if (gs) gs.setLives(node.value);
        R.updateGameHud();
        break;
      case 'timer_set':
        if (gs) gs.setTimer(node.value);
        R.updateGameHud();
        break;
      case 'goal_coins':
        if (gs) gs.setGoalCoins(node.value);
        R.updateGameHud();
        break;
      case 'level_set':
        if (gs) gs.setLevel(node.value);
        R.updateGameHud();
        break;
      case 'next_level':
        if (gs) {
          gs.nextLevel();
          R.updateGameHud();
        }
        break;
      case 'pause_game':
        if (R.loop) R.loop.pause();
        R.showMessage('Paused');
        break;
      case 'resume_game':
        if (R.loop) R.loop.resume();
        if (gs) gs.banner = '';
        R.updateGameHud();
        break;
      case 'camera_follow':
        if (gs) gs.cameraFollow = node.actor;
        break;
      case 'spawn_coin':
        R.spawnCoin(this._evalNumber(node.xExpr), this._evalSpawnY(node.yExpr));
        break;
      case 'spawn_enemy':
        R.spawnEnemy(
          node.name,
          this._evalNumber(node.xExpr),
          this._evalSpawnY(node.yExpr)
        );
        break;
      case 'enemy_patrol':
        R.setEnemyPatrol(
          node.actor,
          this._evalNumber(node.minExpr),
          this._evalNumber(node.maxExpr)
        );
        break;
      case 'score_add':
        R.addScore(node.value);
        if (window.KiddyAudio) KiddyAudio.playSound('success');
        break;
      case 'play_sound':
        if (window.KiddyAudio) KiddyAudio.playSound(node.name);
        break;
      case 'show_message':
        R.showMessage(node.text);
        break;
      case 'if_key_held': {
        var key = input.matchKey(node.key);
        var ok = input.isHeld(key);
        this._execBlock(ok ? (node.trueBranch || []) : (node.falseBranch || []));
        break;
      }
      case 'if_touch':
        this._execIfTouch(node);
        break;
      case 'game_move':
        R.world.moveEntity(node.actor, node.direction, this._evalNumber(node.amountExpr));
        break;
      case 'game_jump':
        R.world.jump(node.actor, node.power != null ? node.power : undefined);
        if (window.KiddyAudio) KiddyAudio.playSound('pop');
        break;
      case 'lose_life':
        if (gs) {
          gs.loseLife(node.amount || 1);
          R.updateGameHud();
          if (window.KiddyGameFx && R.stage) KiddyGameFx.stageShake(R.stage, false);
          if (gs.lives <= 0) this._onGameLost();
        }
        break;
      case 'remove_entity': {
        var player = R.world && R.world.playerKey;
        var target = node.target;
        var actor = player && R.world.getEntity(player);
        if (target === 'coin' && actor && window.KiddyGameFx && R._gameLayer) {
          var cx = actor.x;
          var cy = actor.y;
          Object.keys(R.world.entities).forEach(function (id) {
            var c = R.world.entities[id];
            if (c && c.active && (c.tags.indexOf('coin') >= 0) && R.world._aabb(actor, c)) {
              cx = c.x;
              cy = c.y;
            }
          });
          KiddyGameFx.coinBurst(R._gameLayer, cx, cy);
        }
        R.world.removeEntity(target, player);
        if (target === 'coin' && gs) {
          gs.addCollectedCoin();
          R.updateGameHud();
          if (gs.status === 'won') this._onGameWon();
        }
        break;
      }
      case 'restart_game':
        if (this._program) {
          var prog = this._program;
          var self = this;
          this.stop();
          setTimeout(function () { self.run(prog); }, 50);
        }
        break;
      case 'game_stop':
        this.stop();
        if (this._resolveGame) this._resolveGame();
        break;
      case 'say':
        R.log((node.actor === 'narrator' ? '📖 ' : '') + node.text);
        break;
      default:
        break;
    }
  };

  GameInterpreter.prototype._evalNumber = function (expr) {
    if (typeof expr === 'number') return expr;
    var E = Expr();
    if (!expr || !E) return 4;
    var v = E.evaluate(expr, this.env);
    if (v && v.type === 'number') return v.value;
    if (typeof v === 'number') return v;
    return 4;
  };

  window.KiddyGameInterpreter = GameInterpreter;
  window.GameInterpretError = GameInterpretError;
})();
