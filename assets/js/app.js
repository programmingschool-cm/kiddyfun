/**
 * SpeakScript Main App v0.1
 * Bootstraps all modules and wires the UI together.
 * All window.SpeakXxx refs are resolved inside DOMContentLoaded,
 * guaranteeing every other script has already run.
 */
(function () {
  'use strict';

  var interpreter = null;

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Grab module refs (all scripts already executed by now) ── */
    var Parser      = window.SpeakParser;
    var Errors      = window.SpeakErrors;
    var Runtime     = window.SpeakRuntime;
    var Storage     = window.SpeakStorage;
    var Interpreter = window.SpeakInterpreter && window.SpeakInterpreter.Interpreter;

    /* ── Sanity check ─────────────────────────────────────────── */
    if (!Parser || !Errors || !Runtime || !Storage || !Interpreter) {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:sans-serif;color:red;">' +
        '<h2>⚠️ KiddyFun Code failed to load</h2>' +
        '<p>One or more script files could not be loaded. Please check:<br>' +
        '• All files in <code>assets/js/</code> exist<br>' +
        '• You opened <code>index.html</code> directly in a browser<br>' +
        '• Check the browser console (F12) for details</p>' +
        '<pre>' +
          'Parser:      ' + (Parser      ? '✅' : '❌ MISSING') + '\n' +
          'Errors:      ' + (Errors      ? '✅' : '❌ MISSING') + '\n' +
          'Runtime:     ' + (Runtime     ? '✅' : '❌ MISSING') + '\n' +
          'Storage:     ' + (Storage     ? '✅' : '❌ MISSING') + '\n' +
          'Interpreter: ' + (Interpreter ? '✅' : '❌ MISSING') +
        '</pre></div>';
      return;
    }

    /* ── DOM helpers ──────────────────────────────────────────── */
    function $id(id) { return document.getElementById(id); }

    /* ── Init Runtime ─────────────────────────────────────────── */
    Runtime.init($id('ss-stage'), $id('ss-log'), $id('ss-vocab'), $id('ss-score'));

    /* ── Restore last code ────────────────────────────────────── */
    var last = Storage.loadLastCode();
    if (last) $id('ss-editor').value = last;

    /* ── Build panels ─────────────────────────────────────────── */
    UI.buildGuidePanel();
    UI.buildMissionsPanel();
    UI.buildSavedPanel();
    UI.showPanel('guide');

    /* ── Build example dropdown ───────────────────────────────── */
    buildExampleDropdown();

    /* ── Editor events ────────────────────────────────────────── */
    var editorEl = $id('ss-editor');
    editorEl.addEventListener('input', function () {
      Storage.saveLastCode(editorEl.value);
      UI.syncLineNumbers();
    });
    editorEl.addEventListener('scroll', function () { UI.syncLineNumbers(); });
    editorEl.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = editorEl.selectionStart, en = editorEl.selectionEnd;
        editorEl.value = editorEl.value.slice(0, s) + '    ' + editorEl.value.slice(en);
        editorEl.selectionStart = editorEl.selectionEnd = s + 4;
        UI.syncLineNumbers();
      }
    });
    UI.syncLineNumbers();

    /* ── Nav buttons ──────────────────────────────────────────── */
    document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { UI.showPanel(btn.dataset.panel); });
    });

    /* ── Toolbar buttons ──────────────────────────────────────── */
    bind('btn-run',      runProgram);
    bind('btn-stop',     stopProgram);
    bind('btn-reset',    resetStage);
    bind('btn-clear',    clearEditor);
    bind('btn-save',     function () { UI.promptSaveProgram(); });
    bind('btn-download', function () { UI.downloadProgram(); });
    bind('btn-reset-progress', resetProgress);
    bind('btn-toggle-code', toggleDesktopCodePanel);
    bind('tab-code-btn', function() { setMobileTab('code'); });
    bind('tab-output-btn', function() { setMobileTab('output'); });
    bind('hero-start-btn', function () {
      var ws = $id('workspace');
      if (ws) ws.scrollIntoView({ behavior: 'smooth' });
    });
    bind('ss-badge-overlay', function () { $id('ss-badge-overlay').classList.add('d-none'); });

    var desktopCodeVisible = true;
    function toggleDesktopCodePanel() {
      if (window.innerWidth < 992) return;
      var codeCol = $id('code-col');
      var outCol  = $id('output-col');
      var toggleBtn = $id('btn-toggle-code');
      if (desktopCodeVisible) {
        codeCol.classList.remove('d-lg-flex');
        codeCol.classList.add('d-lg-none');
        outCol.classList.replace('col-lg-7', 'col-lg-12');
        outCol.classList.replace('col-xl-6', 'col-xl-12');
        toggleBtn.innerHTML = '✏️ Edit Code';
        desktopCodeVisible = false;
      } else {
        codeCol.classList.remove('d-lg-none');
        codeCol.classList.add('d-lg-flex');
        outCol.classList.replace('col-lg-12', 'col-lg-7');
        outCol.classList.replace('col-xl-12', 'col-xl-6');
        toggleBtn.innerHTML = '🔲 Full Screen';
        desktopCodeVisible = true;
      }
    }

    function setMobileTab(tab) {
      if (window.innerWidth >= 992) return;
      var codeCol = $id('code-col');
      var outCol  = $id('output-col');
      var tabCode = $id('tab-code-btn');
      var tabOut  = $id('tab-output-btn');
      
      if (tab === 'code') {
        codeCol.classList.remove('mobile-hidden');
        outCol.classList.add('mobile-hidden');
        
        tabCode.className = 'btn btn-dark flex-fill me-1 fw-bold';
        tabOut.className  = 'btn btn-outline-dark flex-fill ms-1 fw-bold';
      } else {
        codeCol.classList.add('mobile-hidden');
        outCol.classList.remove('mobile-hidden');
        
        tabCode.className = 'btn btn-outline-dark flex-fill me-1 fw-bold';
        tabOut.className  = 'btn btn-dark flex-fill ms-1 fw-bold';
      }
    }

    console.log('✅ KiddyFun Code v0.1 ready');

    /* ── Run ──────────────────────────────────────────────────── */
    function runProgram() {
      var code = editorEl.value.trim();
      if (!code) { UI.showToast('✏️ Write some code first!'); return; }
      UI.clearErrors();
      UI.setRunning(true);

      if (window.innerWidth < 992) {
        setMobileTab('output');
      } else if (desktopCodeVisible) {
        // Desktop handles it with desktopCodeVisible if needed
      }

      var ast;
      try {
        ast = Parser.parseProgram(code);
      } catch (err) {
        UI.showErrors(Errors.renderError(Errors.friendlyError(err)));
        UI.setRunning(false);
        return;
      }

      interpreter = new Interpreter(Runtime);
      interpreter.run(ast).then(function () {
        checkMissions(code);
      }).catch(function (err) {
        UI.showErrors(Errors.renderError(Errors.friendlyError(err)));
      }).finally(function () {
        UI.setRunning(false);
        interpreter = null;
      });
    }

    function stopProgram() {
      if (interpreter) interpreter.stop();
      UI.setRunning(false);
      UI.showToast('⏹️ Stopped.');
    }

    function resetStage() {
      if (interpreter) interpreter.stop();
      interpreter = null;
      Runtime.reset();
      UI.clearErrors();
      UI.setRunning(false);
    }

    function clearEditor() {
      if (!confirm('Clear all code?')) return;
      editorEl.value = '';
      Storage.saveLastCode('');
      UI.syncLineNumbers();
      editorEl.focus();
    }

    function resetProgress() {
      if (!confirm('Reset ALL progress and saved programs?')) return;
      Storage.resetAll();
      UI.buildMissionsPanel();
      UI.buildSavedPanel();
      UI.showToast('🔄 Progress reset!');
    }

    /* ── Mission validation ───────────────────────────────────── */
    function checkMissions(code) {
      var completed = Storage.loadCompletedMissions();
      window.SpeakMissions.forEach(function (m) {
        if (completed.indexOf(m.id) === -1 && m.validate(code)) {
          Storage.completeMission(m.id);
          Storage.awardBadge(m.badge);
          UI.showBadge('🎉 Mission Complete!\n' + m.title + '\n' + m.badge);
          UI.buildMissionsPanel();
        }
      });
    }

    /* ── Example dropdown ─────────────────────────────────────── */
    function buildExampleDropdown() {
      var menu = $id('example-dropdown-menu');
      if (!menu) return;
      window.SpeakExamples.forEach(function (ex) {
        var li = document.createElement('li');
        li.innerHTML =
          '<a class="dropdown-item" href="#" data-ex="' + ex.id + '">' +
          ex.title + '<br><small class="text-muted">' + escHtml(ex.desc) + '</small></a>';
        li.querySelector('a').addEventListener('click', function (e) {
          e.preventDefault();
          UI.loadExample(ex.id);
        });
        menu.appendChild(li);
      });
    }

    /* ── Helpers ──────────────────────────────────────────────── */
    function bind(id, fn) {
      var el = $id(id);
      if (el) el.addEventListener('click', fn);
    }

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  });

})();
