/**
 * KiddyFun Interpreter v2.2
 * Stories + variables, functions, input, for-each, break/continue, const
 */
(function () {
  'use strict';

  var Expr = function () { return window.KiddyExpr; };

  function InterpretError(message, line) {
    this.message = message;
    this.line = line;
    this.name = 'InterpretError';
  }
  InterpretError.prototype = Object.create(Error.prototype);

  function Environment(parent) {
    this.vars = {};
    this.consts = {};
    this.parent = parent || null;
  }
  Environment.prototype.isConst = function (name) {
    if (Object.prototype.hasOwnProperty.call(this.consts, name)) return true;
    if (this.parent) return this.parent.isConst(name);
    return false;
  };
  Environment.prototype.get = function (name) {
    if (Object.prototype.hasOwnProperty.call(this.vars, name)) return this.vars[name];
    if (this.parent) return this.parent.get(name);
    return undefined;
  };
  Environment.prototype.set = function (name, value, line) {
    if (this.isConst(name)) {
      throw new InterpretError('Cannot change const "' + name + '". Make a new variable with set instead.', line || 0);
    }
    this.vars[name] = value;
  };
  Environment.prototype.defineConst = function (name, value) {
    this.vars[name] = value;
    this.consts[name] = true;
  };

  function Interpreter(runtime) {
    this.runtime = runtime;
    this._stopped = false;
    this._resolve = null;
    this.functions = {};
    this.globalEnv = new Environment(null);
    this._returnValue = undefined;
    this._returning = false;
    this._breakLoop = false;
    this._continueLoop = false;
  }

  Interpreter.prototype.run = function (nodes) {
    this._stopped = false;
    this._returning = false;
    this._breakLoop = false;
    this._continueLoop = false;
    this.runtime.reset();
    return this._execNodes(nodes, this.globalEnv);
  };

  Interpreter.prototype.stop = function () {
    this._stopped = true;
    if (window.KiddyAudio) KiddyAudio.cancelAll();
    if (this._resolve) { this._resolve('wrong'); this._resolve = null; }
  };

  Interpreter.prototype.promptUser = function (question, line) {
    var E = Expr();
    var text = '';
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      var raw = window.prompt(question);
      text = raw === null ? '' : String(raw);
    }
    if (this.runtime && this.runtime.logMessage) {
      this.runtime.logMessage('⌨️ You typed: ' + (text || '(empty)'));
    }
    return E.kfVal('string', text);
  };

  Interpreter.prototype._eval = function (expr, env, line) {
    var E = Expr();
    if (!E) throw new InterpretError('Expression engine missing', line);
    try {
      return E.evaluate(expr, env, line, this);
    } catch (e) {
      if (e.name === 'ExprError') throw new InterpretError(e.message, line);
      throw e;
    }
  };

  Interpreter.prototype._evalAsync = function (expr, env, line) {
    var self = this;
    if (!expr) return Promise.resolve(null);
    if (expr.type === 'call_expr') {
      return this.callFunctionValue(expr.name, expr.args, env, line);
    }
    if (expr.type === 'ask_user') {
      return Promise.resolve(this.promptUser(expr.question, line));
    }
    return Promise.resolve(this._eval(expr, env, line));
  };

  Interpreter.prototype._shouldStopLoop = function () {
    return this._stopped || this._returning;
  };

  Interpreter.prototype._afterLoopBody = function () {
    if (this._breakLoop) {
      this._breakLoop = false;
      return 'break';
    }
    if (this._continueLoop) {
      this._continueLoop = false;
      return 'continue';
    }
    return null;
  };

  Interpreter.prototype._execNodes = function (nodes, env) {
    var self = this;
    var index = 0;

    function next() {
      if (self._shouldStopLoop() || index >= nodes.length) return Promise.resolve();
      var node = nodes[index++];
      return self._execNode(node, env).then(function () { return next(); });
    }

    return next();
  };

  Interpreter.prototype._execNode = function (node, env) {
    if (this._shouldStopLoop()) return Promise.resolve();
    var self = this;
    var R = this.runtime;
    var E = Expr();
    var line = node.line;

    switch (node.type) {
      case 'set_var':
        return this._evalAsync(node.expr, env, line).then(function (val) {
          env.set(node.name, val, line);
        });

      case 'const_var':
        return this._evalAsync(node.expr, env, line).then(function (val) {
          if (env.isConst(node.name)) {
            throw new InterpretError('const "' + node.name + '" already exists', line);
          }
          env.defineConst(node.name, val);
        });

      case 'ask_user_stmt':
        return this._evalAsync({ type: 'ask_user', question: node.question }, env, line).then(function (val) {
          env.set('answer', val, line);
          if (node.storeAs) env.set(node.storeAs, val, line);
        });

      case 'define_func':
        this.functions[node.name] = { params: node.params, body: node.body };
        return Promise.resolve();

      case 'call_func':
        return this.callFunctionValue(node.name, node.args, env, line).then(function () {});

      case 'return_stmt':
        return this._evalAsync(node.expr, env, line).then(function (val) {
          if (node.expr) self._returnValue = val;
          else self._returnValue = E ? E.kfVal('boolean', true) : null;
          self._returning = true;
        });

      case 'break_stmt':
        this._breakLoop = true;
        return Promise.resolve();

      case 'continue_stmt':
        this._continueLoop = true;
        return Promise.resolve();

      case 'show_type': {
        var tv = env.get(node.name);
        if (tv === undefined) throw new InterpretError('Unknown variable: ' + node.name, line);
        R.logMessage('📦 Type of ' + node.name + ': ' + E.typeName(tv));
        return this._delay(900);
      }

      case 'show_value': {
        var vv = env.get(node.name);
        if (vv === undefined) throw new InterpretError('Unknown variable: ' + node.name, line);
        R.logMessage('📋 ' + node.name + ' = ' + E.toStringVal(vv));
        return this._delay(900);
      }

      case 'add_to_list':
        return this._evalAsync(node.expr, env, line).then(function (val) {
          var listV = env.get(node.listName);
          if (!listV || listV.type !== 'list') {
            throw new InterpretError(node.listName + ' must be a list. Example: set fruits to list "a" and "b"', line);
          }
          if (env.isConst(node.listName)) {
            throw new InterpretError('Cannot add to const list "' + node.listName + '"', line);
          }
          listV.value.push(val);
          env.set(node.listName, listV, line);
          if (R.logMessage) R.logMessage('➕ Added to ' + node.listName + ': ' + E.toStringVal(val));
        });

      case 'remove_from_list': {
        var listR = env.get(node.listName);
        if (!listR || listR.type !== 'list') {
          throw new InterpretError(node.listName + ' must be a list', line);
        }
        if (env.isConst(node.listName)) {
          throw new InterpretError('Cannot remove from const list "' + node.listName + '"', line);
        }
        var idx = node.index - 1;
        if (idx < 0 || idx >= listR.value.length) {
          throw new InterpretError('Cannot remove item ' + node.index + ' — list has ' + listR.value.length + ' item(s)', line);
        }
        listR.value.splice(idx, 1);
        env.set(node.listName, listR, line);
        if (R.logMessage) R.logMessage('➖ Removed item ' + node.index + ' from ' + node.listName);
        return this._delay(400);
      }

      case 'scene':
        R.setScene(node.value);
        return this._delay(400);

      case 'character_appears':
        R.characterAppears(node.actor);
        return this._delay(500);

      case 'say':
        return this._delay(150).then(function () {
          return self._sayText(R, node.actor, node.text);
        });

      case 'say_expr':
        return this._delay(150).then(function () {
          return self._evalAsync(node.expr, env, line).then(function (v) {
            return self._sayText(R, node.actor, E.toStringVal(v));
          });
        });

      case 'action':
        R.applyAction(node.actor, node.action);
        return this._delay(950);

      case 'vocab':
        R.showVocab(node.word, node.meaning);
        return this._delay(700);

      case 'wait':
        return this._delay(Math.min(node.seconds * 1000, 8000));

      case 'quiz':
        return this._runQuiz(node).then(function (result) {
          R.quizResult = result;
          env.set('answer', E.kfVal('string', result), line);
          return self._delay(900);
        });

      case 'repeat':
        return this._repeatCount(node.count, node.body, env);

      case 'repeat_while':
        return this._repeatWhile(node.condition, node.body, env, line);

      case 'for_each':
        return this._forEach(node.itemVar, node.listName, node.body, env, line);

      case 'if_answer': {
        var quizRes = R.quizResult || 'wrong';
        var branch = (quizRes === node.condition) ? node.trueBranch : node.falseBranch;
        return this._execNodes(branch, env);
      }

      case 'if_cond':
        return this._evalAsync(node.condition, env, line).then(function (cv) {
          var br = E.isTruthy(cv) ? node.trueBranch : node.falseBranch;
          return self._execNodes(br, env);
        });

      case 'score_set':
        R.setScore(node.value);
        return Promise.resolve();

      case 'score_add':
        R.addScore(node.value);
        if (window.KiddyAudio) KiddyAudio.playSound('success');
        return this._delay(200);

      case 'score_show':
        R.showScore();
        return this._delay(1200);

      case 'play_sound':
        R.playSound(node.name);
        return this._delay(600);

      default:
        throw new InterpretError('Unknown command: ' + node.type, line);
    }
  };

  Interpreter.prototype._sayText = function (R, actor, text) {
    var self = this;
    var speechPromise = R.showSpeech(actor, text);
    if (speechPromise && typeof speechPromise.then === 'function') {
      return speechPromise.then(function () { return self._delay(300); });
    }
    return this._delay(2000);
  };

  Interpreter.prototype._repeatCount = function (count, body, env) {
    var self = this;
    var i = 0;
    function loop() {
      if (self._shouldStopLoop() || i >= count) return Promise.resolve();
      i++;
      return self._execNodes(body, env).then(function () {
        if (self._breakLoop) { self._breakLoop = false; return Promise.resolve(); }
        if (self._continueLoop) { self._continueLoop = false; return loop(); }
        return self._delay(250).then(loop);
      });
    }
    return loop();
  };

  Interpreter.prototype._repeatWhile = function (condition, body, env, line) {
    var self = this;
    var E = Expr();
    var guard = 0;
    function loop() {
      if (self._shouldStopLoop() || guard > 500) return Promise.resolve();
      return self._evalAsync(condition, env, line).then(function (cv) {
        if (!E.isTruthy(cv)) return Promise.resolve();
        guard++;
        return self._execNodes(body, env).then(function () {
          if (self._breakLoop) { self._breakLoop = false; return Promise.resolve(); }
          if (self._continueLoop) { self._continueLoop = false; return self._delay(100); }
          return self._delay(200);
        }).then(loop);
      });
    }
    return loop();
  };

  Interpreter.prototype._forEach = function (itemVar, listName, body, env, line) {
    var self = this;
    var listV = env.get(listName);
    if (!listV || listV.type !== 'list') {
      throw new InterpretError(listName + ' must be a list for for each', line);
    }
    var items = listV.value;
    var i = 0;
    function loop() {
      if (self._shouldStopLoop() || i >= items.length) return Promise.resolve();
      var local = new Environment(env);
      local.set(itemVar, items[i]);
      i++;
      return self._execNodes(body, local).then(function () {
        if (self._breakLoop) { self._breakLoop = false; return Promise.resolve(); }
        if (self._continueLoop) { self._continueLoop = false; return self._delay(100); }
        return self._delay(200);
      }).then(loop);
    }
    return loop();
  };

  Interpreter.prototype.callFunctionValue = function (name, argExprs, env, line) {
    var fn = this.functions[name];
    if (!fn) throw new InterpretError('Unknown function: ' + name + '. Use define first.', line);
    var E = Expr();
    var self = this;
    var args = [];
    var chain = Promise.resolve();
    (argExprs || []).forEach(function (ex) {
      chain = chain.then(function () {
        return self._evalAsync(ex, env, line).then(function (v) { args.push(v); });
      });
    });
    return chain.then(function () {
      if (args.length !== fn.params.length) {
        throw new InterpretError(
          'Function ' + name + ' needs ' + fn.params.length + ' value(s), got ' + args.length,
          line
        );
      }
      var local = new Environment(env);
      for (var i = 0; i < fn.params.length; i++) local.set(fn.params[i], args[i]);
      var savedReturn = self._returnValue;
      var savedFlag = self._returning;
      self._returnValue = undefined;
      self._returning = false;
      return self._execNodes(fn.body, local).then(function () {
        var out = self._returnValue;
        self._returning = savedFlag;
        self._returnValue = savedReturn;
        if (out !== undefined) return out;
        return E.kfVal('boolean', true);
      });
    });
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
  console.log('[KiddyFun] Interpreter v2.1 ready');
})();
