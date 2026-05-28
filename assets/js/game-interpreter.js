/**
 * KiddyFun Game Interpreter — real-time game mode execution
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
    var Env = window.SpeakInterpreter && window.SpeakInterpreter.Environment;
    this.env = Env ? new Env(null) : { vars: {}, get: function () {}, set: function (_, v) { this.vars[_] = v; } };
    this.handlers = {
      keyDown: [],
      keyHeld: [],
      everyFrame: [],
      touch: [],
    };
    this._touchState = {};
  }

  GameInterpreter.prototype.stop = function () {
    this._stopped = true;
    this._running = false;
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this.runtime.loop) this.runtime.loop.stop();
    if (this.runtime.input) this.runtime.input.stop();
  };

  GameInterpreter.prototype.run = function (program) {
    var self = this;
    this._stopped = false;
    this.runtime.reset();
    this.runtime.resizeWorld();

    if (program.view) this.runtime.setView(program.view);
    if (program.title) this.runtime.showHud('🎮 ' + program.title);

    return this._runSetup(program.setup || []).then(function () {
      self._registerHandlers(program);
      self._spawnSceneEntities();
      self._layoutGameStage();
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
  };

  GameInterpreter.prototype._startLoop = function () {
    var self = this;
    var R = this.runtime;
    var input = R.input;
    var loop = R.loop;
    var world = R.world;

    input.start();
    this._running = true;

    loop.onUpdate = function (dt) {
      if (self._stopped) return;
      self._runHandlers('keyHeld', input);
      self._runHandlers('keyDown', input, true);
      self._runEveryFrame();
      world.integrate(dt);
      self._runTouchHandlers();
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

  GameInterpreter.prototype._runHandlers = function (kind, input, usePressed) {
    var list = this.handlers[kind] || [];
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      var key = input.matchKey(h.key);
      var match = usePressed ? input.consumePressed(key) : input.isHeld(key);
      if (match) this._execBlock(h.body);
    }
  };

  GameInterpreter.prototype._runEveryFrame = function () {
    var list = this.handlers.everyFrame || [];
    for (var i = 0; i < list.length; i++) {
      this._execBlock(list[i].body || []);
    }
  };

  GameInterpreter.prototype._runTouchHandlers = function () {
    var self = this;
    var world = this.runtime.world;
    (this.handlers.touch || []).forEach(function (h) {
      var body = h.trueBranch || h.body || [];
      if (world.isTouching(h.actor, h.target)) {
        var id = h.actor + ':' + h.target;
        if (!self._touchState[id]) {
          self._touchState[id] = true;
          self._execBlock(body);
        }
      } else {
        self._touchState[h.actor + ':' + h.target] = false;
      }
    });
  };

  GameInterpreter.prototype._execBlock = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
      if (this._stopped) return;
      this._execGameNode(nodes[i]);
    }
  };

  GameInterpreter.prototype._execSetupNode = function (node) {
    var R = this.runtime;
    var E = Expr();
    switch (node.type) {
      case 'scene':
        R.setScene(node.value, node.withWalls);
        R.resizeWorld();
        return Promise.resolve();
      case 'game_view':
        R.setView(node.view);
        if (R.world) R.world.setView(node.view);
        return Promise.resolve();
      case 'character_appears':
        R.entityAppears(node.actor);
        return Promise.resolve();
      case 'set_player':
        R.world.setPlayer(node.actor);
        R.entityAppears(node.actor);
        return Promise.resolve();
      case 'set_entity_speed':
        R.world.setEntitySpeed(node.actor, this._evalNumber(node.speedExpr));
        return Promise.resolve();
      case 'set_var':
        if (E) {
          var v = E.evaluate(node.expr, this.env);
          this.env.set(node.name, v, node.line);
        }
        return Promise.resolve();
      case 'add_obstacle': {
        var obs = R.world.addObstacle({
          tag: node.tag,
          x: this._evalNumber(node.xExpr),
          y: this._evalNumber(node.yExpr),
          w: this._evalNumber(node.wExpr),
          h: this._evalNumber(node.hExpr),
        });
        R.addObstacleVisual(obs);
        return Promise.resolve();
      }
      case 'score_set':
        R.setScore(node.value);
        return Promise.resolve();
      case 'score_add':
        R.addScore(node.value);
        if (window.KiddyAudio) KiddyAudio.playSound('success');
        return Promise.resolve();
      case 'spawn_coin':
        R.spawnCoin(node.x, node.y);
        return Promise.resolve();
      case 'play_sound':
        if (window.KiddyAudio) KiddyAudio.playSound(node.name);
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  };

  GameInterpreter.prototype._execGameNode = function (node) {
    var R = this.runtime;
    var E = Expr();
    var input = R.input;
    switch (node.type) {
      case 'if_key_held': {
        var key = input.matchKey(node.key);
        var ok = input.isHeld(key);
        this._execBlock(ok ? (node.trueBranch || []) : (node.falseBranch || []));
        break;
      }
      case 'if_touch': {
        var body = node.trueBranch || [];
        if (R.world.isTouching(node.actor, node.target)) this._execBlock(body);
        break;
      }
      case 'game_move':
        R.world.moveEntity(node.actor, node.direction, this._evalNumber(node.amountExpr));
        break;
      case 'game_jump':
        R.world.jump(node.actor, node.power != null ? node.power : undefined);
        if (window.KiddyAudio) KiddyAudio.playSound('pop');
        break;
      case 'set_var':
        if (E) {
          var val = E.evaluate(node.expr, this.env);
          this.env.set(node.name, val, node.line);
          var ak = node.name.toLowerCase();
          var ent = R.world.getEntity(ak);
          if (ent && val.type === 'number' && ak.indexOf('speed') >= 0) ent.speed = val.value;
        }
        break;
      case 'score_add':
        R.addScore(node.value);
        if (window.KiddyAudio) KiddyAudio.playSound('success');
        break;
      case 'remove_entity':
        R.world.removeEntity(node.target);
        break;
      case 'game_stop':
        this.stop();
        if (this._resolveGame) this._resolveGame();
        break;
      case 'play_sound':
        if (window.KiddyAudio) KiddyAudio.playSound(node.name);
        break;
      case 'say':
        R.log((node.actor === 'narrator' ? '📖 ' : '') + node.text);
        break;
      case 'character_appears':
        R.entityAppears(node.actor);
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
