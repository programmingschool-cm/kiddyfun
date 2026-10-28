/**
 * Phase A2 — Word of the day on menu open
 */
(function () {
  'use strict';

  var WORDS = [
    { w: 'brave', m: 'সাহসী — not afraid' },
    { w: 'friend', m: 'বন্ধু — someone you like' },
    { w: 'hello', m: 'হ্যালো — greeting' },
    { w: 'thank you', m: 'ধন্যবাদ — polite thanks' },
    { w: 'school', m: 'স্কুল — place to learn' },
    { w: 'happy', m: 'খুশি — feeling good' },
    { w: 'run', m: 'দৌড়ানো — move fast' },
    { w: 'share', m: 'ভাগ করা — give part to others' },
  ];

  function todayWord() {
    var day = new Date().getDate();
    return WORDS[day % WORDS.length];
  }

  function showInMenu() {
    var menu = document.getElementById('leftMenu');
    if (!menu || document.getElementById('kf-word-of-day')) return;
    var w = todayWord();
    var box = document.createElement('div');
    box.id = 'kf-word-of-day';
    box.className = 'kf-wotd';
    box.innerHTML =
      '<div class="kf-wotd-kicker">Word of the day</div>' +
      '<div class="kf-wotd-word">' + w.w + '</div>' +
      '<div class="kf-wotd-mean">' + w.m + '</div>';
    var progress = document.getElementById('kf-progress-wrap');
    if (progress && progress.parentNode) progress.parentNode.insertBefore(box, progress);
  }

  window.KiddyWordOfDay = { showInMenu: showInMenu, todayWord: todayWord };
})();
