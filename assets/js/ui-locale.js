/**
 * Phase C4 — Bangla UI labels (code stays English)
 */
(function () {
  'use strict';

  var KEY = 'kf_ui_lang';
  var STR = {
    en: {
      run: 'RUN', stop: 'STOP', guide: 'Guide', lessons: 'Lessons', tutorial: 'Tutorial', missions: 'Missions',
      saved: 'Saved', gallery: 'Gallery', teacher: 'Teacher', sync: 'Sync', badges: 'Badges',
      parent: 'Parent', privacy: 'Privacy', python: 'Python', themes: 'Themes', friends: 'Friends',
      yourCode: 'Your Code', liveOutput: 'Live Output',
      showFriends: 'Show friends', starterHello: 'Hello', starterWave: 'Wave', starterDance: 'Dance', starterScene: 'My scene',
      roomLead: 'Make a room and share the code. Friends send stories by writing code.',
      roomNick: 'Fun name', roomMake: 'Make a room', roomJoin: 'Join', roomOr: 'or type a friend\'s code',
      roomCopyCode: 'Copy code', roomCopyLink: 'Copy link', roomLeave: 'Leave', roomClose: 'Close room',
      roomCloudOff: 'Ask a grown-up to turn on the cloud. Then friends can join the same room.',
      roomLibrary: 'The cloud library did not load. Refresh the page.',
      roomNetwork: 'The cloud did not answer. Check the internet and try again.',
      roomNotFound: 'That room code does not match.',
      roomFull: 'This room is full. Six friends is the limit.',
      roomSlow: 'Wait a moment, then send again.',
      roomTooMany: 'Too many stories. Take a short break.',
      roomClosed: 'This party is over.',
      roomSignIn: 'Sign-in did not finish. Try again.',
      roomTooLong: 'Make the story a little shorter.',
      roomFixCode: 'Fix the code, then send a short story.',
      roomStoryOnly: 'Send a short story. Games, questions, and open loops stay on your screen.',
      roomNeedCode: 'Write a little code first.',
      roomJoinFirst: 'Join a room first.',
      roomHostOnly: 'Only the friend who made the room can close it.',
      roomSetup: 'Rooms are not switched on yet. Ask a grown-up to run the room setup.',
      roomFailed: 'That did not work. Try again.',
      roomCopied: 'Copied', roomLeft: 'You left the room.', roomMade: 'Room is ready. Share the code.',
      roomJoined: 'You are in. Send a story!',
      roomJoining: 'Joining…',
      roomJoinTimeout: 'Joining took too long. Tap Join again.',
      roomWorking: 'Still connecting…',
      roomFrom: 'From', roomTyping: 'is making a story…', roomYou: 'You are',
      roomUntil: 'Open for about {n} hours',
      roomEmpty: 'Stories you send show up here. Tap one to play it again.',
      roomHow: 'Give this code to a friend. Then tap a story. Both screens play it.',
      roomHowCode: 'Or write a short story in Your Code, then press Show friends.',
      roomStoryCard: 'A little story',
      roomSend: 'Send', roomYourTurn: 'Your turn', roomWaitShort: 'Waiting',
      roomWaitTurn: 'Waiting for {name}…', roomWaitFriend: 'Wait for a friend to send.',
      roomAFriend: 'a friend', roomWrite: 'Write', roomStage: 'Stage',
      roomTabCode: 'Code', roomTabOutput: 'Output',
      roomChatTitle: 'Chat', roomStageTitle: 'Stage', roomStageHint: 'Friends appear here',
      roomCoding: 'Coding', roomPill: 'In a room · {code}', roomLeftChip: 'left',
      roomBackToCoding: 'Back to coding',
      privacyChat: 'There is no public chat. A friend room opens only with a code or link, and it disappears after 12 hours. Reset can clear this device, and a separate step can delete cloud copies of programs.',
      lessonTitle: '📚 30-Lesson Path',
      lessonBlurb: 'Finish each lesson, then press Run. The next lesson unlocks after a successful run.',
      lessonStart: 'Start',
      lessonLoaded: '📚 Lesson loaded — press Run when you are ready',
      syncRetry: '☁️ Cloud did not save yet. Your work stays on this device and will retry.',
    },
    bn: {
      run: 'চালান', stop: 'থামান', guide: 'গাইড', lessons: 'পাঠ', tutorial: 'টিউটোরিয়াল', missions: 'মিশন',
      saved: 'সংরক্ষিত', gallery: 'গ্যালারি', teacher: 'শিক্ষক', sync: 'সিঙ্ক', badges: 'ব্যাজ',
      parent: 'অভিভাবক', privacy: 'গোপনীয়তা', python: 'পাইথন', themes: 'থিম', friends: 'বন্ধু',
      yourCode: 'আপনার কোড', liveOutput: 'লাইভ আউটপুট',
      showFriends: 'বন্ধুদের দেখাও', starterHello: 'হ্যালো', starterWave: 'হাত নাড়ো', starterDance: 'নাচ', starterScene: 'আমার দৃশ্য',
      roomLead: 'একটা ঘর বানাও, কোডটা বন্ধুকে দাও। সবাই কোড লিখে গল্প পাঠাবে।',
      roomNick: 'মজার নাম', roomMake: 'ঘর বানাও', roomJoin: 'ঢোকো', roomOr: 'অথবা বন্ধুর কোড',
      roomCopyCode: 'কোড কপি', roomCopyLink: 'লিংক কপি', roomLeave: 'বের হও', roomClose: 'ঘর বন্ধ করো',
      roomCloudOff: 'বড়দের বলো ক্লাউড চালু করতে। তাহলে বন্ধুরা একই ঘরে খেলতে পারবে।',
      roomLibrary: 'ক্লাউডের লাইব্রেরি লোড হয়নি। পেজটা আবার খোলো।',
      roomNetwork: 'ক্লাউড সাড়া দেয়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।',
      roomNotFound: 'এই কোডের ঘর নেই। কোডটা আবার দেখো।',
      roomFull: 'ঘর ভর্তি। একসাথে ছয়জন।',
      roomSlow: 'একটু অপেক্ষা করো, তারপর আবার পাঠাও।',
      roomTooMany: 'অনেকগুলো গল্প হয়ে গেছে। একটু বিরতি নাও।',
      roomClosed: 'এই পার্টি শেষ।',
      roomSignIn: 'ঢুকতে সাইন-ইন শেষ হয়নি। আবার চেষ্টা করো।',
      roomTooLong: 'গল্পটা একটু ছোট করো।',
      roomFixCode: 'আগে কোডটা ঠিক করো, তারপর ছোট গল্প পাঠাও।',
      roomStoryOnly: 'বন্ধুদের জন্য ছোট গল্প পাঠাও। গেম, প্রশ্ন, আর খোলা লুপ নিজের পর্দায় থাকবে।',
      roomNeedCode: 'আগে একটু কোড লেখো।',
      roomJoinFirst: 'আগে একটা ঘরে ঢোকো।',
      roomHostOnly: 'ঘর বন্ধ করতে পারে যে বানিয়েছে।',
      roomSetup: 'ঘর এখনো চালু নয়। বড়দের বলো Supabase-এ ঘরের সেটআপ চালাতে।',
      roomFailed: 'এখন পাঠানো যায়নি। আবার চেষ্টা করো।',
      roomCopied: 'কপি হয়েছে', roomLeft: 'তুমি বেরিয়ে গেছো।', roomMade: 'ঘর তৈরি। কোডটা দাও।',
      roomJoined: 'তুমি ঢুকেছো। একটা গল্প পাঠাও!',
      roomJoining: 'ঢুকছি…',
      roomJoinTimeout: 'ঢুকতে দেরি হচ্ছে। আবার Join চাপো।',
      roomWorking: 'এখনো সংযোগ হচ্ছে…',
      roomFrom: 'পাঠিয়েছে', roomTyping: 'গল্প বানাচ্ছে…', roomYou: 'তুমি',
      roomUntil: 'আর প্রায় {n} ঘণ্টা খোলা',
      roomEmpty: 'যে গল্প পাঠাবে, সেটা এখানে থাকবে। চাপলে আবার চলবে।',
      roomHow: 'এই কোডটা বন্ধুকে দাও। তারপর একটা গল্প চাপো। দুই পর্দায়ই চলবে।',
      roomHowCode: 'অথবা Your Code-এ নিজের গল্প লেখো, তারপর বন্ধুদের দেখাও চাপো।',
      roomStoryCard: 'একটা ছোট গল্প',
      roomSend: 'পাঠাও', roomYourTurn: 'তোমার পালা', roomWaitShort: 'অপেক্ষা',
      roomWaitTurn: '{name}-এর জন্য অপেক্ষা…', roomWaitFriend: 'বন্ধু একটা বার্তা পাঠালে আবার লিখতে পারবে।',
      roomAFriend: 'একজন বন্ধু', roomWrite: 'লেখো', roomStage: 'মঞ্চ',
      roomTabCode: 'কোড', roomTabOutput: 'আউটপুট',
      roomChatTitle: 'চ্যাট', roomStageTitle: 'মঞ্চ', roomStageHint: 'বন্ধুরা এখানে আসবে',
      roomCoding: 'কোডিং', roomPill: 'ঘরে আছো · {code}', roomLeftChip: 'চলে গেছে',
      roomBackToCoding: 'কোডিংয়ে ফিরে এসেছো',
      privacyChat: 'পাবলিক চ্যাট নেই। বন্ধুদের ঘর শুধু কোড বা লিংক দিয়ে খোলে, ১২ ঘণ্টা পর মুছে যায়। রিসেট এই ডিভাইস খালি করতে পারে, আর আলাদা এক ধাপে ক্লাউডের কপি মুছে যায়।',
      lessonTitle: '📚 ৩০টি পাঠ',
      lessonBlurb: 'পাঠ খুলে Run চাপুন। সফল রানের পর পরের পাঠ খুলবে।',
      lessonStart: 'শুরু',
      lessonLoaded: '📚 পাঠ লোড হয়েছে — প্রস্তুত হলে Run চাপুন',
      syncRetry: '☁️ ক্লাউডে এখনো সেভ হয়নি। কাজ এই ডিভাইসে আছে, আবার চেষ্টা হবে।',
    },
  };

  function getLang() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'bn' ? 'bn' : 'en';
    } catch (e) { return 'en'; }
  }

  function text(key, fallback) {
    var t = STR[getLang()] || STR.en;
    if (t[key]) return t[key];
    if (STR.en[key]) return STR.en[key];
    return fallback;
  }

  function apply(lang, silent) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    var t = STR[lang] || STR.en;
    var runBtn = document.getElementById('btn-run');
    if (runBtn) runBtn.textContent = '▶️ ' + t.run;
    var stopBtn = document.getElementById('btn-stop');
    if (stopBtn) stopBtn.textContent = '⏹️ ' + t.stop;
    var navLabels = {
      guide: t.guide, lessons: t.lessons, tutorial: t.tutorial, missions: t.missions,
      saved: t.saved, gallery: t.gallery, teacher: t.teacher, sync: t.sync,
      badges: t.badges, parent: t.parent, privacy: t.privacy, python: t.python,
      themes: t.themes, friends: t.friends,
    };
    Object.keys(navLabels).forEach(function (panel) {
      var el = document.querySelector('[data-panel="' + panel + '"] .ss-nav-label');
      if (el && navLabels[panel]) el.textContent = navLabels[panel];
    });
    var btn = document.getElementById('btn-ui-lang');
    if (btn) btn.textContent = lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাংলা';
    var privacy = document.getElementById('kf-privacy-chat');
    if (privacy && t.privacyChat) privacy.textContent = t.privacyChat;
    if (window.KiddyRoom && KiddyRoom.refreshLabels) KiddyRoom.refreshLabels();
    if (!silent && window.UI && UI.showToast) UI.showToast(lang === 'bn' ? '🇧🇩 UI: বাংলা' : '🇬🇧 UI: English');
    if (window.KiddyCurriculum && KiddyCurriculum.buildPanel) {
      var lessons = document.getElementById('panel-lessons');
      if (lessons && !lessons.classList.contains('d-none')) KiddyCurriculum.buildPanel();
    }
  }

  function toggle() {
    apply(getLang() === 'bn' ? 'en' : 'bn');
  }

  function init() {
    apply(getLang(), true);
    var btn = document.getElementById('btn-ui-lang');
    if (btn) btn.addEventListener('click', toggle);
  }

  window.KiddyLocale = { init: init, toggle: toggle, getLang: getLang, text: text };
})();
