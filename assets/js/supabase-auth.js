/**
 * KiddyFun — Child-safe cloud auth (anonymous + optional parent email).
 */
(function () {
  'use strict';

  var OWNER_KEY = 'kf_cloud_owner';
  var state = {
    signedIn: false,
    displayName: '',
    email: '',
    isAnonymous: true,
  };
  var signInFlight = null;
  var signInFlightUid = '';

  function sb() {
    return window.KiddyCloud && window.KiddyCloud.getClient();
  }

  function cloudEnabled() {
    return window.KiddyCloud && window.KiddyCloud.isConfigured();
  }

  async function loadProfile(userId) {
    var client = sb();
    if (!client) return null;
    var res = await client.from('profiles').select('display_name, class_code, role').eq('id', userId).maybeSingle();
    if (res.error) {
      console.warn('[KiddyAuth] profile load', res.error);
      return null;
    }
    return res.data;
  }

  async function updateProfileFields(fields) {
    var client = sb();
    if (!client) return;
    var session = await client.auth.getSession();
    var uid = session.data.session && session.data.session.user.id;
    if (!uid) return;
    await client.from('profiles').update(fields).eq('id', uid);
  }

  function applyState(session, profile) {
    state.signedIn = !!session;
    if (session && session.user) {
      state.email = session.user.email || '';
      state.isAnonymous = session.user.is_anonymous === true;
      var meta = session.user.user_metadata || {};
      state.displayName = (profile && profile.display_name) || meta.display_name || 'Kiddy Coder';
    } else {
      state.email = '';
      state.displayName = '';
      state.isAnonymous = true;
    }
    refreshSyncStatus();
  }

  function refreshSyncStatus() {
    var statusEl = document.getElementById('kf-cloud-status');
    var panel = document.getElementById('panel-sync');
    if (!statusEl) return;

    if (!cloudEnabled()) {
      statusEl.textContent = '☁️ Cloud sync: add Supabase keys in supabase-config.js';
      if (panel) buildSyncPanel();
      return;
    }

    if (window.KiddyCloud && !window.KiddyCloud.isLibraryLoaded()) {
      statusEl.textContent = '☁️ Cloud library blocked — refresh or check connection';
      if (panel) buildSyncPanel();
      return;
    }

    if (state.signedIn) {
      statusEl.textContent = '☁️ Synced as ' + state.displayName +
        (state.isAnonymous ? ' (guest)' : '');
    } else {
      statusEl.textContent = '☁️ Sign in to sync across devices';
    }
    if (panel) buildSyncPanel();
  }

  function buildSyncPanel() {
    var el = document.getElementById('panel-sync');
    if (!el) return;

    if (!cloudEnabled()) {
      el.innerHTML =
        '<h6 class="ss-panel-title">☁️ Cloud Sync</h6>' +
        '<p class="ss-empty-msg small">Supabase is not configured. The app works offline with saved programs on this device.</p>' +
        '<p class="small text-muted">See <code>docs/BACKEND.md</code> for setup.</p>';
      return;
    }

    if (window.KiddyCloud && !window.KiddyCloud.isLibraryLoaded()) {
      el.innerHTML =
        '<h6 class="ss-panel-title">☁️ Cloud Sync</h6>' +
        '<p class="ss-empty-msg small">The Supabase library did not load (CDN blocked or offline).</p>' +
        '<p class="small text-muted">Refresh the page or try another network. Coding still works offline on this device.</p>';
      return;
    }

    var html = '<h6 class="ss-panel-title">☁️ Cloud Sync</h6>';
    html += '<p class="small text-muted mb-2">Save programs and mission progress across phones and computers. We only store a nickname and your code — no phone number.</p>';

    if (state.signedIn) {
      html += '<div class="alert alert-success py-2 small mb-2">Signed in as <strong>' + esc(state.displayName) + '</strong></div>';
      html += '<label class="form-label small fw-semibold">Your nickname</label>';
      html += '<input type="text" class="form-control form-control-sm mb-2" id="kf-sync-display-name" maxlength="32" value="' + esc(state.displayName) + '"/>';
      html += '<button type="button" class="btn btn-sm btn-outline-primary w-100 mb-2" id="kf-btn-save-nickname">Save nickname</button>';
      html += '<label class="form-label small fw-semibold">Class code (from teacher)</label>';
      html += '<div class="input-group input-group-sm mb-2">';
      html += '<input type="text" class="form-control" id="kf-sync-class-code" placeholder="e.g. SUNNY-42" maxlength="24"/>';
      html += '<button type="button" class="btn btn-outline-secondary" id="kf-btn-join-class">Join</button>';
      html += '</div>';
      html += '<button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-2" id="kf-btn-sync-now">↻ Sync now</button>';
      html += '<button type="button" class="btn btn-sm btn-outline-danger w-100 mb-2" id="kf-btn-sign-out">Sign out</button>';
      html += '<button type="button" class="btn btn-sm btn-outline-danger w-100" id="kf-btn-sign-out-clear">Sign out and clear this device</button>';
      html += '<p class="small text-muted mt-2 mb-0">On a shared computer, clear this device so the next child does not see these programs.</p>';
      if (state.isAnonymous) {
        html += '<hr class="my-3"/><p class="small fw-semibold">Parent: link email (optional)</p>';
        html += '<input type="email" class="form-control form-control-sm mb-2" id="kf-sync-parent-email" placeholder="parent@email.com"/>';
        html += '<button type="button" class="btn btn-sm btn-primary w-100" id="kf-btn-parent-email">Send magic link</button>';
      }
    } else {
      html += '<label class="form-label small fw-semibold">Pick a nickname</label>';
      html += '<input type="text" class="form-control form-control-sm mb-2" id="kf-sync-display-name" maxlength="32" placeholder="e.g. Rafi" value="Kiddy Coder"/>';
      html += '<button type="button" class="btn btn-sm btn-success w-100 mb-2" id="kf-btn-sign-in-anon">Start syncing (one tap)</button>';
      html += '<hr class="my-2"/><p class="small fw-semibold mb-1">Parent sign-in</p>';
      html += '<input type="email" class="form-control form-control-sm mb-2" id="kf-sync-parent-email" placeholder="parent@email.com"/>';
      html += '<button type="button" class="btn btn-sm btn-outline-primary w-100" id="kf-btn-parent-email">Email magic link</button>';
    }

    el.innerHTML = html;
    bindSyncPanel();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function bindSyncPanel() {
    var anonBtn = document.getElementById('kf-btn-sign-in-anon');
    var signOutBtn = document.getElementById('kf-btn-sign-out');
    var syncBtn = document.getElementById('kf-btn-sync-now');
    var nickBtn = document.getElementById('kf-btn-save-nickname');
    var joinBtn = document.getElementById('kf-btn-join-class');
    var emailBtn = document.getElementById('kf-btn-parent-email');

    if (anonBtn) {
      anonBtn.addEventListener('click', function () {
        var nameInput = document.getElementById('kf-sync-display-name');
        var name = (nameInput && nameInput.value.trim()) || 'Kiddy Coder';
        signInAnonymous(name);
      });
    }
    if (signOutBtn) signOutBtn.addEventListener('click', function () { signOut(false); });
    var clearBtn = document.getElementById('kf-btn-sign-out-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () { signOut(true); });
    if (syncBtn) syncBtn.addEventListener('click', runFullSync);
    if (nickBtn) nickBtn.addEventListener('click', saveNickname);
    if (joinBtn) joinBtn.addEventListener('click', joinClassFromInput);
    if (emailBtn) emailBtn.addEventListener('click', signInWithEmail);
  }

  function toast(msg) {
    if (window.UI && window.UI.showToast) window.UI.showToast(msg);
    else if (window.UI && window.UI.showAlert) window.UI.showAlert(msg);
  }

  async function signInAnonymous(displayName) {
    var client = sb();
    if (!client) {
      toast('Cloud not configured');
      return;
    }
    try {
      var res = await client.auth.signInAnonymously({
        options: { data: { display_name: displayName } },
      });
      if (res.error) throw res.error;
      await updateProfileFields({ display_name: displayName });
      await afterSignIn(res.data.session);
      toast('☁️ You are synced!');
    } catch (e) {
      console.warn(e);
      toast('Could not sign in. Enable Anonymous auth in Supabase.');
    }
  }

  async function signInWithEmail() {
    var client = sb();
    var input = document.getElementById('kf-sync-parent-email');
    var email = input && input.value.trim();
    if (!client || !email) {
      toast('Enter a valid email');
      return;
    }
    try {
      var res = await client.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (res.error) throw res.error;
      toast('📧 Check email for the sign-in link');
    } catch (e) {
      console.warn(e);
      toast('Could not send email link');
    }
  }

  function readOwner() {
    try { return localStorage.getItem(OWNER_KEY) || ''; } catch (e) { return ''; }
  }

  function writeOwner(id) {
    try {
      if (id) localStorage.setItem(OWNER_KEY, id);
      else localStorage.removeItem(OWNER_KEY);
    } catch (e) { /* ignore */ }
  }

  function clearEditor() {
    var ed = document.getElementById('ss-editor');
    if (ed) ed.value = '';
    if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
  }

  function refreshLearningUi() {
    if (window.UI) {
      if (UI.buildSavedPanel) UI.buildSavedPanel();
      if (UI.buildMissionsPanel) UI.buildMissionsPanel();
      if (UI.updateProgress) UI.updateProgress();
    }
    if (window.KiddyCurriculum && KiddyCurriculum.buildPanel) KiddyCurriculum.buildPanel();
    if (window.KiddyGamification && KiddyGamification.updateHud) KiddyGamification.updateHud();
  }

  async function signOut(clearDevice) {
    if (window.KiddySync && KiddySync.clearPending) KiddySync.clearPending();
    if (clearDevice && window.SpeakStorage && SpeakStorage.resetAll) {
      SpeakStorage.resetAll();
      clearEditor();
      writeOwner('');
      refreshLearningUi();
    }
    var client = sb();
    if (client) await client.auth.signOut();
    applyState(null, null);
    toast(clearDevice
      ? 'Signed out and cleared this device'
      : 'Signed out — programs stay on this device and are not uploaded to the next account');
  }

  async function saveNickname() {
    var input = document.getElementById('kf-sync-display-name');
    var name = input && input.value.trim();
    if (!name) return;
    await updateProfileFields({ display_name: name });
    state.displayName = name;
    refreshSyncStatus();
    toast('Nickname saved');
  }

  async function joinClassFromInput() {
    var input = document.getElementById('kf-sync-class-code');
    var code = input && input.value.trim();
    if (!code) {
      toast('Enter a class code');
      return;
    }
    try {
      await window.KiddySync.joinClass(code);
      toast('Joined class ' + code.toUpperCase());
    } catch (e) {
      toast('Class code not found');
    }
  }

  async function runFullSync() {
    if (!window.KiddySync) return;
    await window.KiddySync.pushAllLocal();
    var result = await window.KiddySync.pullFromCloud();
    if (result.merged && window.UI) {
      window.UI.buildSavedPanel();
      window.UI.buildMissionsPanel();
      window.UI.updateProgress();
    }
    toast('☁️ Sync complete');
  }

  async function afterSignIn(session) {
    if (!session || !session.user) return;
    if (signInFlight && signInFlightUid === session.user.id) return signInFlight;
    signInFlightUid = session.user.id;
    signInFlight = applySignedInSession(session).finally(function () {
      signInFlight = null;
    });
    return signInFlight;
  }

  async function applySignedInSession(session) {
    var uid = session.user.id;
    var owner = readOwner();
    var switched = !!(owner && owner !== uid);
    if (switched) {
      if (window.KiddySync && KiddySync.clearPending) KiddySync.clearPending();
      if (window.SpeakStorage && SpeakStorage.resetAll) SpeakStorage.resetAll();
      clearEditor();
      toast('This device had another account. Those programs were not uploaded.');
    }
    var profile = await loadProfile(uid);
    applyState(session, profile);
    if (window.KiddySync) {
      if (!switched) await window.KiddySync.pushAllLocal();
      var result = await window.KiddySync.pullFromCloud();
      if ((result && result.merged) || switched) refreshLearningUi();
    }
    writeOwner(uid);
  }

  function openSyncPanel() {
    if (window.UI && window.UI.showPanel) {
      window.UI.showPanel('sync');
    }
    var menu = document.getElementById('leftMenu');
    if (menu && window.bootstrap && bootstrap.Offcanvas) {
      bootstrap.Offcanvas.getOrCreateInstance(menu).show();
    }
    buildSyncPanel();
  }

  async function init() {
    try {
      if (!cloudEnabled()) {
        refreshSyncStatus();
        return;
      }
      await window.KiddyCloud.init();
      var client = sb();
      if (!client) {
        refreshSyncStatus();
        return;
      }

      var sessionRes = await client.auth.getSession();
      if (sessionRes.data.session) {
        await afterSignIn(sessionRes.data.session);
      } else {
        applyState(null, null);
      }

      client.auth.onAuthStateChange(async function (event, session) {
        if (event === 'SIGNED_IN' && session) {
          await afterSignIn(session);
        } else if (event === 'SIGNED_OUT') {
          applyState(null, null);
        }
      });
    } catch (e) {
      console.warn('[KiddyAuth] init failed', e);
      refreshSyncStatus();
    }
  }

  window.KiddyAuth = {
    init: init,
    refreshSyncStatus: refreshSyncStatus,
    buildSyncPanel: buildSyncPanel,
    openSyncPanel: openSyncPanel,
    isSignedIn: function () { return state.signedIn; },
    cloudEnabled: cloudEnabled,
  };

  document.addEventListener('DOMContentLoaded', function () {
    init();
  });
})();
