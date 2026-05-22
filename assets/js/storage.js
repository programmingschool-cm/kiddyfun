/**
 * SpeakScript Storage v0.1
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
    catch(e) { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }

  var Storage = {
    saveLastCode  : function(c) { try{localStorage.setItem(KEYS.LAST_CODE, c);}catch(e){} },
    loadLastCode  : function()  { try{return localStorage.getItem(KEYS.LAST_CODE)||'';}catch(e){return '';} },

    saveProgram   : function(name, code) {
      var p = this.loadAllPrograms();
      p[name] = { code: code, savedAt: new Date().toISOString() };
      safeSet(KEYS.SAVED_PROGRAMS, p);
    },
    loadAllPrograms: function() { return safeGet(KEYS.SAVED_PROGRAMS, {}); },
    deleteProgram  : function(name) { var p = this.loadAllPrograms(); delete p[name]; safeSet(KEYS.SAVED_PROGRAMS, p); },

    completeMission: function(id) {
      var c = this.loadCompletedMissions();
      if (c.indexOf(id) === -1) c.push(id);
      safeSet(KEYS.COMPLETED_MISSIONS, c);
    },
    loadCompletedMissions: function() { return safeGet(KEYS.COMPLETED_MISSIONS, []); },
    isMissionCompleted   : function(id) { return this.loadCompletedMissions().indexOf(id) !== -1; },

    awardBadge : function(id) { var b = this.loadBadges(); if(b.indexOf(id)===-1) b.push(id); safeSet(KEYS.BADGES, b); },
    loadBadges : function()   { return safeGet(KEYS.BADGES, []); },

    resetAll: function() {
      Object.keys(KEYS).forEach(function(k) { try { localStorage.removeItem(KEYS[k]); } catch(e){} });
    },
  };

  window.SpeakStorage = Storage;
  console.log('[SpeakScript] Storage ready');
})();
