/**
 * KiddyFun Game FX — score pop, shake, coin burst (G6)
 */
(function () {
  'use strict';

  var GameFx = {
    scorePop: function (stage, text) {
      if (!stage) return;
      var el = document.createElement('div');
      el.className = 'kf-game-score-pop';
      el.textContent = text || '+10';
      el.style.left = '50%';
      el.style.top = '28%';
      stage.appendChild(el);
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 900);
    },

    coinBurst: function (layer, x, y) {
      if (!layer) return;
      for (var i = 0; i < 6; i++) {
        var p = document.createElement('span');
        p.className = 'kf-game-particle';
        p.textContent = '✨';
        p.style.left = (x + 8) + 'px';
        p.style.top = (y + 4) + 'px';
        p.style.setProperty('--kf-dx', ((Math.random() - 0.5) * 48) + 'px');
        p.style.setProperty('--kf-dy', (-20 - Math.random() * 30) + 'px');
        layer.appendChild(p);
        setTimeout(function (node) {
          return function () {
            if (node.parentNode) node.parentNode.removeChild(node);
          };
        }(p), 650);
      }
    },

    stageShake: function (stage, big) {
      if (!stage) return;
      stage.classList.remove('kf-stage-shake', 'kf-stage-shake-big');
      void stage.offsetWidth;
      stage.classList.add(big ? 'kf-stage-shake-big' : 'kf-stage-shake');
      setTimeout(function () {
        stage.classList.remove('kf-stage-shake', 'kf-stage-shake-big');
      }, big ? 600 : 450);
    },
  };

  window.KiddyGameFx = GameFx;
})();
