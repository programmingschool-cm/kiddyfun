/**
 * SpeakScript Interpreter v0.1
 * Walks the AST and executes commands through the Runtime with async timing.
 */
(function () {
  'use strict';

  function InterpretError(message, line) {
    this.message = message;
    this.line    = line;
    this.name    = 'InterpretError';
  }
  InterpretError.prototype = Object.create(Error.prototype);

  function Interpreter(runtime) {
    this.runtime  = runtime;
    this._stopped = false;
    this._resolve = null;
  }

  Interpreter.prototype.run = function (nodes) {
    this._stopped = false;
    this.runtime.reset();
    return this._execNodes(nodes);
  };

  Interpreter.prototype.stop = function () {
    this._stopped = true;
    if (this._resolve) { this._resolve('wrong'); this._resolve = null; }
  };

  Interpreter.prototype._execNodes = function (nodes) {
    var self  = this;
    var index = 0;

    function next() {
      if (self._stopped || index >= nodes.length) return Promise.resolve();
      var node = nodes[index++];
      return self._execNode(node).then(function () { return next(); });
    }

    return next();
  };

  Interpreter.prototype._execNode = function (node) {
    if (this._stopped) return Promise.resolve();
    var self = this;
    var R    = this.runtime;

    switch (node.type) {
      case 'scene':
        R.setScene(node.value);
        return this._delay(300);

      case 'character_appears':
        R.characterAppears(node.actor);
        return this._delay(400);

      case 'say':
        return this._delay(200).then(function () {
          R.showSpeech(node.actor, node.text);
          return self._delay(1800);
        });

      case 'action':
        R.applyAction(node.actor, node.action);
        return this._delay(900);

      case 'vocab':
        R.showVocab(node.word, node.meaning);
        return this._delay(600);

      case 'wait':
        return this._delay(Math.min(node.seconds * 1000, 5000));

      case 'quiz':
        return this._runQuiz(node).then(function (result) {
          R.quizResult = result;
          return self._delay(800);
        });

      case 'repeat': {
        var count = node.count;
        var body  = node.body;
        var i = 0;
        function loop() {
          if (self._stopped || i >= count) return Promise.resolve();
          i++;
          return self._execNodes(body).then(function () {
            return self._delay(200);
          }).then(loop);
        }
        return loop();
      }

      case 'if_answer': {
        var quizRes = R.quizResult || 'wrong';
        var branch  = (quizRes === node.condition) ? node.trueBranch : node.falseBranch;
        return this._execNodes(branch);
      }

      case 'score_set':
        R.setScore(node.value);
        return Promise.resolve();

      case 'score_add':
        R.addScore(node.value);
        return Promise.resolve();

      case 'score_show':
        R.showScore();
        return this._delay(1000);

      case 'play_sound':
        R.playSound(node.name);
        return this._delay(500);

      default:
        throw new InterpretError('Unknown node type: ' + node.type, node.line);
    }
  };

  Interpreter.prototype._runQuiz = function (node) {
    var self = this;
    return new Promise(function (resolve) {
      self._resolve = resolve;
      self.runtime.showQuiz(node.question, node.choices, function (result) {
        self._resolve = null;
        resolve(result);
      });
    });
  };

  Interpreter.prototype._delay = function (ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  };

  window.SpeakInterpreter = { Interpreter: Interpreter, InterpretError: InterpretError };
  console.log('[SpeakScript] Interpreter ready');
})();
