/**
 * G7b — Map editor (Creator/Studio): build JSON map, save, load via load map "name"
 */
(function () {
  'use strict';

  function defaultMap(view) {
    return {
      refW: 600,
      refH: 360,
      view: view || 'top',
      label: 'Custom map',
      obstacles: [],
      entities: [],
    };
  }

  function buildPanel() {
    var el = document.getElementById('panel-map-editor');
    if (!el) return;
    el.innerHTML =
      '<h6 class="ss-panel-title">🗺️ Map Editor (G7b)</h6>' +
      '<p class="small text-muted">Edit JSON, save as a custom map, then use <code>load map "name"</code> in game code.</p>' +
      '<label class="small fw-bold">Map name</label>' +
      '<input type="text" class="form-control form-control-sm mb-2" id="kf-map-name" value="my_map" />' +
      '<label class="small fw-bold">Map JSON</label>' +
      '<textarea class="form-control form-control-sm font-monospace mb-2" id="kf-map-json" rows="10"></textarea>' +
      '<div class="d-flex flex-wrap gap-1">' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" id="kf-map-template-top">Top template</button>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" id="kf-map-template-side">Side template</button>' +
      '<button type="button" class="btn btn-sm btn-primary" id="kf-map-save">💾 Save map</button>' +
      '<button type="button" class="btn btn-sm btn-outline-primary" id="kf-map-insert">Insert load line</button>' +
      '</div>' +
      '<p class="small text-muted mt-2 mb-0" id="kf-map-status"></p>';

    var jsonEl = document.getElementById('kf-map-json');
    if (jsonEl && !jsonEl.value) {
      jsonEl.value = JSON.stringify(defaultMap('top'), null, 2);
    }

    if (!el._bound) {
      el._bound = true;
      document.getElementById('kf-map-template-top').addEventListener('click', function () {
        jsonEl.value = JSON.stringify(defaultMap('top'), null, 2);
      });
      document.getElementById('kf-map-template-side').addEventListener('click', function () {
        jsonEl.value = JSON.stringify(defaultMap('side'), null, 2);
      });
      document.getElementById('kf-map-save').addEventListener('click', saveMap);
      document.getElementById('kf-map-insert').addEventListener('click', insertLoadLine);
    }
  }

  function saveMap() {
    var name = (document.getElementById('kf-map-name').value || '').trim();
    var jsonEl = document.getElementById('kf-map-json');
    var status = document.getElementById('kf-map-status');
    try {
      var data = JSON.parse(jsonEl.value);
      if (!window.KiddyUserMaps) throw new Error('User maps not loaded');
      var res = KiddyUserMaps.save(name, data);
      if (!res.ok) throw new Error(res.error);
      KiddyUserMaps.registerBuiltin();
      if (status) status.textContent = 'Saved as: ' + res.name;
      if (window.UI && UI.showToast) UI.showToast('💾 Map saved: ' + res.name);
    } catch (e) {
      if (status) status.textContent = 'Error: ' + e.message;
      if (window.UI && UI.showToast) UI.showToast('⚠️ ' + e.message);
    }
  }

  function insertLoadLine() {
    var name = (document.getElementById('kf-map-name').value || 'my_map').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    var ed = document.getElementById('ss-editor');
    if (!ed) return;
    var line = 'load map "' + name + '"';
    ed.value = ed.value.trim() ? ed.value + '\n' + line + '\n' : line + '\n';
    if (window.SpeakStorage) SpeakStorage.saveLastCode(ed.value);
    if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
    if (window.KiddySmartEditor && KiddySmartEditor.notifyExternalChange) {
      KiddySmartEditor.notifyExternalChange();
    }
    if (window.UI && UI.showToast) UI.showToast('Inserted: ' + line);
  }

  window.KiddyMapEditor = { buildPanel: buildPanel };
})();
