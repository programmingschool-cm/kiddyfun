/**
 * KiddyFun — Supabase client wrapper (vanilla JS, CDN).
 */
(function () {
  'use strict';

  var client = null;
  var initPromise = null;

  function cfg() {
    return window.KiddySupabaseConfig || {};
  }

  function isConfigured() {
    var c = cfg();
    return !!(c.url && c.anonKey);
  }

  function getSupabaseGlobal() {
    if (typeof supabase !== 'undefined' && supabase.createClient) return supabase;
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      return window.supabase;
    }
    return null;
  }

  function waitForLibrary(timeoutMs) {
    timeoutMs = timeoutMs || 4000;
    return new Promise(function (resolve) {
      if (getSupabaseGlobal()) {
        resolve(true);
        return;
      }
      var elapsed = 0;
      var timer = setInterval(function () {
        if (getSupabaseGlobal()) {
          clearInterval(timer);
          resolve(true);
        } else {
          elapsed += 50;
          if (elapsed >= timeoutMs) {
            clearInterval(timer);
            resolve(false);
          }
        }
      }, 50);
    });
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    var lib = getSupabaseGlobal();
    if (!lib) {
      console.warn('[KiddyCloud] Supabase JS not loaded — check index.html UMD script');
      return null;
    }
    var c = cfg();
    try {
      client = lib.createClient(c.url, c.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.error('[KiddyCloud] createClient failed:', e);
      return null;
    }
    return client;
  }

  function isLibraryLoaded() {
    return !!getSupabaseGlobal();
  }

  function init() {
    if (!isConfigured()) {
      return Promise.resolve(null);
    }
    if (initPromise) return initPromise;
    initPromise = waitForLibrary(4000).then(function (ok) {
      if (!ok) {
        console.warn('[KiddyCloud] Supabase JS not loaded after wait');
        return null;
      }
      return getClient();
    });
    return initPromise;
  }

  window.KiddyCloud = {
    isConfigured: isConfigured,
    isLibraryLoaded: isLibraryLoaded,
    getClient: getClient,
    init: init,
  };
})();
