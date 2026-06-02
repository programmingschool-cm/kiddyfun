/**
 * KiddyFun Game World — entity state, physics, AABB collision
 */
(function () {
  'use strict';

  var DEFAULT_GRAVITY = 0.55;
  var ENTITY_W = 56;
  var ENTITY_H = 72;

  function GameWorld(opts) {
    opts = opts || {};
    this.view = opts.view || 'side';
    this.gravity = opts.gravity != null ? opts.gravity : DEFAULT_GRAVITY;
    this.groundY = opts.groundY != null ? opts.groundY : 0;
    this.bounds = opts.bounds || { w: 800, h: 400 };
    this.entities = {};
    this.obstacles = [];
    this.playerKey = null;
    this._removed = [];
  }

  GameWorld.prototype.setBounds = function (w, h) {
    this.bounds.w = w;
    this.bounds.h = h;
    if (this.view === 'side') {
      this.groundY = h - ENTITY_H - 8;
    }
  };

  GameWorld.prototype.setView = function (view) {
    this.view = view === 'top' ? 'top' : 'side';
  };

  GameWorld.prototype.addEntity = function (key, data) {
    key = key.toLowerCase();
    var initX = data.x != null ? data.x : (this.view === 'top'
      ? Math.max(40, this.bounds.w / 2 - ENTITY_W / 2)
      : 80);
    var initY = data.y != null ? data.y : (this.view === 'side'
      ? this.groundY
      : Math.max(40, this.bounds.h / 2 - ENTITY_H / 2));
    var e = {
      key: key,
      name: data.name || key,
      x: initX,
      y: initY,
      refX: data.refX != null ? data.refX : initX,
      refY: data.refY != null ? data.refY : initY,
      w: data.w || ENTITY_W,
      h: data.h || ENTITY_H,
      vx: 0,
      vy: 0,
      speed: data.speed != null ? data.speed : 4,
      jumpPower: data.jumpPower != null ? data.jumpPower : 12,
      onGround: false,
      facing: 'right',
      tags: data.tags || [],
      def: data.def || null,
      el: null,
      active: true,
    };
    if (this.view === 'side') {
      e.y = this.groundY;
      e.onGround = true;
    }
    this.entities[key] = e;
    return e;
  };

  GameWorld.prototype.setPlayer = function (key) {
    this.playerKey = String(key).toLowerCase();
    var e = this.entities[this.playerKey];
    if (e && e.tags.indexOf('player') < 0) e.tags.push('player');
  };

  GameWorld.prototype.getEntity = function (key) {
    return this.entities[String(key).toLowerCase()];
  };

  GameWorld.prototype.setEntitySpeed = function (key, speed) {
    var e = this.getEntity(key);
    if (e) e.speed = speed;
  };

  GameWorld.prototype.removeEntity = function (keyOrTag, actorKey) {
    var k = String(keyOrTag).toLowerCase();
    var self = this;
    var actor = actorKey ? this.getEntity(actorKey) : null;

    if (k === 'coin' && actor && actor.active) {
      var bestId = null;
      var bestOverlap = 0;
      Object.keys(this.entities).forEach(function (id) {
        var ent = self.entities[id];
        if (!ent.active) return;
        if (ent.tags.indexOf('coin') < 0 && id.indexOf('coin') !== 0) return;
        if (!self._aabb(actor, ent)) return;
        var overlap = Math.min(actor.x + actor.w - ent.x, ent.x + ent.w - actor.x) *
          Math.min(actor.y + actor.h - ent.y, ent.y + ent.h - actor.y);
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestId = id;
        }
      });
      if (bestId) {
        this._deactivateEntity(bestId);
        return;
      }
    }

    var keys = Object.keys(this.entities);
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var ent = self.entities[id];
      if (!ent.active) continue;
      if (id === k || ent.tags.indexOf(k) >= 0) {
        this._deactivateEntity(id);
        break;
      }
    }
  };

  GameWorld.prototype._deactivateEntity = function (id) {
    var ent = this.entities[id];
    if (!ent || !ent.active) return;
    ent.active = false;
    if (ent.el && ent.el.parentNode) ent.el.parentNode.removeChild(ent.el);
    ent.el = null;
    this._removed.push(id);
  };

  GameWorld.prototype.addObstacle = function (obs) {
    var o = {
      id: obs.id || 'wall_' + this.obstacles.length,
      x: obs.x || 0,
      y: obs.y || 0,
      refX: obs.x || 0,
      refY: obs.y || 0,
      refW: obs.w || 40,
      refH: obs.h || 40,
      w: obs.w || 40,
      h: obs.h || 40,
      tag: obs.tag || 'wall',
      solid: obs.solid !== false,
    };
    this.obstacles.push(o);
    return o;
  };

  GameWorld.prototype.loadSceneData = function (sceneName) {
    var data = window.KiddyGameScenes && window.KiddyGameScenes[sceneName];
    if (!data) return;
    var self = this;
    if (data.obstacles) {
      data.obstacles.forEach(function (o) { self.addObstacle(o); });
    }
    if (data.entities) {
      data.entities.forEach(function (ent) {
        self.addEntity(ent.key, ent);
      });
    }
    if (data.view) this.setView(data.view);
    this.scaleSceneLayout(data.refW || 600, data.refH || 360);
  };

  GameWorld.prototype.scaleSceneLayout = function (refW, refH) {
    if (!refW || !refH || !this.bounds.w || !this.bounds.h) return;
    var sx = this.bounds.w / refW;
    var sy = this.bounds.h / refH;
    var self = this;

    this.obstacles.forEach(function (o) {
      o.x = Math.round((o.refX != null ? o.refX : o.x) * sx);
      o.y = Math.round((o.refY != null ? o.refY : o.y) * sy);
      o.w = Math.max(8, Math.round((o.refW != null ? o.refW : o.w) * sx));
      o.h = Math.max(8, Math.round((o.refH != null ? o.refH : o.h) * sy));
      if (o.el) {
        o.el.style.left = o.x + 'px';
        o.el.style.top = o.y + 'px';
        o.el.style.width = o.w + 'px';
        o.el.style.height = o.h + 'px';
      }
    });

    Object.keys(this.entities).forEach(function (key) {
      var e = self.entities[key];
      if (!e || e.tags.indexOf('player') >= 0) return;
      if (e.tags.indexOf('coin') >= 0 || e.key.indexOf('coin') === 0) {
        e.x = Math.round((e.refX != null ? e.refX : e.x) * sx);
        e.y = Math.round((e.refY != null ? e.refY : e.y) * sy);
      }
    });

    if (this.view === 'side') {
      this.groundY = this.bounds.h - ENTITY_H - 8;
    }
    if (this.playerKey && this.entities[this.playerKey]) {
      this.layoutPlayer();
    }
  };

  GameWorld.prototype.jump = function (key, power) {
    var e = this.getEntity(key);
    if (!e || !e.active) return;
    if (this.view === 'top') return;
    if (e.onGround) {
      e.vy = -(power != null ? power : e.jumpPower);
      e.onGround = false;
    }
  };

  GameWorld.prototype.moveEntity = function (key, dir, amount) {
    var e = this.getEntity(key);
    if (!e || !e.active) return;
    var amt = amount || e.speed;
    var prevX = e.x;
    var prevY = e.y;
    if (dir === 'left') {
      e.x -= amt;
      e.facing = 'left';
      if (this.view === 'side') e.vx = -amt * 0.5;
    } else if (dir === 'right') {
      e.x += amt;
      e.facing = 'right';
      if (this.view === 'side') e.vx = amt * 0.5;
    } else if (dir === 'up') {
      e.y -= amt;
      e.facing = 'up';
    } else if (dir === 'down') {
      e.y += amt;
      e.facing = 'down';
    }
    this._clampEntity(e);
    e._movedThisFrame = e.x !== prevX || e.y !== prevY;
  };

  GameWorld.prototype._clampEntity = function (e) {
    var pad = 4;
    e.x = Math.max(pad, Math.min(this.bounds.w - e.w - pad, e.x));
    if (this.view === 'top') {
      e.y = Math.max(pad, Math.min(this.bounds.h - e.h - pad, e.y));
    } else if (e.onGround) {
      e.y = this.groundY;
    }
  };

  GameWorld.prototype.integrate = function (dt) {
    var self = this;
    var scale = dt / 16.67;
    Object.keys(this.entities).forEach(function (key) {
      var e = self.entities[key];
      if (!e.active) return;

      if (self.view === 'side') {
        e.vy += self.gravity * scale;
        e.y += e.vy * scale;
        e.x += e.vx * scale;
        e.vx *= 0.85;

        if (e.y >= self.groundY) {
          e.y = self.groundY;
          e.vy = 0;
          e.onGround = true;
        } else {
          e.onGround = false;
        }
      }

      self._resolveObstacleCollisions(e);
      self._clampEntity(e);
    });

    this._purgeRemoved();
  };

  GameWorld.prototype._aabb = function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  };

  GameWorld.prototype._resolveObstacleCollisions = function (e) {
    for (var i = 0; i < this.obstacles.length; i++) {
      var o = this.obstacles[i];
      if (!o.solid) continue;
      if (!this._aabb(e, o)) continue;

      var overlapX = Math.min(e.x + e.w - o.x, o.x + o.w - e.x);
      var overlapY = Math.min(e.y + e.h - o.y, o.y + o.h - e.y);

      if (this.view === 'side' && overlapY < overlapX) {
        if (e.vy > 0 && e.y < o.y) {
          e.y = o.y - e.h;
          e.vy = 0;
          e.onGround = true;
        } else if (e.vy < 0) {
          e.y = o.y + o.h;
          e.vy = 0;
        }
      } else if (overlapX < overlapY) {
        if (e.x + e.w / 2 < o.x + o.w / 2) e.x = o.x - e.w;
        else e.x = o.x + o.w;
      } else {
        if (e.y + e.h / 2 < o.y + o.h / 2) e.y = o.y - e.h;
        else e.y = o.y + o.h;
      }
    }
  };

  GameWorld.prototype.isTouching = function (actorKey, target) {
    actorKey = String(actorKey).toLowerCase();
    target = String(target).toLowerCase();
    var a = this.entities[actorKey];
    if (!a || !a.active) return false;

    for (var i = 0; i < this.obstacles.length; i++) {
      var o = this.obstacles[i];
      if ((o.tag === target || o.id === target) && this._aabb(a, o)) return true;
    }

    var keys = Object.keys(this.entities);
    for (var j = 0; j < keys.length; j++) {
      var b = this.entities[keys[j]];
      if (!b.active || keys[j] === actorKey) continue;
      if (keys[j] === target || b.tags.indexOf(target) >= 0) {
        if (this._aabb(a, b)) return true;
      }
    }
    return false;
  };

  GameWorld.prototype._purgeRemoved = function () {
    var self = this;
    this._removed.forEach(function (id) {
      delete self.entities[id];
    });
    this._removed = [];
  };

  GameWorld.prototype.reset = function () {
    this.entities = {};
    this.obstacles = [];
    this.playerKey = null;
    this._removed = [];
    this.view = 'side';
  };

  GameWorld.prototype.layoutPlayer = function () {
    if (!this.playerKey) return;
    var e = this.entities[this.playerKey];
    if (!e || !e.active) return;
    if (this.view === 'top') {
      e.x = Math.round(this.bounds.w / 2 - e.w / 2);
      e.y = Math.round(this.bounds.h / 2 - e.h / 2);
    } else {
      e.y = this.groundY;
      e.onGround = true;
      e.vy = 0;
      if (e.x == null || e.x < 40) e.x = 80;
    }
  };

  window.KiddyGameWorld = GameWorld;
})();
