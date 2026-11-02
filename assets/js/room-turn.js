/**
 * KiddyFun — whose turn it is, and which stage name a friend gets.
 * Nicknames can be shown as labels. The stage name has to be code.
 */
(function (root) {
  'use strict';

  var FALLBACKS = [
    'Friend', 'Buddy', 'Star', 'Sunny', 'Lucky', 'Happy', 'Brave', 'Tiny',
    'Cosy', 'Swift', 'Jolly', 'Panda', 'Fox', 'Cat', 'Duck', 'Otter',
    'Bunny', 'Tiger', 'Koala'
  ];
  var COLORS = ['#e91e63', '#9c27b0', '#3f51b5', '#009688', '#ff5722', '#607d8b', '#f59e0b', '#0ea5e9'];
  var KEYWORDS = {
    scene: 1, appears: 1, says: 1, waves: 1, smiles: 1, jumps: 1, flies: 1, moves: 1,
    right: 1, left: 1, hides: 1, shows: 1, show: 1, word: 1, means: 1, narrator: 1,
    wait: 1, second: 1, seconds: 1, ask: 1, choice: 1, correct: 1, wrong: 1,
    repeat: 1, times: 1, while: 1, if: 1, answer: 1, is: 1, else: 1, end: 1, score: 1, starts: 1,
    at: 1, add: 1, points: 1, play: 1, sound: 1, flaps: 1, clap: 1, success: 1, dances: 1, bows: 1, runs: 1,
    walks: 1, handshakes: 1, nods: 1, cheers: 1,
    set: 1, to: 1, true: 1, false: 1, define: 1, call: 1, return: 1, with: 1,
    and: 1, or: 1, not: 1, plus: 1, minus: 1, divided: 1, by: 1, joined: 1,
    greater: 1, than: 1, less: 1, equal: 1, equals: 1, length: 1, of: 1, list: 1,
    item: 1, in: 1, type: 1, value: 1, empty: 1,
    const: 1, for: 1, each: 1, break: 1, continue: 1, user: 1, as: 1,
    random: 1, from: 1, remainder: 1, remove: 1, number: 1,
    game: 1, player: 1, when: 1, pressed: 1, held: 1, arrow: 1, key: 1, keys: 1,
    space: 1, every: 1, frame: 1, stop: 1, move: 1, jump: 1, power: 1, touches: 1,
    touch: 1, width: 1, height: 1, view: 1, top: 1, side: 1, wall: 1, coin: 1, platform: 1,
    spawn: 1, lives: 1, life: 1, timer: 1, goal: 1, collect: 1, collected: 1, message: 1, restart: 1,
    enemy: 1, patrols: 1, between: 1, camera: 1, follows: 1, follow: 1, lose: 1, ground: 1,
    pause: 1, resume: 1, level: 1, next: 1, load: 1, map: 1,
    choose: 1, health: 1, damage: 1, hurt: 1, chases: 1, chase: 1, shoot: 1, bullet: 1,
    toward: 1, hazard: 1, give: 1, has: 1, export: 1
  };

  function actorToken(nick) {
    var matches = String(nick || '').match(/[A-Za-z][A-Za-z0-9]*/g);
    if (!matches || !matches.length) return '';
    var name = matches.map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');
    if (name.length > 24) name = name.slice(0, 24);
    if (!/^[A-Za-z]/.test(name)) return '';
    return name;
  }

  function isKeyword(name) {
    return !!KEYWORDS[String(name || '').toLowerCase()];
  }

  function taken(used, name) {
    return !!(used && used[String(name || '').toLowerCase()]);
  }

  function actorName(nick, used) {
    var base = actorToken(nick);
    if (base && !isKeyword(base) && !taken(used, base)) return base;
    var i;
    for (i = 0; i < FALLBACKS.length; i++) {
      if (!taken(used, FALLBACKS[i]) && !isKeyword(FALLBACKS[i])) return FALLBACKS[i];
    }
    var n = 1;
    while (taken(used, 'Pal' + n)) n += 1;
    return 'Pal' + n;
  }

  function canSend(lastSenderId, myId, memberCount) {
    var count = Number(memberCount);
    if (!isFinite(count) || count < 2) return true;
    if (lastSenderId == null || String(lastSenderId) === '') return true;
    if (myId == null || String(myId) === '') return false;
    return String(lastSenderId) !== String(myId);
  }

  function colorFor(id) {
    var s = String(id || '');
    var h = 0;
    var i;
    for (i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }

  root.KiddyRoomTurn = {
    actorName: actorName,
    canSend: canSend,
    colorFor: colorFor,
  };
})(typeof window !== 'undefined' ? window : global);
