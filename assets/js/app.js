/**
 * KiddyFun Main App v1.0
 */
(function () {
  'use strict';

  var interpreter = null;

  document.addEventListener('DOMContentLoaded', function () {

    var Parser      = window.SpeakParser;
    var Errors      = window.SpeakErrors;
    var Runtime     = window.SpeakRuntime;
    var GameRuntime = window.KiddyGameRuntime;
    var Storage     = window.SpeakStorage;
    var Interpreter = window.SpeakInterpreter && window.SpeakInterpreter.Interpreter;
    var GameInterpreter = window.KiddyGameInterpreter;

    if (!Parser || !Errors || !Runtime || !Storage || !Interpreter) {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:sans-serif;color:#dc2626;max-width:600px;margin:40px auto;">' +
        '<h2>⚠️ KiddyFun Code failed to load</h2>' +
        '<p>Please check that all files in <code>assets/js/</code> exist and open <code>index.html</code> in a browser.</p>' +
        '<pre style="background:#f1f5f9;padding:16px;border-radius:8px;">' +
          'Parser:      ' + (Parser      ? '✅' : '❌') + '\n' +
          'Errors:      ' + (Errors      ? '✅' : '❌') + '\n' +
          'Runtime:     ' + (Runtime     ? '✅' : '❌') + '\n' +
          'Storage:     ' + (Storage     ? '✅' : '❌') + '\n' +
          'Interpreter: ' + (Interpreter ? '✅' : '❌') +
        '</pre></div>';
      return;
    }

    function $id(id) { return document.getElementById(id); }

    Runtime.init($id('ss-stage'), $id('ss-log'), $id('ss-vocab'), $id('ss-score'));
    if (GameRuntime) {
      GameRuntime.init($id('ss-stage'), $id('ss-log'), $id('ss-score'));
    }

    var last = Storage.loadLastCode();
    if (last) $id('ss-editor').value = last;

    UI.buildGuidePanel();
    UI.buildMissionsPanel();
    UI.buildSavedPanel();
    UI.updateProgress();
    UI.showPanel('guide');

    if (window.KiddyTutorial && window.KiddyTutorial.load) {
      window.KiddyTutorial.load(false);
    }

    if (window.KiddyAuth) {
      if (window.KiddyAuth.buildSyncPanel) window.KiddyAuth.buildSyncPanel();
      var btnSync = $id('btn-open-sync');
      if (btnSync) {
        btnSync.addEventListener('click', function () {
          if (window.KiddyAuth.openSyncPanel) window.KiddyAuth.openSyncPanel();
        });
      }
      var btnSyncMobile = $id('btn-open-sync-mobile');
      if (btnSyncMobile) {
        btnSyncMobile.addEventListener('click', function () {
          if (window.KiddyAuth.openSyncPanel) window.KiddyAuth.openSyncPanel();
        });
      }
    }

    buildExampleDropdown();
    buildSyntaxDropdown();
    initAudioToggles();

    var editorEl = $id('ss-editor');
    if (window.KiddySmartEditor && window.KiddySmartEditor.init) {
      KiddySmartEditor.init(editorEl, {
        onChange: function () {
          Storage.saveLastCode(editorEl.value);
          UI.syncLineNumbers();
        },
        onScroll: function () { UI.syncLineNumbers(); },
      });
    } else {
      editorEl.addEventListener('input', function () {
        Storage.saveLastCode(editorEl.value);
        UI.syncLineNumbers();
      });
      editorEl.addEventListener('scroll', function () { UI.syncLineNumbers(); });
    }
    UI.syncLineNumbers();

    document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { UI.showPanel(btn.dataset.panel); });
    });

    bind('btn-run', runProgram);
    bind('btn-stop', stopProgram);
    bind('btn-reset', resetStage);
    bind('btn-clear', clearEditor);
    bind('btn-save', function () { UI.promptSaveProgram(); });
    bind('btn-publish', function () { UI.publishProgram(); });
    bind('btn-download', function () { UI.downloadProgram(); });
    bind('btn-reset-progress', resetProgress);
    bind('btn-reset-progress-mobile', resetProgress);
    bind('btn-open-tutorial', function () {
      if (window.KiddyTutorial && window.KiddyTutorial.openInMenu) window.KiddyTutorial.openInMenu();
    });
    bind('btn-open-tutorial-mobile', function () {
      if (window.KiddyTutorial && window.KiddyTutorial.openInMenu) window.KiddyTutorial.openInMenu();
    });
    bind('btn-toggle-code', toggleDesktopCodePanel);
    bind('btn-max-editor', toggleMaxEditor);
    bind('tab-code-btn', function () {
      unlockMobileTab();
      setMobileTab('code');
    });
    bind('tab-output-btn', function () {
      setMobileTab('output');
    });
    bind('ss-badge-overlay', function () { $id('ss-badge-overlay').classList.add('d-none'); });

    var currentMobileTab = 'code';
    var mobileTabLock = null;
    var resizeDebounce = null;

    function isMobileLayout() {
      return window.innerWidth < 992;
    }

    function isOutputInputActive() {
      var dock = $id('kf-input-dock');
      if (dock && !dock.classList.contains('d-none')) return true;
      if (document.querySelector('.kf-waiting-input')) return true;
      var dialog = $id('kf-dialog-overlay');
      if (dialog && !dialog.classList.contains('d-none')) return true;
      return false;
    }

    function shouldForceOutputTab() {
      if (mobileTabLock === 'output') return true;
      return isOutputInputActive();
    }

    function lockMobileTab(tab) {
      mobileTabLock = tab;
      if (isMobileLayout()) setMobileTab(tab, true);
    }

    function unlockMobileTab() {
      mobileTabLock = null;
    }

    function initMobileLayout() {
      if (!isMobileLayout()) {
        $id('code-col').classList.remove('mobile-hidden');
        $id('output-col').classList.remove('mobile-hidden');
        document.body.classList.remove('kf-mobile-mode');
        return;
      }
      document.body.classList.add('kf-mobile-mode');
      if (shouldForceOutputTab()) setMobileTab('output', true);
      else setMobileTab(currentMobileTab, true);
    }

    function scheduleLayoutRefresh() {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(initMobileLayout, 120);
    }

    initMobileLayout();
    window.addEventListener('resize', scheduleLayoutRefresh);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleLayoutRefresh);
    }

    document.addEventListener('focusin', function (e) {
      if (!isMobileLayout()) return;
      var target = e.target;
      if (!target) return;
      var outCol = $id('output-col');
      var editor = $id('ss-editor');
      if (editor && (target === editor || editor.contains(target))) {
        unlockMobileTab();
        setMobileTab('code');
        return;
      }
      if (target.id === 'kf-dialog-input' || target.id === 'kf-input-field' ||
          (outCol && outCol.contains(target))) {
        lockMobileTab('output');
      }
    });

    var desktopCodeVisible = true;
    var editorMaximized = false;

    function toggleMaxEditor() {
      if (window.innerWidth < 992) return;
      var codeCol = $id('code-col');
      var outCol  = $id('output-col');
      var btn     = $id('btn-max-editor');
      if (!codeCol || !outCol) return;

      editorMaximized = !editorMaximized;
      if (editorMaximized) {
        outCol.classList.add('d-none');
        codeCol.classList.remove('kf-col-code');
        codeCol.classList.add('kf-col-full');
        document.body.classList.add('kf-editor-maximized');
        if (btn) {
          btn.textContent = '🗗';
          btn.title = 'Restore editor';
          btn.setAttribute('aria-pressed', 'true');
        }
      } else {
        outCol.classList.remove('d-none');
        codeCol.classList.remove('kf-col-full');
        codeCol.classList.add('kf-col-code');
        document.body.classList.remove('kf-editor-maximized');
        if (btn) {
          btn.textContent = '🗖';
          btn.title = 'Maximize editor';
          btn.setAttribute('aria-pressed', 'false');
        }
      }

      if (window.KiddySmartEditor && KiddySmartEditor.updateGutter) {
        KiddySmartEditor.updateGutter();
      }
    }

    function toggleDesktopCodePanel() {
      if (window.innerWidth < 992) return;
      var codeCol = $id('code-col');
      var outCol  = $id('output-col');
      var toggleBtn = $id('btn-toggle-code');
      if (desktopCodeVisible) {
        codeCol.classList.add('d-none');
        outCol.classList.remove('kf-col-output');
        outCol.classList.add('kf-col-full');
        toggleBtn.textContent = '✏️ Edit Code';
        desktopCodeVisible = false;
      } else {
        codeCol.classList.remove('d-none');
        outCol.classList.remove('kf-col-full');
        outCol.classList.add('kf-col-output');
        toggleBtn.textContent = '🔲 Full Screen';
        desktopCodeVisible = true;
      }
    }

    function setMobileTab(tab, silent) {
      if (!isMobileLayout()) return;
      if (tab !== 'code' && tab !== 'output') return;
      if (!silent && tab === 'code' && shouldForceOutputTab()) {
        tab = 'output';
      }
      currentMobileTab = tab;

      var codeCol = $id('code-col');
      var outCol  = $id('output-col');
      var tabCode = $id('tab-code-btn');
      var tabOut  = $id('tab-output-btn');
      if (tab === 'code') {
        codeCol.classList.remove('mobile-hidden');
        outCol.classList.add('mobile-hidden');
        if (tabCode) tabCode.classList.add('active');
        if (tabOut) tabOut.classList.remove('active');
        document.body.classList.remove('kf-tab-output-active');
      } else {
        codeCol.classList.add('mobile-hidden');
        outCol.classList.remove('mobile-hidden');
        if (tabCode) tabCode.classList.remove('active');
        if (tabOut) tabOut.classList.add('active');
        document.body.classList.add('kf-tab-output-active');
        requestAnimationFrame(function () {
          var stage = $id('ss-stage');
          if (stage) void stage.offsetHeight;
          var field = $id('kf-input-field');
          if (field && !field.closest('.d-none')) {
            try { field.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (err) { /* ignore */ }
          }
        });
      }
    }

    function initAudioToggles() {
      if (!window.KiddyAudio) return;

      var voiceBtn = $id('btn-toggle-voice');
      var soundBtn = $id('btn-toggle-sound');

      function syncToggle(btn, enabled, onLabel, offLabel) {
        if (!btn) return;
        btn.classList.toggle('active', enabled);
        btn.title = enabled ? onLabel : offLabel;
      }

      syncToggle(voiceBtn, KiddyAudio.isVoiceEnabled(), 'Voice ON — click to mute', 'Voice OFF — click to enable English speech');
      syncToggle(soundBtn, KiddyAudio.isSoundEnabled(), 'Sound ON — click to mute', 'Sound OFF — click to enable effects');

      var voiceMobile = $id('btn-toggle-voice-mobile');
      var soundMobile = $id('btn-toggle-sound-mobile');
      syncToggle(voiceMobile, KiddyAudio.isVoiceEnabled(), 'Voice ON', 'Voice OFF');
      syncToggle(soundMobile, KiddyAudio.isSoundEnabled(), 'Sound ON', 'Sound OFF');

      if (voiceMobile) voiceMobile.addEventListener('click', function () { toggleVoice(); });
      if (soundMobile) soundMobile.addEventListener('click', function () { toggleSound(); });

      function toggleVoice() {
        var next = !KiddyAudio.isVoiceEnabled();
        KiddyAudio.setVoiceEnabled(next);
        syncToggle(voiceBtn, next, 'Voice ON', 'Voice OFF');
        syncToggle(voiceMobile, next, 'Voice ON', 'Voice OFF');
        UI.showToast(next ? '🔊 English voice ON' : '🔇 Voice muted');
      }

      function toggleSound() {
        var next = !KiddyAudio.isSoundEnabled();
        KiddyAudio.setSoundEnabled(next);
        syncToggle(soundBtn, next, 'Sound ON', 'Sound OFF');
        syncToggle(soundMobile, next, 'Sound ON', 'Sound OFF');
        if (next) KiddyAudio.playSound('pop');
        UI.showToast(next ? '🎵 Sound effects ON' : '🔇 Sound muted');
      }

      if (voiceBtn) voiceBtn.addEventListener('click', toggleVoice);
      if (soundBtn) soundBtn.addEventListener('click', toggleSound);

      document.addEventListener('click', function resumeAudio() {
        if (window.KiddyAudio && KiddyAudio.sounds._ensureCtx) {
          KiddyAudio.sounds._ensureCtx();
        }
      }, { once: true });
    }

    window.KiddyApp = {
      setMobileTab: setMobileTab,
      lockMobileTab: lockMobileTab,
      unlockMobileTab: unlockMobileTab,
      runProgram: runProgram,
    };

    tryLoadSharedFromUrl();

    console.log('✅ KiddyFun Code v1.0 ready');

    function tryLoadSharedFromUrl() {
      if (!window.KiddyPublish) return;
      var params = KiddyPublish.getParamsFromLocation();
      if (!params.shareId && !params.urlCode) return;

      var loadPromise;
      if (params.shareId) {
        loadPromise = KiddyPublish.loadFromShareId(params.shareId);
      } else {
        loadPromise = Promise.resolve(KiddyPublish.loadFromUrlParam(params.urlCode));
      }

      loadPromise.then(function (res) {
        if (!res.ok) {
          UI.showAlert(res.error, { title: 'Share link', icon: '🔗' });
          return;
        }
        UI.loadSharedCode(res.code, res.title, params.autoRun);
      });
    }

    function runProgram() {
      var code = editorEl.value.trim();
      if (window.KiddySmartEditor && window.KiddySmartEditor.expandForRun) {
        code = KiddySmartEditor.expandForRun(code).trim();
      }
      if (!code) { UI.showToast('✏️ Write some code first!'); return; }
      UI.clearErrors();
      UI.setRunning(true);

      if (isMobileLayout()) lockMobileTab('output');

      var ast;
      try {
        ast = Parser.parseProgram(code);
      } catch (err) {
        UI.showErrors(Errors.renderError(Errors.friendlyError(err)));
        UI.setRunning(false);
        unlockMobileTab();
        if (window.KiddyAudio) KiddyAudio.playSound('wrong');
        return;
      }

      if (editorMaximized && window.innerWidth >= 992) {
        toggleMaxEditor();
      }

      if (ast.mode === 'game') {
        if (!GameRuntime || !GameInterpreter) {
          UI.showErrors('Game mode is not loaded. Check game-*.js scripts in index.html.');
          UI.setRunning(false);
          unlockMobileTab();
          return;
        }
        if (editorEl && editorEl.blur) editorEl.blur();
        Runtime.reset();
        interpreter = new GameInterpreter(GameRuntime);
        interpreter.run(ast).then(function () {
          checkMissions(code);
        }).catch(function (err) {
          UI.showErrors(Errors.renderError(Errors.friendlyError(err)));
        }).finally(function () {
          UI.setRunning(false);
          interpreter = null;
        });
        return;
      }

      interpreter = new Interpreter(Runtime);
      interpreter.run(ast.nodes || ast).then(function () {
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
      if (GameRuntime && GameRuntime.loop) GameRuntime.loop.stop();
      UI.setRunning(false);
      unlockMobileTab();
      UI.showToast('⏹️ Stopped.');
    }

    function resetStage() {
      if (interpreter) interpreter.stop();
      interpreter = null;
      Runtime.reset();
      if (GameRuntime) GameRuntime.reset();
      UI.clearErrors();
      UI.setRunning(false);
    }

    function clearEditor() {
      UI.showConfirm('Clear all code?', {
        title: 'Clear editor?',
        okLabel: 'Clear',
        danger: true,
      }).then(function (ok) {
        if (!ok) return;
        editorEl.value = '';
        Storage.saveLastCode('');
        UI.syncLineNumbers();
        if (window.KiddySmartEditor && window.KiddySmartEditor.notifyExternalChange) {
          KiddySmartEditor.notifyExternalChange();
        }
        editorEl.focus();
        UI.showToast('🗑 Editor cleared');
      });
    }

    function resetProgress() {
      UI.showConfirm('Reset ALL progress and saved programs? This cannot be undone.', {
        title: 'Reset everything?',
        okLabel: 'Reset all',
        danger: true,
      }).then(function (ok) {
        if (!ok) return;
        resetProgressApply();
      });
    }

    function resetProgressApply() {
      Storage.resetAll();
      UI.buildMissionsPanel();
      UI.buildSavedPanel();
      UI.updateProgress();
      UI.showToast('🔄 Progress reset!');
    }

    function checkMissions(code) {
      var completed = Storage.loadCompletedMissions();
      var newComplete = false;
      window.SpeakMissions.forEach(function (m) {
        if (completed.indexOf(m.id) === -1 && m.validate(code)) {
          Storage.completeMission(m.id);
          Storage.awardBadge(m.badge);
          UI.showBadge('🎉 Mission Complete!\n' + m.title + '\n' + m.badge);
          newComplete = true;
        }
      });
      if (newComplete) {
        UI.buildMissionsPanel();
        UI.updateProgress();
        if (window.KiddyAudio) KiddyAudio.playSound('cheer');
      }
    }

    function buildExampleDropdown() {
      var menu = $id('example-dropdown-menu');
      if (!menu) return;
      window.SpeakExamples.forEach(function (ex) {
        var li = document.createElement('li');
        li.innerHTML =
          '<a class="dropdown-item py-2" href="#" data-ex="' + ex.id + '">' +
          '<strong>' + ex.title + '</strong><br>' +
          '<small class="text-muted">' + escHtml(ex.desc) + '</small></a>';
        li.querySelector('a').addEventListener('click', function (e) {
          e.preventDefault();
          UI.loadExample(ex.id);
        });
        menu.appendChild(li);
      });
      setupDropdownPortal(menu, 'kf-examples-menu-portaled');
    }

    function buildSyntaxDropdown() {
      var menu = $id('syntax-dropdown-menu');
      if (!menu || !window.KiddySyntax) return;
      var toggleBtnRef = menu.parentElement &&
        menu.parentElement.querySelector('[data-bs-toggle="dropdown"]');

      /* Top: "Copy AI prompt" mega action */
      var topLi = document.createElement('li');
      topLi.className = 'kf-syntax-top';
      topLi.innerHTML =
        '<div class="kf-syntax-header">' +
          '<div class="kf-syntax-header-title">🤖 AI Code Helper</div>' +
          '<div class="kf-syntax-header-desc">' +
            'Copy the full language reference + prompt template, paste it into ' +
            '<b>ChatGPT, Claude, Gemini</b>, etc., add your goal, and the AI will generate ' +
            'a complete program in this language.' +
          '</div>' +
          '<button type="button" class="kf-syntax-copy-prompt">' +
            '<span class="kf-syntax-copy-prompt-icon">✨</span>' +
            '<span class="kf-syntax-copy-prompt-text">Copy AI prompt template</span>' +
          '</button>' +
        '</div>';
      menu.appendChild(topLi);
      var promptBtn = topLi.querySelector('.kf-syntax-copy-prompt');
      promptBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(window.KiddySyntax.aiPrompt).then(function (ok) {
          flashCopyButton(promptBtn, ok, 'Copied! Paste into ChatGPT →', '✨ Copy AI prompt template');
          if (ok && window.UI && UI.showToast) UI.showToast('✨ AI prompt copied — paste into ChatGPT, Claude, or Gemini.');
        });
      });

      /* Categories + items */
      window.KiddySyntax.groups.forEach(function (group) {
        var hdrLi = document.createElement('li');
        hdrLi.className = 'kf-syntax-group';
        hdrLi.innerHTML = '<div class="kf-syntax-group-title">' + escHtml(group.group) + '</div>';
        menu.appendChild(hdrLi);

        group.items.forEach(function (item) {
          var li = document.createElement('li');
          li.className = 'kf-syntax-item';
          li.innerHTML =
            '<div class="kf-syntax-item-row">' +
              '<div class="kf-syntax-item-text">' +
                '<div class="kf-syntax-item-title">' + escHtml(item.title) + '</div>' +
                '<div class="kf-syntax-item-desc">' + escHtml(item.desc) + '</div>' +
                '<pre class="kf-syntax-item-code"><code></code></pre>' +
              '</div>' +
              '<button type="button" class="kf-syntax-copy" title="Copy this snippet">📋</button>' +
            '</div>';
          li.querySelector('code').textContent = item.code;
          var btn = li.querySelector('.kf-syntax-copy');
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            copyToClipboard(item.code).then(function (ok) {
              flashCopyButton(btn, ok, '✅', '📋');
              if (ok && window.UI && UI.showToast) UI.showToast('Copied snippet: ' + item.title);
            });
          });
          /* Click on the code itself also drops into the editor */
          li.querySelector('.kf-syntax-item-code').addEventListener('click', function () {
            if (window.UI && UI.insertCode) UI.insertCode(item.code);
            else copyToClipboard(item.code);
            /* Close the dropdown after inserting */
            var inst = window.bootstrap && bootstrap.Dropdown
              ? bootstrap.Dropdown.getInstance(toggleBtnRef) : null;
            if (inst) inst.hide();
          });
          menu.appendChild(li);
        });
      });

      setupDropdownPortal(menu, 'kf-syntax-menu-portaled');
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
      }
      return Promise.resolve(fallbackCopy(text));
    }

    function fallbackCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    }

    function flashCopyButton(btn, ok, okLabel, defaultLabel) {
      if (!btn) return;
      var prev = btn.innerHTML;
      var inner = btn.querySelector('.kf-syntax-copy-prompt-text');
      if (inner) {
        inner.textContent = ok ? okLabel : 'Copy failed';
        btn.classList.add(ok ? 'kf-copy-ok' : 'kf-copy-err');
        setTimeout(function () {
          inner.textContent = defaultLabel.replace(/^[^\s]+\s/, '');
          btn.classList.remove('kf-copy-ok', 'kf-copy-err');
        }, 1800);
        return;
      }
      btn.textContent = ok ? okLabel : '⚠️';
      btn.classList.add(ok ? 'kf-copy-ok' : 'kf-copy-err');
      setTimeout(function () {
        btn.innerHTML = prev;
        btn.classList.remove('kf-copy-ok', 'kf-copy-err');
      }, 1500);
    }

    /* Portal the menu to <body> on mobile so it escapes ancestor
     * containing-blocks (backdrop-filter / transform / filter cause
     * fixed-positioned descendants to render INSIDE the ancestor box). */
    function setupDropdownPortal(menu, portalClass) {
      var dropdownEl = menu.parentElement;
      if (!dropdownEl) return;
      var toggleBtn = dropdownEl.querySelector('[data-bs-toggle="dropdown"]');
      if (!toggleBtn) return;

      var placeholder = document.createComment('kf-portal-placeholder');
      var backdrop = null;
      var portaled = false;

      function isMobile() { return window.matchMedia('(max-width: 576px)').matches; }

      function portalToBody() {
        if (portaled || !isMobile()) return;
        if (menu.parentNode === dropdownEl) {
          dropdownEl.insertBefore(placeholder, menu);
          document.body.appendChild(menu);
          menu.classList.add(portalClass);
          backdrop = document.createElement('div');
          backdrop.className = 'kf-examples-backdrop';
          backdrop.addEventListener('click', function () {
            var inst = window.bootstrap && bootstrap.Dropdown
              ? bootstrap.Dropdown.getInstance(toggleBtn) : null;
            if (inst) inst.hide();
          });
          document.body.appendChild(backdrop);
          requestAnimationFrame(function () {
            if (backdrop) backdrop.classList.add('kf-examples-backdrop-in');
          });
          portaled = true;
        }
      }

      function restoreFromBody() {
        if (!portaled) return;
        if (backdrop) {
          backdrop.classList.remove('kf-examples-backdrop-in');
          var bd = backdrop;
          setTimeout(function () { if (bd && bd.parentNode) bd.remove(); }, 220);
          backdrop = null;
        }
        if (menu.parentNode === document.body && placeholder.parentNode === dropdownEl) {
          dropdownEl.insertBefore(menu, placeholder);
          placeholder.remove();
          menu.classList.remove(portalClass);
        }
        portaled = false;
      }

      toggleBtn.addEventListener('show.bs.dropdown', portalToBody);
      toggleBtn.addEventListener('hidden.bs.dropdown', restoreFromBody);

      window.addEventListener('resize', function () {
        if (portaled && !isMobile()) {
          var inst = window.bootstrap && bootstrap.Dropdown
            ? bootstrap.Dropdown.getInstance(toggleBtn) : null;
          if (inst) inst.hide();
        }
      });
    }

    function bind(id, fn) {
      var el = $id(id);
      if (el) el.addEventListener('click', fn);
    }

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  });
})();
