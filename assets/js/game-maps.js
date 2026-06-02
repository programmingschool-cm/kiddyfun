/**
 * KiddyFun Game Maps (G7) — named layouts: walls, platforms, coins
 * Reference size 600×360 (scaled to stage on load)
 */
(function () {
  'use strict';

  window.KiddyGameMaps = {
    school_maze: {
      refW: 600,
      refH: 360,
      view: 'top',
      label: 'School maze',
      obstacles: [
        { id: 'b_top', x: 0, y: 0, w: 600, h: 24, tag: 'wall', solid: true },
        { id: 'b_bot', x: 0, y: 336, w: 600, h: 24, tag: 'wall', solid: true },
        { id: 'b_left', x: 0, y: 0, w: 24, h: 360, tag: 'wall', solid: true },
        { id: 'b_right', x: 576, y: 0, w: 24, h: 360, tag: 'wall', solid: true },
        { id: 'm1', x: 120, y: 80, w: 200, h: 32, tag: 'wall', solid: true },
        { id: 'm2', x: 320, y: 180, w: 160, h: 32, tag: 'wall', solid: true },
        { id: 'm3', x: 80, y: 220, w: 32, h: 100, tag: 'wall', solid: true },
        { id: 'desk', x: 400, y: 60, w: 80, h: 50, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 60, y: 60, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 280, y: 140, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 520, y: 100, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin4', name: 'Coin', x: 180, y: 300, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin5', name: 'Coin', x: 480, y: 280, w: 28, h: 28, tags: ['coin'] },
      ],
    },

    playground_extended: {
      refW: 600,
      refH: 360,
      view: 'side',
      label: 'Platform course',
      obstacles: [
        { id: 'plat1', x: 80, y: 260, w: 120, h: 24, tag: 'platform', solid: true },
        { id: 'plat2', x: 260, y: 220, w: 100, h: 24, tag: 'platform', solid: true },
        { id: 'plat3', x: 400, y: 180, w: 120, h: 24, tag: 'platform', solid: true },
        { id: 'plat4', x: 180, y: 140, w: 90, h: 24, tag: 'platform', solid: true },
        { id: 'wall_end', x: 520, y: 200, w: 40, h: 120, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 120, y: 228, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 290, y: 188, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 440, y: 148, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin4', name: 'Coin', x: 210, y: 108, w: 28, h: 28, tags: ['coin'] },
      ],
    },

    jungle_run: {
      refW: 600,
      refH: 360,
      view: 'side',
      label: 'Jungle run',
      obstacles: [
        { id: 'tree1', x: 200, y: 230, w: 48, h: 90, tag: 'wall', solid: true },
        { id: 'tree2', x: 380, y: 250, w: 48, h: 70, tag: 'wall', solid: true },
        { id: 'stump', x: 480, y: 270, w: 60, h: 40, tag: 'platform', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 100, y: 280, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 300, y: 200, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 500, y: 238, w: 28, h: 28, tags: ['coin'] },
      ],
    },

    arena_coins: {
      refW: 600,
      refH: 360,
      view: 'top',
      label: 'Open arena',
      obstacles: [
        { id: 'c1', x: 150, y: 120, w: 100, h: 28, tag: 'wall', solid: true },
        { id: 'c2', x: 350, y: 200, w: 100, h: 28, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 80, y: 80, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 500, y: 80, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 80, y: 260, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin4', name: 'Coin', x: 500, y: 260, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin5', name: 'Coin', x: 300, y: 160, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin6', name: 'Coin', x: 300, y: 260, w: 28, h: 28, tags: ['coin'] },
      ],
    },
  };
})();
