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
    if (window.KiddyPublish && KiddyPublish.encodeForUrl) {
      var enc = KiddyPublish.encodeForUrl(code);
      if (!enc) {
        if (window.UI && UI.showToast) UI.showToast('⚠️ Code too long for link');
        return;
      }
      var url = window.location.origin + window.location.pathname + '?z=' + encodeURIComponent(enc) + '&run=1';
      navigator.clipboard.writeText(url).then(function () {
        if (window.UI && UI.showToast) UI.showToast('🔗 Link copied! Share with friends');
      }).catch(function () {
        if (window.UI && UI.showAlert) UI.showAlert(url, { title: 'Copy this link', icon: '🔗' });
      });
    }
  }

  window.KiddyShareLink = { copyShareLink: copyShareLink };
})();
