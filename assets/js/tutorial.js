/**
 * KiddyFun — in-app language tutorial (loads docs/TUTORIAL.md)
 */
(function () {
  'use strict';

  var TUTORIAL_PATH = 'docs/TUTORIAL.md';
  var _loaded = false;

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return text
      .replace(/^\d+\.\s*/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** Lightweight Markdown → HTML for TUTORIAL.md */
  function mdToHtml(md) {
    var lines = md.replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var i = 0;
    var inCode = false;
    var codeBuf = [];
    var listType = null;

    function flushList() {
      if (listType) {
        html.push(listType === 'ol' ? '</ol>' : '</ul>');
        listType = null;
      }
    }

    function inline(s) {
      s = escHtml(s);
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return s;
    }

    while (i < lines.length) {
      var line = lines[i];

      if (line.indexOf('```') === 0) {
        flushList();
        if (!inCode) {
          inCode = true;
          codeBuf = [];
        } else {
          html.push('<pre class="ss-tutorial-pre"><code>' + escHtml(codeBuf.join('\n')) + '</code></pre>');
          inCode = false;
        }
        i++;
        continue;
      }

      if (inCode) {
        codeBuf.push(line);
        i++;
        continue;
      }

      if (/^---+$/.test(line.trim())) {
        flushList();
        html.push('<hr class="ss-tutorial-hr"/>');
        i++;
        continue;
      }

      var h4 = line.match(/^#### (.+)$/);
      var h3 = line.match(/^### (.+)$/);
      var h2 = line.match(/^## (.+)$/);
      var h1 = line.match(/^# (.+)$/);

      if (h4 || h3 || h2 || h1) {
        flushList();
        var text = (h4 || h3 || h2 || h1)[1];
        var level = h4 ? 4 : h3 ? 3 : h2 ? 2 : 1;
        var id = slugify(text);
        html.push('<h' + level + ' id="tut-' + id + '" class="ss-tutorial-h' + level + '">' + inline(text) + '</h' + level + '>');
        i++;
        continue;
      }

      if (/^\|.+\|$/.test(line.trim()) && i + 1 < lines.length && /^\|[-\s|:]+\|$/.test(lines[i + 1].trim())) {
        flushList();
        var headerCells = line.trim().slice(1, -1).split('|').map(function (c) { return c.trim(); });
        i += 2;
        html.push('<div class="ss-tutorial-table-wrap"><table class="ss-tutorial-table"><thead><tr>');
        headerCells.forEach(function (c) {
          html.push('<th>' + inline(c) + '</th>');
        });
        html.push('</tr></thead><tbody>');
        while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
          var cells = lines[i].trim().slice(1, -1).split('|').map(function (c) { return c.trim(); });
          html.push('<tr>');
          cells.forEach(function (c) {
            html.push('<td>' + inline(c) + '</td>');
          });
          html.push('</tr>');
          i++;
        }
        html.push('</tbody></table></div>');
        continue;
      }

      var bq = line.match(/^> (.+)$/);
      if (bq) {
        flushList();
        html.push('<blockquote class="ss-tutorial-quote">' + inline(bq[1]) + '</blockquote>');
        i++;
        continue;
      }

      var ul = line.match(/^[-*] (.+)$/);
      var ol = line.match(/^\d+\. (.+)$/);
      if (ul) {
        if (listType !== 'ul') {
          flushList();
          html.push('<ul class="ss-tutorial-ul">');
          listType = 'ul';
        }
        html.push('<li>' + inline(ul[1]) + '</li>');
        i++;
        continue;
      }
      if (ol) {
        if (listType !== 'ol') {
          flushList();
          html.push('<ol class="ss-tutorial-ol">');
          listType = 'ol';
        }
        html.push('<li>' + inline(ol[1]) + '</li>');
        i++;
        continue;
      }

      if (line.trim() === '') {
        flushList();
        i++;
        continue;
      }

      flushList();
      html.push('<p class="ss-tutorial-p">' + inline(line) + '</p>');
      i++;
    }

    flushList();
    if (inCode && codeBuf.length) {
      html.push('<pre class="ss-tutorial-pre"><code>' + escHtml(codeBuf.join('\n')) + '</code></pre>');
    }

    return html.join('\n');
  }

  function buildToc(md) {
    var toc = [];
    var re = /^## (.+)$/gm;
    var m;
    while ((m = re.exec(md)) !== null) {
      var title = m[1].replace(/\s*\{#.+\}\s*$/, '').trim();
      if (title.indexOf('Table of contents') === 0) continue;
      toc.push({ title: title, id: 'tut-' + slugify(title) });
    }
    return toc;
  }

  function renderPanel(md) {
    var el = document.getElementById('panel-tutorial');
    if (!el) return;

    var toc = buildToc(md);
    var bodyHtml = mdToHtml(md);

    var jumpHtml = '<label class="ss-tutorial-jump-wrap">';
    jumpHtml += '<span class="ss-tutorial-jump-label">Contents</span>';
    jumpHtml += '<select class="ss-tutorial-jump" aria-label="Tutorial sections">';
    jumpHtml += '<option value="">Jump to a section</option>';
    toc.forEach(function (item) {
      jumpHtml += '<option value="' + escHtml(item.id) + '">' + escHtml(item.title) + '</option>';
    });
    jumpHtml += '</select></label>';

    el.innerHTML =
      '<div class="ss-tutorial-header">' +
        '<h6 class="ss-panel-title mb-1">Language Tutorial</h6>' +
        '<p class="ss-tutorial-sub small text-muted mb-0">Syntax, keywords, and rules (v2.2)</p>' +
        jumpHtml +
      '</div>' +
      '<div class="ss-tutorial-layout">' +
        '<div class="ss-tutorial-article" id="ss-tutorial-article">' + bodyHtml + '</div>' +
      '</div>';

    var jump = el.querySelector('.ss-tutorial-jump');
    if (jump) {
      jump.addEventListener('change', function () {
        var id = jump.value;
        var target = id ? document.getElementById(id) : null;
        var article = document.getElementById('ss-tutorial-article');
        var drawer = document.getElementById('leftMenu');
        if (!target) return;
        if (article && article.scrollHeight > article.clientHeight + 24) {
          article.scrollTo({ top: target.offsetTop - 8, behavior: 'smooth' });
          return;
        }
        if (drawer) {
          var top = target.getBoundingClientRect().top - drawer.getBoundingClientRect().top + drawer.scrollTop - 72;
          drawer.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      });
    }

    _loaded = true;
  }

  function showError(msg) {
    var el = document.getElementById('panel-tutorial');
    if (!el) return;
    el.innerHTML =
      '<h6 class="ss-panel-title">📘 Language Tutorial</h6>' +
      '<p class="text-danger small">' + escHtml(msg) + '</p>' +
      '<p class="small text-muted">Try opening the site via <strong>GitHub Pages</strong> or <code>python -m http.server</code>, then reload.</p>' +
      '<a class="btn btn-sm btn-outline-primary" href="docs/TUTORIAL.md" target="_blank" rel="noopener">Open TUTORIAL.md file</a>';
  }

  function resolveTutorialUrl() {
    var base = document.querySelector('base');
    if (base && base.href) {
      try {
        return new URL(TUTORIAL_PATH, base.href).href;
      } catch (e) { /* fall through */ }
    }
    return TUTORIAL_PATH;
  }

  function loadFromEmbedded() {
    if (window.KIDDY_TUTORIAL_MD) {
      renderPanel(window.KIDDY_TUTORIAL_MD);
      return true;
    }
    return false;
  }

  function loadTutorial(force) {
    if (_loaded && !force) return Promise.resolve();

    if (window.location.protocol === 'file:') {
      if (loadFromEmbedded()) return Promise.resolve();
      showError('Open via http:// or use GitHub Pages for the full tutorial.');
      return Promise.resolve();
    }

    return fetch(resolveTutorialUrl(), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load tutorial (' + res.status + ')');
        return res.text();
      })
      .then(function (md) {
        renderPanel(md);
      })
      .catch(function (err) {
        console.warn('[KiddyFun] Tutorial fetch failed, using embedded copy:', err);
        if (!loadFromEmbedded()) {
          showError(err.message || 'Tutorial not available.');
        }
      });
  }

  function buildPanel() {
    var el = document.getElementById('panel-tutorial');
    if (!el) return;
    if (!_loaded) {
      el.innerHTML =
        '<h6 class="ss-panel-title">📘 Language Tutorial</h6>' +
        '<p class="ss-tutorial-loading text-muted small">Loading tutorial…</p>';
      loadTutorial(false);
    }
  }

  function openInMenu() {
    if (window.UI && window.UI.showPanel) {
      window.UI.showPanel('tutorial');
    }
    buildPanel();
    var offcanvasEl = document.getElementById('leftMenu');
    if (offcanvasEl && window.bootstrap) {
      var oc = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      oc.show();
    }
  }

  window.KiddyTutorial = {
    load: loadTutorial,
    buildPanel: buildPanel,
    openInMenu: openInMenu,
    mdToHtml: mdToHtml,
  };

  console.log('[KiddyFun] Tutorial module ready');
})();
