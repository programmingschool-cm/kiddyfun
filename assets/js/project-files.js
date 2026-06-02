/**
 * E3 Studio — simple multi-file projects (localStorage)
 */
(function () {
  'use strict';

  var KEY = 'kf_studio_project';
  var activeFile = 'main.kf';

  function loadProject() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{"files":{"main.kf":""},"active":"main.kf"}');
    } catch (e) {
      return { files: { 'main.kf': '' }, active: 'main.kf' };
    }
  }

  function saveProject(proj) {
    try { localStorage.setItem(KEY, JSON.stringify(proj)); } catch (e) { /* ignore */ }
  }

  function isStudio() {
    return window.KiddyExperience && KiddyExperience.isStudio();
  }

  function mergeForRun(mainCode) {
    if (!isStudio()) return mainCode;
    var proj = loadProject();
    var parts = [];
    Object.keys(proj.files).forEach(function (name) {
      if (name === 'main.kf') return;
      parts.push('# --- file: ' + name + ' ---\n' + proj.files[name]);
    });
    parts.push('# --- file: main.kf ---\n' + (proj.files['main.kf'] || mainCode));
    return parts.join('\n\n');
  }

  function buildTabs() {
    var bar = document.getElementById('kf-studio-tabs');
    if (!bar || !isStudio()) {
      if (bar) bar.classList.add('d-none');
      return;
    }
    bar.classList.remove('d-none');
    var proj = loadProject();
    activeFile = proj.active || 'main.kf';
    bar.innerHTML = '';
    Object.keys(proj.files).forEach(function (name) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kf-studio-tab' + (name === activeFile ? ' active' : '');
      btn.textContent = name;
      btn.addEventListener('click', function () {
        switchFile(name);
      });
      bar.appendChild(btn);
    });
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'kf-studio-tab kf-studio-tab-add';
    add.textContent = '+';
    add.title = 'New file';
    add.addEventListener('click', function () {
      var n = prompt('New file name:', 'utils.kf');
      if (!n) return;
      proj = loadProject();
      proj.files[n] = '';
      proj.active = n;
      saveProject(proj);
      buildTabs();
      switchFile(n);
    });
    bar.appendChild(add);
  }

  function switchFile(name) {
    var ed = document.getElementById('ss-editor');
    var proj = loadProject();
    if (ed) proj.files[proj.active || 'main.kf'] = ed.value;
    proj.active = name;
    saveProject(proj);
    activeFile = name;
    if (ed) {
      ed.value = proj.files[name] || '';
      if (window.SpeakStorage) SpeakStorage.saveLastCode(ed.value);
      if (window.UI && UI.syncLineNumbers) UI.syncLineNumbers();
    }
    buildTabs();
  }

  function syncFromEditor() {
    if (!isStudio()) return;
    var ed = document.getElementById('ss-editor');
    var proj = loadProject();
    proj.files[proj.active || 'main.kf'] = ed ? ed.value : '';
    saveProject(proj);
  }

  window.KiddyProjectFiles = {
    isStudio: isStudio,
    mergeForRun: mergeForRun,
    buildTabs: buildTabs,
    syncFromEditor: syncFromEditor,
    init: function () {
      buildTabs();
      window.addEventListener('kf-experience-change', buildTabs);
    },
  };
})();
