/**
 * Phase C4 — Rule-based "why isn't my code working?" hints
 */
(function () {
  'use strict';

  var RULES = [
    { re: /scene\s+[^"]/, hint: 'Scene name needs quotes: scene "school"' },
    { re: /\bsay\s+"/, hint: 'Use says (with s): Rafi says "Hello!"' },
    { re: /repeat\s+\d+[^t]/, hint: 'After the number write: repeat 3 times' },
    { re: /\bif\b(?!.+\bend\b)/s, hint: 'Every if block needs end on its own line' },
    { re: /every frame(?!.+\bend\b)/s, hint: 'Close every frame with end' },
    { re: /move\s+\w+\s+(?!left|right|up|down)/, hint: 'Game move: move Rafi left by 5 (inside every frame)' },
    { re: /is player(?!.*every frame)/s, hint: 'After Rafi is player, add every frame for movement' },
    { re: /Unknown variable/, hint: 'Create variables first: set name to "Rafi"' },
    { re: /not a known action/, hint: 'Check Guide for actions: waves, smiles, jumps, claps…' },
    { re: /inside an every frame/, hint: 'Put move/if key inside every frame … end' },
  ];

  function analyze(code, parseError) {
    var hints = [];
    var c = code || '';
    if (parseError && parseError.raw) {
      RULES.forEach(function (r) {
        if (r.re.test(parseError.raw) || r.re.test(c)) hints.push(r.hint);
      });
      if (parseError.tip) hints.push(parseError.tip.split('\n')[0]);
    } else {
      RULES.forEach(function (r) {
        if (r.re.test(c)) hints.push(r.hint);
      });
      if (!/scene\s+"/.test(c) && /appears|says/.test(c)) hints.push('Add a scene first: scene "school"');
      if (/game\s+"/.test(c) && !/every frame/.test(c)) hints.push('Games need every frame for movement');
    }
    return hints.filter(function (h, i, a) { return a.indexOf(h) === i; }).slice(0, 4);
  }

  function showPanel(hints) {
    if (!hints.length) {
      if (window.UI && UI.showToast) UI.showToast('✅ No quick hints — check the Guide');
      return;
    }
    var html = '<div class="ss-error-card"><div class="ss-error-title">💡 Hints</div><ul class="mb-0 ps-3">';
    hints.forEach(function (h) { html += '<li>' + h + '</li>'; });
    html += '</ul></div>';
    if (window.UI && UI.showErrors) UI.showErrors(html);
  }

  function helpWithCurrentCode() {
    var ed = document.getElementById('ss-editor');
    var code = ed ? ed.value : '';
    var err = null;
    try {
      if (window.SpeakParser) SpeakParser.parseProgram(code);
    } catch (e) {
      err = window.SpeakErrors ? SpeakErrors.friendlyError(e) : { raw: e.message };
    }
    showPanel(analyze(code, err));
  }

  window.KiddyHintBot = { analyze: analyze, help: helpWithCurrentCode };
})();
