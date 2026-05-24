/**
 * KiddyFun UI Controller v1.0
 */
(function () {
  'use strict';

  var GUIDE_SECTIONS = [
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
      ]},
    { icon:'🔁', title:'Repeat (Loop)',
      items:[
        {desc:'Repeat a block N times',
         code:'repeat 3 times\n    Bird flies\n    Bird says "Tweet!"\nend'},
      ]},
    { icon:'🔀', title:'If / Else',
      items:[
        {desc:'React to quiz answers',
         code:'if answer is correct\n    narrator says "Well done!"\nelse\n    narrator says "Try again!"\nend'},
      ]},
    { icon:'🏆', title:'Score & Sound',
      items:[
        {desc:'Track points and play sounds',code:'score starts at 0\nadd 10 points\nshow score\nplay sound "success"'},
      ]},
    { icon:'📦', title:'Variables & Data Types',
      items:[
        {desc:'Store text, numbers, and true/false',code:'set name to "Rafi"\nset age to 10\nset ready to true'},
        {desc:'See type and value (number, text, list…)',code:'show type of age\nshow value of name'},
        {desc:'Update with math or joined text',code:'set score to score plus 10\nset msg to "Hi" joined with " there"'},
      ]},
    { icon:'📋', title:'Lists (Strings of items)',
      items:[
        {desc:'Create a list',code:'set colors to list "red" and "blue" and "green"'},
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
        {desc:'Functions with inputs',code:'define greet with name\n    narrator says name\nend\n\ncall greet with "Mina"'},
        {desc:'Return a value',code:'define double with n\n    return n times 2\nend'},
      ]},
    { icon:'🧠', title:'Conditions & Loops',
      items:[
        {desc:'If / else with comparisons',code:'if score is greater than 10\n    narrator says "High score!"\nelse\n    narrator says "Keep trying!"\nend'},
        {desc:'Greater-or-equal / less-or-equal',code:'if level is greater than or equal to 5\n    narrator says "Pro level!"\nend'},
        {desc:'Equals text',code:'if name equals "Rafi"\n    Rafi smiles\nend'},
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
    { icon:'↩️', title:'Function return value',
      items:[
        {desc:'Use result in set or say',code:'define addTen with x\n    return x plus 10\nend\nset total to call addTen with 5'},
      ]},
  ];

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

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
      ['guide','missions','saved','sync'].forEach(function(p) {
        var el = document.getElementById('panel-' + p);
        if (el) el.classList.toggle('d-none', p !== name);
      });
      document.querySelectorAll('.ss-nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.panel === name);
      });
      if (name === 'sync' && window.KiddyAuth && window.KiddyAuth.buildSyncPanel) {
        window.KiddyAuth.buildSyncPanel();
      }
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
