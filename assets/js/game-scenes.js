/**
 * Pre-built scene collision / entity data for game mode
 */
(function () {
  'use strict';

  window.KiddyGameScenes = {
    playground: {
      refW: 600,
      refH: 360,
      view: 'side',
      obstacles: [
        { id: 'ground_plat', x: 120, y: 280, w: 160, h: 24, tag: 'platform', solid: true },
        { id: 'wall1', x: 400, y: 220, w: 40, h: 100, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 180, y: 248, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 320, y: 200, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 480, y: 280, w: 28, h: 28, tags: ['coin'] },
      ],
    },
    jungle: {
      view: 'side',
      obstacles: [
        { id: 'tree', x: 250, y: 240, w: 50, h: 80, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 150, y: 280, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 350, y: 200, w: 28, h: 28, tags: ['coin'] },
      ],
    },
    school: {
      refW: 600,
      refH: 360,
      view: 'top',
      obstacles: [
        { id: 'desk1', x: 100, y: 100, w: 60, h: 40, tag: 'wall', solid: true },
        { id: 'desk2', x: 300, y: 200, w: 60, h: 40, tag: 'wall', solid: true },
      ],
      entities: [
        { key: 'coin1', name: 'Coin', x: 200, y: 150, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin2', name: 'Coin', x: 450, y: 250, w: 28, h: 28, tags: ['coin'] },
        { key: 'coin3', name: 'Coin', x: 150, y: 280, w: 28, h: 28, tags: ['coin'] },
      ],
    },
  };
})();
