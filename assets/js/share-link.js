/**
 * Phase A1 — Copy share link with encoded example (?z= base64)
 */
(function () {
  'use strict';

  function copyShareLink() {
    var ed = document.getElementById('ss-editor');
    if (!ed || !ed.value.trim()) {
      if (window.UI && UI.showToast) UI.showToast('✏️ Write code first');
      return;
    }
    var code = ed.value;
    if (!window.KiddyPublish || !KiddyPublish.encodeForUrl) {
      if (window.UI && UI.showToast) UI.showToast('⚠️ Share is not ready yet');
      return;
    }
    var enc = KiddyPublish.encodeForUrl(code);
    if (!enc || enc.length > 12000) {
      if (window.UI && UI.showToast) UI.showToast('⚠️ Code too long for a link. Publish instead.');
      return;
    }
    var url = window.location.origin + window.location.pathname + '?z=' + encodeURIComponent(enc);
    var done = function (ok) {
      if (ok) {
        if (window.UI && UI.showToast) UI.showToast('🔗 Link copied. The program loads, and your friend presses Run.');
        return;
      }
      if (window.UI && UI.showAlert) UI.showAlert(url, { title: 'Copy this link', icon: '🔗' });
    };
    if (KiddyPublish.copyToClipboard) {
      KiddyPublish.copyToClipboard(url).then(done);
      return;
    }
    done(false);
  }

  window.KiddyShareLink = { copyShareLink: copyShareLink };
})();
