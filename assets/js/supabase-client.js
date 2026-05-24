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

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      console.warn('[KiddyCloud] Supabase JS library not loaded');
      return null;
    }
    client = supabase.createClient(cfg().url, cfg().anonKey);
    return client;
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
    getClient: getClient,
    init: init,
  };
})();
