/**
 * KiddyFun UI Controller v1.0
 */
(function () {
  'use strict';

  var GUIDE_SECTIONS = [
    { icon:'💡', title:'Comments & blocks',
      items:[
        {desc:'Notes for yourself (# — computer ignores)',code:'# This is a comment\nscene "school"\nRafi says "Hi"'},
        {desc:'Indent inside blocks + always close with end',code:'repeat 2 times\n    Rafi waves\nend'},
      ]},
    { icon:'🎬', title:'Scene',
      items:[
        {desc:'Set the story background',code:'scene "school"'},
        {desc:'Try: school, classroom, jungle, restaurant, home, playground, space',code:'scene "jungle"'},
      ]},
    { icon:'🧑', title:'Characters',
      items:[
        {desc:'Make a character appear on stage',code:'Rafi appears'},
        {desc:'Any name works — Lion, Bird, Robot, Mostak…',code:'Lion appears'},
      ]},
    { icon:'💬', title:'Speaking & English',
      items:[
        {desc:'Characters speak English aloud (turn on 🔊 Voice)',code:'Rafi says "Hello! How are you?"'},
        {desc:'Narrator tells the story',code:'narrator says "Once upon a time..."'},
      ]},
    { icon:'🎭', title:'Actions',
      items:[
        {desc:'Wave, run, jump and more',code:'Rafi waves\nMina smiles\nMonkey jumps\nBird flies'},
        {desc:'Move left or right',code:'Robot moves right\nRobot moves left'},
        {desc:'Hide and show',code:'Cat hides\nCat shows'},
      ]},
    { icon:'📚', title:'Vocabulary',
      items:[
        {desc:'Learn English words with meanings',code:'show word "brave" means "সাহসী"'},
        {desc:'Build your English vocabulary',code:'show word "friend" means "বন্ধু"'},
      ]},
    { icon:'⏸️', title:'Wait / Pause',
      items:[
        {desc:'Pause for N seconds',code:'wait 1 second\nwait 2 seconds'},
      ]},
    { icon:'❓', title:'Quiz',
      items:[
        {desc:'Ask a question with clickable choices',
         code:'ask "What colour is the sky?"\nchoice "Blue" correct\nchoice "Red" wrong\nchoice "Green" wrong'},
        {desc:'React after quiz (answer is correct or wrong)',
         code:'if answer is correct\n    narrator says "Yes!"\nelse\n    narrator says "Try again"\nend'},
      ]},
    { icon:'🔁', title:'Repeat (Loop)',
      items:[
        {desc:'Repeat a block N times',
         code:'repeat 3 times\n    Bird flies\n    Bird says "Tweet!"\nend'},
      ]},
    { icon:'🏆', title:'Score & Sound',
      items:[
        {desc:'Track points and play sounds',code:'score starts at 0\nadd 10 points\nshow score\nplay sound "success"'},
      ]},
    { icon:'📦', title:'Variables & Data Types',
      items:[
        {desc:'Store text, numbers, and true/false',code:'set name to "Rafi"\nset age to 10\nset ready to true'},
        {desc:'See type and value (number, text, list…)',code:'show type of age\nshow value of name'},
        {desc:'Math: plus, minus, times, divided by',code:'set a to 10 plus 5\nset b to 10 minus 3\nset c to 4 times 2\nset d to 8 divided by 2'},
        {desc:'Join text',code:'set msg to "Hi" joined with " there"'},
        {desc:'Update a variable',code:'set score to score plus 10'},
      ]},
    { icon:'📋', title:'Lists (Strings of items)',
      items:[
        {desc:'Create a list (text or numbers)',code:'set colors to list "red" and "blue" and "green"\nset nums to list 1 and 2 and 3'},
        {desc:'Get item by position (starts at 1)',code:'set first to item 1 in colors\nshow value of first'},
        {desc:'Length of text or list',code:'set n to length of colors'},
        {desc:'Add or remove items',code:'add "yellow" to colors\nremove item 2 from colors'},
        {desc:'Empty or contains?',code:'if colors is empty\n    narrator says "None"\nend\nif "red" is in colors\n    narrator says "Found red"\nend'},
      ]},
    { icon:'🎲', title:'Random & remainder',
      items:[
        {desc:'Random number in a range',code:'set dice to random number from 1 to 6\nnarrator says dice'},
        {desc:'Remainder (even/odd)',code:'set check to 7 remainder 2\nif check equals 0\n    narrator says "even"\nend'},
      ]},
    { icon:'⚙️', title:'Functions',
      items:[
        {desc:'Define steps once, call many times',code:'define waveHello\n    Rafi waves\n    Rafi says "Hello!"\nend\n\ncall waveHello'},
        {desc:'Functions with one input',code:'define greet with name\n    narrator says name\nend\n\ncall greet with "Mina"'},
        {desc:'Several inputs (use and)',code:'define addNumbers with a and b\n    return a plus b\nend\n\ncall addNumbers with 3 and 7'},
        {desc:'Return a value from a function',code:'define double with n\n    return n times 2\nend\nset x to call double with 5'},
      ]},
    { icon:'🧠', title:'Conditions & Loops',
      items:[
        {desc:'If / else with comparisons',code:'if score is greater than 10\n    narrator says "High score!"\nelse\n    narrator says "Keep trying!"\nend'},
        {desc:'Equals / not equal',code:'if name equals "Rafi"\n    Rafi smiles\nend\nif age is not equal to 5\n    narrator says "Not five"\nend'},
        {desc:'Greater, less, or equal',code:'if level is greater than or equal to 5\n    narrator says "Level 5+"\nend\nif lives is less than or equal to 0\n    narrator says "Game over"\nend'},
        {desc:'And / or / not',code:'if age is greater than 5 and happy equals true\n    narrator says "Ready!"\nend\nif tired equals true or hungry equals true\n    narrator says "Rest"\nend\nif not ready equals true\n    narrator says "Wait"\nend'},
        {desc:'Repeat while condition',code:'set i to 1\nrepeat while i is less than 4\n    set i to i plus 1\nend'},
      ]},
    { icon:'💬', title:'Speak from variables',
      items:[
        {desc:'Say a variable (not only quoted text)',code:'set line to "Welcome!"\nnarrator says line'},
      ]},
    { icon:'⌨️', title:'Keyboard input',
      items:[
        {desc:'Ask the user (type in Output panel)',code:'ask user "What is your name?" as playerName\nnarrator says playerName'},
        {desc:'Or use built-in answer',code:'ask user "Favourite colour?"\nset colour to answer'},
        {desc:'In an expression',code:'set name to ask user "Your name?"'},
      ]},
    { icon:'🔒', title:'const (cannot change)',
      items:[
        {desc:'Fixed value for the whole program',code:'const maxScore to 100\n# set maxScore to 200  ← error'},
      ]},
    { icon:'🔁', title:'for each in list',
      items:[
        {desc:'Loop over every list item',code:'set colours to list "red" and "blue"\nfor each colour in colours\n    narrator says colour\nend'},
      ]},
    { icon:'⏭️', title:'break / continue',
      items:[
        {desc:'Stop loop early or skip one turn',code:'repeat while n is less than 10\n    if n equals 5\n        continue\n    end\n    if n is greater than 8\n        break\n    end\nend'},
      ]},
    { icon:'➗', title:'Score vs list add',
      items:[
        {desc:'Game score (points)',code:'score starts at 0\nadd 10 points'},
        {desc:'Add to a list (different!)',code:'set items to list "a" and "b"\nadd "c" to items'},
      ]},
  ];

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /** Snippets for Guide “Use this” buttons (indexed by data-guide-idx) */
  var GUIDE_SNIPPETS = [];

  var UI = {
    updateProgress: function() {
      var total = window.SpeakMissions ? window.SpeakMissions.length : 0;
      var completed = window.SpeakStorage.loadCompletedMissions();
      var done = completed.length;
      var pct = total ? Math.round((done / total) * 100) : 0;
      var fill = document.getElementById('kf-progress-fill');
      var text = document.getElementById('kf-progress-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = done + ' / ' + total;
    },

    showPanel: function(name) {
      ['guide', 'tutorial', 'missions', 'saved', 'sync'].forEach(function (p) {
        var el = document.getElementById('panel-' + p);
        if (el) el.classList.toggle('d-none', p !== name);
      });
      document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.panel === name);
      });
      if (name === 'sync' && window.KiddyAuth && window.KiddyAuth.buildSyncPanel) {
        window.KiddyAuth.buildSyncPanel();
      }
      if (name === 'tutorial' && window.KiddyTutorial && window.KiddyTutorial.buildPanel) {
        window.KiddyTutorial.buildPanel();
      }
      var sidePanel = document.querySelector('.ss-side-panel');
      if (sidePanel) sidePanel.classList.toggle('ss-side-tutorial', name === 'tutorial');
    },

    /* ── Guide panel ─────────────────────────────────────────────────── */
    buildGuidePanel: function() {
      var el = document.getElementById('panel-guide');
      if (!el) return;
      var html = '<h6 class="ss-panel-title">📖 Language Guide</h6>';
      html += '';
      GUIDE_SNIPPETS = [];
      GUIDE_SECTIONS.forEach(function(s) {
        html += '<div class="ss-guide-section">';
        html += '<div class="ss-guide-header" role="button" tabindex="0">';
        html += '<span>' + s.icon + ' ' + escHtml(s.title) + '</span><span class="ss-guide-arrow">›</span></div>';
        html += '<div class="ss-guide-body">';
        s.items.forEach(function(item) {
          var idx = GUIDE_SNIPPETS.length;
          GUIDE_SNIPPETS.push(item.code);
          html += '<div class="ss-guide-item">';
          html += '<div class="ss-guide-desc">' + escHtml(item.desc) + '</div>';
          html += '<pre class="ss-guide-code">' + escHtml(item.code) + '</pre>';
          html += '<button type="button" class="ss-copy-btn" data-guide-idx="' + idx + '">📋 Use this</button>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      el.innerHTML = html;

      el.querySelectorAll('.ss-guide-header').forEach(function (hdr) {
        hdr.addEventListener('click', function () {
          hdr.parentElement.classList.toggle('open');
        });
      });

      el.addEventListener('click', function (e) {
        var btn = e.target.closest('.ss-copy-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var i = parseInt(btn.getAttribute('data-guide-idx'), 10);
        if (!isNaN(i) && GUIDE_SNIPPETS[i] !== undefined) {
          UI.insertCode(GUIDE_SNIPPETS[i]);
        }
      });

      var tutBtn = document.getElementById('btn-guide-open-tutorial');
      if (tutBtn) {
        tutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.KiddyTutorial && window.KiddyTutorial.openInMenu) {
            window.KiddyTutorial.openInMenu();
          }
        });
      }
    },

    closeLeftMenu: function () {
      var menu = document.getElementById('leftMenu');
      if (!menu || !window.bootstrap) return;
      var oc = window.bootstrap.Offcanvas.getInstance(menu);
      if (!oc) oc = window.bootstrap.Offcanvas.getOrCreateInstance(menu);
      if (oc) oc.hide();
    },

    insertCode: function(snippet) {
      var editor = document.getElementById('ss-editor');
      if (!editor) return;
      var pos = editor.selectionStart || editor.value.length;
      var prefix = editor.value.length > 0 && pos > 0 ? '\n' : '';
      var suffix = editor.value.length > 0 ? '\n' : '';
      editor.value = editor.value.slice(0, pos) + prefix + snippet + suffix + editor.value.slice(pos);
      editor.focus();
      if (window.SpeakStorage) window.SpeakStorage.saveLastCode(editor.value);
      this.syncLineNumbers();
      this.showToast('📋 Code added to editor');
      this.closeLeftMenu();

      if (window.innerWidth < 992) {
        if (window.KiddyApp && window.KiddyApp.unlockMobileTab) {
          window.KiddyApp.unlockMobileTab();
        }
        if (window.KiddyApp && window.KiddyApp.setMobileTab) {
          window.KiddyApp.setMobileTab('code');
        } else {
          var tabCode = document.getElementById('tab-code-btn');
          if (tabCode) tabCode.click();
        }
      }
    },

    /* ── Missions panel ──────────────────────────────────────────────── */
    buildMissionsPanel: function() {
      var el = document.getElementById('panel-missions');
      if (!el) return;
      var completed = window.SpeakStorage.loadCompletedMissions();
      var html = '<h6 class="ss-panel-title">🎯 Missions</h6>';
      window.SpeakMissions.forEach(function(m) {
        var done = completed.indexOf(m.id) !== -1;
        html += '<div class="ss-mission-card' + (done ? ' ss-mission-done' : '') + '">';
        html += '<div class="ss-mission-header"><span class="ss-mission-emoji">' + m.emoji + '</span>';
        html += '<span class="ss-mission-title">' + escHtml(m.title) + '</span>';
        if (done) html += '<span class="ss-mission-badge">✅</span>';
        html += '</div>';
        html += '<p class="ss-mission-goal">' + escHtml(m.goal) + '</p>';
        html += '<div class="ss-mission-syntax">' + m.requiredSyntax.map(function(s){return '<code>'+escHtml(s)+'</code>';}).join('') + '</div>';
        html += '<button type="button" class="ss-mission-load-btn" data-mission-id="' + escHtml(m.id) + '">🚀 Load Starter Code</button>';
        html += '</div>';
      });
      el.innerHTML = html;
      if (!el._kfMissionBound) {
        el._kfMissionBound = true;
        el.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-mission-id]');
          if (!btn) return;
          UI.loadMissionCode(btn.getAttribute('data-mission-id'));
        });
      }
    },

    loadMissionCode: function(missionId) {
      var self = this;
      var mission = null;
      window.SpeakMissions.forEach(function(m) { if (m.id === missionId) mission = m; });
      if (!mission) return;
      var editor = document.getElementById('ss-editor');
      if (!editor) return;

      function apply() {
        editor.value = mission.starterCode;
        window.SpeakStorage.saveLastCode(editor.value);
        self.syncLineNumbers();
        self.showPanel('guide');
        self.closeLeftMenu();
        editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        editor.focus();
      }

      if (editor.value.trim()) {
        self.showConfirm('Replace current code with mission starter code?', {
          title: 'Load mission code?',
          okLabel: 'Replace',
        }).then(function (ok) { if (ok) apply(); });
      } else {
        apply();
      }
    },

    /* ── Saved programs panel ────────────────────────────────────────── */
    buildSavedPanel: function() {
      var el = document.getElementById('panel-saved');
      if (!el) return;
      var programs = window.SpeakStorage.loadAllPrograms();
      var names    = Object.keys(programs);
      if (names.length === 0) {
        el.innerHTML = '<h6 class="ss-panel-title">💾 Saved Programs</h6>' +
          '<p class="ss-empty-msg">No saved programs yet.<br>Write code and click <strong>💾</strong> to save!</p>';
        return;
      }
      var html = '<h6 class="ss-panel-title">💾 Saved Programs</h6>';
      names.forEach(function(name) {
        html += '<div class="ss-saved-card">';
        html += '<span class="ss-saved-name">📄 ' + escHtml(name) + '</span>';
        html += '<div class="ss-saved-actions">';
        html += '<button type="button" class="ss-btn-mini ss-btn-load" data-saved-name="' + escHtml(name) + '">Load</button>';
        html += '<button type="button" class="ss-btn-mini ss-btn-del" data-saved-delete="' + escHtml(name) + '">🗑</button>';
        html += '</div></div>';
      });
      el.innerHTML = html;
      if (!el._kfSavedBound) {
        el._kfSavedBound = true;
        el.addEventListener('click', function (e) {
          var loadBtn = e.target.closest('[data-saved-name]');
          if (loadBtn) {
            UI.loadSavedProgram(loadBtn.getAttribute('data-saved-name'));
            return;
          }
          var delBtn = e.target.closest('[data-saved-delete]');
          if (delBtn) UI.deleteSavedProgram(delBtn.getAttribute('data-saved-delete'));
        });
      }
    },

    loadSavedProgram: function(name) {
      var prog = window.SpeakStorage.loadAllPrograms()[name];
      if (!prog) return;
      var editor = document.getElementById('ss-editor');
      if (editor) { editor.value = prog.code; window.SpeakStorage.saveLastCode(prog.code); this.syncLineNumbers(); editor.focus(); }
    },

    deleteSavedProgram: function(name) {
      var self = this;
      self.showConfirm('Delete "' + name + '"?', {
        title: 'Delete program?',
        okLabel: 'Delete',
        danger: true,
      }).then(function (ok) {
        if (!ok) return;
        window.SpeakStorage.deleteProgram(name);
        self.buildSavedPanel();
        self.showToast('🗑 Program deleted');
      });
    },

    /* ── Save dialog ─────────────────────────────────────────────────── */
    promptSaveProgram: function() {
      var self = this;
      var editor = document.getElementById('ss-editor');
      if (!editor || !editor.value.trim()) {
        self.showAlert('Write some code first!', { title: 'Nothing to save', icon: '✏️' });
        return;
      }
      self.showPrompt('Choose a name for your program:', 'My Story', {
        title: 'Save program',
        icon: '💾',
        okLabel: 'Save',
      }).then(function (name) {
        if (!name || !name.trim()) return;
        window.SpeakStorage.saveProgram(name.trim(), editor.value);
        self.buildSavedPanel();
        self.showPanel('saved');
        self.closeLeftMenu();
        self.showToast('💾 Program saved!');
      });
    },

    /* ── Download ────────────────────────────────────────────────────── */
    downloadProgram: function() {
      var editor = document.getElementById('ss-editor');
      if (!editor || !editor.value.trim()) {
        this.showAlert('Nothing to download!', { title: 'Empty editor', icon: '📥' });
        return;
      }
      var blob = new Blob([editor.value], { type: 'text/plain' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href = url; a.download = 'my-kiddyfun-code.txt'; a.click();
      URL.revokeObjectURL(url);
    },

    /* ── Load example ───────────────────────────────────────────────── */
    loadExample: function(id) {
      var ex = null;
      window.SpeakExamples.forEach(function(e) { if (e.id === id) ex = e; });
      if (!ex) return;
      var editor = document.getElementById('ss-editor');
      if (!editor) return;
      editor.value = ex.code;
      window.SpeakStorage.saveLastCode(ex.code);
      this.syncLineNumbers();
      editor.focus();
      this.showToast('✅ Loaded: ' + ex.title);
    },

    /* ── Badge popup ─────────────────────────────────────────────────── */
    showBadge: function(text) {
      var overlay = document.getElementById('ss-badge-overlay');
      var el      = document.getElementById('ss-badge-text');
      if (!overlay || !el) return;
      el.textContent = text;
      overlay.classList.remove('d-none');
      setTimeout(function() { overlay.classList.add('d-none'); }, 4000);
    },

    /* ── Dialogs (replaces alert / confirm / prompt) ─────────────────── */
    _dialogResolve: null,

    _closeDialog: function (result) {
      var overlay = document.getElementById('kf-dialog-overlay');
      if (overlay) overlay.classList.add('d-none');
      if (window.KiddyApp && window.KiddyApp.unlockMobileTab) {
        window.KiddyApp.unlockMobileTab();
      }
      if (this._dialogResolve) {
        var r = this._dialogResolve;
        this._dialogResolve = null;
        r(result);
      }
    },

    _openDialog: function (config) {
      var self = this;
      var overlay = document.getElementById('kf-dialog-overlay');
      var iconEl = document.getElementById('kf-dialog-icon');
      var titleEl = document.getElementById('kf-dialog-title');
      var msgEl = document.getElementById('kf-dialog-message');
      var inputEl = document.getElementById('kf-dialog-input');
      var actionsEl = document.getElementById('kf-dialog-actions');
      if (!overlay || !actionsEl) return Promise.resolve(config.type === 'confirm' ? false : null);

      return new Promise(function (resolve) {
        self._dialogResolve = resolve;

        if (iconEl) iconEl.textContent = config.icon || 'ℹ️';
        if (titleEl) titleEl.textContent = config.title || '';
        if (msgEl) msgEl.textContent = config.message || '';

        var isPrompt = config.type === 'prompt';
        if (inputEl) {
          if (isPrompt) {
            inputEl.classList.remove('d-none');
            inputEl.value = config.defaultValue || '';
          } else {
            inputEl.classList.add('d-none');
            inputEl.value = '';
          }
        }

        actionsEl.innerHTML = '';

        function addBtn(label, cls, value) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kf-dialog-btn ' + cls;
          btn.textContent = label;
          btn.addEventListener('click', function () {
            if (isPrompt && value !== null) {
              self._closeDialog(inputEl ? inputEl.value : '');
            } else {
              self._closeDialog(value);
            }
          });
          actionsEl.appendChild(btn);
        }

        if (config.type === 'alert') {
          addBtn(config.okLabel || 'OK', 'kf-dialog-btn-primary', true);
        } else if (config.type === 'confirm') {
          addBtn(config.cancelLabel || 'Cancel', 'kf-dialog-btn-secondary', false);
          addBtn(config.okLabel || 'OK', config.danger ? 'kf-dialog-btn-danger' : 'kf-dialog-btn-primary', true);
        } else if (config.type === 'prompt') {
          addBtn(config.cancelLabel || 'Cancel', 'kf-dialog-btn-secondary', null);
          addBtn(config.okLabel || 'Save', 'kf-dialog-btn-primary', true);
        }

        overlay.classList.remove('d-none');

        if (window.KiddyApp && window.KiddyApp.lockMobileTab && window.innerWidth < 992) {
          window.KiddyApp.lockMobileTab('output');
        }

        setTimeout(function () {
          if (isPrompt && inputEl) {
            inputEl.focus();
            inputEl.select();
          } else {
            var primary = actionsEl.querySelector('.kf-dialog-btn-primary, .kf-dialog-btn-danger');
            if (primary) primary.focus();
          }
        }, 50);

        function onKey(e) {
          if (e.key === 'Escape') {
            document.removeEventListener('keydown', onKey);
            self._closeDialog(config.type === 'alert' ? true : (config.type === 'prompt' ? null : false));
          }
          if (e.key === 'Enter' && isPrompt && inputEl && document.activeElement === inputEl) {
            e.preventDefault();
            document.removeEventListener('keydown', onKey);
            self._closeDialog(inputEl.value);
          }
        }
        document.addEventListener('keydown', onKey);

        var oldResolve = self._dialogResolve;
        self._dialogResolve = function (v) {
          document.removeEventListener('keydown', onKey);
          oldResolve(v);
        };
      });
    },

    showAlert: function (message, options) {
      options = options || {};
      return this._openDialog({
        type: 'alert',
        title: options.title || 'Notice',
        message: message,
        icon: options.icon || 'ℹ️',
        okLabel: options.okLabel || 'OK',
      });
    },

    showConfirm: function (message, options) {
      options = options || {};
      return this._openDialog({
        type: 'confirm',
        title: options.title || 'Are you sure?',
        message: message,
        icon: options.icon || '❓',
        okLabel: options.okLabel || 'Yes',
        cancelLabel: options.cancelLabel || 'Cancel',
        danger: !!options.danger,
      });
    },

    showPrompt: function (message, defaultValue, options) {
      options = options || {};
      return this._openDialog({
        type: 'prompt',
        title: options.title || 'Enter a name',
        message: message,
        defaultValue: defaultValue || '',
        icon: options.icon || '💾',
        okLabel: options.okLabel || 'Save',
        cancelLabel: options.cancelLabel || 'Cancel',
      });
    },

    /* ── Toast ───────────────────────────────────────────────────────── */
    showToast: function(msg) {
      var toast = document.getElementById('ss-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('d-none', 'ss-toast-hide');
      toast.classList.add('ss-toast-show');
      setTimeout(function() {
        toast.classList.remove('ss-toast-show');
        toast.classList.add('ss-toast-hide');
        setTimeout(function() { toast.classList.add('d-none'); }, 400);
      }, 2200);
    },

    /* ── Errors ──────────────────────────────────────────────────────── */
    showErrors: function(html) {
      var panel = document.getElementById('ss-error-panel');
      if (!panel) return;
      panel.innerHTML = html;
      panel.classList.remove('d-none');
    },
    clearErrors: function() {
      var panel = document.getElementById('ss-error-panel');
      if (!panel) return;
      panel.innerHTML = '';
      panel.classList.add('d-none');
    },

    /* ── Run state ───────────────────────────────────────────────────── */
    setRunning: function(running) {
      var runBtn  = document.getElementById('btn-run');
      var stopBtn = document.getElementById('btn-stop');
      if (runBtn)  runBtn.classList.toggle('d-none', running);
      if (stopBtn) stopBtn.classList.toggle('d-none', !running);
    },

    /* ── Line numbers ────────────────────────────────────────────────── */
    syncLineNumbers: function() {
      var editor  = document.getElementById('ss-editor');
      var lineNos = document.getElementById('ss-line-numbers');
      if (!editor || !lineNos) return;
      var count = editor.value.split('\n').length;
      var html  = '';
      for (var i = 1; i <= count; i++) html += '<div>' + i + '</div>';
      lineNos.innerHTML     = html;
      lineNos.scrollTop     = editor.scrollTop;
    },
  };

  window.UI = UI;
  console.log('[KiddyFun] UI ready');
})();
