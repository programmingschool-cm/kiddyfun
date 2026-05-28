/**
 * KiddyFun Publish — share code via unique link (?p=shareId)
 * Cloud: Supabase published_programs. Offline fallback: ?z= compressed URL.
 */
(function () {
  'use strict';

  var SHARE_PARAM = 'p';
  var URL_PARAM = 'z';
  var MAX_URL_CODE = 6000;

  function baseUrl() {
    var loc = window.location;
    return loc.origin + loc.pathname;
  }

  function randomShareId() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var out = '';
    for (var i = 0; i < 10; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function encodeForUrl(code) {
    try {
      return btoa(unescape(encodeURIComponent(code)));
    } catch (e) {
      return null;
    }
  }

  function decodeFromUrl(encoded) {
    try {
      return decodeURIComponent(escape(atob(encoded)));
    } catch (e) {
      return null;
    }
  }

  function parseShareId(raw) {
    if (!raw) return null;
    var id = String(raw).trim().toLowerCase();
    if (!/^[a-z0-9]{8,12}$/.test(id)) return null;
    return id;
  }

  function getCloud() {
    return window.KiddyCloud && window.KiddyCloud.isConfigured() ? window.KiddyCloud : null;
  }

  async function getClient() {
    var cloud = getCloud();
    if (!cloud) return null;
    await cloud.init();
    return cloud.getClient();
  }

  var Publish = {
    getShareUrl: function (shareId, autoRun) {
      var url = baseUrl() + '?' + SHARE_PARAM + '=' + encodeURIComponent(shareId);
      if (autoRun) url += '&run=1';
      return url;
    },

    getUrlFallbackLink: function (code, autoRun) {
      var enc = encodeForUrl(code);
      if (!enc || enc.length > 12000) return null;
      var url = baseUrl() + '?' + URL_PARAM + '=' + encodeURIComponent(enc);
      if (autoRun) url += '&run=1';
      return url;
    },

    isCloudAvailable: function () {
      return !!getCloud();
    },

    publish: async function (code, title) {
      code = (code || '').trim();
      if (!code) {
        return { ok: false, error: 'Write some code first!' };
      }

      var client = await getClient();
      if (client) {
        try {
          var res = await client.rpc('publish_program', {
            p_code: code,
            p_title: title || null,
          });
          if (res.error) {
            return { ok: false, error: res.error.message || 'Publish failed' };
          }
          var shareId = res.data;
          if (!shareId) {
            return { ok: false, error: 'No share id returned' };
          }
          return {
            ok: true,
            shareId: shareId,
            url: this.getShareUrl(shareId, true),
            mode: 'cloud',
          };
        } catch (e) {
          return { ok: false, error: e.message || String(e) };
        }
      }

      if (code.length > MAX_URL_CODE) {
        return {
          ok: false,
          error: 'Cloud is not configured and code is too long for a link. Set up Supabase or shorten your program.',
        };
      }

      var link = this.getUrlFallbackLink(code, true);
      if (!link) {
        return { ok: false, error: 'Could not encode program for sharing' };
      }
      return {
        ok: true,
        shareId: null,
        url: link,
        mode: 'url',
      };
    },

    loadFromShareId: async function (shareId) {
      shareId = parseShareId(shareId);
      if (!shareId) {
        return { ok: false, error: 'Invalid share link' };
      }

      var client = await getClient();
      if (!client) {
        return { ok: false, error: 'Cloud is not configured — cannot load this link' };
      }

      try {
        var res = await client.rpc('get_published_program', { p_share_id: shareId });
        if (res.error) {
          return { ok: false, error: res.error.message || 'Load failed' };
        }
        var row = res.data;
        if (Array.isArray(row)) row = row[0];
        if (!row || !row.code) {
          return { ok: false, error: 'Shared program not found' };
        }
        return {
          ok: true,
          code: row.code,
          title: row.title || 'Shared Program',
          mode: 'cloud',
        };
      } catch (e) {
        return { ok: false, error: e.message || String(e) };
      }
    },

    loadFromUrlParam: function (encoded) {
      var code = decodeFromUrl(encoded);
      if (!code) {
        return { ok: false, error: 'Invalid or corrupted share link' };
      }
      return { ok: true, code: code, title: 'Shared Program', mode: 'url' };
    },

    getParamsFromLocation: function () {
      var params = new URLSearchParams(window.location.search);
      return {
        shareId: params.get(SHARE_PARAM),
        urlCode: params.get(URL_PARAM),
        autoRun: params.get('run') === '1' || params.has(SHARE_PARAM) || params.has(URL_PARAM),
      };
    },

    copyToClipboard: function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return true; });
      }
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      return Promise.resolve(ok);
    },
  };

  window.KiddyPublish = Publish;
})();
