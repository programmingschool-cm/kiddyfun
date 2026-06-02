/**
 * KiddyFun UI Controller v1.0
 */
(function () {
  'use strict';

  var GUIDE_SECTIONS = [
    { icon:'🌟', title:'Story mode vs Game mode',
      items:[
        {desc:'STORY — animated scenes, speech, quizzes (no keyboard control). Start with scene, appears, says.',
         code:'scene "school"\nRafi appears\nRafi says "Hello!"\nRafi waves'},
        {desc:'GAME — real-time keyboard/touch control. First line must be game "Title" (or use every frame / when).',
         code:'game "My Game"\nscene "playground" with walls\nRafi is player\n\nevery frame\n    if right key is held\n        move Rafi right by 4\n    end\nend'},
        {desc:'Rule: story and game do not mix in one file. Pick one style per program.',
         code:'# Story file → scene, says, repeat\n# Game file  → game, every frame, move, if touches'},
      ]},
    { icon:'💡', title:'Comments & writing rules',
      items:[
        {desc:'# starts a comment (ignored when you Run)',
         code:'# My first program\nscene "school"'},
        {desc:'Indent with 4 spaces inside blocks. Every if / repeat / every frame / when ends with end.',
         code:'repeat 2 times\n    Rafi waves\n    Rafi says "Hi!"\nend'},
        {desc:'Use double quotes for text: "Hello!" — not single quotes.',
         code:'Rafi says "Hello, friend!"'},
      ]},
    { icon:'🎬', title:'Scene (story & game)',
      items:[
        {desc:'Set background. Built-in: school, classroom, jungle, restaurant, home, playground, space',
         code:'scene "school"'},
        {desc:'Game only: with walls loads coins & obstacles from that scene',
         code:'scene "playground" with walls\nscene "school" with walls'},
      ]},
    { icon:'🧑', title:'Characters',
      items:[
        {desc:'Make someone appear. Built-in: Rafi, Mina, Teacher, Lion, Bird, Monkey, Robot, Cat, Dog, Mostak, Sagor, Rabiul',
         code:'Rafi appears\nMina appears\nLion appears'},
        {desc:'Any name works — the app draws a character for you',
         code:'SuperHero appears\nCow appears'},
      ]},
    { icon:'💬', title:'Speaking & narrator',
      items:[
        {desc:'Character speaks (turn on 🔊 Voice for English TTS in story mode)',
         code:'Rafi says "Good morning!"\nMina says "How are you?"'},
        {desc:'Narrator text at top of stage',
         code:'narrator says "Once upon a time in a big school..."'},
        {desc:'Say a variable (no quotes around the variable name)',
         code:'set greeting to "Welcome!"\nnarrator says greeting'},
      ]},
    { icon:'🎭', title:'Actions (story mode)',
      items:[
        {desc:'Single-word actions on a character',
         code:'Rafi waves\nMina smiles\nMonkey jumps\nBird flies\nRobot runs\nTeacher bows'},
        {desc:'Move left or right on stage',
         code:'Rafi moves right\nRafi moves right\nRafi moves left'},
        {desc:'Hide, show, cheer, dance, nod, handshake, flap',
         code:'Cat hides\nCat shows\nRafi cheers\nMina dances\nRafi nods\nRafi handshakes\nBird flaps'},
      ]},
    { icon:'⏸️', title:'Wait / pause',
      items:[
        {desc:'Pause the story for N seconds (max 8)',
         code:'wait 1 second\nwait 2 seconds'},
      ]},
    { icon:'📚', title:'Vocabulary cards',
      items:[
        {desc:'Show an English word + meaning (Bangla or any language)',
         code:'show word "brave" means "সাহসী"\nshow word "friend" means "বন্ধু"'},
      ]},
    { icon:'❓', title:'Quiz (multiple choice)',
      items:[
        {desc:'Ask a question, then add choices (one correct)',
         code:'ask "What colour is the sky?"\nchoice "Blue" correct\nchoice "Red" wrong\nchoice "Green" wrong'},
        {desc:'React after the player picks an answer',
         code:'if answer is correct\n    narrator says "Yes! Great job!"\nelse\n    narrator says "Try again next time."\nend'},
      ]},
    { icon:'🔀', title:'Story branching (choose)',
      items:[
        {desc:'Player picks a path (buttons on stage)',
         code:'choose "Go to the forest" or "Stay at school"'},
        {desc:'React with if — use the exact choice text',
         code:'if choice equals "Go to the forest"\n    narrator says "You found adventure!"\nelse\n    narrator says "You stayed safe at school."\nend'},
      ]},
    { icon:'📦', title:'Variables & types',
      items:[
        {desc:'Store text, numbers, true/false',
         code:'set name to "Rafi"\nset age to 10\nset ready to true'},
        {desc:'Math: plus, minus, times, divided by, remainder',
         code:'set total to 10 plus 5\nset half to 8 divided by 2\nset odd to 7 remainder 2'},
        {desc:'Join text with joined with',
         code:'set msg to "Hello" joined with " world"'},
        {desc:'Debug: show type or value in the log panel',
         code:'show type of age\nshow value of name'},
        {desc:'const — value cannot change later',
         code:'const maxScore to 100'},
      ]},
    { icon:'📋', title:'Lists',
      items:[
        {desc:'Create a list of items',
         code:'set colors to list "red" and "blue" and "green"'},
        {desc:'Read item by position (starts at 1, not 0)',
         code:'set first to item 1 in colors'},
        {desc:'Add, remove, length, empty, contains',
         code:'add "yellow" to colors\nremove item 2 from colors\nset n to length of colors\nif colors is empty\n    narrator says "No colors"\nend\nif "red" is in colors\n    narrator says "Found red"\nend'},
      ]},
    { icon:'🧠', title:'If, loops & logic',
      items:[
        {desc:'if / else with comparisons (equals, greater than, less than, and, or, not)',
         code:'if score is greater than 10\n    narrator says "High score!"\nelse\n    narrator says "Keep going!"\nend'},
        {desc:'repeat N times (1–100)',
         code:'repeat 3 times\n    Bird flies\n    Bird says "Tweet!"\nend'},
        {desc:'repeat while condition (stops when false)',
         code:'set n to 1\nrepeat while n is less than 4\n    set n to n plus 1\nend'},
        {desc:'for each item in a list',
         code:'for each color in colors\n    narrator says color\nend'},
        {desc:'break (stop loop) / continue (skip to next turn)',
         code:'repeat 5 times\n    if n equals 3\n        continue\n    end\nend'},
      ]},
    { icon:'⚙️', title:'Functions',
      items:[
        {desc:'Define once, call many times',
         code:'define waveHello\n    Rafi waves\n    Rafi says "Hello!"\nend\n\ncall waveHello'},
        {desc:'Parameters and return value',
         code:'define addNumbers with a and b\n    return a plus b\nend\nset x to call addNumbers with 3 and 7'},
      ]},
    { icon:'⌨️', title:'Ask the user (keyboard input)',
      items:[
        {desc:'Type an answer in the Output panel while the story runs',
         code:'ask user "What is your name?" as playerName\nnarrator says playerName'},
        {desc:'Or use built-in answer variable',
         code:'ask user "Favourite colour?"\nset colour to answer'},
      ]},
    { icon:'🎲', title:'Random numbers',
      items:[
        {desc:'Pick a random integer from A to B (inclusive)',
         code:'set dice to random number from 1 to 6\nnarrator says dice'},
      ]},
    { icon:'🏆', title:'Score & sounds (both modes)',
      items:[
        {desc:'Points counter (shown on screen in game mode too)',
         code:'score starts at 0\nadd 10 points\nshow score'},
        {desc:'Built-in sounds: success, clap, cheer, win, pop, gameover',
         code:'play sound "success"\nplay sound "cheer"\nplay sound "win"'},
        {desc:'Game score vs list add — different commands!',
         code:'add 10 points\n# NOT the same as:\nadd "apple" to fruits'},
      ]},
    { icon:'🎮', title:'Game — start & player',
      items:[
        {desc:'Step 1: Declare game mode + title',
         code:'game "My Platform Game"'},
        {desc:'Step 2: Side view (default) or top-down (4 directions, no jump/gravity)',
         code:'game view top'},
        {desc:'Step 3: Who you control + optional speed',
         code:'Rafi is player\nset Rafi speed to 4'},
        {desc:'Keys: arrows or WASD. Space = jump (side view). Mobile: touch pad on stage.',
         code:'# Arrow keys / WASD\n# Click Output stage once so keys work'},
      ]},
    { icon:'🕹️', title:'Game — move & jump',
      items:[
        {desc:'Movement must be INSIDE every frame (not at top level alone)',
         code:'every frame\n    if left key is held\n        move Rafi left by 4\n    end\n    if right key is held\n        move Rafi right by 4\n    end\nend'},
        {desc:'Top-down: add up and down',
         code:'every frame\n    if up key is held\n        move Mina up by 4\n    end\n    if down key is held\n        move Mina down by 4\n    end\nend'},
        {desc:'Jump once per space press (side view only)',
         code:'when space is pressed\n    Rafi jump with power 12\nend'},
        {desc:'while key is held (alternative to if inside every frame)',
         code:'while right key is held\n    move Rafi right by 4\nend'},
      ]},
    { icon:'🪙', title:'Game — coins, walls & spawn',
      items:[
        {desc:'Collect coins: top-level if touches (runs once per touch, not every frame)',
         code:'if Rafi touches coin\n    add 10 points\n    play sound "success"\n    remove coin\nend'},
        {desc:'Place your own coins in setup (before every frame)',
         code:'spawn coin at x 200 y 150\nspawn coin at x 400 y 280'},
        {desc:'Add a solid wall box (pixels)',
         code:'add wall at x 200 y 250 width 80 height 40'},
        {desc:'Side view: y ground puts enemy/player on the floor',
         code:'spawn Lion as enemy at x 350 y ground'},
        {desc:'Load a built-in map (walls + coins) — G7',
         code:'load map "school_maze"\n# Maps: school_maze, playground_extended, jungle_run, arena_coins'},
      ]},
    { icon:'❤️', title:'Game — lives, timer & win',
      items:[
        {desc:'Arcade HUD: hearts, countdown, coin goal (top-left on stage)',
         code:'lives start at 3\ntimer starts at 60\ngoal is collect 5 coins'},
        {desc:'Lose a heart when hit by danger',
         code:'if Rafi touches enemy\n    lose 1 life\n    play sound "wrong"\nend'},
        {desc:'Show a banner message on the HUD',
         code:'show message "Level 2!"'},
        {desc:'Event blocks (top level, same indent as every frame)',
         code:'when time is 0\n    show message "Time up!"\nend\n\nwhen lives is 0\n    show message "Game over"\nend\n\nwhen all coins collected\n    show message "Nice!"\nend'},
        {desc:'Win overlay appears automatically when goal is met',
         code:'goal is collect 3 coins\n# collect 3 coins → You Win!'},
      ]},
    { icon:'🦁', title:'Game — enemies & camera',
      items:[
        {desc:'Spawn a patrol enemy + set left/right bounds',
         code:'spawn Lion as enemy at x 350 y ground\nLion patrols between x 200 and x 500'},
        {desc:'Touch enemy → lose life (see Lives section)',
         code:'if Mina touches enemy\n    lose 1 life\nend'},
        {desc:'Camera follows player (side-scrolling feel)',
         code:'camera follows Rafi'},
        {desc:'Stop the game loop',
         code:'stop game'},
      ]},
    { icon:'🏁', title:'Game — full examples (copy & Run)',
      items:[
        {desc:'Platform starter — jump, move, collect coins',
         code:'game "Starter"\nscene "playground" with walls\nscore starts at 0\nRafi is player\n\nwhen space is pressed\n    Rafi jump with power 12\nend\n\nevery frame\n    if left key is held\n        move Rafi left by 4\n    end\n    if right key is held\n        move Rafi right by 4\n    end\nend\n\nif Rafi touches coin\n    add 10 points\n    play sound "success"\n    remove coin\nend'},
        {desc:'Coin Collector — top-down, 4 directions',
         code:'game "Coin Collector"\ngame view top\nscene "school" with walls\nscore starts at 0\nMina is player\nset Mina speed to 4\n\nevery frame\n    if left key is held\n        move Mina left by 4\n    end\n    if right key is held\n        move Mina right by 4\n    end\n    if up key is held\n        move Mina up by 4\n    end\n    if down key is held\n        move Mina down by 4\n    end\nend\n\nif Mina touches coin\n    add 15 points\n    play sound "cheer"\n    remove coin\nend'},
        {desc:'Coin Rush — timer + coin goal (arcade)',
         code:'game "Coin Rush"\ngame view top\nscene "school" with walls\ntimer starts at 45\ngoal is collect 5 coins\nMina is player\n\nevery frame\n    if left key is held\n        move Mina left by 5\n    end\n    if right key is held\n        move Mina right by 5\n    end\nend\n\nif Mina touches coin\n    add 10 points\n    remove coin\nend\n\nwhen time is 0\n    show message "Time is up!"\nend'},
        {desc:'Platform Escape — lives + enemy patrol',
         code:'game "Platform Escape"\nscene "playground" with walls\nlives start at 3\ngoal is collect 3 coins\nRafi is player\n\nspawn Lion as enemy at x 350 y ground\nLion patrols between x 250 and x 500\n\nwhen space is pressed\n    Rafi jump with power 13\nend\n\nevery frame\n    if right key is held\n        move Rafi right by 4\n    end\n    if left key is held\n        move Rafi left by 4\n    end\nend\n\nif Rafi touches coin\n    add 20 points\n    remove coin\nend\n\nif Rafi touches enemy\n    lose 1 life\nend'},
      ]},
    { icon:'🔧', title:'Game — tips & debug',
      items:[
        {desc:'Not moving? Put if key is held inside every frame. Click stage for focus.',
         code:'every frame\n    if left key is held\n        move Rafi left by 4\n    end\nend'},
        {desc:'Double points on coins? Put if touches at TOP level, not inside every frame.',
         code:'# Good (top level):\nif Rafi touches coin\n    add 10 points\n    remove coin\nend'},
        {desc:'Debug hitboxes: add ?gameDebug=1 to page URL, or in console: KiddyGameRuntime.debug = true',
         code:'# URL: index.html?gameDebug=1\n# Console: KiddyGameRuntime.debug = true'},
        {desc:'Publish & share: use Publish button to get a link others can open',
         code:'# Write game code → Run → Publish → copy link'},
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
      ['guide', 'lessons', 'tutorial', 'missions', 'saved', 'gallery', 'teacher', 'sync'].forEach(function (p) {
        var el = document.getElementById('panel-' + p);
        if (el) el.classList.toggle('d-none', p !== name);
      });
      document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.panel === name);
      });
      if (name === 'sync' && window.KiddyAuth && window.KiddyAuth.buildSyncPanel) {
        window.KiddyAuth.buildSyncPanel();
      }
      if (name === 'gallery' && window.KiddyGallery && window.KiddyGallery.buildPanel) {
        window.KiddyGallery.buildPanel();
      }
      if (name === 'lessons' && window.KiddyCurriculum && window.KiddyCurriculum.buildPanel) {
        window.KiddyCurriculum.buildPanel();
      }
      if (name === 'teacher' && window.KiddyTeacher && window.KiddyTeacher.buildPanel) {
        window.KiddyTeacher.buildPanel();
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
      html += '<div class="ss-guide-item" style="margin:0 0 12px;border-style:dashed;background:#f8fafc;">';
      html += '<div class="ss-guide-desc" style="font-weight:500;color:var(--kf-text);line-height:1.45;">';
      html += 'KiddyFun has two modes: <strong>Story</strong> (animated scenes, speech, quiz) and <strong>Game</strong> (keyboard / touch, coins, lives, timer). ';
      html += 'Tap a section › to expand. Use <strong>📋 Use this</strong> to paste code into the editor. For long lessons open <strong>Tutorial</strong> in the menu.';
      html += '</div></div>';
      GUIDE_SNIPPETS = [];
      GUIDE_SECTIONS.forEach(function(s, si) {
        html += '<div class="ss-guide-section' + (si === 0 ? ' open' : '') + '">';
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
      if (window.KiddySmartEditor && window.KiddySmartEditor.insertAtCursor) {
        KiddySmartEditor.insertAtCursor(snippet);
      } else {
        var pos = editor.selectionStart || editor.value.length;
        var prefix = editor.value.length > 0 && pos > 0 ? '\n' : '';
        var suffix = editor.value.length > 0 ? '\n' : '';
        editor.value = editor.value.slice(0, pos) + prefix + snippet + suffix + editor.value.slice(pos);
      }
      editor.focus();
      if (window.SpeakStorage) window.SpeakStorage.saveLastCode(editor.value);
      this.syncLineNumbers();
      if (window.KiddySmartEditor && window.KiddySmartEditor.refresh) KiddySmartEditor.refresh();
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
        if (window.KiddySmartEditor && window.KiddySmartEditor.notifyExternalChange) {
          KiddySmartEditor.notifyExternalChange();
        }
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
      names.sort(function (a, b) {
        var ta = programs[a].savedAt || '';
        var tb = programs[b].savedAt || '';
        return tb.localeCompare(ta);
      });
      names.forEach(function(name) {
        var savedAt = programs[name].savedAt;
        var dateHint = savedAt
          ? '<span class="ss-saved-date">' + escHtml(savedAt.slice(0, 10)) + '</span>'
          : '';
        html += '<div class="ss-saved-card">';
        html += '<div class="ss-saved-meta"><span class="ss-saved-name">📄 ' + escHtml(name) + '</span>' + dateHint + '</div>';
        html += '<div class="ss-saved-actions">';
        html += '<button type="button" class="ss-btn-mini ss-btn-load" data-saved-load="' + escHtml(name) + '">Load</button>';
        html += '<button type="button" class="ss-btn-mini" data-saved-rename="' + escHtml(name) + '" title="Rename">✏️</button>';
        html += '<button type="button" class="ss-btn-mini" data-saved-dup="' + escHtml(name) + '" title="Duplicate">📋</button>';
        html += '<button type="button" class="ss-btn-mini ss-btn-del" data-saved-delete="' + escHtml(name) + '">🗑</button>';
        html += '</div></div>';
      });
      el.innerHTML = html;
      if (!el._kfSavedBound) {
        el._kfSavedBound = true;
        el.addEventListener('click', function (e) {
          var loadBtn = e.target.closest('[data-saved-load]');
          if (loadBtn) {
            UI.loadSavedProgram(loadBtn.getAttribute('data-saved-load'));
            return;
          }
          var renameBtn = e.target.closest('[data-saved-rename]');
          if (renameBtn) {
            UI.renameSavedProgram(renameBtn.getAttribute('data-saved-rename'));
            return;
          }
          var dupBtn = e.target.closest('[data-saved-dup]');
          if (dupBtn) {
            UI.duplicateSavedProgram(dupBtn.getAttribute('data-saved-dup'));
            return;
          }
          var delBtn = e.target.closest('[data-saved-delete]');
          if (delBtn) UI.deleteSavedProgram(delBtn.getAttribute('data-saved-delete'));
        });
      }
    },

    renameSavedProgram: function (name) {
      var self = this;
      self.showPrompt('New name for this program:', name, {
        title: 'Rename program',
        icon: '✏️',
        okLabel: 'Rename',
      }).then(function (newName) {
        if (!newName || !newName.trim()) return;
        var res = window.SpeakStorage.renameProgram(name, newName.trim());
        if (!res.ok) {
          self.showAlert(res.error || 'Could not rename.', { title: 'Rename failed', icon: '⚠️' });
          return;
        }
        self.buildSavedPanel();
        self.showToast('✏️ Renamed to: ' + res.name);
      });
    },

    duplicateSavedProgram: function (name) {
      var res = window.SpeakStorage.duplicateProgram(name);
      if (!res.ok) {
        this.showAlert(res.error || 'Could not duplicate.', { title: 'Duplicate failed', icon: '⚠️' });
        return;
      }
      this.buildSavedPanel();
      this.showToast('📋 Duplicated as: ' + res.name);
    },

    loadSavedProgram: function(name) {
      var prog = window.SpeakStorage.loadAllPrograms()[name];
      if (!prog) return;
      var editor = document.getElementById('ss-editor');
      if (editor) {
        editor.value = prog.code;
        window.SpeakStorage.saveLastCode(prog.code);
        this.syncLineNumbers();
        if (window.KiddySmartEditor && window.KiddySmartEditor.notifyExternalChange) {
          KiddySmartEditor.notifyExternalChange();
        }
        editor.focus();
      }
      this.showToast('✅ Loaded: ' + name);
      this.closeLeftMenu();
      if (window.innerWidth < 992) {
        if (window.KiddyApp && window.KiddyApp.unlockMobileTab) {
          window.KiddyApp.unlockMobileTab();
        }
        if (window.KiddyApp && window.KiddyApp.setMobileTab) {
          window.KiddyApp.setMobileTab('code');
        }
      }
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

    /* ── Publish & share link ─────────────────────────────────────────── */
    publishProgram: function () {
      var self = this;
      var editor = document.getElementById('ss-editor');
      if (!editor || !editor.value.trim()) {
        self.showAlert('Write some code first!', { title: 'Nothing to publish', icon: '🔗' });
        return;
      }
      if (!window.KiddyPublish) {
        self.showAlert('Publish is not loaded. Refresh the page.', { title: 'Error', icon: '⚠️' });
        return;
      }

      self.showPrompt('Title for this shared program (optional):', 'My KiddyFun Program', {
        title: 'Publish & share',
        icon: '🔗',
        okLabel: 'Publish',
      }).then(function (title) {
        if (title === null) return;
        var useCloud = window.KiddyPublish && KiddyPublish.isCloudAvailable && KiddyPublish.isCloudAvailable();
        self.showToast(useCloud ? '☁️ Publishing to cloud…' : '🔗 Creating share link…');
        KiddyPublish.publish(editor.value, title)
          .then(function (res) {
            if (!res || !res.ok || !res.url) {
              self.showAlert(
                (res && res.error) || 'Could not create a share link.',
                { title: 'Publish failed', icon: '⚠️' }
              );
              return;
            }
            var hint = res.mode === 'cloud'
              ? 'Anyone with this link can open and run your program. Tap Copy link or select the URL below.'
              : 'This link contains your code. Share it with friends.';
            setTimeout(function () {
              self.showShareLink(res.url, hint, res.shareId);
            }, 80);
          })
          .catch(function (err) {
            console.error('[KiddyPublish]', err);
            self.showAlert(
              (err && err.message) || 'Something went wrong while publishing.',
              { title: 'Publish failed', icon: '⚠️' }
            );
          });
      });
    },

    showShareLink: function (url, hint, shareId) {
      if (!url) {
        this.showAlert('No link was generated.', { title: 'Publish', icon: '⚠️' });
        return Promise.resolve();
      }
      return this._openDialog({
        type: 'share',
        title: 'Share link ready!',
        message: hint || 'Copy and send this link to friends.',
        icon: '🔗',
        url: url,
        shareId: shareId,
        okLabel: 'Done',
      });
    },

    remixCode: function (code, title, shareId) {
      var header = '# Remix of "' + (title || 'Shared Program') + '"';
      if (shareId) header += ' (share: ' + shareId + ')';
      header += '\n# Edit and make it your own!\n\n';
      return header + (code || '');
    },

    loadSharedCode: function (code, title, autoRun, options) {
      options = options || {};
      var editor = document.getElementById('ss-editor');
      if (!editor || !code) return;
      var origTitle = title;
      if (options.remix) {
        code = this.remixCode(code, title, options.shareId);
        title = 'Remix of ' + (origTitle || 'Shared Program');
      }
      editor.value = code;
      if (window.SpeakStorage) SpeakStorage.saveLastCode(code);
      this.syncLineNumbers();
      if (window.KiddySmartEditor && window.KiddySmartEditor.notifyExternalChange) {
        KiddySmartEditor.notifyExternalChange();
      }
      this.showToast(options.remix
        ? '✨ Remix loaded — edit and save your version!'
        : '🔗 Loaded: ' + (title || 'Shared program'));
      if (options.remix) {
        var self = this;
        setTimeout(function () {
          self.showPrompt('Save your remix as:', 'Remix of ' + (origTitle || 'Program'), {
            title: 'Save remix',
            icon: '✨',
            okLabel: 'Save',
            cancelLabel: 'Later',
          }).then(function (saveName) {
            if (!saveName || !saveName.trim()) return;
            window.SpeakStorage.saveProgram(saveName.trim(), editor.value);
            self.buildSavedPanel();
            self.showToast('💾 Remix saved: ' + saveName.trim());
          });
        }, 600);
      }
      if (window.innerWidth < 992 && window.KiddyApp && window.KiddyApp.setMobileTab) {
        window.KiddyApp.setMobileTab(autoRun && !options.remix ? 'output' : 'code');
      }
      if (autoRun && !options.remix && window.KiddyApp && window.KiddyApp.runProgram) {
        setTimeout(function () { window.KiddyApp.runProgram(); }, 450);
      }
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
      if (window.KiddySmartEditor && window.KiddySmartEditor.notifyExternalChange) {
        KiddySmartEditor.notifyExternalChange();
      }
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
      var inputEl = document.getElementById('kf-dialog-input');
      if (inputEl) {
        inputEl.readOnly = false;
        inputEl.classList.remove('kf-share-url-input');
      }
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
        var isShare = config.type === 'share';
        if (inputEl) {
          if (isPrompt) {
            inputEl.classList.remove('d-none');
            inputEl.readOnly = false;
            inputEl.value = config.defaultValue || '';
          } else if (isShare) {
            inputEl.classList.remove('d-none');
            inputEl.classList.add('kf-share-url-input');
            inputEl.readOnly = true;
            inputEl.value = config.url || '';
          } else {
            inputEl.classList.add('d-none');
            inputEl.readOnly = false;
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
            if (config.type === 'share' && value === 'copy') {
              var link = config.url || (inputEl ? inputEl.value : '');
              if (window.KiddyPublish && link) {
                KiddyPublish.copyToClipboard(link).then(function (ok) {
                  self.showToast(ok ? '✅ Link copied!' : '⚠️ Select the link and copy manually');
                });
              }
              return;
            }
            if (config.type === 'share' && value === 'remixlink' && config.shareId) {
              var remixUrl = window.KiddyPublish.getRemixUrl(config.shareId);
              if (inputEl) inputEl.value = remixUrl;
              KiddyPublish.copyToClipboard(remixUrl).then(function (ok) {
                self.showToast(ok ? '✨ Remix link copied!' : '⚠️ Copy the remix link manually');
              });
              return;
            }
            if (config.type === 'share' && value === 'remixnow' && config.shareId) {
              self._closeDialog(true);
              KiddyPublish.loadFromShareId(config.shareId).then(function (res) {
                if (!res.ok) {
                  self.showAlert(res.error, { title: 'Remix failed', icon: '⚠️' });
                  return;
                }
                self.loadSharedCode(res.code, res.title, false, {
                  remix: true,
                  shareId: config.shareId,
                });
              });
              return;
            }
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
        } else if (config.type === 'share') {
          addBtn('Copy link', 'kf-dialog-btn-secondary', 'copy');
          if (config.shareId && window.KiddyPublish && KiddyPublish.getRemixUrl) {
            addBtn('Remix link', 'kf-dialog-btn-secondary', 'remixlink');
          }
          if (config.shareId) {
            addBtn('Remix now', 'kf-dialog-btn-secondary', 'remixnow');
          }
          addBtn(config.okLabel || 'Done', 'kf-dialog-btn-primary', true);
        }

        overlay.classList.remove('d-none');

        if (window.KiddyApp && window.KiddyApp.lockMobileTab && window.innerWidth < 992) {
          window.KiddyApp.lockMobileTab(isShare ? 'code' : 'output');
        }

        setTimeout(function () {
          if ((isPrompt || isShare) && inputEl) {
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
      if (window.KiddySmartEditor && window.KiddySmartEditor.updateGutter) {
        KiddySmartEditor.updateGutter();
        if (window.KiddySmartEditor.syncHighlight) KiddySmartEditor.syncHighlight();
        return;
      }
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
