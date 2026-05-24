/**
 * KiddyFun Storage v1.1 — localStorage (offline-first) + optional Supabase sync.
 */
(function () {
  'use strict';

  var KEYS = {
    LAST_CODE         : 'ss_last_code',
    SAVED_PROGRAMS    : 'ss_saved_programs',
    COMPLETED_MISSIONS: 'ss_completed_missions',
    BADGES            : 'ss_badges',
  };

  function safeGet(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (e) { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function cloudSync() {
    return window.KiddySync && window.KiddySync.canSync() ? window.KiddySync : null;
  }

  var Storage = {
    saveLastCode: function (c) {
      try { localStorage.setItem(KEYS.LAST_CODE, c); } catch (e) {}
    },
    loadLastCode: function () {
      try { return localStorage.getItem(KEYS.LAST_CODE) || ''; } catch (e) { return ''; }
    },

    saveProgram: function (name, code) {
      var p = this.loadAllPrograms();
      var savedAt = new Date().toISOString();
      p[name] = { code: code, savedAt: savedAt };
      safeSet(KEYS.SAVED_PROGRAMS, p);
      var sync = cloudSync();
      if (sync) sync.syncProgram(name, code, savedAt);
    },
    loadAllPrograms: function () { return safeGet(KEYS.SAVED_PROGRAMS, {}); },
    deleteProgram: function (name) {
      var p = this.loadAllPrograms();
      delete p[name];
      safeSet(KEYS.SAVED_PROGRAMS, p);
      var sync = cloudSync();
      if (sync) sync.deleteProgram(name);
    },

    completeMission: function (id) {
      var c = this.loadCompletedMissions();
      if (c.indexOf(id) === -1) c.push(id);
      safeSet(KEYS.COMPLETED_MISSIONS, c);
      var sync = cloudSync();
      if (sync) sync.syncMission(id);
    },
    loadCompletedMissions: function () { return safeGet(KEYS.COMPLETED_MISSIONS, []); },
    isMissionCompleted: function (id) {
      return this.loadCompletedMissions().indexOf(id) !== -1;
    },

    awardBadge: function (id) {
      var b = this.loadBadges();
      if (b.indexOf(id) === -1) b.push(id);
      safeSet(KEYS.BADGES, b);
      var sync = cloudSync();
      if (sync) sync.syncBadge(id);
    },
    loadBadges: function () { return safeGet(KEYS.BADGES, []); },

    resetAll: function () {
      Object.keys(KEYS).forEach(function (k) {
        try { localStorage.removeItem(KEYS[k]); } catch (e) {}
      });
    },

    isCloudAvailable: function () {
      return !!(window.KiddyCloud && window.KiddyCloud.isConfigured());
    },

    pullFromCloud: function () {
      var sync = cloudSync();
      if (!sync || !sync.pullFromCloud) {
        return Promise.resolve({ merged: false });
      }
      return sync.pullFromCloud();
    },

    pushToCloud: function () {
      var sync = cloudSync();
      if (!sync || !sync.pushAllLocal) return Promise.resolve();
      return sync.pushAllLocal();
    },
  };

  window.SpeakStorage = Storage;
  console.log('[KiddyFun] Storage ready' + (Storage.isCloudAvailable() ? ' (cloud configured)' : ''));
})();
