/**
 * SpeakScript Friendly Error Engine v0.1
 */
(function () {
  'use strict';

  var ERROR_HINTS = [
    { pattern: /scene.*Expected a quoted string/i,
      title: '🎬 Scene needs quotes!',
      tip: 'Scene names must be inside quotation marks.\n✅ Try: scene "school"' },
    { pattern: /"say"\s|say\s+is not a known/i,
      title: '💬 Did you mean "says"?',
      tip: 'Use "says" (with an "s") when a character speaks.\n✅ Try: Rafi says "Hello!"' },
    { pattern: /"repeat" block needs an "end"/i,
      title: '🔁 Missing "end" for your repeat block!',
      tip: 'Every repeat block must be closed with "end".\n✅ Try:\nrepeat 3 times\n    Bird flies\nend' },
    { pattern: /"if" block needs an "end"|"else" block needs an "end"/i,
      title: '❓ Missing "end" for your if block!',
      tip: 'Every if block must be closed with "end".\n✅ Try:\nif answer is correct\n    narrator says "Great!"\nend' },
    { pattern: /choice.*needs a question|"choice" needs a question/i,
      title: '📋 Choices need a question first!',
      tip: 'Write an "ask" line before your choices.\n✅ Try:\nask "What colour is the sky?"\nchoice "Blue" correct\nchoice "Red" wrong' },
    { pattern: /Unclosed string/i,
      title: '✏️ You forgot to close your quotation marks!',
      tip: 'Every opening " needs a closing ".\n✅ Try: Rafi says "Hello!"' },
    { pattern: /Repeat count must be/i,
      title: '🔢 Repeat count out of range!',
      tip: 'Use a number between 1 and 100.\n✅ Try: repeat 3 times' },
    { pattern: /Expected "times"/i,
      title: '🔁 Missing "times" keyword!',
      tip: 'After the repeat number, write "times".\n✅ Try: repeat 3 times' },
    { pattern: /Unrecognised command/i,
      title: '🤔 I don\'t understand that command.',
      tip: 'Check the Language Guide for supported commands.\nCommon commands: scene, appears, says, waves, smiles, jumps.' },
    { pattern: /not a known action/i,
      title: '🎭 That action is not supported yet!',
      tip: 'Known actions: waves, smiles, jumps, flies, hides, shows, moves right, moves left.' },
    { pattern: /Expected a quoted string/i,
      title: '✏️ Missing quotation marks!',
      tip: 'Put the text inside double quotes.\n✅ Example: Rafi says "Hello!"' },
    { pattern: /Lexer not loaded/i,
      title: '⚙️ Script loading error',
      tip: 'Try refreshing the page (F5). If the problem persists, check the browser console.' },
  ];

  function friendlyError(err) {
    var line = err.line || '?';
    var raw  = err.message || String(err);

    for (var i = 0; i < ERROR_HINTS.length; i++) {
      var hint = ERROR_HINTS[i];
      if (hint.pattern.test(raw)) {
        return { title: hint.title, message: 'Line ' + line + ': ' + raw, line: line, tip: hint.tip, raw: raw };
      }
    }
    return {
      title  : '⚠️ Oops! Something went wrong.',
      message: 'Line ' + line + ': ' + raw,
      line   : line,
      tip    : 'Check the Language Guide for correct syntax.',
      raw    : raw,
    };
  }

  function renderError(errObj) {
    return '<div class="ss-error-card">' +
      '<div class="ss-error-title">' + escHtml(errObj.title) + '</div>' +
      '<div class="ss-error-message">' + escHtml(errObj.message) + '</div>' +
      '<pre class="ss-error-tip">' + escHtml(errObj.tip) + '</pre>' +
      '</div>';
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.SpeakErrors = { friendlyError: friendlyError, renderError: renderError };
  console.log('[SpeakScript] Errors ready');
})();
