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
      parent: 'Parent', privacy: 'Privacy', python: 'Python', themes: 'Themes', yourCode: 'Your Code', liveOutput: 'Live Output',
      lessonTitle: '📚 30-Lesson Path',
      lessonBlurb: 'Finish each lesson, then press Run. The next lesson unlocks after a successful run.',
      lessonStart: 'Start',
      lessonLoaded: '📚 Lesson loaded — press Run when you are ready',
      syncRetry: '☁️ Cloud did not save yet. Your work stays on this device and will retry.',
    },
    bn: {
      run: 'চালান', stop: 'থামান', guide: 'গাইড', lessons: 'পাঠ', tutorial: 'টিউটোরিয়াল', missions: 'মিশন',
      saved: 'সংরক্ষিত', gallery: 'গ্যালারি', teacher: 'শিক্ষক', sync: 'সিঙ্ক', badges: 'ব্যাজ',
      parent: 'অভিভাবক', privacy: 'গোপনীয়তা', python: 'পাইথন', themes: 'থিম', yourCode: 'আপনার কোড', liveOutput: 'লাইভ আউটপুট',
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
      themes: t.themes,
    };
    Object.keys(navLabels).forEach(function (panel) {
      var el = document.querySelector('[data-panel="' + panel + '"] .ss-nav-label');
      if (el && navLabels[panel]) el.textContent = navLabels[panel];
    });
    var btn = document.getElementById('btn-ui-lang');
    if (btn) btn.textContent = lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাংলা';
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
