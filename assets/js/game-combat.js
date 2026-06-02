/**
 * KiddyFun G8 — projectiles, chase AI, hazards, health hooks
 */
(function () {
  'use strict';

  var Combat = {
    setChase: function (world, enemyKey, targetKey) {
      var e = world.getEntity(enemyKey);
      if (e) {
        e.chaseTarget = String(targetKey).toLowerCase();
        e.patrolMin = null;
        e.patrolMax = null;
        e.patrolSpeed = e.patrolSpeed || 2.5;
      }
    },

    spawnHazard: function (runtime, name, x, y, w, h) {
      var world = runtime.world;
      if (!world) return null;
      return world.addObstacle({
        id: 'hazard_' + name + '_' + world.obstacles.length,
        x: x,
        y: y,
        w: w,
        h: h,
        tag: 'hazard',
        solid: false,
        hazardName: name,
      });
    },

    shootBullet: function (runtime, fromActor, direction, speed) {
      var world = runtime.world;
      if (!world) return;
      var actor = world.getEntity(fromActor);
      if (!actor) return;
      var dir = direction || 'right';
      var spd = speed || 8;
      var bx = actor.x + actor.w / 2 - 4;
      var by = actor.y + actor.h / 2 - 4;
      var vx = 0;
      var vy = 0;
      if (dir === 'left') vx = -spd;
      else if (dir === 'right') vx = spd;
      else if (dir === 'up') vy = -spd;
      else if (dir === 'down') vy = spd;
      if (!world.projectiles) world.projectiles = [];
      world.projectiles.push({
        x: bx,
        y: by,
        w: 10,
        h: 10,
        vx: vx,
        vy: vy,
        from: fromActor,
        el: null,
        active: true,
      });
    },

    updateProjectiles: function (runtime, dt) {
      var world = runtime.world;
      if (!world || !world.projectiles) return;
      var scale = dt / 16.67;
      var layer = runtime._gameLayer;
      var toRemove = [];

      world.projectiles.forEach(function (p, idx) {
        if (!p.active) return;
        p.x += p.vx * scale;
        p.y += p.vy * scale;

        if (!p.el && layer) {
          p.el = document.createElement('div');
          p.el.className = 'kf-game-bullet';
          p.el.textContent = '•';
          p.el.style.position = 'absolute';
          layer.appendChild(p.el);
        }
        if (p.el) {
          p.el.style.left = p.x + 'px';
          p.el.style.top = p.y + 'px';
        }

        if (p.x < -20 || p.y < -20 || p.x > world.bounds.w + 20 || p.y > world.bounds.h + 20) {
          toRemove.push(idx);
          return;
        }

        Object.keys(world.entities).forEach(function (key) {
          var e = world.entities[key];
          if (!e || !e.active || e.tags.indexOf('enemy') < 0) return;
          if (world._aabb(p, e)) {
            world.removeEntity(key);
            toRemove.push(idx);
            if (window.KiddyAudio) KiddyAudio.playSound('pop');
          }
        });
      });

      toRemove.sort(function (a, b) { return b - a; }).forEach(function (i) {
        var p = world.projectiles[i];
        if (p && p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        world.projectiles.splice(i, 1);
      });
    },

    updateChase: function (world, dt) {
      if (!world || !world.playerKey) return;
      var player = world.getEntity(world.playerKey);
      if (!player) return;
      var scale = dt / 16.67;
      Object.keys(world.entities).forEach(function (key) {
        var e = world.entities[key];
        if (!e || !e.active || !e.chaseTarget || e.tags.indexOf('enemy') < 0) return;
        var target = world.getEntity(e.chaseTarget);
        if (!target) return;
        var dx = (target.x + target.w / 2) - (e.x + e.w / 2);
        var dy = (target.y + target.h / 2) - (e.y + e.h / 2);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var spd = (e.patrolSpeed || 2.5) * scale;
        e.x += (dx / dist) * spd;
        e.y += (dy / dist) * spd;
        e.facing = dx >= 0 ? 'right' : 'left';
        world._clampEntity(e);
      });
    },

    checkHazardTouch: function (runtime) {
      var world = runtime.world;
      var gs = runtime.gameState;
      if (!world || !gs || !world.playerKey) return;
      var player = world.getEntity(world.playerKey);
      if (!player) return;
      world.obstacles.forEach(function (o) {
        if (o.tag !== 'hazard') return;
        if (world._aabb(player, o)) {
          gs.damagePlayer(world.playerKey, 15);
          runtime.updateGameHud();
        }
      });
    },
  };

  window.KiddyGameCombat = Combat;
})();
