/**
 * SpeakScript UI Controller v0.1
 */
(function () {
  'use strict';

  var GUIDE_SECTIONS = [
    { icon:'🎬', title:'Scene',
      items:[
        {desc:'Set the story background',code:'scene "school"'},
        {desc:'Available: school, classroom, jungle, restaurant, home, playground, space',code:'scene "jungle"'},
      ]},
    { icon:'🧑', title:'Characters',
      items:[
        {desc:'Make a character appear on stage',code:'Rafi appears'},
        {desc:'Any name works — Rafi, Mina, Lion, Bird, Robot…',code:'Lion appears'},
      ]},
    { icon:'💬', title:'Speaking',
      items:[
        {desc:'Make a character say something',code:'Rafi says "Hello!"'},
        {desc:'Narrator speaks without a character',code:'narrator says "Once upon a time..."'},
      ]},
    { icon:'🎭', title:'Actions',
      items:[
        {desc:'Wave',  code:'Rafi waves'},
        {desc:'Smile', code:'Mina smiles'},
        {desc:'Jump',  code:'Monkey jumps'},
        {desc:'Fly',   code:'Bird flies'},
        {desc:'Move right / left', code:'Robot moves right\nRobot moves left'},
        {desc:'Hide and show',     code:'Cat hides\nCat shows'},
      ]},
    { icon:'📚', title:'Vocabulary',
      items:[
        {desc:'Show a vocabulary card',code:'show word "brave" means "সাহসী"'},
        {desc:'Any language meaning works',code:'show word "river" means "নদী"'},
      ]},
    { icon:'⏸️', title:'Wait / Pause',
      items:[
        {desc:'Pause for N seconds',code:'wait 1 second\nwait 2 seconds'},
      ]},
    { icon:'❓', title:'Quiz',
      items:[
        {desc:'Ask a question with choices',
         code:'ask "What colour is the sky?"\nchoice "Blue" correct\nchoice "Red" wrong\nchoice "Green" wrong'},
      ]},
    { icon:'🔁', title:'Repeat',
      items:[
        {desc:'Repeat a block N times',
         code:'repeat 3 times\n    Bird flies\n    Bird says "Tweet!"\nend'},
      ]},
    { icon:'🔀', title:'If / Else',
      items:[
        {desc:'React to a quiz answer',
         code:'if answer is correct\n    narrator says "Well done!"\nelse\n    narrator says "Try again!"\nend'},
      ]},
    { icon:'🏆', title:'Score',
      items:[
        {desc:'Start, add, and display the score',
         code:'score starts at 0\nadd 10 points\nshow score'},
      ]},
  ];

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  var UI = {
    /* ── Panel switching ─────────────────────────────────────────────── */
    showPanel: function(name) {
      ['guide','missions','saved'].forEach(function(p) {
        var el = document.getElementById('panel-' + p);
        if (el) el.classList.toggle('d-none', p !== name);
      });
      document.querySelectorAll('.ss-nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.panel === name);
      });
    },

    /* ── Guide panel ─────────────────────────────────────────────────── */
    buildGuidePanel: function() {
      var el = document.getElementById('panel-guide');
      if (!el) return;
      var html = '<h6 class="ss-panel-title">📖 Language Guide</h6>';
      GUIDE_SECTIONS.forEach(function(s) {
        html += '<div class="ss-guide-section">';
        html += '<div class="ss-guide-header" onclick="this.parentElement.classList.toggle(\'open\')">';
        html += '<span>' + s.icon + ' ' + escHtml(s.title) + '</span><span class="ss-guide-arrow">›</span></div>';
        html += '<div class="ss-guide-body">';
        s.items.forEach(function(item) {
          html += '<div class="ss-guide-item">';
          html += '<div class="ss-guide-desc">' + escHtml(item.desc) + '</div>';
          html += '<pre class="ss-guide-code">' + escHtml(item.code) + '</pre>';
          html += '<button class="ss-copy-btn" onclick="window.UI.insertCode(' + JSON.stringify(item.code) + ')">📋 Use this</button>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      el.innerHTML = html;
    },

    insertCode: function(snippet) {
      var editor = document.getElementById('ss-editor');
      if (!editor) return;
      var pos = editor.selectionStart || editor.value.length;
      editor.value = editor.value.slice(0, pos) + (pos > 0 ? '\n' : '') + snippet + '\n' + editor.value.slice(pos);
      editor.focus();
      window.SpeakStorage.saveLastCode(editor.value);
      this.syncLineNumbers();
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
        html += '<button class="ss-mission-load-btn" onclick="window.UI.loadMissionCode(\'' + m.id + '\')">🚀 Load Starter Code</button>';
        html += '</div>';
      });
      el.innerHTML = html;
    },

    loadMissionCode: function(missionId) {
      var mission = null;
      window.SpeakMissions.forEach(function(m) { if (m.id === missionId) mission = m; });
      if (!mission) return;
      var editor = document.getElementById('ss-editor');
      if (!editor) return;
      if (editor.value.trim() && !confirm('Replace current code with mission starter code?')) return;
      editor.value = mission.starterCode;
      window.SpeakStorage.saveLastCode(editor.value);
      this.syncLineNumbers();
      this.showPanel('guide');
      editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      editor.focus();
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
        html += '<button class="ss-btn-mini ss-btn-load" onclick="window.UI.loadSavedProgram(' + JSON.stringify(name) + ')">Load</button>';
        html += '<button class="ss-btn-mini ss-btn-del"  onclick="window.UI.deleteSavedProgram(' + JSON.stringify(name) + ')">🗑</button>';
        html += '</div></div>';
      });
      el.innerHTML = html;
    },

    loadSavedProgram: function(name) {
      var prog = window.SpeakStorage.loadAllPrograms()[name];
      if (!prog) return;
      var editor = document.getElementById('ss-editor');
      if (editor) { editor.value = prog.code; window.SpeakStorage.saveLastCode(prog.code); this.syncLineNumbers(); editor.focus(); }
    },

    deleteSavedProgram: function(name) {
      if (!confirm('Delete "' + name + '"?')) return;
      window.SpeakStorage.deleteProgram(name);
      this.buildSavedPanel();
    },

    /* ── Save dialog ─────────────────────────────────────────────────── */
    promptSaveProgram: function() {
      var editor = document.getElementById('ss-editor');
      if (!editor || !editor.value.trim()) { alert('Write some code first!'); return; }
      var name = prompt('Enter a name for your program:', 'My Story');
      if (!name || !name.trim()) return;
      window.SpeakStorage.saveProgram(name.trim(), editor.value);
      this.buildSavedPanel();
      this.showPanel('saved');
      this.showToast('💾 Program saved!');
    },

    /* ── Download ────────────────────────────────────────────────────── */
    downloadProgram: function() {
      var editor = document.getElementById('ss-editor');
      if (!editor || !editor.value.trim()) { alert('Nothing to download!'); return; }
      var blob = new Blob([editor.value], { type: 'text/plain' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href = url; a.download = 'my-speakscript.txt'; a.click();
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
  console.log('[SpeakScript] UI ready');
})();
