/**
 * KiddyFun Gallery — browse & remix published programs (Phase E1)
 */
(function () {
  'use strict';

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return iso.slice(0, 10);
    }
  }

  function buildGalleryPanel() {
    var el = document.getElementById('panel-gallery');
    if (!el) return;

    el.innerHTML =
      '<h6 class="ss-panel-title">🌐 Community Gallery</h6>' +
      '<p class="small text-muted mb-2">Open or <strong>remix</strong> programs others published (needs Supabase).</p>' +
      '<div class="kf-gallery-list" id="kf-gallery-list">' +
      '<p class="ss-empty-msg small">Loading gallery…</p></div>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary w-100 mt-2" id="kf-gallery-refresh">↻ Refresh</button>';

    var refreshBtn = document.getElementById('kf-gallery-refresh');
    if (refreshBtn && !refreshBtn._bound) {
      refreshBtn._bound = true;
      refreshBtn.addEventListener('click', function () {
        loadGallery(true);
      });
    }

    if (!el._galleryClickBound) {
      el._galleryClickBound = true;
      el.addEventListener('click', function (e) {
        var openBtn = e.target.closest('[data-gallery-open]');
        if (openBtn) {
          openProgram(openBtn.getAttribute('data-gallery-open'), false);
          return;
        }
        var remixBtn = e.target.closest('[data-gallery-remix]');
        if (remixBtn) {
          openProgram(remixBtn.getAttribute('data-gallery-remix'), true);
        }
      });
    }

    loadGallery(false);
  }

  function setListHtml(html) {
    var list = document.getElementById('kf-gallery-list');
    if (list) list.innerHTML = html;
  }

  function loadGallery(showToastOnRefresh) {
    if (!window.KiddyPublish || !KiddyPublish.listRecentPrograms) {
      setListHtml('<p class="ss-empty-msg">Publish module not loaded.</p>');
      return;
    }
    if (!KiddyPublish.isCloudAvailable || !KiddyPublish.isCloudAvailable()) {
      setListHtml(
        '<p class="ss-empty-msg">Gallery needs Supabase.<br>Configure <code>supabase-config.js</code> and run migration 003.</p>'
      );
      return;
    }

    setListHtml('<p class="ss-empty-msg small">Loading…</p>');

    KiddyPublish.listRecentPrograms(24).then(function (res) {
      if (!res.ok) {
        setListHtml('<p class="ss-empty-msg text-danger">' + escHtml(res.error || 'Could not load gallery') + '</p>');
        return;
      }
      var items = res.items || [];
      if (!items.length) {
        setListHtml(
          '<p class="ss-empty-msg">No published programs yet.<br>Be the first — use <strong>Publish</strong>!</p>'
        );
        return;
      }
      var html = '';
      items.forEach(function (row) {
        var sid = row.share_id;
        var title = row.title || 'Shared Program';
        html += '<div class="kf-gallery-card">';
        html += '<div class="kf-gallery-card-title">' + escHtml(title) + '</div>';
        html += '<div class="kf-gallery-card-meta">' + escHtml(formatDate(row.created_at)) + '</div>';
        html += '<div class="kf-gallery-card-actions">';
        html += '<button type="button" class="ss-btn-mini" data-gallery-open="' + escHtml(sid) + '">Open</button>';
        html += '<button type="button" class="ss-btn-mini kf-gallery-remix-btn" data-gallery-remix="' + escHtml(sid) + '">✨ Remix</button>';
        html += '</div></div>';
      });
      setListHtml(html);
      if (showToastOnRefresh && window.UI && UI.showToast) {
        UI.showToast('🌐 Gallery updated');
      }
    });
  }

  function openProgram(shareId, asRemix) {
    if (!shareId || !window.KiddyPublish) return;
    if (window.UI && UI.showToast) {
      UI.showToast(asRemix ? '✨ Loading remix…' : '🔗 Opening program…');
    }
    KiddyPublish.loadFromShareId(shareId).then(function (res) {
      if (!res.ok) {
        if (window.UI && UI.showAlert) {
          UI.showAlert(res.error || 'Not found', { title: 'Gallery', icon: '⚠️' });
        }
        return;
      }
      if (window.UI && UI.loadSharedCode) {
        UI.loadSharedCode(res.code, res.title, !asRemix, {
          remix: asRemix,
          shareId: shareId,
        });
        if (window.UI.closeLeftMenu) UI.closeLeftMenu();
      }
    });
  }

  window.KiddyGallery = {
    buildPanel: buildGalleryPanel,
    refresh: function () { loadGallery(true); },
  };
})();
