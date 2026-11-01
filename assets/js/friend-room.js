/**
 * KiddyFun — invite-only friend rooms.
 * A message is a short story program. Friends see it on the same stage.
 */
(function () {
  'use strict';

  var NICK_KEY = 'kf_room_nick';
  var ADJ = ['Sunny', 'Lucky', 'Happy', 'Brave', 'Tiny', 'Cosy', 'Swift', 'Jolly'];
  var ANIMALS = ['Panda', 'Fox', 'Cat', 'Duck', 'Otter', 'Bunny', 'Tiger', 'Koala'];
  var STARTERS = {
    hello: 'scene "school"\nFriend appears\nFriend says "Hello!"\nFriend waves',
    wave: 'scene "park"\nBuddy appears\nBuddy says "Hi friends!"\nBuddy waves',
    dance: 'scene "party"\nStar appears\nStar says "Let\'s dance!"\nStar dances',
    scene: 'scene "beach"\nSunny appears\nSunny says "Come see this!"\nSunny smiles',
  };
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
  var playedIds = {};
  var channel = null;
  var busy = false;
  var sending = false;
  var nextSendAt = 0;
  var typingTimer = null;
  var typingSent = false;
  var fromTimer = null;
  var presenceTimer = null;
  var ignoredPresence = {};
  var joinedFromUrl = false;
  var joinGen = 0;
  var channelGen = 0;
  var channelRetries = 0;
  var accessToken = '';
  var selfClose = false;

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

  function open() {
    document.body.classList.add('kf-friends-open');
    if (window.KiddyApp && KiddyApp.setMobileTab) KiddyApp.setMobileTab('friends');
    var menu = $('leftMenu');
    if (menu && window.bootstrap && bootstrap.Offcanvas) {
      var inst = bootstrap.Offcanvas.getInstance(menu);
      if (inst) inst.hide();
    }
    prepareLobby();
  }

  function hideRail() {
    document.body.classList.remove('kf-friends-open');
    if (window.KiddyApp && KiddyApp.setMobileTab) {
      KiddyApp.setMobileTab(room ? 'output' : 'code');
    }
  }

  function showOffline(kind) {
    var lobby = $('kf-friend-lobby');
    var live = $('kf-friend-live');
    var off = $('kf-friend-offline');
    if (lobby) lobby.classList.add('d-none');
    if (live) live.classList.add('d-none');
    if (off) off.classList.remove('d-none');
    var note = $('kf-friend-offline-text');
    if (note) {
      note.textContent = kind === 'library'
        ? text('roomLibrary', 'The cloud library did not load. Refresh the page.')
        : text('roomCloudOff', 'Ask a grown-up to turn on the cloud. Then friends can join the same room.');
    }
    var composer = $('kf-room-composer');
    if (composer) composer.classList.add('d-none');
  }

  function showLobby() {
    var lobby = $('kf-friend-lobby');
    var live = $('kf-friend-live');
    var off = $('kf-friend-offline');
    if (off) off.classList.add('d-none');
    if (live) live.classList.add('d-none');
    if (lobby) lobby.classList.remove('d-none');
    var composer = $('kf-room-composer');
    if (composer) composer.classList.add('d-none');
    var input = $('kf-friend-nick');
    if (input && !input.value) input.value = nickname();
  }

  function showLive() {
    var lobby = $('kf-friend-lobby');
    var live = $('kf-friend-live');
    var off = $('kf-friend-offline');
    if (off) off.classList.add('d-none');
    if (lobby) lobby.classList.add('d-none');
    if (live) live.classList.remove('d-none');
    var composer = $('kf-room-composer');
    if (composer) composer.classList.remove('d-none');
    open();
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

  function applyMembers(list) {
    memberList = asArray(list);
    memberIds = {};
    memberList.forEach(function (m) {
      if (m && m.user_id) memberIds[String(m.user_id)] = m.nickname || 'Friend';
    });
    if (myId) memberIds[String(myId)] = myNick || memberIds[String(myId)] || 'Friend';
  }

  function renderPeople() {
    var box = $('kf-friend-people');
    if (!box) return;
    box.textContent = '';
    var online = presenceList();
    var list = online.length ? online : memberList.map(function (m) {
      return { user_id: m.user_id, nickname: m.nickname };
    });
    var seen = {};
    list.forEach(function (m) {
      var id = String(m.user_id || '');
      if (!id || seen[id]) return;
      if (online.length && !memberIds[id]) return;
      seen[id] = true;
      var chip = document.createElement('span');
      chip.className = 'kf-room-person';
      chip.textContent = m.nickname || memberIds[id] || 'Friend';
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
      });
    }, 400);
  }

  function fillLiveChrome() {
    var codeEl = $('kf-room-code');
    if (codeEl) codeEl.textContent = formatCode(room.code);
    var until = $('kf-room-until');
    if (until) until.textContent = hoursLabel(room.expires);
    var you = $('kf-room-you');
    if (you) you.textContent = text('roomYou', 'You are') + ' ' + myNick;
    var closeBtn = $('kf-friend-close');
    if (closeBtn) closeBtn.classList.toggle('d-none', !isHost());
    renderPeople();
  }

  function clearCards() {
    messagesById = {};
    var list = $('kf-friend-cards');
    if (list) list.textContent = '';
    var empty = $('kf-friend-empty');
    if (empty) empty.classList.remove('d-none');
  }

  function appendCard(row) {
    var list = $('kf-friend-cards');
    if (!list) return;
    var empty = $('kf-friend-empty');
    if (empty) empty.classList.add('d-none');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kf-room-card';
    var who = document.createElement('span');
    who.className = 'kf-room-card-who';
    who.textContent = row.nickname || 'Friend';
    var line = document.createElement('span');
    line.className = 'kf-room-card-line';
    var result = checkMessage(row.code || '');
    line.textContent = (result.ok && result.preview) ? result.preview : text('roomStoryCard', 'A little story');
    btn.appendChild(who);
    btn.appendChild(line);
    btn.addEventListener('click', function () { replay(row); });
    list.appendChild(btn);
    list.scrollTop = list.scrollHeight;
  }

  function remember(row, autoplay) {
    if (!row || row.id == null) return;
    var id = String(row.id);
    if (!messagesById[id]) {
      messagesById[id] = row;
      appendCard(row);
    }
    if (!autoplay) return;
    if (myId && String(row.sender_id) === String(myId)) {
      playedIds[id] = true;
      return;
    }
    if (playedIds[id]) return;
    playedIds[id] = true;
    playIncoming(row);
  }

  function showFrom(name) {
    var el = $('kf-room-from');
    if (!el) return;
    el.textContent = text('roomFrom', 'From') + ' ' + esc(name || 'Friend');
    el.classList.remove('d-none');
    clearTimeout(fromTimer);
    fromTimer = setTimeout(function () { el.classList.add('d-none'); }, 4000);
  }

  function playIncoming(row) {
    var result = checkMessage(row.code || '');
    if (!result.ok) {
      toast(explainCheck(result));
      return;
    }
    showFrom(row.nickname);
    if (window.KiddyApp && KiddyApp.runSource) {
      KiddyApp.runSource(row.code, { fromFriend: true, award: false });
    }
  }

  function replay(row) {
    var result = checkMessage(row.code || '');
    if (!result.ok) {
      toast(explainCheck(result));
      return;
    }
    showFrom(row.nickname);
    if (window.KiddyApp && KiddyApp.runSource) {
      KiddyApp.runSource(row.code, { fromFriend: true, award: false });
    }
  }

  function closeChannel() {
    typingSent = false;
    clearTimeout(typingTimer);
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
      asArray(res.data.messages).forEach(function (row) { remember(row, true); });
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
      remember(payload.new, true);
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

  function enterFresh(data, session) {
    selfClose = false;
    closeChannel();
    clearCards();
    playedIds = {};
    ignoredPresence = {};
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
    fillLiveChrome();
    showLive();
    channelRetries = 0;
    subscribe(room.id);
  }

  function refreshMembers() {
    if (!room) return Promise.resolve();
    return clientReady().then(function (client) {
      if (!client || !room) return null;
      return client.rpc('join_friend_room', { p_code: room.code, p_nickname: myNick });
    }).then(function (res) {
      if (!res || res.error || !res.data) return;
      applyMembers(res.data.members);
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

  function applyEditor(code) {
    var editor = $('ss-editor');
    if (!editor) return;
    editor.value = code;
    if (window.SpeakStorage && SpeakStorage.saveLastCode) SpeakStorage.saveLastCode(code);
    if (window.KiddyProjectFiles && KiddyProjectFiles.syncFromEditor) KiddyProjectFiles.syncFromEditor();
    if (window.KiddySmartEditor && KiddySmartEditor.notifyExternalChange) {
      KiddySmartEditor.notifyExternalChange();
    }
    if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
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
    if (sending || Date.now() < nextSendAt) {
      toast(text('roomSlow', 'Wait a moment, then send again.'));
      return;
    }
    sending = true;
    nextSendAt = Date.now() + 3000;
    if (window.KiddyApp && KiddyApp.runSource) {
      KiddyApp.runSource(code, { award: true });
    }
    ensureSession().then(function () {
      return clientReady();
    }).then(function (client) {
      if (!client) throw new Error('cloud');
      return client.rpc('send_room_message', { p_room_id: room.id, p_code: code });
    }).then(function (res) {
      if (res.error) throw res.error;
      var row = res.data;
      if (row && row.id != null) playedIds[String(row.id)] = true;
      remember(row, false);
    }).catch(function (e) {
      nextSendAt = 0;
      var raw = (e && e.message) || '';
      toast(raw === 'cloud' ? text('roomCloudOff', 'Ask a grown-up to turn on the cloud.') : friendlyRpc(e));
      if (raw.indexOf('party is over') !== -1) exitRoom(true);
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
          var messages = asArray(res.data.messages);
          messages.forEach(function (row) {
            remember(row, false);
            if (row && row.id != null) playedIds[String(row.id)] = true;
          });
          var latest = messages[messages.length - 1];
          setJoinStatus('', false);
          toast(text('roomJoined', 'You are in. Send a story!'));
          if (latest) setTimeout(function () { playIncoming(latest); }, 0);
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
    room = null;
    memberIds = {};
    memberList = [];
    playedIds = {};
    clearCards();
    var line = $('kf-friend-composing');
    if (line) line.textContent = '';
    showLobby();
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
    if (!room || !channel) return;
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

  function buildBody() {
    var body = $('kf-friend-body');
    if (!body || body.dataset.ready === '1') return;
    body.dataset.ready = '1';
    body.innerHTML =
      '<div id="kf-friend-offline" class="d-none"><p class="kf-friend-lead" id="kf-friend-offline-text"></p></div>' +
      '<div id="kf-friend-lobby">' +
        '<p class="kf-friend-lead" id="kf-friend-lead"></p>' +
        '<label class="form-label small fw-semibold" for="kf-friend-nick" id="kf-friend-nick-label"></label>' +
        '<input type="text" class="form-control form-control-sm mb-2" id="kf-friend-nick" maxlength="24" autocomplete="nickname">' +
        '<button type="button" class="btn btn-success w-100 mb-2" id="kf-friend-make"></button>' +
        '<p class="kf-friend-or" id="kf-friend-or"></p>' +
        '<input type="text" class="form-control form-control-sm mb-2 kf-room-code-input" id="kf-friend-code-input" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false">' +
        '<button type="button" class="btn btn-outline-primary w-100" id="kf-friend-join"></button>' +
        '<p class="kf-friend-status" id="kf-friend-status" role="status"></p>' +
      '</div>' +
      '<div id="kf-friend-live" class="d-none">' +
        '<p class="kf-room-code" id="kf-room-code"></p>' +
        '<p class="kf-room-you" id="kf-room-you"></p>' +
        '<p class="kf-room-until" id="kf-room-until"></p>' +
        '<div class="kf-room-actions">' +
          '<button type="button" class="btn btn-sm btn-light border" id="kf-friend-copy-code"></button>' +
          '<button type="button" class="btn btn-sm btn-light border" id="kf-friend-copy-link"></button>' +
        '</div>' +
        '<div class="kf-friend-people" id="kf-friend-people"></div>' +
        '<div class="kf-room-next">' +
          '<p class="kf-friend-how" id="kf-friend-how"></p>' +
          '<p class="kf-friend-how" id="kf-friend-how-code"></p>' +
          '<div class="kf-room-composer" id="kf-room-composer">' +
            '<div class="kf-room-starters" role="group" aria-label="Quick stories">' +
              '<button type="button" class="kf-room-chip" data-starter="hello">👋 <span class="kf-starter-label">Hello</span></button>' +
              '<button type="button" class="kf-room-chip" data-starter="wave">🙋 <span class="kf-starter-label">Wave</span></button>' +
              '<button type="button" class="kf-room-chip" data-starter="dance">💃 <span class="kf-starter-label">Dance</span></button>' +
              '<button type="button" class="kf-room-chip" data-starter="scene">🏖️ <span class="kf-starter-label">My scene</span></button>' +
            '</div>' +
            '<button type="button" class="kf-btn-show-friends" id="btn-show-friends">🎉 <span id="kf-show-friends-label">Show friends</span></button>' +
          '</div>' +
        '</div>' +
        '<p class="kf-friend-composing" id="kf-friend-composing" aria-live="polite"></p>' +
        '<p class="kf-friend-empty" id="kf-friend-empty"></p>' +
        '<div class="kf-friend-cards" id="kf-friend-cards" aria-live="polite"></div>' +
        '<div class="kf-room-react" id="kf-friend-react"></div>' +
        '<div class="kf-room-actions">' +
          '<button type="button" class="btn btn-sm btn-outline-secondary" id="kf-friend-leave"></button>' +
          '<button type="button" class="btn btn-sm btn-outline-danger d-none" id="kf-friend-close"></button>' +
        '</div>' +
      '</div>';

    var react = $('kf-friend-react');
    REACTIONS.forEach(function (item) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kf-room-react-btn';
      btn.textContent = item.emoji;
      btn.setAttribute('aria-label', item.kind);
      btn.addEventListener('click', function () {
        burst(item.kind);
        broadcast('reaction', { user_id: myId, nickname: myNick, kind: item.kind });
      });
      react.appendChild(btn);
    });

    $('kf-friend-make').addEventListener('click', makeRoom);
    $('kf-friend-join').addEventListener('click', function () {
      joinRoom($('kf-friend-code-input').value);
    });
    $('kf-friend-code-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') joinRoom(e.target.value);
    });
    $('kf-friend-nick').addEventListener('change', function () { readNickInput(); });
    $('kf-friend-copy-code').addEventListener('click', function () {
      if (room) copyText(formatCode(room.code));
    });
    $('kf-friend-copy-link').addEventListener('click', function () {
      if (room) copyText(roomLink(room.code));
    });
    $('kf-friend-leave').addEventListener('click', leaveRoom);
    $('kf-friend-close').addEventListener('click', closeRoom);
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
    var show = $('kf-show-friends-label');
    if (show) show.textContent = text('showFriends', 'Show friends');
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
    var copyCode = $('kf-friend-copy-code');
    if (copyCode) copyCode.textContent = text('roomCopyCode', 'Copy code');
    var copyLink = $('kf-friend-copy-link');
    if (copyLink) copyLink.textContent = text('roomCopyLink', 'Copy link');
    var leave = $('kf-friend-leave');
    if (leave) leave.textContent = text('roomLeave', 'Leave');
    var close = $('kf-friend-close');
    if (close) close.textContent = text('roomClose', 'Close room');
    var empty = $('kf-friend-empty');
    if (empty) empty.textContent = text('roomEmpty', 'Stories you send show up here. Tap one to play it again.');
    var how = $('kf-friend-how');
    if (how) how.textContent = text('roomHow', 'Give this code to a friend. Then tap a story. Both screens play it.');
    var howCode = $('kf-friend-how-code');
    if (howCode) howCode.textContent = text('roomHowCode', 'Or write a short story in Your Code, then press Show friends.');
    var codeInput = $('kf-friend-code-input');
    if (codeInput) codeInput.placeholder = 'SUN-4K7P';
    var hello = document.querySelector('[data-starter="hello"] .kf-starter-label');
    var wave = document.querySelector('[data-starter="wave"] .kf-starter-label');
    var dance = document.querySelector('[data-starter="dance"] .kf-starter-label');
    var scene = document.querySelector('[data-starter="scene"] .kf-starter-label');
    if (hello) hello.textContent = text('starterHello', 'Hello');
    if (wave) wave.textContent = text('starterWave', 'Wave');
    if (dance) dance.textContent = text('starterDance', 'Dance');
    if (scene) scene.textContent = text('starterScene', 'My scene');
    if (room) fillLiveChrome();
  }

  function bindComposer() {
    var composer = $('kf-room-composer');
    if (!composer || composer.dataset.ready === '1') return;
    composer.dataset.ready = '1';
    composer.querySelectorAll('[data-starter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = STARTERS[btn.getAttribute('data-starter')];
        if (!code) return;
        applyEditor(code);
        sendStory(code);
      });
    });
    var showBtn = $('btn-show-friends');
    if (showBtn) {
      showBtn.addEventListener('click', function () {
        var code = window.KiddyApp && KiddyApp.editorCode ? KiddyApp.editorCode() : '';
        sendStory(code);
      });
    }
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
    bindComposer();
    var hide = $('kf-friend-hide');
    if (hide) hide.addEventListener('click', hideRail);
    var navBtn = $('btn-friends-nav');
    if (navBtn) navBtn.addEventListener('click', open);
    prepareLobby();
    refreshLabels();
  }

  window.KiddyRoom = {
    open: open,
    joinFromUrl: joinFromUrl,
    noteTyping: noteTyping,
    refreshLabels: refreshLabels,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
