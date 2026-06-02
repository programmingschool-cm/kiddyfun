/**
 * KiddyFun Game State — lives, timer, goals, win/lose (G6)
 */
(function () {
  'use strict';

  function GameState() {
    this.reset();
  }

  GameState.prototype.reset = function () {
    this.lives = null;
    this.timer = null;
    this._timerAccum = 0;
    this.goalCoins = null;
    this.collectedCoins = 0;
    this.level = 1;
    this.status = 'playing';
    this.banner = '';
    this.cameraFollow = null;
  };

  GameState.prototype.setLives = function (n) {
    this.lives = Math.max(0, Math.round(n));
  };

  GameState.prototype.setTimer = function (seconds) {
    this.timer = Math.max(0, Math.round(seconds));
    this._timerAccum = 0;
  };

  GameState.prototype.setGoalCoins = function (n) {
    this.goalCoins = Math.max(1, Math.round(n));
  };

  GameState.prototype.loseLife = function (n) {
    if (this.lives == null) return;
    this.lives = Math.max(0, this.lives - (n || 1));
    if (this.lives <= 0) this.status = 'lost';
  };

  GameState.prototype.tickTimer = function (dtMs) {
    if (this.timer == null || this.status !== 'playing') return;
    this._timerAccum += dtMs;
    while (this._timerAccum >= 1000 && this.timer > 0) {
      this._timerAccum -= 1000;
      this.timer--;
    }
    if (this.timer <= 0) {
      this.timer = 0;
      this.status = 'lost';
    }
  };

  GameState.prototype.countActiveCoins = function (world) {
    if (!world) return 0;
    var n = 0;
    Object.keys(world.entities).forEach(function (key) {
      var e = world.entities[key];
      if (!e || !e.active) return;
      if (e.tags.indexOf('coin') >= 0 || key.indexOf('coin') === 0) n++;
    });
    return n;
  };

  GameState.prototype.countCollectedTowardGoal = function (world, initialCoins) {
    if (this.goalCoins == null) return 0;
    var left = this.countActiveCoins(world);
    return Math.max(0, initialCoins - left);
  };

  GameState.prototype.addCollectedCoin = function () {
    this.collectedCoins++;
    if (this.goalCoins != null && this.collectedCoins >= this.goalCoins && this.status === 'playing') {
      this.status = 'won';
    }
  };

  GameState.prototype.checkAllCoinsGone = function (world) {
    return this.countActiveCoins(world) === 0;
  };

  GameState.prototype.markWon = function () {
    if (this.status === 'playing') this.status = 'won';
  };

  GameState.prototype.isPlaying = function () {
    return this.status === 'playing';
  };

  window.KiddyGameState = GameState;
})();
