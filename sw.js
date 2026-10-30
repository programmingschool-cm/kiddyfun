/**
 * PWA service worker — network first, versioned cache.
 * Offline fallback is the app shell for navigations only.
 */
var CACHE = 'kiddyfun-v5';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/css/stage.css',
  './assets/css/worksheet.css',
  './assets/css/fonts.css',
  './assets/css/bootstrap.min.css',
  './assets/data/curriculum.json',
  './assets/brand/mostak.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/js/bootstrap.bundle.min.js',
  './assets/js/supabase-config.js',
  './assets/js/supabase-client.js',
  './assets/js/supabase-sync.js',
  './assets/js/supabase-auth.js',
  './assets/js/audio.js',
  './assets/js/lexer.js',
  './assets/js/expr.js',
  './assets/js/parser.js',
  './assets/js/errors.js',
  './assets/js/storage.js',
  './assets/js/experience-mode.js',
  './assets/js/publish.js',
  './assets/js/gallery.js',
  './assets/js/examples.js',
  './assets/js/syntax-reference.js',
  './assets/js/missions.js',
  './assets/js/tutorial-content.js',
  './assets/js/tutorial.js',
  './assets/js/game-world.js',
  './assets/js/game-input.js',
  './assets/js/game-loop.js',
  './assets/js/game-scenes.js',
  './assets/js/game-maps.js',
  './assets/js/game-user-maps.js',
  './assets/js/game-combat.js',
  './assets/js/game-state.js',
  './assets/js/game-enemies.js',
  './assets/js/game-fx.js',
  './assets/js/game-runtime.js',
  './assets/js/stage-animator.js',
  './assets/js/stage-graphics.js',
  './assets/js/stage-actions.js',
  './assets/js/stage-pro.js',
  './assets/js/runtime.js',
  './assets/js/game-interpreter.js',
  './assets/js/interpreter.js',
  './assets/js/editor-highlight.js',
  './assets/js/editor-blocks.js',
  './assets/js/editor-linter.js',
  './assets/js/language-catalog.js',
  './assets/js/smart-editor.js',
  './assets/js/game-map-helper.js',
  './assets/js/game-map-editor.js',
  './assets/js/game-debugger.js',
  './assets/js/curriculum-data.js',
  './assets/js/curriculum.js',
  './assets/js/speech-practice.js',
  './assets/js/gamification.js',
  './assets/js/teacher-panel.js',
  './assets/js/python-export.js',
  './assets/js/project-files.js',
  './assets/js/blocks-script.js',
  './assets/js/blocks-mode.js',
  './assets/js/tour.js',
  './assets/js/share-link.js',
  './assets/js/hint-bot.js',
  './assets/js/word-of-day.js',
  './assets/js/ui-locale.js',
  './assets/js/badges-gallery.js',
  './assets/js/parent-summary.js',
  './assets/js/python-panel.js',
  './assets/js/avatar-themes.js',
  './assets/js/game-tile-painter.js',
  './assets/js/ui.js',
  './assets/js/app.js',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function offlineFallback(request) {
  if (request.mode === 'navigate') return caches.match('./index.html');
  return Promise.resolve(new Response('', { status: 504, statusText: 'offline' }));
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.search) {
    e.respondWith(fetch(e.request).catch(function () { return offlineFallback(e.request); }));
    return;
  }

  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || offlineFallback(e.request);
      });
    })
  );
});
