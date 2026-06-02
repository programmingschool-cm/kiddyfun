/**
 * G7 — Visual tile painter (grid → map JSON)
 */
(function () {
  'use strict';

  var COLS = 15;
  var ROWS = 9;
  var CELL = 24;
  var tool = 'coin';

  function buildInto(container) {
    if (!container || container._painter) return;
    container._painter = true;
    var html = '<div class="kf-tile-painter"><div class="btn-group btn-group-sm mb-2">' +
      '<button type="button" class="btn btn-outline-secondary active" data-tile-tool="coin">🪙</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-tile-tool="wall">🧱</button>' +
      '<button type="button" class="btn btn-outline-secondary" data-tile-tool="erase">⌫</button>' +
      '</div><canvas id="kf-tile-canvas" width="' + (COLS * CELL) + '" height="' + (ROWS * CELL) + '" class="kf-tile-canvas border rounded"></canvas>' +
      '<button type="button" class="btn btn-sm btn-primary mt-2 w-100" id="kf-tile-to-json">Apply grid to JSON</button></div>';
    container.insertAdjacentHTML('beforeend', html);
    var canvas = document.getElementById('kf-tile-canvas');
    var ctx = canvas.getContext('2d');
    var grid = [];
    for (var r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (var c = 0; c < COLS; c++) grid[r][c] = '';
    }

    function draw() {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
          if (grid[r][c] === 'coin') {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 8, 0, Math.PI * 2);
            ctx.fill();
          } else if (grid[r][c] === 'wall') {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
          }
        }
      }
    }

    canvas.addEventListener('click', function (ev) {
      var rect = canvas.getBoundingClientRect();
      var c = Math.floor((ev.clientX - rect.left) / CELL);
      var r = Math.floor((ev.clientY - rect.top) / CELL);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      grid[r][c] = tool === 'erase' ? '' : tool;
      draw();
    });

    container.querySelectorAll('[data-tile-tool]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tool = btn.getAttribute('data-tile-tool');
        container.querySelectorAll('[data-tile-tool]').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
      });
    });

    document.getElementById('kf-tile-to-json').addEventListener('click', function () {
      var obstacles = [];
      var entities = [];
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var x = c * CELL * 2;
          var y = r * CELL * 2;
          if (grid[r][c] === 'wall') {
            obstacles.push({ x: x, y: y, w: CELL * 2, h: CELL * 2, solid: true });
          } else if (grid[r][c] === 'coin') {
            entities.push({ type: 'coin', x: x + 8, y: y + 8 });
          }
        }
      }
      var data = {
        refW: COLS * CELL * 2,
        refH: ROWS * CELL * 2,
        view: 'top',
        label: 'Painted map',
        obstacles: obstacles,
        entities: entities,
      };
      var jsonEl = document.getElementById('kf-map-json');
      if (jsonEl) jsonEl.value = JSON.stringify(data, null, 2);
      if (window.UI && UI.showToast) UI.showToast('🗺️ Grid applied to map JSON');
    });
    draw();
  }

  window.KiddyTilePainter = { buildInto: buildInto };
})();
