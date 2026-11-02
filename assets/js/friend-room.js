/**
 * KiddyFun — invite-only friend rooms.
 * Chat mode: write a story on the left, watch avatars on the right.
 * Coding mode keeps the project that was open before the room.
 */
(function () {
  'use strict';

  var NICK_KEY = 'kf_room_nick';
  var REPLAY_LIMIT = 20;
  var ADJ = ['Sunny', 'Lucky', 'Happy', 'Brave', 'Tiny', 'Cosy', 'Swift', 'Jolly'];
  var ANIMALS = ['Panda', 'Fox', 'Cat', 'Duck', 'Otter', 'Bunny', 'Tiger', 'Koala'];
  var REACTIONS = [
    { kind: 'clap', emoji: '👏' },
    { kind: 'heart', emoji: '❤️' },
    { kind: 'laugh', emoji: '😄' },
    { kind: 'star', emoji: '⭐' },
  ];
  var ERROR_KEY = {
    empty: 'roomNeedCode',
    too_long: 'roomTooLong',
    parse: 'roomFixCode',
    game: 'roomStoryOnly',
    ask: 'roomStoryOnly',
    quiz: 'roomStoryOnly',
    choose: 'roomStoryOnly',
    repeat_while: 'roomStoryOnly',
  };

  var room = null;
  var myId = '';
  var myNick = '';
  var memberIds = {};
  var memberList = [];
  var messagesById = {};
  var seenPlay = {};
  var playQueue = [];
  var playing = false;
  var playGen = 0;
  var lastSenderId = '';
  var actorByUser = {};
  var channel = null;
  var busy = false;
  var sending = false;
  var nextSendAt = 0;
  var typingTimer = null;
  var typingSent = false;
  var fromTimer = null;
  var presenceTimer = null;
  var ignoredPresence = {};
  var presenceReady = false;
  var joinedFromUrl = false;
  var joinGen = 0;
  var channelGen = 0;
  var channelRetries = 0;
  var accessToken = '';
  var selfClose = false;
  var mounted = false;
  var dockPacked = false;
  var toggleHome = null;
  var codingBuffer = '';
  var chatBuffer = '';
  var codingView = 'text';
  var chatView = 'text';
  var codingStashed = false;

  function text(key, fallback) {
    if (window.KiddyLocale && KiddyLocale.text) return KiddyLocale.text(key, fallback);
    return fallback;
  }

  function toast(msg) {
    if (window.UI && UI.showToast) UI.showToast(msg);
  }

  function esc(s) {
    return String(s == null ? '' : s);
  }

  function inChat() {
    return document.body.classList.contains('kf-chat-mode');
  }

  function randomNick() {
    return ADJ[Math.floor(Math.random() * ADJ.length)] + ' ' +
      ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  }

  function nickname() {
    try {
      var saved = localStorage.getItem(NICK_KEY);
      if (saved && saved.trim()) return saved.trim().slice(0, 24);
    } catch (e) { /* ignore */ }
    var nick = randomNick();
    try { localStorage.setItem(NICK_KEY, nick); } catch (e2) { /* ignore */ }
    return nick;
  }

  function setNickname(value) {
    var nick = String(value || '').trim().slice(0, 24);
    if (!nick) nick = randomNick();
    try { localStorage.setItem(NICK_KEY, nick); } catch (e) { /* ignore */ }
    return nick;
  }

  function normalizeCode(raw) {
    return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  }

  function formatCode(raw) {
    var code = normalizeCode(raw);
    if (code.length <= 3) return code;
    return code.slice(0, 3) + '-' + code.slice(3);
  }

  function roomLink(code) {
    return window.location.origin + window.location.pathname + '?room=' + normalizeCode(code);
  }

  function asArray(value) {
    if (!value) return [];
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (e) { return []; }
    }
    return Object.prototype.toString.call(value) === '[object Array]' ? value : [];
  }

  function clientReady() {
    if (!window.KiddyCloud || !KiddyCloud.isConfigured()) return Promise.resolve(null);
    return KiddyCloud.init();
  }

  function ensureSession() {
    var ready = (window.KiddyAuth && KiddyAuth.whenReady) ? KiddyAuth.whenReady() : Promise.resolve();
    return ready.then(function () {
      return clientReady();
    }).then(function (client) {
      if (!client) return null;
      var existing = window.KiddyAuth && KiddyAuth.currentSession && KiddyAuth.currentSession();
      if (existing && existing.user) return existing;
      var nick = readNickInput();
      return client.auth.signInAnonymously({
        options: { data: { display_name: nick } },
      }).then(function (res) {
        if (res.error) throw res.error;
        return res.data && res.data.session;
      });
    });
  }

  function setJoinStatus(message, bad) {
    var el = $('kf-friend-status');
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('kf-friend-status-bad', !!bad);
  }

  function friendlyRpc(error) {
    var m = '';
    if (error && error.message) m = error.message;
    else m = String(error || '');
    if (m.indexOf('Room not found') !== -1) return text('roomNotFound', 'That room code does not match.');
    if (m.indexOf('full') !== -1) return text('roomFull', 'This room is full.');
    if (m.indexOf('Wait for a friend') !== -1) return text('roomWaitFriend', 'Wait for a friend to send.');
    if (m.indexOf('Slow down') !== -1) return text('roomSlow', 'Wait a moment, then send again.');
    if (m.indexOf('Too many') !== -1) return text('roomTooMany', 'Too many stories. Take a short break.');
    if (m.indexOf('party is over') !== -1) return text('roomClosed', 'This party is over.');
    if (m.indexOf('Not authenticated') !== -1 || m.indexOf('Sign in') !== -1) {
      return text('roomSignIn', 'Sign-in did not finish. Try again.');
    }
    if (m.indexOf('too large') !== -1) return text('roomTooLong', 'Make the story a little shorter.');
    if (m.indexOf('Only the host') !== -1) return text('roomHostOnly', 'Only the friend who made the room can close it.');
    if (m.indexOf('Failed to fetch') !== -1 || m.indexOf('NetworkError') !== -1 || m.indexOf('Load failed') !== -1) {
      return text('roomNetwork', 'The cloud did not answer. Check the internet and try again.');
    }
    if (m.indexOf('timeout') !== -1 || m.indexOf('AbortError') !== -1 || m.indexOf('aborted') !== -1) {
      return text('roomJoinTimeout', 'Joining took too long. Tap Join again.');
    }
    if (m.indexOf('Could not find the function') !== -1 || m.indexOf('schema cache') !== -1) {
      return text('roomSetup', 'Rooms are not switched on yet. Ask a grown-up to run the room setup.');
    }
    return text('roomFailed', 'That did not work. Try again.');
  }

  function checkMessage(code) {
    if (!window.KiddyRoomMessage) return { ok: false, error: 'parse' };
    return KiddyRoomMessage.check(code);
  }

  function explainCheck(result) {
    return text(ERROR_KEY[result.error] || 'roomFixCode', 'Fix the code, then send a short story.');
  }

  function $(id) { return document.getElementById(id); }

  function readNickInput() {
    var input = $('kf-friend-nick');
    var nick = setNickname(input ? input.value : nickname());
    if (input) input.value = nick;
    return nick;
  }

  function visibleView() {
    var blocks = $('btn-view-blocks');
    return blocks && blocks.classList.contains('active') ? 'blocks' : 'text';
  }

  function readEditor() {
    var editor = $('ss-editor');
    return editor ? editor.value : '';
  }

  function writeEditor(code) {
    var editor = $('ss-editor');
    if (!editor) return;
    editor.value = code || '';
    if (window.KiddySmartEditor && KiddySmartEditor.notifyExternalChange) {
      KiddySmartEditor.notifyExternalChange();
    } else if (window.UI && UI.syncLineNumbers) {
      UI.syncLineNumbers();
    }
  }

  function setViewSafe(view, persist) {
    if (window.KiddyBlocksMode && KiddyBlocksMode.setView) {
      KiddyBlocksMode.setView(view || 'text', persist);
    }
  }

  function stashCoding() {
    if (codingStashed) return;
    codingBuffer = readEditor();
    codingView = visibleView();
    codingStashed = true;
    document.body.classList.add('kf-chat-mode');
    writeEditor(chatBuffer);
    setViewSafe(chatView, false);
  }

  function restoreCoding() {
    if (!codingStashed) return;
    chatBuffer = readEditor();
    chatView = visibleView();
    codingStashed = false;
    document.body.classList.remove('kf-chat-mode');
    writeEditor(codingBuffer);
    setViewSafe(codingView, true);
  }

  function chatSource() {
    var code = readEditor();
    if (window.KiddySmartEditor && KiddySmartEditor.expandForRun) {
      code = KiddySmartEditor.expandForRun(code);
    }
    return String(code || '').trim();
  }

  function ensureSplit() {
    if (window.innerWidth < 992) return;
    var codeCol = $('code-col');
    if (codeCol && codeCol.classList.contains('d-none')) {
      var toggle = $('btn-toggle-code');
      if (toggle) toggle.click();
    }
    if (document.body.classList.contains('kf-editor-maximized')) {
      var maxBtn = $('btn-max-editor');
      if (maxBtn) maxBtn.click();
    }
  }

  function mountChatChrome() {
    if (mounted) return;
    var panel = document.querySelector('#code-col .kf-panel');
    var body = document.querySelector('#code-col .kf-panel-body');
    var workspace = $('workspace');
    if (!panel || !body || !workspace) return;
    mounted = true;
    var bar = $('kf-chat-bar');
    if (bar) panel.insertBefore(bar, panel.firstChild);
    var lobby = $('kf-friend-lobby');
    if (lobby) body.insertBefore(lobby, body.firstChild);
    var dock = document.createElement('div');
    dock.id = 'kf-chat-dock';
    dock.className = 'kf-chat-dock';
    body.appendChild(dock);
    var transcript = $('kf-chat-transcript');
    var composing = $('kf-friend-composing');
    if (transcript) body.insertBefore(transcript, dock);
    if (composing) body.insertBefore(composing, dock);
    placeTurnRow();
    var pill = $('kf-room-pill');
    var toolbar = document.querySelector('#code-col .kf-editor-toolbar');
    if (pill && toolbar) toolbar.appendChild(pill);
  }

  function placeTurnRow() {
    var turn = $('kf-chat-turn');
    if (!turn) return;
    var tabs = $('mobile-tabs');
    var panel = document.querySelector('#code-col .kf-panel');
    var workspace = $('workspace');
    if (window.innerWidth < 992) {
      if (tabs && tabs.parentNode) tabs.insertAdjacentElement('afterend', turn);
      else if (workspace) workspace.insertBefore(turn, workspace.firstChild);
      return;
    }
    if (panel) panel.insertBefore(turn, panel.firstChild);
  }

  function packDock() {
    if (dockPacked) return;
    var body = document.querySelector('#code-col .kf-panel-body');
    var dock = $('kf-chat-dock');
    var wrap = document.querySelector('#code-col .kf-editor-wrap');
    var runRow = $('kf-run-row');
    if (!body || !dock || !wrap || !runRow) return;
    var toggle = document.querySelector('#code-col .kf-view-toggle');
    var starters = $('kf-chat-starters');
    var status = $('kf-status-bar');
    var err = $('ss-error-panel');
    var editor = $('ss-editor');
    if (starters) dock.appendChild(starters);
    if (toggle) {
      toggleHome = toggle.parentNode;
      dock.appendChild(toggle);
    }
    dock.appendChild(wrap);
    if (status) dock.appendChild(status);
    dock.appendChild(runRow);
    if (err) dock.appendChild(err);
    if (editor) editor.setAttribute('wrap', 'soft');
    body.appendChild(dock);
    dockPacked = true;
  }

  function unpackDock() {
    if (!dockPacked) return;
    var body = document.querySelector('#code-col .kf-panel-body');
    var toggle = document.querySelector('#code-col .kf-view-toggle');
    var wrap = document.querySelector('#code-col .kf-editor-wrap');
    var editor = $('ss-editor');
    if (toggle && toggleHome) toggleHome.appendChild(toggle);
    if (body && wrap) {
      var lobby = $('kf-friend-lobby');
      if (lobby && lobby.parentNode === body) body.insertBefore(wrap, lobby.nextSibling);
      else body.insertBefore(wrap, body.firstChild);
    }
    if (body) {
      var status = $('kf-status-bar');
      var runRow = $('kf-run-row');
      var err = $('ss-error-panel');
      if (status) body.appendChild(status);
      if (runRow) body.appendChild(runRow);
      if (err) body.appendChild(err);
    }
    if (editor) editor.setAttribute('wrap', 'off');
    dockPacked = false;
  }

  function showStageHint(on) {
    var stage = $('ss-stage');
    if (!stage) return;
    var hint = $('kf-stage-hint');
    if (!on) {
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
      return;
    }
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'kf-stage-hint';
      hint.className = 'kf-stage-hint';
      stage.appendChild(hint);
    }
    hint.textContent = text('roomStageHint', 'Friends appear here');
  }

  function enterChatMode() {
    if (!inChat()) stashCoding();
    document.body.classList.remove('kf-friends-open');
    ensureSplit();
    mountChatChrome();
    packDock();
    placeTurnRow();
    if (window.KiddyBlocksMode && KiddyBlocksMode.setChatMode) KiddyBlocksMode.setChatMode(true);
    if (room) document.body.classList.remove('kf-chat-lobby');
    else {
      document.body.classList.add('kf-chat-lobby');
      prepareLobby();
    }
    if (window.innerWidth < 992 && window.KiddyApp && KiddyApp.setMobileTab) {
      KiddyApp.setMobileTab('code');
    }
    var menu = $('leftMenu');
    if (menu && window.bootstrap && bootstrap.Offcanvas) {
      var inst = bootstrap.Offcanvas.getInstance(menu);
      if (inst) inst.hide();
    }
    refreshLabels();
    applyTurnLock();
    updateRoomPill();
  }

  function exitToCoding() {
    if (!inChat()) return;
    unpackDock();
    playGen += 1;
    playing = false;
    restoreCoding();
    document.body.classList.remove('kf-chat-lobby', 'kf-chat-locked');
    var editor = $('ss-editor');
    if (editor) editor.readOnly = false;
    var runBtn = $('btn-run');
    if (runBtn) runBtn.disabled = false;
    if (window.KiddyBlocksMode && KiddyBlocksMode.setChatMode) KiddyBlocksMode.setChatMode(false);
    showStageHint(false);
    if (window.KiddyApp && KiddyApp.resetStage) KiddyApp.resetStage();
    updateRoomPill();
    refreshLabels();
    toast(text('roomBackToCoding', 'Back to coding'));
  }

  function open() {
    var was = inChat();
    enterChatMode();
    if (room) {
      showStageHint(false);
      if (!was) {
        if (window.KiddyApp && KiddyApp.resetStage) KiddyApp.resetStage();
        spawnMemberAvatars();
        drainQueue();
      }
      return;
    }
    if (!was) {
      if (window.KiddyApp && KiddyApp.resetStage) KiddyApp.resetStage();
      showStageHint(true);
    }
  }

  function showOffline(kind) {
    var form = $('kf-friend-lobby-form');
    var off = $('kf-friend-offline');
    if (form) form.classList.add('d-none');
    if (off) off.classList.remove('d-none');
    var note = $('kf-friend-offline-text');
    if (note) {
      note.textContent = kind === 'library'
        ? text('roomLibrary', 'The cloud library did not load. Refresh the page.')
        : text('roomCloudOff', 'Ask a grown-up to turn on the cloud. Then friends can join the same room.');
    }
  }

  function showLobby() {
    var form = $('kf-friend-lobby-form');
    var off = $('kf-friend-offline');
    if (off) off.classList.add('d-none');
    if (form) form.classList.remove('d-none');
    var input = $('kf-friend-nick');
    if (input && !input.value) input.value = nickname();
  }

  function prepareLobby() {
    if (room) return;
    if (!window.KiddyCloud || !KiddyCloud.isConfigured()) {
      showOffline('off');
      return;
    }
    clientReady().then(function (client) {
      if (room || busy) return;
      if (!client) showOffline('library');
      else showLobby();
    });
  }

  function hoursLabel(iso) {
    var ms = new Date(iso).getTime() - Date.now();
    var h = Math.max(1, Math.round(ms / 3600000));
    return text('roomUntil', 'Open for about {n} hours').replace('{n}', String(h));
  }

  function isHost() {
    return !!(room && myId && String(room.hostId) === String(myId));
  }

  function turnApi() {
    return window.KiddyRoomTurn || null;
  }

  function usedActorNames() {
    var used = {};
    Object.keys(actorByUser).forEach(function (id) {
      var info = actorByUser[id];
      if (info && info.name) used[info.name.toLowerCase()] = true;
    });
    return used;
  }

  function actorFor(userId, nicknameValue) {
    var id = String(userId || '');
    if (!id) id = 'guest';
    if (actorByUser[id]) {
      if (nicknameValue) actorByUser[id].label = nicknameValue;
      return actorByUser[id];
    }
    var api = turnApi();
    var name = api ? api.actorName(nicknameValue, usedActorNames()) : 'Friend';
    var color = api ? api.colorFor(id) : '#3f51b5';
    actorByUser[id] = { name: name, label: nicknameValue || name, color: color };
    return actorByUser[id];
  }

  function myActorName() {
    return actorFor(myId || 'me', myNick || 'Friend').name;
  }

  function paintActor(info) {
    if (!info) return;
    var stage = $('ss-stage');
    if (!stage) return;
    var el = stage.querySelector('.ss-character[data-key="' + info.name.toLowerCase() + '"]');
    if (!el) return;
    var label = el.querySelector('.ss-char-label');
    if (label) {
      label.textContent = info.label;
      label.style.color = info.color;
    }
  }

  function spawnMemberAvatars() {
    if (!inChat() || !room || !window.SpeakRuntime || !SpeakRuntime.characterAppears) return;
    var stage = $('ss-stage');
    memberList.forEach(function (m) {
      if (!m || !m.user_id) return;
      var info = actorFor(m.user_id, m.nickname);
      var key = info.name.toLowerCase();
      var existing = stage && stage.querySelector('.ss-character[data-key="' + key + '"]');
      if (!existing) SpeakRuntime.characterAppears(info.name);
      paintActor(info);
    });
  }

  function applyMembers(list) {
    memberList = asArray(list);
    memberIds = {};
    memberList.forEach(function (m) {
      if (m && m.user_id) memberIds[String(m.user_id)] = m.nickname || 'Friend';
    });
    if (myId) memberIds[String(myId)] = myNick || memberIds[String(myId)] || 'Friend';
    applyTurnLock();
  }

  function waitingName() {
    var others = memberList.filter(function (m) {
      return m && String(m.user_id) !== String(myId);
    });
    if (others.length === 1) return others[0].nickname || 'Friend';
    return text('roomAFriend', 'a friend');
  }

  function myTurn() {
    var api = turnApi();
    if (!api) return true;
    return api.canSend(lastSenderId, myId, memberList.length);
  }

  function renderPeople() {
    var box = $('kf-chat-people');
    if (!box) return;
    box.textContent = '';
    var online = {};
    if (presenceReady) {
      presenceList().forEach(function (m) { online[String(m.user_id)] = true; });
    }
    var seen = {};
    memberList.forEach(function (m) {
      var id = String(m.user_id || '');
      if (!id || seen[id]) return;
      seen[id] = true;
      var info = actorFor(id, m.nickname);
      var away = presenceReady && !online[id];
      var chip = document.createElement('span');
      chip.className = 'kf-room-person' + (away ? ' kf-room-person-away' : '');
      chip.style.boxShadow = 'inset 0 0 0 2px ' + info.color;
      chip.textContent = (m.nickname || info.label) + (away ? ' · ' + text('roomLeftChip', 'left') : '');
      box.appendChild(chip);
    });
  }

  function presenceList() {
    if (!channel || !channel.presenceState) return [];
    var state = channel.presenceState() || {};
    var list = [];
    Object.keys(state).forEach(function (key) {
      var metas = state[key] || [];
      var meta = metas[0] || {};
      var id = String(meta.user_id || key);
      list.push({ user_id: id, nickname: meta.nickname || memberIds[id] || 'Friend' });
    });
    return list;
  }

  function onPresence() {
    var unknown = [];
    presenceList().forEach(function (m) {
      var id = String(m.user_id);
      if (!memberIds[id] && !ignoredPresence[id]) unknown.push(id);
    });
    if (!unknown.length) {
      renderPeople();
      spawnMemberAvatars();
      return;
    }
    if (presenceTimer) return;
    presenceTimer = setTimeout(function () {
      presenceTimer = null;
      refreshMembers().then(function () {
        unknown.forEach(function (id) {
          if (!memberIds[id]) ignoredPresence[id] = true;
        });
        renderPeople();
        spawnMemberAvatars();
      });
    }, 400);
  }

  function fillLiveChrome() {
    var codeEl = $('kf-chat-code');
    if (codeEl) {
      var shown = formatCode(room.code);
      codeEl.textContent = shown;
      codeEl.setAttribute('aria-label', text('roomCopyCode', 'Copy code') + ' ' + shown);
    }
    var until = $('kf-chat-until');
    if (until) until.textContent = hoursLabel(room.expires);
    var you = $('kf-chat-you');
    if (you) you.textContent = text('roomYou', 'You are') + ' ' + myNick;
    var closeBtn = $('kf-chat-close');
    if (closeBtn) closeBtn.classList.toggle('d-none', !isHost());
    renderPeople();
    updateRoomPill();
  }

  function clearTranscript() {
    messagesById = {};
    var list = $('kf-chat-transcript');
    if (list) list.textContent = '';
  }

  function appendTranscript(row) {
    var list = $('kf-chat-transcript');
    if (!list || !row) return;
    var info = actorFor(row.sender_id, row.nickname);
    var result = checkMessage(row.code || '');
    var line = (result.ok && result.preview) ? result.preview : text('roomStoryCard', 'A little story');
    var bubble = document.createElement('div');
    bubble.className = 'kf-chat-bubble';
    if (myId && String(row.sender_id) === String(myId)) bubble.classList.add('kf-chat-bubble-mine');
    bubble.style.borderColor = info.color;
    var who = document.createElement('span');
    who.className = 'kf-chat-bubble-who';
    who.style.color = info.color;
    who.textContent = row.nickname || info.label;
    var msg = document.createElement('span');
    msg.className = 'kf-chat-bubble-line';
    msg.textContent = line;
    bubble.appendChild(who);
    bubble.appendChild(msg);
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  }

  function updateRoomPill() {
    var pill = $('kf-room-pill');
    if (!pill) return;
    var show = !!(room && !inChat());
    pill.classList.toggle('d-none', !show);
    var label = $('kf-room-pill-text');
    if (label && room) {
      label.textContent = text('roomPill', 'In a room · {code}').replace('{code}', formatCode(room.code));
    }
    var badge = $('kf-room-pill-badge');
    if (!badge) return;
    var waiting = playQueue.length;
    if (show && waiting > 0) {
      badge.textContent = String(waiting);
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  }

  function clearBubbles() {
    var stage = $('ss-stage');
    if (!stage) return;
    var nodes = stage.querySelectorAll('.kf-pro-bubble');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  function queueRow(row) {
    if (!row || row.id == null) return;
    var id = String(row.id);
    if (seenPlay[id]) return;
    seenPlay[id] = true;
    playQueue.push(row);
    updateRoomPill();
    drainQueue();
  }

  function drainQueue() {
    if (playing || !inChat()) return;
    var row = playQueue[0];
    if (!row) {
      updateRoomPill();
      spawnMemberAvatars();
      return;
    }
    var result = checkMessage(row.code || '');
    if (!result.ok) {
      playQueue.shift();
      updateRoomPill();
      drainQueue();
      return;
    }
    playing = true;
    var gen = playGen;
    clearBubbles();
    showFrom(row.nickname);
    var job = Promise.resolve();
    if (window.KiddyApp && KiddyApp.runSource) {
      job = KiddyApp.runSource(row.code, { fromFriend: true, award: false, chat: true }) || Promise.resolve();
    }
    Promise.resolve(job).then(function () {
      if (gen !== playGen) return;
      if (playQueue[0] === row) playQueue.shift();
      playing = false;
      spawnMemberAvatars();
      updateRoomPill();
      drainQueue();
    }, function () {
      if (gen !== playGen) return;
      if (playQueue[0] === row) playQueue.shift();
      playing = false;
      updateRoomPill();
      drainQueue();
    });
  }

  function loadHistory(messages, replayTail) {
    messages = asArray(messages);
    var i;
    for (i = 0; i < messages.length; i++) {
      var row = messages[i];
      if (!row || row.id == null) continue;
      var id = String(row.id);
      if (!messagesById[id]) {
        messagesById[id] = row;
        appendTranscript(row);
      }
    }
    var last = messages.length ? messages[messages.length - 1] : null;
    if (last && last.sender_id) lastSenderId = String(last.sender_id);
    else lastSenderId = '';
    applyTurnLock();
    var start = replayTail ? Math.max(0, messages.length - replayTail) : messages.length;
    for (i = 0; i < start; i++) {
      if (messages[i] && messages[i].id != null) seenPlay[String(messages[i].id)] = true;
    }
    for (i = start; i < messages.length; i++) queueRow(messages[i]);
  }

  function onIncoming(row) {
    if (!row || row.id == null) return;
    var id = String(row.id);
    if (!messagesById[id]) {
      messagesById[id] = row;
      appendTranscript(row);
    }
    if (row.sender_id) lastSenderId = String(row.sender_id);
    applyTurnLock();
    queueRow(row);
  }

  function showFrom(name) {
    var el = $('kf-room-from');
    if (!el) return;
    el.textContent = text('roomFrom', 'From') + ' ' + esc(name || 'Friend');
    el.classList.remove('d-none');
    clearTimeout(fromTimer);
    fromTimer = setTimeout(function () { el.classList.add('d-none'); }, 4000);
  }

  function applyTurnLock() {
    var locked = !!(room && inChat() && !myTurn());
    document.body.classList.toggle('kf-chat-locked', locked);
    var editor = $('ss-editor');
    if (editor) editor.readOnly = locked;
    var runBtn = $('btn-run');
    if (runBtn && inChat() && room) runBtn.disabled = locked;
    else if (runBtn && !inChat()) runBtn.disabled = false;
    var badge = $('kf-chat-turn-text');
    if (badge) {
      if (!room || !inChat()) badge.textContent = '';
      else if (!locked) badge.textContent = text('roomYourTurn', 'Your turn');
      else badge.textContent = text('roomWaitTurn', 'Waiting for {name}…').replace('{name}', waitingName());
    }
    if (window.KiddyBlocksMode && KiddyBlocksMode.setChatMode && inChat()) {
      KiddyBlocksMode.setChatMode(true);
    }
    renderPeople();
  }

  function closeChannel() {
    typingSent = false;
    clearTimeout(typingTimer);
    presenceReady = false;
    var client = window.KiddyCloud && KiddyCloud.getClient && KiddyCloud.getClient();
    if (channel && client && client.removeChannel) client.removeChannel(channel);
    channel = null;
  }

  function broadcast(event, payload) {
    if (!channel || !channel.send) return;
    channel.send({ type: 'broadcast', event: event, payload: payload || {} });
  }

  function authRealtime(client) {
    var session = window.KiddyAuth && KiddyAuth.currentSession && KiddyAuth.currentSession();
    var token = (session && session.access_token) || accessToken;
    if (!token || !client || !client.realtime || !client.realtime.setAuth) return;
    try { client.realtime.setAuth(token); } catch (e) { /* subscribe retries */ }
  }

  function catchUp(roomId) {
    var nick = myNick;
    clientReady().then(function (client) {
      if (!client || !room || String(room.id) !== String(roomId)) return null;
      authRealtime(client);
      return client.rpc('join_friend_room', { p_code: room.code, p_nickname: nick });
    }).then(function (res) {
      if (!res || res.error || !res.data || !room || String(room.id) !== String(roomId)) return;
      applyMembers(res.data.members);
      asArray(res.data.messages).forEach(function (row) { onIncoming(row); });
      spawnMemberAvatars();
    }).catch(function () { /* the live insert still arrives */ });
  }

  function subscribe(roomId) {
    var gen = ++channelGen;
    closeChannel();
    var client = window.KiddyCloud && KiddyCloud.getClient && KiddyCloud.getClient();
    if (!client || !client.channel) return;
    authRealtime(client);
    channel = client.channel('room:' + roomId, {
      config: { presence: { key: myId || roomId } },
    });
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'room_messages',
      filter: 'room_id=eq.' + roomId,
    }, function (payload) {
      if (gen !== channelGen) return;
      onIncoming(payload.new);
    });
    channel.on('broadcast', { event: 'composing' }, function (msg) {
      var p = (msg && msg.payload) || {};
      var id = String(p.user_id || '');
      if (!id || id === String(myId) || !memberIds[id]) return;
      var line = $('kf-friend-composing');
      if (!line) return;
      if (p.active) line.textContent = (p.nickname || 'Friend') + ' ' + text('roomTyping', 'is making a story…');
      else if (line.textContent.indexOf(p.nickname || '') === 0) line.textContent = '';
    });
    channel.on('broadcast', { event: 'reaction' }, function (msg) {
      var p = (msg && msg.payload) || {};
      if (!p.user_id || String(p.user_id) === String(myId)) return;
      if (!memberIds[String(p.user_id)]) return;
      burst(p.kind);
    });
    channel.on('broadcast', { event: 'closed' }, function () {
      if (selfClose || !room) return;
      exitRoom(true);
    });
    channel.on('presence', { event: 'sync' }, onPresence);
    channel.subscribe(function (status) {
      if (gen !== channelGen || !room || String(room.id) !== String(roomId)) return;
      if (status === 'SUBSCRIBED' && channel) {
        channelRetries = 0;
        presenceReady = true;
        channel.track({ user_id: myId, nickname: myNick });
        renderPeople();
        catchUp(roomId);
        return;
      }
      if (channelRetries >= 1) return;
      if (status !== 'CHANNEL_ERROR' && status !== 'TIMED_OUT' && status !== 'CLOSED') return;
      channelRetries += 1;
      setTimeout(function () {
        if (gen !== channelGen || !room || String(room.id) !== String(roomId)) return;
        subscribe(roomId);
      }, 800);
    });
  }

  function resetPlayState() {
    playGen += 1;
    playing = false;
    playQueue = [];
    seenPlay = {};
    lastSenderId = '';
    actorByUser = {};
    clearTranscript();
    updateRoomPill();
  }

  function enterFresh(data, session) {
    selfClose = false;
    closeChannel();
    resetPlayState();
    ignoredPresence = {};
    presenceReady = false;
    myId = session && session.user ? session.user.id : '';
    accessToken = (session && session.access_token) || accessToken;
    myNick = data.nickname || readNickInput();
    room = {
      id: data.room_id,
      code: data.code,
      hostId: data.host_id,
      expires: data.expires_at,
    };
    applyMembers(data.members);
    enterChatMode();
    if (window.KiddyApp && KiddyApp.resetStage) KiddyApp.resetStage();
    showStageHint(false);
    fillLiveChrome();
    spawnMemberAvatars();
    loadHistory(data.messages, REPLAY_LIMIT);
    channelRetries = 0;
    subscribe(room.id);
    if (window.innerWidth < 992 && window.KiddyApp && KiddyApp.setMobileTab) {
      KiddyApp.setMobileTab('output');
    }
  }

  function refreshMembers() {
    if (!room) return Promise.resolve();
    return clientReady().then(function (client) {
      if (!client || !room) return null;
      return client.rpc('join_friend_room', { p_code: room.code, p_nickname: myNick });
    }).then(function (res) {
      if (!res || res.error || !res.data) return;
      applyMembers(res.data.members);
      spawnMemberAvatars();
    }).catch(function () { /* presence can retry */ });
  }

  function copyText(value) {
    var done = text('roomCopied', 'Copied');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { toast(done); }, function () {
        fallbackCopy(value, done);
      });
      return;
    }
    fallbackCopy(value, done);
  }

  function fallbackCopy(value, done) {
    var ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast(done);
    } catch (e) {
      toast(value);
    }
    ta.remove();
  }

  function clearDraft() {
    chatBuffer = '';
    writeEditor('');
    if (visibleView() === 'blocks' && window.KiddyBlocksMode && KiddyBlocksMode.reloadFromEditor) {
      KiddyBlocksMode.reloadFromEditor();
    }
  }

  function starterCode(kind) {
    var actor = myActorName();
    var scenes = { hello: 'school', wave: 'park', dance: 'party', scene: 'beach' };
    var lines = { hello: 'Hello!', wave: 'Hi friends!', dance: "Let's dance!", scene: 'Come see this!' };
    var actions = { hello: 'waves', wave: 'waves', dance: 'dances', scene: 'smiles' };
    var scene = scenes[kind] || 'school';
    var say = lines[kind] || 'Hello!';
    var action = actions[kind] || 'waves';
    return 'scene "' + scene + '"\n' + actor + ' appears\n' + actor + ' says "' + say + '"\n' + actor + ' ' + action;
  }

  function applyDraft(code) {
    chatBuffer = code;
    writeEditor(code);
    if (visibleView() === 'blocks' && window.KiddyBlocksMode && KiddyBlocksMode.reloadFromEditor) {
      KiddyBlocksMode.reloadFromEditor();
    }
    var editor = $('ss-editor');
    if (editor && !editor.readOnly) editor.focus();
  }

  function sendCurrent() {
    if (!inChat()) return;
    if (!room) {
      toast(text('roomJoinFirst', 'Join a room first.'));
      open();
      return;
    }
    if (!myTurn()) {
      toast(text('roomWaitFriend', 'Wait for a friend to send.'));
      return;
    }
    sendStory(chatSource());
  }

  function sendStory(code) {
    if (!room) {
      toast(text('roomJoinFirst', 'Join a room first.'));
      open();
      return;
    }
    var result = checkMessage(code);
    if (!result.ok) {
      toast(explainCheck(result));
      return;
    }
    if (!myTurn()) {
      toast(text('roomWaitFriend', 'Wait for a friend to send.'));
      return;
    }
    if (sending || Date.now() < nextSendAt) {
      toast(text('roomSlow', 'Wait a moment, then send again.'));
      return;
    }
    sending = true;
    nextSendAt = Date.now() + 3000;
    ensureSession().then(function () {
      return clientReady();
    }).then(function (client) {
      if (!client) throw new Error('cloud');
      return client.rpc('send_room_message', { p_room_id: room.id, p_code: code });
    }).then(function (res) {
      if (res.error) throw res.error;
      onIncoming(res.data);
      clearDraft();
      if (window.innerWidth < 992 && window.KiddyApp && KiddyApp.setMobileTab) {
        KiddyApp.setMobileTab('output');
      }
    }).catch(function (e) {
      nextSendAt = 0;
      var raw = (e && e.message) || '';
      toast(raw === 'cloud' ? text('roomCloudOff', 'Ask a grown-up to turn on the cloud.') : friendlyRpc(e));
      if (raw.indexOf('party is over') !== -1) exitRoom(true);
      applyTurnLock();
    }).then(function () {
      sending = false;
    });
  }

  function makeRoom() {
    if (busy) return;
    busy = true;
    var nick = readNickInput();
    ensureSession().then(function (session) {
      if (!session) {
        showOffline('off');
        return null;
      }
      return clientReady().then(function (client) {
        if (!client) {
          showOffline('library');
          return null;
        }
        return client.rpc('create_friend_room', { p_nickname: nick }).then(function (res) {
          if (res.error) throw res.error;
          enterFresh(res.data, session);
          toast(text('roomMade', 'Room is ready. Share the code.'));
        });
      });
    }).catch(function (e) {
      toast(friendlyRpc(e));
    }).then(function () {
      busy = false;
    });
  }

  function joinRoom(raw) {
    var code = normalizeCode(raw);
    if (code.length !== 6) {
      setJoinStatus(text('roomNotFound', 'That room code does not match.'), true);
      toast(text('roomNotFound', 'That room code does not match.'));
      return;
    }
    if (room && normalizeCode(room.code) === code) {
      open();
      return;
    }
    if (busy) {
      setJoinStatus(text('roomWorking', 'Still connecting…'), false);
      return;
    }
    var myJoin = ++joinGen;
    busy = true;
    setJoinStatus(text('roomJoining', 'Joining…'), false);
    var joinBtn = $('kf-friend-join');
    if (joinBtn) joinBtn.disabled = true;
    var nick = readNickInput();
    var gaveUp = false;
    var timer = setTimeout(function () {
      if (myJoin !== joinGen || (room && normalizeCode(room.code) === code)) return;
      gaveUp = true;
      busy = false;
      if (joinBtn) joinBtn.disabled = false;
      var msg = text('roomJoinTimeout', 'Joining took too long. Tap Join again.');
      setJoinStatus(msg, true);
      toast(msg);
    }, 15000);
    ensureSession().then(function (session) {
      if (myJoin !== joinGen) return null;
      if (!session) {
        showOffline('off');
        return null;
      }
      return clientReady().then(function (client) {
        if (myJoin !== joinGen) return null;
        if (!client) {
          showOffline('library');
          return null;
        }
        return client.rpc('join_friend_room', { p_code: code, p_nickname: nick }).then(function (res) {
          if (myJoin !== joinGen) return;
          if (res.error) throw res.error;
          if (!res.data || !res.data.room_id) throw new Error('Room not found');
          enterFresh(res.data, session);
          setJoinStatus('', false);
          toast(text('roomJoined', 'You are in. Send a story!'));
        });
      });
    }).catch(function (e) {
      if (myJoin !== joinGen || gaveUp || (room && normalizeCode(room.code) === code)) return;
      console.warn('[KiddyRoom] join', e);
      var msg = friendlyRpc(e);
      setJoinStatus(msg, true);
      toast(msg);
    }).then(function () {
      if (myJoin !== joinGen) return;
      clearTimeout(timer);
      if (gaveUp && !(room && normalizeCode(room.code) === code)) return;
      busy = false;
      if (joinBtn) joinBtn.disabled = false;
    });
  }

  function exitRoom(remote) {
    selfClose = false;
    closeChannel();
    resetPlayState();
    room = null;
    memberIds = {};
    memberList = [];
    var line = $('kf-friend-composing');
    if (line) line.textContent = '';
    if (inChat()) {
      document.body.classList.add('kf-chat-lobby');
      showLobby();
      if (window.KiddyApp && KiddyApp.resetStage) KiddyApp.resetStage();
      showStageHint(true);
      if (window.innerWidth < 992 && window.KiddyApp && KiddyApp.setMobileTab) {
        KiddyApp.setMobileTab('code');
      }
    }
    applyTurnLock();
    updateRoomPill();
    refreshLabels();
    if (remote) toast(text('roomClosed', 'This party is over.'));
  }

  function leaveRoom() {
    if (!room || busy) return;
    var id = room.id;
    var host = isHost();
    busy = true;
    selfClose = true;
    if (host) broadcast('closed', {});
    clientReady().then(function (client) {
      if (!client) return null;
      return client.rpc('leave_friend_room', { p_room_id: id });
    }).catch(function () { /* still leave the screen */ }).then(function () {
      busy = false;
      exitRoom(false);
      toast(text('roomLeft', 'You left the room.'));
    });
  }

  function closeRoom() {
    if (!room || !isHost() || busy) return;
    var id = room.id;
    busy = true;
    selfClose = true;
    broadcast('closed', {});
    clientReady().then(function (client) {
      if (!client) return null;
      return client.rpc('close_friend_room', { p_room_id: id });
    }).then(function (res) {
      if (res && res.error) throw res.error;
      exitRoom(false);
      toast(text('roomClosed', 'This party is over.'));
    }).catch(function (e) {
      toast(friendlyRpc(e));
    }).then(function () {
      busy = false;
    });
  }

  function burst(kind) {
    var wrap = document.querySelector('.kf-stage-wrap');
    if (!wrap) return;
    var emoji = '⭐';
    for (var i = 0; i < REACTIONS.length; i++) {
      if (REACTIONS[i].kind === kind) emoji = REACTIONS[i].emoji;
    }
    var el = document.createElement('div');
    el.className = 'kf-room-burst';
    el.textContent = emoji;
    el.style.left = (18 + Math.random() * 60) + '%';
    el.style.top = (28 + Math.random() * 36) + '%';
    wrap.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
  }

  function noteTyping() {
    if (!room || !channel || !inChat() || !myTurn()) return;
    if (!typingSent) {
      typingSent = true;
      broadcast('composing', { user_id: myId, nickname: myNick, active: true });
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      typingSent = false;
      broadcast('composing', { user_id: myId, nickname: myNick, active: false });
    }, 1600);
  }

  function syncMobileTabs() {
    var chat = inChat();
    var friendsBtn = $('tab-friends-btn');
    if (friendsBtn) friendsBtn.classList.toggle('d-none', chat);
    var codeBtn = $('tab-code-btn');
    var outBtn = $('tab-output-btn');
    if (codeBtn) {
      codeBtn.textContent = chat ? ('✍️ ' + text('roomWrite', 'Write')) : ('✏️ ' + text('roomTabCode', 'Code'));
    }
    if (outBtn) {
      outBtn.textContent = chat ? ('📺 ' + text('roomStage', 'Stage')) : ('📺 ' + text('roomTabOutput', 'Output'));
    }
  }

  function buildBody() {
    var body = $('kf-friend-body');
    if (!body || body.dataset.ready === '1') return;
    body.dataset.ready = '1';
    body.innerHTML =
      '<div id="kf-chat-turn" class="kf-chat-turn" role="status">' +
        '<span id="kf-chat-turn-text" class="kf-chat-turn-text" aria-live="polite"></span>' +
        '<div class="kf-chat-turn-actions">' +
          '<button type="button" class="btn btn-sm btn-outline-primary" id="kf-chat-coding"></button>' +
          '<button type="button" class="btn btn-sm btn-outline-secondary" id="kf-chat-leave"></button>' +
          '<button type="button" class="btn btn-sm btn-outline-danger d-none" id="kf-chat-close"></button>' +
        '</div>' +
      '</div>' +
      '<div id="kf-chat-bar" class="kf-chat-bar">' +
        '<div class="kf-chat-meta">' +
          '<div class="kf-chat-code-chip">' +
            '<button type="button" class="kf-chat-code" id="kf-chat-code"></button>' +
            '<button type="button" class="kf-chat-link" id="kf-chat-copy-link">🔗</button>' +
          '</div>' +
          '<span class="kf-chat-sub" id="kf-chat-you"></span>' +
          '<span class="kf-chat-sub" id="kf-chat-until"></span>' +
          '<div class="kf-chat-people" id="kf-chat-people"></div>' +
        '</div>' +
      '</div>' +
      '<div id="kf-friend-lobby">' +
        '<button type="button" class="btn btn-outline-secondary w-100 mb-2" id="kf-lobby-coding"></button>' +
        '<div id="kf-friend-offline" class="d-none"><p class="kf-friend-lead" id="kf-friend-offline-text"></p></div>' +
        '<div id="kf-friend-lobby-form">' +
          '<p class="kf-friend-lead" id="kf-friend-lead"></p>' +
          '<label class="form-label small fw-semibold" for="kf-friend-nick" id="kf-friend-nick-label"></label>' +
          '<input type="text" class="form-control mb-2" id="kf-friend-nick" maxlength="24" autocomplete="nickname">' +
          '<button type="button" class="btn btn-success w-100 mb-2" id="kf-friend-make"></button>' +
          '<p class="kf-friend-or" id="kf-friend-or"></p>' +
          '<input type="text" class="form-control mb-2 kf-room-code-input" id="kf-friend-code-input" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false">' +
          '<button type="button" class="btn btn-outline-primary w-100" id="kf-friend-join"></button>' +
          '<p class="kf-friend-status" id="kf-friend-status" role="status"></p>' +
        '</div>' +
      '</div>' +
      '<div id="kf-chat-starters" class="kf-room-starters" role="group" aria-label="Quick stories">' +
        '<button type="button" class="kf-room-chip" data-starter="hello">👋 <span class="kf-starter-label">Hello</span></button>' +
        '<button type="button" class="kf-room-chip" data-starter="wave">🙋 <span class="kf-starter-label">Wave</span></button>' +
        '<button type="button" class="kf-room-chip" data-starter="dance">💃 <span class="kf-starter-label">Dance</span></button>' +
        '<button type="button" class="kf-room-chip" data-starter="scene">🏖️ <span class="kf-starter-label">My scene</span></button>' +
      '</div>' +
      '<div id="kf-chat-transcript" class="kf-chat-transcript" aria-live="polite"></div>' +
      '<p class="kf-friend-composing" id="kf-friend-composing" aria-live="polite"></p>' +
      '<button type="button" id="kf-room-pill" class="kf-room-pill d-none">' +
        '<span id="kf-room-pill-text"></span>' +
        '<span id="kf-room-pill-badge" class="kf-room-pill-badge d-none"></span>' +
      '</button>';

    $('kf-friend-make').addEventListener('click', makeRoom);
    $('kf-friend-join').addEventListener('click', function () {
      joinRoom($('kf-friend-code-input').value);
    });
    $('kf-friend-code-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') joinRoom(e.target.value);
    });
    $('kf-friend-nick').addEventListener('change', function () { readNickInput(); });
    $('kf-chat-code').addEventListener('click', function () {
      if (room) copyText(formatCode(room.code));
    });
    $('kf-chat-copy-link').addEventListener('click', function () {
      if (room) copyText(roomLink(room.code));
    });
    $('kf-chat-leave').addEventListener('click', leaveRoom);
    $('kf-chat-close').addEventListener('click', closeRoom);
    $('kf-chat-coding').addEventListener('click', exitToCoding);
    var lobbyCoding = $('kf-lobby-coding');
    if (lobbyCoding) lobbyCoding.addEventListener('click', exitToCoding);
    $('kf-room-pill').addEventListener('click', open);
    document.querySelectorAll('#kf-chat-starters [data-starter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!room || !myTurn()) {
          toast(text('roomWaitFriend', 'Wait for a friend to send.'));
          return;
        }
        applyDraft(starterCode(btn.getAttribute('data-starter')));
      });
    });
    var runBtn = $('btn-run');
    if (runBtn) {
      runBtn.addEventListener('click', function (e) {
        if (!inChat()) return;
        e.preventDefault();
        e.stopPropagation();
        sendCurrent();
      }, true);
    }
    var nickInput = $('kf-friend-nick');
    if (nickInput) nickInput.value = nickname();
    refreshLabels();
  }

  function refreshLabels() {
    var heading = $('kf-friend-heading-label');
    if (heading) heading.textContent = text('friends', 'Friends');
    var navLabel = $('kf-nav-friends-label');
    if (navLabel) navLabel.textContent = text('friends', 'Friends');
    var tab = $('kf-tab-friends-label');
    if (tab) tab.textContent = text('friends', 'Friends');
    var codeHeading = $('kf-code-heading');
    if (codeHeading) codeHeading.textContent = inChat() ? text('roomChatTitle', 'Chat') : text('yourCode', 'Your Code');
    var outHeading = $('kf-output-heading');
    if (outHeading) outHeading.textContent = inChat() ? text('roomStageTitle', 'Stage') : text('liveOutput', 'Live Output');
    var runBtn = $('btn-run');
    if (runBtn) {
      if (inChat() && room) runBtn.textContent = '📤 ' + text('roomSend', 'Send');
      else if (!inChat()) runBtn.textContent = '▶️ ' + text('run', 'RUN');
    }
    var lead = $('kf-friend-lead');
    if (lead) lead.textContent = text('roomLead', 'Make a room and share the code. Friends send stories by writing code.');
    var nickLabel = $('kf-friend-nick-label');
    if (nickLabel) nickLabel.textContent = text('roomNick', 'Fun name');
    var make = $('kf-friend-make');
    if (make) make.textContent = text('roomMake', 'Make a room');
    var or = $('kf-friend-or');
    if (or) or.textContent = text('roomOr', 'or type a friend\'s code');
    var join = $('kf-friend-join');
    if (join) join.textContent = text('roomJoin', 'Join');
    var codeChip = $('kf-chat-code');
    if (codeChip) {
      codeChip.title = text('roomCopyCode', 'Copy code');
      codeChip.setAttribute('aria-label', text('roomCopyCode', 'Copy code'));
    }
    var copyLink = $('kf-chat-copy-link');
    if (copyLink) {
      copyLink.textContent = '🔗';
      copyLink.title = text('roomCopyLink', 'Copy link');
      copyLink.setAttribute('aria-label', text('roomCopyLink', 'Copy link'));
    }
    var leave = $('kf-chat-leave');
    if (leave) leave.textContent = text('roomLeave', 'Leave');
    var close = $('kf-chat-close');
    if (close) close.textContent = text('roomClose', 'Close room');
    var coding = $('kf-chat-coding');
    if (coding) coding.textContent = text('roomCoding', 'Coding');
    var lobbyCoding = $('kf-lobby-coding');
    if (lobbyCoding) lobbyCoding.textContent = text('roomBackToCoding', 'Back to coding');
    var codeInput = $('kf-friend-code-input');
    if (codeInput) codeInput.placeholder = 'SUN-4K7';
    var hello = document.querySelector('[data-starter="hello"] .kf-starter-label');
    var wave = document.querySelector('[data-starter="wave"] .kf-starter-label');
    var dance = document.querySelector('[data-starter="dance"] .kf-starter-label');
    var scene = document.querySelector('[data-starter="scene"] .kf-starter-label');
    if (hello) hello.textContent = text('starterHello', 'Hello');
    if (wave) wave.textContent = text('starterWave', 'Wave');
    if (dance) dance.textContent = text('starterDance', 'Dance');
    if (scene) scene.textContent = text('starterScene', 'My scene');
    syncMobileTabs();
    if (room) fillLiveChrome();
    else updateRoomPill();
    applyTurnLock();
  }

  function joinFromUrl(raw) {
    if (joinedFromUrl) return;
    joinedFromUrl = true;
    open();
    var code = normalizeCode(raw);
    var input = $('kf-friend-code-input');
    if (input && code) input.value = formatCode(code);
    if (code.length === 6) joinRoom(code);
  }

  function init() {
    buildBody();
    mountChatChrome();
    var navBtn = $('btn-friends-nav');
    if (navBtn) navBtn.addEventListener('click', open);
    document.querySelectorAll('[data-panel="friends"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      }, true);
    });
    prepareLobby();
    refreshLabels();
    window.addEventListener('resize', placeTurnRow);
  }

  window.KiddyRoom = {
    open: open,
    joinFromUrl: joinFromUrl,
    noteTyping: noteTyping,
    refreshLabels: refreshLabels,
    sendCurrent: sendCurrent,
    exitToCoding: exitToCoding,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
