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

  function normalizeShareId(data) {
    if (data == null || data === '') return null;
    if (typeof data === 'string') {
      var s = data.trim().replace(/^"|"$/g, '');
      return parseShareId(s) || null;
    }
    if (Array.isArray(data)) {
      if (!data.length) return null;
      return normalizeShareId(data[0]);
    }
    if (typeof data === 'object') {
      if (data.share_id) return normalizeShareId(data.share_id);
    }
    return null;
  }

  function friendlyRpcError(err) {
    var msg = (err && (err.message || err.details || err.hint)) || 'Publish failed';
    if (/function.*does not exist/i.test(msg) || err.code === 'PGRST202' || err.code === '42883') {
      return 'Publish is not set up in Supabase yet. Run migrations/003_published_programs.sql (and 004) in SQL Editor, wait one minute, then try again.';
    }
    return String(msg);
  }

  function getCloud() {
    return window.KiddyCloud && window.KiddyCloud.isConfigured() ? window.KiddyCloud : null;
  }

  async function getClient() {
    var cloud = getCloud();
    if (!cloud) return null;
    if (!cloud.isLibraryLoaded || !cloud.isLibraryLoaded()) {
      console.warn('[KiddyPublish] Supabase JS library not loaded');
      return null;
    }
    await cloud.init();
    return cloud.getClient();
  }

  async function publishViaRpc(client, code, title) {
    var res = await client.rpc('publish_program', {
      p_code: code,
      p_title: title || null,
    });
    if (res.error) {
      throw new Error(friendlyRpcError(res.error));
    }
    return normalizeShareId(res.data);
  }

  async function publishViaInsert(client, code, title) {
    var vTitle = (title && String(title).trim()) || 'Shared Program';
    if (vTitle.length > 120) vTitle = vTitle.slice(0, 120);

    for (var attempt = 0; attempt < 8; attempt++) {
      var shareId = randomShareId();
      var res = await client.from('published_programs').insert({
        share_id: shareId,
        code: code,
        title: vTitle,
      }).select('share_id').single();

      if (!res.error && res.data) {
        return normalizeShareId(res.data.share_id) || shareId;
      }
      if (res.error && res.error.code === '23505') continue;
      if (res.error) {
        throw new Error(res.error.message || 'Insert failed');
      }
    }
    throw new Error('Could not generate a unique share id');
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

    publish: function (code, title) {
      var self = this;
      code = (code || '').trim();
      if (!code) {
        return Promise.resolve({ ok: false, error: 'Write some code first!' });
      }

      return (async function () {
        var client = await getClient();
        if (client) {
          var shareId = null;
          try {
            shareId = await publishViaRpc(client, code, title);
          } catch (rpcErr) {
            var msg = rpcErr.message || '';
            if (/does not exist|PGRST202|42883|not set up/i.test(msg)) {
              try {
                shareId = await publishViaInsert(client, code, title);
              } catch (insErr) {
                return { ok: false, error: insErr.message || msg };
              }
            } else {
              return { ok: false, error: msg };
            }
          }

          if (!shareId) {
            try {
              shareId = await publishViaInsert(client, code, title);
            } catch (e2) {
              return {
                ok: false,
                error: 'Could not get a share link. Run migration 003 (and 004) in Supabase SQL Editor.',
              };
            }
          }

          var url = self.getShareUrl(shareId, true);
          return { ok: true, shareId: shareId, url: url, mode: 'cloud' };
        }

        if (code.length > MAX_URL_CODE) {
          return {
            ok: false,
            error: 'Cloud is not configured and code is too long for a link. Set up Supabase or shorten your program.',
          };
        }

        var link = self.getUrlFallbackLink(code, true);
        if (!link) {
          return { ok: false, error: 'Could not encode program for sharing' };
        }
        return { ok: true, shareId: null, url: link, mode: 'url' };
      })();
    },

    loadFromShareId: function (shareId) {
      var self = this;
      shareId = parseShareId(shareId);
      if (!shareId) {
        return Promise.resolve({ ok: false, error: 'Invalid share link' });
      }

      return (async function () {
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
            var tbl = await client.from('published_programs')
              .select('code, title')
              .eq('share_id', shareId)
              .maybeSingle();
            if (tbl.error || !tbl.data) {
              return { ok: false, error: 'Shared program not found' };
            }
            row = tbl.data;
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
      })();
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
        return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
          return false;
        });
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
