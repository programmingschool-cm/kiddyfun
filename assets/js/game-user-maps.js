/**
 * G7b — user-defined maps (localStorage)
 */
(function () {
  'use strict';

  var KEY = 'kf_user_maps';

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveAll(maps) {
    try {
      localStorage.setItem(KEY, JSON.stringify(maps));
    } catch (e) { /* ignore */ }
  }

  window.KiddyUserMaps = {
    save: function (name, data) {
      var key = String(name || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!key) return { ok: false, error: 'Invalid map name' };
      var maps = loadAll();
      maps[key] = data;
      saveAll(maps);
      return { ok: true, name: key };
    },

    get: function (name) {
      var key = String(name || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      var maps = loadAll();
      return maps[key] || null;
    },

    list: function () {
      return Object.keys(loadAll());
    },

    remove: function (name) {
      var key = String(name || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      var maps = loadAll();
      delete maps[key];
      saveAll(maps);
    },

    registerBuiltin: function () {
      if (!window.KiddyGameMaps) return;
      var maps = loadAll();
      Object.keys(maps).forEach(function (k) {
        if (!window.KiddyGameMaps[k]) {
          window.KiddyGameMaps[k] = maps[k];
        }
      });
    },
  };

  KiddyUserMaps.registerBuiltin();
})();
