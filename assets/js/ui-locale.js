/**
 * Phase C4 — Bangla UI labels (code stays English)
 */
(function () {
  'use strict';

  var KEY = 'kf_ui_lang';
  var STR = {
    en: {
      run: 'RUN', stop: 'STOP', guide: 'Guide', lessons: 'Lessons', missions: 'Missions',
      saved: 'Saved', gallery: 'Gallery', teacher: 'Teacher', sync: 'Sync', badges: 'Badges',
      parent: 'Parent', python: 'Python', yourCode: 'Your Code', liveOutput: 'Live Output',
    },
    bn: {
      run: 'চালান', stop: 'থামান', guide: 'গাইড', lessons: 'পাঠ', missions: 'মিশন',
      saved: 'সংরক্ষিত', gallery: 'গ্যালারি', teacher: 'শিক্ষক', sync: 'সিঙ্ক', badges: 'ব্যাজ',
      parent: 'অভিভাবক', python: 'পাইথন', yourCode: 'আপনার কোড', liveOutput: 'লাইভ আউটপুট',
    },
  };

  function getLang() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'bn' ? 'bn' : 'en';
    } catch (e) { return 'en'; }
  }

  function apply(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    var t = STR[lang] || STR.en;
    var map = [
      ['#btn-run', '▶️ ' + t.run],
      ['#btn-stop', '⏹️ ' + t.stop],
      ['[data-panel="guide"]', '📖 ' + t.guide],
      ['[data-panel="lessons"]', '📚 ' + t.lessons],
      ['[data-panel="missions"]', '🎯 ' + t.missions],
      ['[data-panel="saved"]', '💾 ' + t.saved],
      ['[data-panel="gallery"]', '🌐 ' + t.gallery],
      ['[data-panel="teacher"]', '👩‍🏫 ' + t.teacher],
      ['[data-panel="sync"]', '☁️ ' + t.sync],
      ['[data-panel="badges"]', '🏅 ' + t.badges],
      ['[data-panel="parent"]', '👨‍👩‍👧 ' + t.parent],
      ['[data-panel="python"]', '🐍 ' + t.python],
    ];
    map.forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (el) el.textContent = pair[1];
    });
    var btn = document.getElementById('btn-ui-lang');
    if (btn) btn.textContent = lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাংলা';
    if (window.UI && UI.showToast) UI.showToast(lang === 'bn' ? '🇧🇩 UI: বাংলা' : '🇬🇧 UI: English');
  }

  function toggle() {
    apply(getLang() === 'bn' ? 'en' : 'bn');
  }

  function init() {
    apply(getLang());
    var btn = document.getElementById('btn-ui-lang');
    if (btn) btn.addEventListener('click', toggle);
  }

  window.KiddyLocale = { init: init, toggle: toggle, getLang: getLang };
})();
