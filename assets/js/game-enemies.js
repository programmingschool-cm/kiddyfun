/**
 * KiddyFun Game Enemies — spawn + patrol AI (G6)
 */
(function () {
  'use strict';

  var GameEnemies = {
    spawn: function (runtime, name, x, y, opts) {
      opts = opts || {};
      var world = runtime.world;
      if (!world) return null;
      var key = String(name).toLowerCase();
      if (!world.entities[key]) {
        runtime.entityAppears(name, { tags: ['enemy'] });
      }
      var e = world.entities[key];
      if (!e) return null;
      if (e.tags.indexOf('enemy') < 0) e.tags.push('enemy');
      if (e.el) e.el.classList.add('kf-game-enemy');
      e.x = x;
      e.y = y;
      if (world.view === 'side') {
        e.y = world.groundY;
        e.onGround = true;
      }
      e.patrolMin = opts.patrolMin != null ? opts.patrolMin : Math.max(40, x - 120);
      e.patrolMax = opts.patrolMax != null ? opts.patrolMax : Math.min(world.bounds.w - e.w - 40, x + 120);
      e.patrolDir = opts.patrolDir || 1;
      e.patrolSpeed = opts.patrolSpeed != null ? opts.patrolSpeed : 2;
      e.speed = e.patrolSpeed;
      return e;
    },

    update: function (world, dt) {
      if (!world) return;
      var scale = dt / 16.67;
      Object.keys(world.entities).forEach(function (key) {
        var e = world.entities[key];
        if (!e || !e.active || e.tags.indexOf('enemy') < 0) return;
        if (e.patrolMin == null || e.patrolMax == null) return;
        var spd = (e.patrolSpeed || 2) * scale;
        e.x += spd * (e.patrolDir || 1);
        if (e.x <= e.patrolMin) {
          e.x = e.patrolMin;
          e.patrolDir = 1;
          e.facing = 'right';
        } else if (e.x + e.w >= e.patrolMax) {
          e.x = e.patrolMax - e.w;
          e.patrolDir = -1;
          e.facing = 'left';
        }
        world._clampEntity(e);
      });
    },
  };

  window.KiddyGameEnemies = GameEnemies;
})();
