/**
 * Phase A1 — First-run tooltip tour
 */
(function () {
  'use strict';

  var KEY = 'kf_tour_done_v1';
  var step = 0;
  var steps = [
    { sel: '#ss-editor', text: '✏️ Write KiddyFun code here — try scene "school" and Rafi appears' },
    { sel: '#btn-run', text: '▶️ Press RUN to watch your story or play your game!' },
    { sel: '#ss-stage', text: '📺 Output appears here — speech, animation, and game' },
    { sel: '#tab-output-btn', text: '📱 On mobile, switch to Output tab after Run', mobileOnly: true },
    { sel: '#leftMenu', text: '☰ Menu: Guide, Lessons, Missions, and Examples', trigger: 'open-menu' },
  ];

  function isMobile() { return window.innerWidth < 992; }

  function done() {
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    var ov = document.getElementById('kf-tour-overlay');
    if (ov) ov.remove();
  }

  function showStep() {
    var ov = document.getElementById('kf-tour-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'kf-tour-overlay';
      ov.className = 'kf-tour-overlay';
      ov.innerHTML = '<div class="kf-tour-card"><p id="kf-tour-text"></p><div class="d-flex gap-2 justify-content-end"><button type="button" class="btn btn-sm btn-light" id="kf-tour-skip">Skip</button><button type="button" class="btn btn-sm btn-primary" id="kf-tour-next">Next</button></div></div>';
      document.body.appendChild(ov);
      document.getElementById('kf-tour-skip').addEventListener('click', done);
      document.getElementById('kf-tour-next').addEventListener('click', next);
    }
    while (step < steps.length) {
      var s = steps[step];
      if (s.mobileOnly && !isMobile()) { step++; continue; }
      if (s.trigger === 'open-menu') {
        var menuBtn = document.querySelector('[data-bs-target="#leftMenu"]');
        if (menuBtn && window.bootstrap) menuBtn.click();
      }
      var el = document.querySelector(s.sel);
      if (!el) { step++; continue; }
      document.getElementById('kf-tour-text').textContent = s.text;
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    done();
  }

  function next() {
    step++;
    if (step >= steps.length) done();
    else showStep();
  }

  function maybeStart() {
    try { if (localStorage.getItem(KEY)) return; } catch (e) { /* ignore */ }
    if (/[?&]notour=1/i.test(location.search)) return;
    setTimeout(showStep, 800);
  }

  window.KiddyTour = { maybeStart: maybeStart, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} } };
})();
