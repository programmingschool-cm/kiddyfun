/**
 * KiddyFun Publish — share code via unique link (?p=shareId)
 * Cloud: Supabase published_programs. Offline fallback: ?z= compressed URL.
 */
(function () {
  'use strict';

  var SHARE_PARAM = 'p';
  var URL_PARAM = 'z';
  var MAX_URL_CODE = 6000;
  var MAX_CLOUD_CODE = 20000;
  var MY_SHARES_KEY = 'kf_my_shares';

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

  function rememberShare(shareId, title) {
    try {
      var list = JSON.parse(localStorage.getItem(MY_SHARES_KEY) || '[]');
      list = list.filter(function (row) { return row && row.shareId !== shareId; });
      list.unshift({ shareId: shareId, title: title || 'Shared Program' });
      localStorage.setItem(MY_SHARES_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) { /* ignore */ }
  }

  function isMine(shareId) {
    try {
      var list = JSON.parse(localStorage.getItem(MY_SHARES_KEY) || '[]');
      return list.some(function (row) { return row && row.shareId === shareId; });
    } catch (e) {
      return false;
    }
  }

  function forgetShare(shareId) {
    try {
      var list = JSON.parse(localStorage.getItem(MY_SHARES_KEY) || '[]');
      list = list.filter(function (row) { return row && row.shareId !== shareId; });
      localStorage.setItem(MY_SHARES_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  function friendlyRpcError(err) {
    var msg = (err && (err.message || err.details || err.hint)) || 'Publish failed';
    if (/function.*does not exist/i.test(msg) || err.code === 'PGRST202' || err.code === '42883') {
      return 'Publish is not set up in Supabase yet. Run migrations 003 through 005 in the SQL Editor, wait one minute, then try again.';
    }
    return String(msg);
  }

  function isCloudConfigured() {
    return !!(window.KiddyCloud && window.KiddyCloud.isConfigured());
  }

  async function getClient() {
    if (!isCloudConfigured()) return null;
    await window.KiddyCloud.init();
    var client = window.KiddyCloud.getClient();
    if (!client) {
      console.warn('[KiddyPublish] Supabase client is null after init');
    }
    return client;
  }

  async function publishViaRpc(client, code, title) {
    console.log('[KiddyPublish] POST rpc/publish_program');
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
    var sessionRes = await client.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (!session || !session.user) {
      throw new Error('Sign in before publishing to the gallery.');
    }
    if (code.length > MAX_CLOUD_CODE) {
      throw new Error('Code is too large (max 20000 characters)');
    }
    var vTitle = (title && String(title).trim()) || 'Shared Program';
    if (vTitle.length > 120) vTitle = vTitle.slice(0, 120);

    for (var attempt = 0; attempt < 8; attempt++) {
      var shareId = randomShareId();
      console.log('[KiddyPublish] POST published_programs insert');
      var res = await client.from('published_programs').insert({
        share_id: shareId,
        code: code,
        title: vTitle,
        author_id: session.user.id,
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
    encodeForUrl: encodeForUrl,

    getShareUrl: function (shareId) {
      return baseUrl() + '?' + SHARE_PARAM + '=' + encodeURIComponent(shareId);
    },

    getUrlFallbackLink: function (code) {
      var enc = encodeForUrl(code);
      if (!enc || enc.length > 12000) return null;
      return baseUrl() + '?' + URL_PARAM + '=' + encodeURIComponent(enc);
    },

    isCloudAvailable: function () {
      return isCloudConfigured();
    },

    publish: function (code, title) {
      var self = this;
      code = (code || '').trim();
      if (!code) {
        return Promise.resolve({ ok: false, error: 'Write some code first!' });
      }

      return (async function () {
        if (isCloudConfigured()) {
          if (code.length > MAX_CLOUD_CODE) {
            return { ok: false, error: 'Code is too large (max 20000 characters)' };
          }
          var client = await getClient();
          if (!client) {
            return {
              ok: false,
              error: 'Supabase did not start. Refresh the page, check your internet, and make sure the Supabase script loads (see browser console).',
            };
          }

          var sessionRes = await client.auth.getSession();
          if (!sessionRes.data || !sessionRes.data.session) {
            return { ok: false, error: 'Sign in (menu → Sync) before publishing to the gallery.' };
          }

          var shareId = null;
          try {
            shareId = await publishViaRpc(client, code, title);
          } catch (rpcErr) {
            var msg = rpcErr.message || '';
            console.warn('[KiddyPublish] RPC failed:', msg);
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
                error: 'Could not get a share link. Run migrations 003 through 005 in the Supabase SQL Editor.',
              };
            }
          }

          rememberShare(shareId, title);
          var url = self.getShareUrl(shareId);
          return { ok: true, shareId: shareId, url: url, mode: 'cloud' };
        }

        console.log('[KiddyPublish] No Supabase config — using URL fallback (no API call)');
        if (code.length > MAX_URL_CODE) {
          return {
            ok: false,
            error: 'Supabase is not configured and code is too long for a link. Add keys in supabase-config.js.',
          };
        }

        var link = self.getUrlFallbackLink(code);
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
      if (code.length > MAX_CLOUD_CODE) {
        return { ok: false, error: 'This share link is too large to open' };
      }
      return { ok: true, code: code, title: 'Shared Program', mode: 'url' };
    },

    getParamsFromLocation: function () {
      var params = new URLSearchParams(window.location.search);
      return {
        shareId: params.get(SHARE_PARAM),
        urlCode: params.get(URL_PARAM),
        autoRun: false,
        remix: params.get('remix') === '1',
      };
    },

    isMine: isMine,

    deletePublished: function (shareId) {
      shareId = parseShareId(shareId);
      if (!shareId) return Promise.resolve({ ok: false, error: 'Invalid share link' });
      return (async function () {
        var client = await getClient();
        if (!client) return { ok: false, error: 'Cloud is not configured' };
        var res = await client.from('published_programs').delete().eq('share_id', shareId);
        if (res.error) return { ok: false, error: res.error.message || 'Could not unpublish' };
        forgetShare(shareId);
        return { ok: true };
      })();
    },

    listRecentPrograms: function (limit) {
      limit = limit || 24;
      return (async function () {
        if (!isCloudConfigured()) {
          return { ok: false, error: 'Cloud not configured', items: [] };
        }
        var client = await getClient();
        if (!client) {
          return { ok: false, error: 'Could not connect to cloud', items: [] };
        }
        try {
          var res = await client.from('published_programs')
            .select('share_id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);
          if (res.error) {
            return { ok: false, error: res.error.message || 'Gallery load failed', items: [] };
          }
          return { ok: true, items: res.data || [] };
        } catch (e) {
          return { ok: false, error: e.message || String(e), items: [] };
        }
      })();
    },

    getRemixUrl: function (shareId) {
      return baseUrl() + '?' + SHARE_PARAM + '=' + encodeURIComponent(shareId) + '&remix=1';
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
