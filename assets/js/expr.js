/**
 * KiddyFun Expression Engine v2.0
 * English-like expressions: set x to 5 plus 3, if score is greater than 10
 */
(function () {
  'use strict';

  var TT = {
    KEYWORD: 'KEYWORD',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    IDENTIFIER: 'IDENTIFIER',
    EOL: 'EOL',
    EOF: 'EOF',
  };

  /* Only words that break the grammar if used as a name (set x to …, if … is greater than …) */
  var RESERVED_NAMES = {
    to: 1, with: 1, and: 1, or: 1, not: 1, is: 1, in: 1, of: 1,
    true: 1, false: 1, end: 1, else: 1, if: 1,
    greater: 1, than: 1, less: 1, equal: 1, equals: 1,
    divided: 1, by: 1, joined: 1, length: 1,
    set: 1, define: 1, call: 1, const: 1, for: 1, each: 1, break: 1, continue: 1,
    list: 1, item: 1, ask: 1, user: 1, as: 1,
    scene: 1, appears: 1, says: 1, narrator: 1,
    at: 1, starts: 1, means: 1, correct: 1, wrong: 1,
    wait: 1, second: 1, seconds: 1, choice: 1,
    random: 1, from: 1, remainder: 1, remove: 1, number: 1,
  };

  function isVarNameToken(tok) {
    if (!tok) return false;
    if (tok.type === TT.IDENTIFIER) return true;
    if (tok.type === TT.KEYWORD && !RESERVED_NAMES[tok.value]) return true;
    return false;
  }

  function varNameHint(word) {
    if (word === 'with') {
      return 'Put the function name before "with". Example: define addNumbers with a and b';
    }
    if (RESERVED_NAMES[word]) {
      return '"' + word + '" is a special command word. Pick another name, e.g. my' +
        word.charAt(0).toUpperCase() + word.slice(1);
    }
    return 'Expected a name here. Example: define myFunction with x';
  }

  function ExprError(message, line) {
    this.message = message;
    this.line = line;
    this.name = 'ExprError';
  }
  ExprError.prototype = Object.create(Error.prototype);

  function ExprParser(tokens, pos, line) {
    this.tokens = tokens;
    this.pos = pos;
    this.line = line;
  }

  ExprParser.prototype.peek = function () { return this.tokens[this.pos]; };
  ExprParser.prototype.advance = function () { return this.tokens[this.pos++]; };
  ExprParser.prototype.isAtEnd = function () {
    var t = this.peek();
    return !t || t.type === TT.EOL || t.type === TT.EOF;
  };

  ExprParser.prototype.matchKeyword = function (kw) {
    var t = this.peek();
    return t && t.type === TT.KEYWORD && t.value === kw;
  };

  ExprParser.prototype.consumeKeyword = function (kw) {
    if (!this.matchKeyword(kw)) return false;
    this.advance();
    return true;
  };

  ExprParser.prototype.parseExpression = function () {
    return this.parseOr();
  };

  ExprParser.prototype.parseOr = function () {
    var left = this.parseAnd();
    while (this.matchKeyword('or')) {
      this.advance();
      left = { type: 'binop', op: 'or', left: left, right: this.parseAnd() };
    }
    return left;
  };

  ExprParser.prototype.parseAnd = function () {
    var left = this.parseComparison();
    while (this.matchKeyword('and')) {
      this.advance();
      left = { type: 'binop', op: 'and', left: left, right: this.parseComparison() };
    }
    return left;
  };

  ExprParser.prototype.parseComparison = function () {
    var left = this.parseAddition();
    if (this.matchKeyword('is')) {
      this.advance();
      if (this.consumeKeyword('greater')) {
        this.consumeKeyword('than');
        if (this.consumeKeyword('or')) {
          this.consumeKeyword('equal');
          this.consumeKeyword('to');
          return { type: 'compare', op: 'gte', left: left, right: this.parseAddition() };
        }
        return { type: 'compare', op: 'gt', left: left, right: this.parseAddition() };
      }
      if (this.consumeKeyword('less')) {
        this.consumeKeyword('than');
        if (this.consumeKeyword('or')) {
          this.consumeKeyword('equal');
          this.consumeKeyword('to');
          return { type: 'compare', op: 'lte', left: left, right: this.parseAddition() };
        }
        return { type: 'compare', op: 'lt', left: left, right: this.parseAddition() };
      }
      if (this.consumeKeyword('empty')) {
        return { type: 'compare', op: 'empty', left: left, right: null };
      }
      if (this.consumeKeyword('in')) {
        var listTok = this.peek();
        if (!isVarNameToken(listTok)) {
          throw new ExprError('Use: "apple" is in fruits (list variable name after in)', this.line);
        }
        this.advance();
        return { type: 'compare', op: 'in', left: left, right: { type: 'var', name: listTok.value } };
      }
      if (this.consumeKeyword('not')) {
        this.consumeKeyword('equal');
        this.consumeKeyword('to');
        return { type: 'compare', op: 'neq', left: left, right: this.parseAddition() };
      }
      if (this.consumeKeyword('equal')) {
        this.consumeKeyword('to');
        return { type: 'compare', op: 'eq', left: left, right: this.parseAddition() };
      }
      throw new ExprError('After "is" use: greater than, less than, equal to, empty, in, not equal to', this.line);
    }
    if (this.matchKeyword('equals')) {
      this.advance();
      return { type: 'compare', op: 'eq', left: left, right: this.parseAddition() };
    }
    return left;
  };

  ExprParser.prototype.parseAddition = function () {
    var left = this.parseMultiplication();
    while (true) {
      if (this.matchKeyword('plus')) {
        this.advance();
        left = { type: 'binop', op: 'plus', left: left, right: this.parseMultiplication() };
      } else if (this.matchKeyword('minus')) {
        this.advance();
        left = { type: 'binop', op: 'minus', left: left, right: this.parseMultiplication() };
      } else if (this.matchKeyword('joined')) {
        this.advance();
        if (!this.consumeKeyword('with')) throw new ExprError('Use: joined with', this.line);
        left = { type: 'binop', op: 'join', left: left, right: this.parseMultiplication() };
      } else {
        break;
      }
    }
    return left;
  };

  ExprParser.prototype.parseMultiplication = function () {
    var left = this.parseUnary();
    while (true) {
      if (this.matchKeyword('times')) {
        this.advance();
        left = { type: 'binop', op: 'times', left: left, right: this.parseUnary() };
      } else if (this.matchKeyword('divided')) {
        this.advance();
        if (!this.consumeKeyword('by')) throw new ExprError('Use: divided by', this.line);
        left = { type: 'binop', op: 'divide', left: left, right: this.parseUnary() };
      } else if (this.matchKeyword('remainder')) {
        this.advance();
        left = { type: 'binop', op: 'mod', left: left, right: this.parseUnary() };
      } else {
        break;
      }
    }
    return left;
  };

  ExprParser.prototype.parseUnary = function () {
    if (this.matchKeyword('not')) {
      this.advance();
      return { type: 'unary', op: 'not', operand: this.parseUnary() };
    }
    if (this.matchKeyword('length')) {
      this.advance();
      if (!this.consumeKeyword('of')) throw new ExprError('Use: length of name', this.line);
      return { type: 'unary', op: 'length', operand: this.parsePrimary() };
    }
    return this.parsePrimary();
  };

  ExprParser.prototype.parsePrimary = function () {
    var t = this.peek();
    if (!t) throw new ExprError('Expected a value (number, text, true, false, or variable)', this.line);

    if (t.type === TT.NUMBER) {
      this.advance();
      return { type: 'literal', valueType: 'number', value: t.value };
    }
    if (t.type === TT.STRING) {
      this.advance();
      return { type: 'literal', valueType: 'string', value: t.value };
    }
    if (t.type === TT.KEYWORD && t.value === 'true') {
      this.advance();
      return { type: 'literal', valueType: 'boolean', value: true };
    }
    if (t.type === TT.KEYWORD && t.value === 'false') {
      this.advance();
      return { type: 'literal', valueType: 'boolean', value: false };
    }
    if (t.type === TT.KEYWORD && t.value === 'call') {
      return this.parseCallExpr();
    }
    if (t.type === TT.KEYWORD && t.value === 'ask') {
      this.advance();
      if (!this.consumeKeyword('user')) {
        throw new ExprError('Use: ask user "Your question?"', this.line);
      }
      var qTok = this.peek();
      if (!qTok || qTok.type !== TT.STRING) {
        throw new ExprError('ask user needs quoted text. Example: ask user "Your name?"', this.line);
      }
      this.advance();
      return { type: 'ask_user', question: qTok.value };
    }
    if (t.type === TT.KEYWORD && t.value === 'random') {
      this.advance();
      if (!this.consumeKeyword('number')) {
        throw new ExprError('Use: random number from 1 to 10', this.line);
      }
      if (!this.consumeKeyword('from')) throw new ExprError('Use: random number from 1 to 10', this.line);
      var lowExpr = this.parsePrimary();
      if (!this.consumeKeyword('to')) throw new ExprError('Use: random number from 1 to 10', this.line);
      var highExpr = this.parsePrimary();
      return { type: 'random', low: lowExpr, high: highExpr };
    }
    if (t.type === TT.KEYWORD && t.value === 'list') {
      return this.parseListLiteral();
    }
    if (t.type === TT.KEYWORD && t.value === 'item') {
      this.advance();
      var numTok = this.peek();
      if (!numTok || numTok.type !== TT.NUMBER) {
        throw new ExprError('Use: item 1 in myList (position starts at 1)', this.line);
      }
      var idx = Math.round(numTok.value);
      this.advance();
      if (!this.consumeKeyword('in')) throw new ExprError('Use: item 1 in myList', this.line);
      var listName = this.peek();
      if (!isVarNameToken(listName)) {
        throw new ExprError('Expected list variable name after "in"', this.line);
      }
      this.advance();
      return { type: 'item', index: idx, listName: listName.value };
    }
    if (isVarNameToken(t)) {
      var name = t.value;
      this.advance();
      if (this.matchKeyword('in')) {
        throw new ExprError('Use: item 1 in myList (not variable in list here)', this.line);
      }
      return { type: 'var', name: name };
    }
    throw new ExprError('Expected a value, got: ' + (t.value || t.type), this.line);
  };

  ExprParser.prototype.parseCallExpr = function () {
    this.advance(); // call
    var nameTok = this.peek();
    if (!isVarNameToken(nameTok)) {
      throw new ExprError('Expected: call myFunction with 1 and 2', this.line);
    }
    this.advance();
    var name = nameTok.value;
    var args = [];
    if (this.matchKeyword('with')) {
      this.advance();
      if (!this.isAtEnd()) {
        args.push(this.parseExpression());
        while (this.matchKeyword('and')) {
          this.advance();
          args.push(this.parseExpression());
        }
      }
    }
    return { type: 'call_expr', name: name, args: args };
  };

  ExprParser.prototype.parseListLiteral = function () {
    this.advance(); // list
    var items = [];
    while (!this.isAtEnd()) {
      items.push(this.parsePrimary());
      if (this.matchKeyword('and')) { this.advance(); continue; }
      break;
    }
    return { type: 'list', items: items };
  };

  function parseExpression(tokens, pos, line) {
    return parseExpressionUntil(tokens, pos, line, null);
  }

  function parseExpressionUntil(tokens, pos, line, stopKeyword) {
    var p = new ExprParser(tokens, pos, line);
    var expr = p.parseExpression();
    var tk = p.peek();
    if (stopKeyword && tk && tk.type === TT.KEYWORD && tk.value === stopKeyword) {
      return { expr: expr, pos: p.pos };
    }
    while (!p.isAtEnd()) {
      tk = p.peek();
      if (tk.type === TT.EOL || tk.type === TT.EOF) break;
      throw new ExprError('Unexpected extra text in expression: ' + tk.value, line);
    }
    if (!p.isAtEnd() && p.peek().type === TT.EOL) p.advance();
    return { expr: expr, pos: p.pos };
  }

  function parseArgList(tokens, pos, line) {
    var p = new ExprParser(tokens, pos, line);
    var args = [];
    if (p.isAtEnd()) return { args: args, pos: p.pos };
    args.push(p.parseExpression());
    while (p.matchKeyword('and')) {
      p.advance();
      args.push(p.parseExpression());
    }
    return { args: args, pos: p.pos };
  }

  /* ── Runtime values ─────────────────────────────────────────────────── */
  function kfVal(type, value) {
    return { type: type, value: value };
  }

  function toStringVal(v) {
    if (!v) return '';
    if (v.type === 'string') return String(v.value);
    if (v.type === 'number') return String(v.value);
    if (v.type === 'boolean') return v.value ? 'true' : 'false';
    if (v.type === 'list') return '[' + v.value.map(toStringVal).join(', ') + ']';
    return String(v.value);
  }

  function isTruthy(v) {
    if (!v) return false;
    if (v.type === 'boolean') return !!v.value;
    if (v.type === 'number') return v.value !== 0;
    if (v.type === 'string') return v.value.length > 0;
    if (v.type === 'list') return v.value.length > 0;
    return false;
  }

  function evaluate(expr, env, line, interpreter) {
    if (!expr) throw new ExprError('Empty expression', line);

    switch (expr.type) {
      case 'ask_user': {
        if (!interpreter || !interpreter.promptUser) {
          throw new ExprError('ask user only works when the program runs', line);
        }
        return interpreter.promptUser(expr.question, line);
      }
      case 'call_expr': {
        if (!interpreter || !interpreter.callFunctionValue) {
          throw new ExprError('call in an expression needs the running program', line);
        }
        return interpreter.callFunctionValue(expr.name, expr.args, env, line);
      }
      case 'literal':
        return kfVal(expr.valueType, expr.value);
      case 'var': {
        var v = env.get(expr.name);
        if (v === undefined) throw new ExprError('Unknown variable: ' + expr.name, line);
        return v;
      }
      case 'item': {
        var listV = env.get(expr.listName);
        if (!listV || listV.type !== 'list') {
          throw new ExprError(expr.listName + ' is not a list', line);
        }
        var i = expr.index - 1;
        if (i < 0 || i >= listV.value.length) {
          throw new ExprError('List position ' + expr.index + ' is out of range', line);
        }
        return listV.value[i];
      }
      case 'list': {
        var arr = expr.items.map(function (it) { return evaluate(it, env, line); });
        return kfVal('list', arr);
      }
      case 'random': {
        var lo = Math.floor(Number(evaluate(expr.low, env, line).value));
        var hi = Math.floor(Number(evaluate(expr.high, env, line).value));
        if (hi < lo) { var tmp = lo; lo = hi; hi = tmp; }
        return kfVal('number', lo + Math.floor(Math.random() * (hi - lo + 1)));
      }
      case 'unary': {
        var opd = evaluate(expr.operand, env, line);
        if (expr.op === 'not') return kfVal('boolean', !isTruthy(opd));
        if (expr.op === 'length') {
          if (opd.type === 'string') return kfVal('number', opd.value.length);
          if (opd.type === 'list') return kfVal('number', opd.value.length);
          throw new ExprError('length of needs text or list', line);
        }
        break;
      }
      case 'binop': {
        var l = evaluate(expr.left, env, line);
        var r = evaluate(expr.right, env, line);
        if (expr.op === 'join') {
          return kfVal('string', toStringVal(l) + toStringVal(r));
        }
        if (expr.op === 'plus') {
          if (l.type === 'string' || r.type === 'string') {
            return kfVal('string', toStringVal(l) + toStringVal(r));
          }
          return kfVal('number', Number(l.value) + Number(r.value));
        }
        if (expr.op === 'minus') return kfVal('number', Number(l.value) - Number(r.value));
        if (expr.op === 'times') return kfVal('number', Number(l.value) * Number(r.value));
        if (expr.op === 'divide') return kfVal('number', Number(l.value) / Number(r.value));
        if (expr.op === 'mod') {
          var denom = Number(r.value);
          if (denom === 0) throw new ExprError('Cannot divide by zero (remainder)', line);
          return kfVal('number', Math.floor(Number(l.value)) % Math.floor(denom));
        }
        if (expr.op === 'and') return kfVal('boolean', isTruthy(l) && isTruthy(r));
        if (expr.op === 'or') return kfVal('boolean', isTruthy(l) || isTruthy(r));
        break;
      }
      case 'compare': {
        var a = evaluate(expr.left, env, line);
        var b = evaluate(expr.right, env, line);
        if (expr.op === 'eq') {
          if (a.type === b.type && a.type !== 'list') {
            return kfVal('boolean', a.value === b.value);
          }
          return kfVal('boolean', toStringVal(a) === toStringVal(b));
        }
        if (expr.op === 'neq') {
          return kfVal('boolean', toStringVal(a) !== toStringVal(b));
        }
        var an = Number(a.value);
        var bn = Number(b.value);
        if (expr.op === 'gt') return kfVal('boolean', an > bn);
        if (expr.op === 'lt') return kfVal('boolean', an < bn);
        if (expr.op === 'gte') return kfVal('boolean', an >= bn);
        if (expr.op === 'lte') return kfVal('boolean', an <= bn);
        if (expr.op === 'empty') {
          if (a.type === 'list') return kfVal('boolean', a.value.length === 0);
          if (a.type === 'string') return kfVal('boolean', a.value.length === 0);
          return kfVal('boolean', !isTruthy(a));
        }
        if (expr.op === 'in') {
          var listV = evaluate(expr.right, env, line);
          if (!listV || listV.type !== 'list') {
            throw new ExprError('Right side of "is in" must be a list variable', line);
          }
          var needle = toStringVal(a);
          var found = false;
          for (var i = 0; i < listV.value.length; i++) {
            if (toStringVal(listV.value[i]) === needle) { found = true; break; }
          }
          return kfVal('boolean', found);
        }
        break;
      }
    }
    throw new ExprError('Could not evaluate expression', line);
  }

  function typeName(v) {
    if (!v) return 'empty';
    if (v.type === 'number') return 'number';
    if (v.type === 'string') return 'text';
    if (v.type === 'boolean') return 'true/false';
    if (v.type === 'list') return 'list';
    return 'value';
  }

  window.KiddyExpr = {
    parseExpression: parseExpression,
    parseExpressionUntil: parseExpressionUntil,
    parseArgList: parseArgList,
    evaluate: evaluate,
    toStringVal: toStringVal,
    isTruthy: isTruthy,
    typeName: typeName,
    kfVal: kfVal,
    isVarNameToken: isVarNameToken,
    varNameHint: varNameHint,
    RESERVED_NAMES: RESERVED_NAMES,
    ExprError: ExprError,
  };
})();
