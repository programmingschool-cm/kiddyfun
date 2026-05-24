/**
 * Supabase project credentials (browser-safe key only).
 * Get values: Dashboard → Connect, OR Project Settings → API Keys.
 * Use Publishable (sb_publishable_...) OR legacy anon (eyJ...) — NOT secret/service_role.
 * Leave url/anonKey empty to run offline with localStorage only.
 */
(function () {
  'use strict';

  var base = {
    url: 'https://rajrmkalqxhalvtsejpo.supabase.co',
    anonKey: 'sb_publishable_z96Ll0SgqjKN0aCtCVOX5Q_CJI3zGeK',
  };

  if (window.KiddySupabaseConfigLocal) {
    if (window.KiddySupabaseConfigLocal.url) base.url = window.KiddySupabaseConfigLocal.url;
    if (window.KiddySupabaseConfigLocal.anonKey) base.anonKey = window.KiddySupabaseConfigLocal.anonKey;
  }

  window.KiddySupabaseConfig = base;
})();
