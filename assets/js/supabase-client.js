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

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    var lib = getSupabaseGlobal();
    if (!lib) {
      console.warn('[KiddyCloud] Supabase JS not loaded — check index.html UMD script');
      return null;
    }
    client = lib.createClient(cfg().url, cfg().anonKey);
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
    initPromise = Promise.resolve(getClient());
    return initPromise;
  }

  window.KiddyCloud = {
    isConfigured: isConfigured,
    isLibraryLoaded: isLibraryLoaded,
    getClient: getClient,
    init: init,
  };
})();
