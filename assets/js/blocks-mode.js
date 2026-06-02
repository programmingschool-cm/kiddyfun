/**
 * Phase B3 — Visual blocks palette (click to insert KiddyFun text)
 */
(function () {
  'use strict';

  var KEY_VIEW = 'kf_editor_view';
  var BLOCKS = [
    { cat: 'Story', items: [
      { label: '🎬 Scene', code: 'scene "school"\n' },
      { label: '✨ Appears', code: 'Rafi appears\n' },
      { label: '💬 Says', code: 'Rafi says "Hello!"\n' },
      { label: '📖 Narrator', code: 'narrator says "Once upon a time..."\n' },
      { label: '👋 Wave', code: 'Rafi waves\n' },
      { label: '⏸️ Wait', code: 'wait 1 second\n' },
    ]},
    { cat: 'Logic', items: [
      { label: '🔁 Repeat', code: 'repeat 3 times\n    \nend\n' },
      { label: '🧠 If', code: 'if score is greater than 10\n    narrator says "High!"\nend\n' },
      { label: '❓ Quiz', code: 'ask "2 + 2?"\nchoice "4" correct\nchoice "5" wrong\n' },
      { label: '📦 Set', code: 'set name to "Rafi"\n' },
    ]},
    { cat: 'Game', items: [
      { label: '🎮 Game', code: 'game "My Game"\ngame view top\n' },
      { label: '👤 Player', code: 'Rafi is player\n' },
      { label: '🔄 Every frame', code: 'every frame\n    \nend\n' },
      { label: '🪙 Spawn coin', code: 'spawn coin at x 200 y 150\n' },
      { label: '🧱 Wall', code: 'add wall at x 200 y 250 width 80 height 40\n' },
    ]},
  ];

  function getView() {
    try { return localStorage.getItem(KEY_VIEW) || 'text'; } catch (e) { return 'text'; }
  }

  function setView(v) {
    try { localStorage.setItem(KEY_VIEW, v); } catch (e) { /* ignore */ }
    applyView(v);
  }

  function applyView(v) {
    var wrap = document.getElementById('kf-blocks-wrap');
    var stack = document.getElementById('kf-editor-stack');
    var btnT = document.getElementById('btn-view-text');
    var btnB = document.getElementById('btn-view-blocks');
    if (wrap) wrap.classList.toggle('d-none', v !== 'blocks');
    if (stack) stack.classList.toggle('d-none', v === 'blocks');
    if (btnT) btnT.classList.toggle('active', v === 'text');
    if (btnB) btnB.classList.toggle('active', v === 'blocks');
  }

  function buildPalette() {
    var wrap = document.getElementById('kf-blocks-wrap');
    if (!wrap) return;
    var html = '<div class="kf-blocks-palette">';
    BLOCKS.forEach(function (cat) {
      html += '<div class="kf-blocks-cat"><div class="kf-blocks-cat-title">' + cat.cat + '</div><div class="kf-blocks-row">';
      cat.items.forEach(function (b) {
        html += '<button type="button" class="kf-block-chip" data-code="' + encodeURIComponent(b.code) + '">' + b.label + '</button>';
      });
      html += '</div></div>';
    });
    html += '<p class="small text-muted mt-2 mb-0">Blocks insert text code. Switch to <strong>Text</strong> to edit freely.</p></div>';
    wrap.innerHTML = html;
    wrap.querySelectorAll('.kf-block-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = decodeURIComponent(btn.getAttribute('data-code') || '');
        if (window.KiddySmartEditor && KiddySmartEditor.insertAtCursor) {
          KiddySmartEditor.insertAtCursor(code);
        } else {
          var ed = document.getElementById('ss-editor');
          if (ed) ed.value += code;
        }
        if (window.SpeakStorage) SpeakStorage.saveLastCode(document.getElementById('ss-editor').value);
      });
    });
  }

  function exportToText() {
    setView('text');
    if (window.UI && UI.showToast) UI.showToast('✏️ Text mode — your code is in the editor');
  }

  function init() {
    buildPalette();
    applyView(getView());
    var btnT = document.getElementById('btn-view-text');
    var btnB = document.getElementById('btn-view-blocks');
    if (btnT) btnT.addEventListener('click', function () { setView('text'); });
    if (btnB) btnB.addEventListener('click', function () { setView('blocks'); });
  }

  window.KiddyBlocksMode = { init: init, exportToText: exportToText, getView: getView, BLOCKS: BLOCKS };
})();
