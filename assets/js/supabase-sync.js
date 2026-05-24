/**
 * KiddyFun — Cloud sync (Supabase) with offline-first localStorage merge.
 */
(function () {
  'use strict';

  var SYNC_KEY = 'ss_sync_pending';

  function client() {
    return window.KiddyCloud && window.KiddyCloud.getClient();
  }

  async function currentUserId() {
    var sb = client();
    if (!sb) return null;
    var res = await sb.auth.getSession();
    return res.data.session ? res.data.session.user.id : null;
  }

  function canSync() {
    return window.KiddyCloud && window.KiddyCloud.isConfigured() && !!client();
  }

  function queueOp(op) {
    try {
      var q = JSON.parse(localStorage.getItem(SYNC_KEY) || '[]');
      q.push(op);
      localStorage.setItem(SYNC_KEY, JSON.stringify(q));
    } catch (e) { /* ignore */ }
  }

  async function runOp(op, uid) {
    var sb = client();
    if (!sb || !uid) return;
    if (op.type === 'program') {
      await sb.from('programs').upsert({
        user_id: uid,
        name: op.name,
        code: op.code,
        saved_at: op.savedAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,name' });
    } else if (op.type === 'delete_program') {
      await sb.from('programs').delete().eq('user_id', uid).eq('name', op.name);
    } else if (op.type === 'mission') {
      await sb.from('mission_progress').upsert({
        user_id: uid,
        mission_id: op.missionId,
        completed_at: op.completedAt || new Date().toISOString(),
      }, { onConflict: 'user_id,mission_id' });
    } else if (op.type === 'badge') {
      await sb.from('badges').upsert({
        user_id: uid,
        badge_id: op.badgeId,
        awarded_at: op.awardedAt || new Date().toISOString(),
      }, { onConflict: 'user_id,badge_id' });
    }
  }

  async function flushQueue() {
    if (!canSync()) return;
    var uid = await currentUserId();
    if (!uid) return;
    var q;
    try {
      q = JSON.parse(localStorage.getItem(SYNC_KEY) || '[]');
    } catch (e) {
      return;
    }
    if (!q.length) return;
    var remaining = [];
    for (var i = 0; i < q.length; i++) {
      try {
        await runOp(q[i], uid);
      } catch (e) {
        remaining.push(q[i]);
      }
    }
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
    } catch (e) { /* ignore */ }
  }

  async function runWhenSignedIn(op, runner) {
    if (!canSync()) return;
    var uid = await currentUserId();
    if (!uid) {
      if (op) queueOp(op);
      return;
    }
    try {
      if (runner) await runner(uid);
      else if (op) await runOp(op, uid);
      await flushQueue();
    } catch (e) {
      console.warn('[KiddyCloud] sync error', e);
      if (op) queueOp(op);
    }
  }

  var Sync = {
    canSync: canSync,

    isSignedIn: async function () {
      return !!(await currentUserId());
    },

    syncProgram: function (name, code, savedAt) {
      var op = {
        type: 'program',
        name: name,
        code: code,
        savedAt: savedAt || new Date().toISOString(),
      };
      return runWhenSignedIn(op);
    },

    deleteProgram: function (name) {
      return runWhenSignedIn({ type: 'delete_program', name: name });
    },

    syncMission: function (missionId) {
      return runWhenSignedIn({
        type: 'mission',
        missionId: missionId,
        completedAt: new Date().toISOString(),
      });
    },

    syncBadge: function (badgeId) {
      return runWhenSignedIn({
        type: 'badge',
        badgeId: badgeId,
        awardedAt: new Date().toISOString(),
      });
    },

    pushAllLocal: async function () {
      if (!canSync() || !window.SpeakStorage) return;
      var uid = await currentUserId();
      if (!uid) return;

      var programs = window.SpeakStorage.loadAllPrograms();
      Object.keys(programs).forEach(function (name) {
        var p = programs[name];
        Sync.syncProgram(name, p.code, p.savedAt);
      });

      window.SpeakStorage.loadCompletedMissions().forEach(function (id) {
        Sync.syncMission(id);
      });

      window.SpeakStorage.loadBadges().forEach(function (id) {
        Sync.syncBadge(id);
      });

      await flushQueue();
    },

    pullFromCloud: async function () {
      if (!canSync() || !window.SpeakStorage) return { merged: false };
      var uid = await currentUserId();
      if (!uid) return { merged: false };

      var sb = client();
      var merged = false;

      var progRes = await sb.from('programs').select('name, code, saved_at').eq('user_id', uid);
      if (progRes.data && progRes.data.length) {
        var local = window.SpeakStorage.loadAllPrograms();
        progRes.data.forEach(function (row) {
          var existing = local[row.name];
          var remoteAt = row.saved_at ? new Date(row.saved_at).getTime() : 0;
          var localAt = existing && existing.savedAt ? new Date(existing.savedAt).getTime() : 0;
          if (!existing || remoteAt >= localAt) {
            local[row.name] = {
              code: row.code,
              savedAt: row.saved_at || new Date().toISOString(),
            };
            merged = true;
          }
        });
        try {
          localStorage.setItem('ss_saved_programs', JSON.stringify(local));
        } catch (e) { /* ignore */ }
      }

      var missRes = await sb.from('mission_progress').select('mission_id').eq('user_id', uid);
      if (missRes.data) {
        var missions = window.SpeakStorage.loadCompletedMissions();
        missRes.data.forEach(function (row) {
          if (missions.indexOf(row.mission_id) === -1) {
            missions.push(row.mission_id);
            merged = true;
          }
        });
        try {
          localStorage.setItem('ss_completed_missions', JSON.stringify(missions));
        } catch (e) { /* ignore */ }
      }

      var badgeRes = await sb.from('badges').select('badge_id').eq('user_id', uid);
      if (badgeRes.data) {
        var badges = window.SpeakStorage.loadBadges();
        badgeRes.data.forEach(function (row) {
          if (badges.indexOf(row.badge_id) === -1) {
            badges.push(row.badge_id);
            merged = true;
          }
        });
        try {
          localStorage.setItem('ss_badges', JSON.stringify(badges));
        } catch (e) { /* ignore */ }
      }

      await flushQueue();
      return { merged: merged };
    },

    joinClass: async function (classCode) {
      if (!canSync()) throw new Error('Cloud not configured');
      var sb = client();
      var res = await sb.rpc('join_class_by_code', { p_class_code: classCode });
      if (res.error) throw res.error;
    },

    flushQueue: flushQueue,
  };

  window.KiddySync = Sync;

  window.addEventListener('online', function () {
    flushQueue();
    if (window.KiddyAuth && window.KiddyAuth.refreshSyncStatus) {
      window.KiddyAuth.refreshSyncStatus();
    }
  });
})();
