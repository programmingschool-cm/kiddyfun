/**
 * SpeakScript Parser v0.1
 * Converts token stream to AST node array.
 * Depends on: window.SpeakLexer (must load after lexer.js)
 */
(function () {
  'use strict';

  /* TOKEN_TYPES is a local copy so parser never needs window.SpeakLexer at load time */
  var TT = {
    KEYWORD   : 'KEYWORD',
    STRING    : 'STRING',
    NUMBER    : 'NUMBER',
    IDENTIFIER: 'IDENTIFIER',
    INDENT    : 'INDENT',
    EOL       : 'EOL',
    EOF       : 'EOF',
  };

  /* ── ParseError ────────────────────────────────────────────────────── */
  function ParseError(message, line) {
    this.message = message;
    this.line    = line;
    this.name    = 'ParseError';
  }
  ParseError.prototype = Object.create(Error.prototype);

  /* ── Parser class ──────────────────────────────────────────────────── */
  function Parser(tokens) {
    this.tokens  = tokens;
    this.pos     = 0;
    this.hasQuiz = false;
  }

  Parser.prototype.peek    = function () { return this.tokens[this.pos]; };
  Parser.prototype.advance = function () { return this.tokens[this.pos++]; };
  Parser.prototype.isEOF   = function () {
    var t = this.peek();
    return !t || t.type === TT.EOF;
  };

  Parser.prototype.restOfLine = function (lineNum) {
    while (!this.isEOF() && this.peek().type !== TT.EOL) this.advance();
    if (!this.isEOF() && this.peek().type === TT.EOL) this.advance();
  };

  Parser.prototype.skipEOL = function () {
    while (!this.isEOF() && this.peek().type === TT.EOL) this.advance();
  };

  Parser.prototype.skipNonContent = function () {
    while (!this.isEOF()) {
      var t = this.peek();
      if (t.type === TT.EOL || t.type === TT.INDENT) this.advance();
      else break;
    }
  };

  /* ── parseAll ──────────────────────────────────────────────────────── */
  Parser.prototype.parseAll = function () {
    var nodes = [];
    while (!this.isEOF()) {
      this.skipNonContent();
      if (this.isEOF()) break;
      var node = this.parseStatement();
      if (node) nodes.push(node);
    }
    return nodes;
  };

  /* ── parseStatement ────────────────────────────────────────────────── */
  Parser.prototype.parseStatement = function () {
    var tok = this.peek();
    if (!tok) return null;

    // Consume leading INDENT
    if (tok.type === TT.INDENT) { this.advance(); tok = this.peek(); }
    if (!tok || tok.type === TT.EOL || tok.type === TT.EOF) { this.skipEOL(); return null; }

    var lineNum = tok.line;
    var val     = tok.value;
    var type    = tok.type;

    if (type === TT.KEYWORD) {
      if (val === 'game')     return this.parseGame(lineNum);
      if (val === 'when')     return this.parseWhen(lineNum);
      if (val === 'lives')    return this.parseLives(lineNum);
      if (val === 'timer')    return this.parseTimer(lineNum);
      if (val === 'goal')     return this.parseGoal(lineNum);
      if (val === 'level')    return this.parseLevel(lineNum);
      if (val === 'health')   return this.parseHealth(lineNum);
      if (val === 'damage' || val === 'hurt') return this.parseDamage(lineNum);
      if (val === 'give')     return this.parseGive(lineNum);
      if (val === 'shoot')    return this.parseShoot(lineNum);
      if (val === 'pause')    return this.parsePauseGame(lineNum);
      if (val === 'resume')   return this.parseResumeGame(lineNum);
      if (val === 'next')     return this.parseNextLevel(lineNum);
      if (val === 'restart')  return this.parseRestart(lineNum);
      if (val === 'lose')     return this.parseLoseLife(lineNum);
      if (val === 'camera')   return this.parseCameraFollow(lineNum);
      if (val === 'while')    return this.parseWhileKeyHeld(lineNum);
      if (val === 'every')    return this.parseEveryFrame(lineNum);
      if (val === 'move')     return this.parseGameMove(lineNum);
      if (val === 'stop')     return this.parseGameStop(lineNum);
      if (val === 'const')    return this.parseConst(lineNum);
      if (val === 'set')      return this.parseSet(lineNum);
      if (val === 'define')   return this.parseDefine(lineNum);
      if (val === 'call')     return this.parseCall(lineNum);
      if (val === 'return')   return this.parseReturn(lineNum);
      if (val === 'break')    return this.parseBreak(lineNum);
      if (val === 'continue') return this.parseContinue(lineNum);
      if (val === 'for')      return this.parseForEach(lineNum);
      if (val === 'scene')    return this.parseScene(lineNum);
      if (val === 'narrator') return this.parseNarrator(lineNum);
      if (val === 'show')     return this.parseShow(lineNum);
      if (val === 'wait')     return this.parseWait(lineNum);
      if (val === 'ask')      return this.parseAsk(lineNum);
      if (val === 'choice')   return this.parseChoice(lineNum);
      if (val === 'repeat')   return this.parseRepeat(lineNum);
      if (val === 'if')       return this.parseIf(lineNum);
      if (val === 'score')    return this.parseScore(lineNum);
      if (val === 'add')      return this.parseAdd(lineNum);
      if (val === 'remove')   return this.parseRemoveFromList(lineNum);
      if (val === 'play')     return this.parsePlaySound(lineNum);
      if (val === 'load')     return this.parseLoadMap(lineNum);
      if (val === 'choose')   return this.parseStoryChoose(lineNum);
      if (val === 'spawn')    return this.parseSpawn(lineNum);
      if (val === 'end')      { this.advance(); this.restOfLine(lineNum); return null; }
    }

    if (type === TT.IDENTIFIER) return this.parseCharacterLine(lineNum);

    var bad = tok.value || tok.type;
    this.restOfLine(lineNum);
    throw new ParseError('Unrecognised command starting with "' + bad + '"', lineNum);
  };

  Parser.prototype.readVarName = function (line, hint) {
    var tok = this.advance();
    if (window.KiddyExpr && window.KiddyExpr.isVarNameToken(tok)) {
      return tok.value;
    }
    if (tok && tok.type === TT.KEYWORD && window.KiddyExpr && window.KiddyExpr.varNameHint) {
      throw new ParseError(window.KiddyExpr.varNameHint(tok.value), line);
    }
    if (tok && tok.type === TT.IDENTIFIER) return tok.value;
    throw new ParseError(hint || 'Expected a variable name. Example: set points to 10', line);
  };

  Parser.prototype.parseExpressionFromHere = function (line) {
    if (!window.KiddyExpr) throw new ParseError('Expression engine not loaded', line);
    try {
      var result = window.KiddyExpr.parseExpression(this.tokens, this.pos, line);
      this.pos = result.pos;
      return result.expr;
    } catch (e) {
      if (e.name === 'ExprError') throw new ParseError(e.message, line);
      throw e;
    }
  };

  /** Read a numeric coordinate (game x/y positions are plain numbers). */
  Parser.prototype.parseCoordNumber = function (line) {
    var tok = this.peek();
    if (tok && tok.type === TT.NUMBER) {
      this.advance();
      return { type: 'literal', valueType: 'number', value: tok.value };
    }
    throw new ParseError('Expected a number for position. Example: x 200 y 150', line);
  };

  Parser.prototype.parseConst = function (line) {
    this.advance();
    var varName = this.readVarName(line, 'Expected: const name to value. Example: const maxScore to 100');
    if (!this.peek() || this.peek().value !== 'to') {
      throw new ParseError('Expected "to" after const name. Example: const maxScore to 100', line);
    }
    this.advance();
    var expr = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    return { type: 'const_var', name: varName, expr: expr, line: line };
  };

  Parser.prototype.parseSet = function (line) {
    this.advance(); // set
    var first = this.readVarName(line, 'Expected: set name to value. Example: set points to 10');
    if (this.peek() && this.peek().value === 'speed') {
      this.advance();
      var actor = first;
      if (!this.peek() || this.peek().value !== 'to') {
        throw new ParseError('Expected: set Rafi speed to 4', line);
      }
      this.advance();
      var speedExpr = this.parseExpressionFromHere(line);
      this.restOfLine(line);
      return { type: 'set_entity_speed', actor: actor, speedExpr: speedExpr, line: line };
    }
    if (!this.peek() || this.peek().value !== 'to') {
      throw new ParseError('Expected "to" after variable name. Example: set name to "Rafi"', line);
    }
    this.advance(); // to
    var expr = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    return { type: 'set_var', name: first, expr: expr, line: line };
  };

  Parser.prototype.parseDefine = function (line) {
    this.advance(); // define
    var fnName = this.readVarName(line, 'Expected: define myFunction');
    var params = [];
    if (this.peek() && this.peek().value === 'with') {
      this.advance();
      while (true) {
        params.push(this.readVarName(line, 'Expected parameter names after "with". Example: define greet with name'));
        if (this.peek() && this.peek().value === 'and') this.advance();
        else break;
      }
    }
    this.restOfLine(line);
    var body = this.parseBlock('define', line, false);
    return { type: 'define_func', name: fnName, params: params, body: body, line: line };
  };

  Parser.prototype.parseCall = function (line) {
    this.advance(); // call
    var fnName = this.readVarName(line, 'Expected: call myFunction');
    var args = [];
    if (this.peek() && this.peek().value === 'with') {
      this.advance();
      var argResult = window.KiddyExpr.parseArgList(this.tokens, this.pos, line);
      this.pos = argResult.pos;
      args = argResult.args;
    }
    this.restOfLine(line);
    return { type: 'call_func', name: fnName, args: args, line: line };
  };

  Parser.prototype.parseReturn = function (line) {
    this.advance(); // return
    var expr = null;
    if (this.peek() && this.peek().type !== TT.EOL) {
      expr = this.parseExpressionFromHere(line);
    }
    this.restOfLine(line);
    return { type: 'return_stmt', expr: expr, line: line };
  };

  Parser.prototype.parseBreak = function (line) {
    this.advance();
    this.restOfLine(line);
    return { type: 'break_stmt', line: line };
  };

  Parser.prototype.parseContinue = function (line) {
    this.advance();
    this.restOfLine(line);
    return { type: 'continue_stmt', line: line };
  };

  Parser.prototype.parseForEach = function (line) {
    this.advance(); // for
    if (!this.peek() || this.peek().value !== 'each') {
      throw new ParseError('Expected: for each item in myList', line);
    }
    this.advance();
    var itemVar = this.readVarName(line, 'Expected: for each item in myList');
    if (!this.peek() || this.peek().value !== 'in') {
      throw new ParseError('Expected "in" after item name. Example: for each fruit in fruits', line);
    }
    this.advance();
    var listName = this.readVarName(line, 'Expected list name after in');
    this.restOfLine(line);
    var body = this.parseBlock('for each', line, false);
    return { type: 'for_each', itemVar: itemVar, listName: listName, body: body, line: line };
  };

  /* ── Individual parsers ────────────────────────────────────────────── */
  Parser.prototype.parseLoadMap = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'map') {
      throw new ParseError('Expected: load map "school_maze"', line);
    }
    this.advance();
    var name = this.expectString(line, 'load map "school_maze"');
    this.restOfLine(line);
    var key = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return { type: 'load_map', mapName: key, line: line };
  };

  Parser.prototype.parseStoryChoose = function (line) {
    this.advance();
    var options = [];
    var first = this.expectString(line, 'choose "Go left" or "Go right"');
    options.push(first);
    while (this.peek() && this.peek().value === 'or') {
      this.advance();
      options.push(this.expectString(line, 'choose "A" or "B"'));
    }
    this.restOfLine(line);
    return { type: 'story_choose', options: options, line: line };
  };

  Parser.prototype.parseScene = function (line) {
    this.advance();
    var str = this.expectString(line, 'scene "school"');
    var withWalls = false;
    if (this.peek() && this.peek().value === 'with') {
      this.advance();
      var w = this.peek();
      if (w && w.value === 'walls') {
        this.advance();
        withWalls = true;
      }
    }
    this.restOfLine(line);
    return { type: 'scene', value: str.toLowerCase().replace(/[^a-z0-9]/g, ''), withWalls: withWalls, line: line };
  };

  /* ── Game mode parsers ───────────────────────────────────────────── */
  Parser.prototype.parseGame = function (line) {
    this.advance();
    if (this.peek() && this.peek().value === 'view') {
      this.advance();
      var vOnly = this.advance();
      var viewOnly = (vOnly && vOnly.value === 'top') ? 'top' : 'side';
      this.restOfLine(line);
      return { type: 'game_view', view: viewOnly, line: line };
    }
    var title = 'Game';
    if (this.peek() && this.peek().type === TT.STRING) {
      title = this.expectString(line, 'game "My Game"');
    }
    var view = 'side';
    if (this.peek() && this.peek().value === 'view') {
      this.advance();
      var v = this.advance();
      if (v && (v.value === 'top' || v.value === 'side')) view = v.value;
    }
    this.restOfLine(line);
    return { type: 'game_start', title: title, view: view, line: line };
  };

  Parser.prototype.parseGameView = function (line) {
    this.advance();
    var v = this.advance();
    var view = (v && v.value === 'top') ? 'top' : 'side';
    this.restOfLine(line);
    return { type: 'game_view', view: view, line: line };
  };

  Parser.prototype.parseGameStop = function (line) {
    this.advance();
    if (this.peek() && this.peek().value === 'game') this.advance();
    this.restOfLine(line);
    return { type: 'game_stop', line: line };
  };

  Parser.prototype.parseKeyName = function (line) {
    var parts = [];
    while (this.peek() && this.peek().type !== TT.EOL) {
      var t = this.peek();
      if (t.value === 'is' || t.value === 'pressed' || t.value === 'held') break;
      if (t.type === TT.KEYWORD || t.type === TT.IDENTIFIER) {
        parts.push(t.value);
        this.advance();
        if (t.value === 'arrow' || t.value === 'key' || t.value === 'keys') continue;
        if (t.value === 'left' || t.value === 'right' || t.value === 'up' ||
            t.value === 'down' || t.value === 'space' || t.value === 'jump') {
          if (this.peek() && (this.peek().value === 'key' || this.peek().value === 'arrow')) continue;
          break;
        }
      } else break;
    }
    var key = parts.join(' ').replace(/\s+arrow\s*$/, '').replace(/\s+key\s*$/, '').trim();
    if (key.indexOf('arrow') >= 0) key = key.replace(/\s*arrow/g, '').trim();
    if (key === 'space') key = 'jump';
    return key || 'left';
  };

  Parser.prototype.parseWhen = function (line) {
    this.advance();
    if (this.peek() && this.peek().value === 'all') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'coins') {
        throw new ParseError('Expected: when all coins collected', line);
      }
      this.advance();
      if (!this.peek() || this.peek().value !== 'collected') {
        throw new ParseError('Expected: when all coins collected', line);
      }
      this.advance();
      this.restOfLine(line);
      var bodyCoins = this.parseBlock('when', line, false);
      return { type: 'on_game_event', event: 'all_coins_collected', body: bodyCoins, line: line };
    }
    if (this.peek() && this.peek().value === 'lives') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'is') {
        throw new ParseError('Expected: when lives is 0', line);
      }
      this.advance();
      var lz = this.advance();
      if (!lz || lz.type !== TT.NUMBER || lz.value !== 0) {
        throw new ParseError('Expected: when lives is 0', line);
      }
      this.restOfLine(line);
      var bodyLz = this.parseBlock('when', line, false);
      return { type: 'on_game_event', event: 'lives_zero', body: bodyLz, line: line };
    }
    if (this.peek() && this.peek().value === 'time') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'is') {
        throw new ParseError('Expected: when time is 0', line);
      }
      this.advance();
      var tz = this.advance();
      if (!tz || tz.type !== TT.NUMBER || tz.value !== 0) {
        throw new ParseError('Expected: when time is 0', line);
      }
      this.restOfLine(line);
      var bodyTz = this.parseBlock('when', line, false);
      return { type: 'on_game_event', event: 'time_zero', body: bodyTz, line: line };
    }
    if (this.peek() && this.peek().value === 'health') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'is') {
        throw new ParseError('Expected: when health is 0', line);
      }
      this.advance();
      var hz = this.advance();
      if (!hz || hz.type !== TT.NUMBER || hz.value !== 0) {
        throw new ParseError('Expected: when health is 0', line);
      }
      this.restOfLine(line);
      var bodyHz = this.parseBlock('when', line, false);
      return { type: 'on_game_event', event: 'health_zero', body: bodyHz, line: line };
    }
    var key = this.parseKeyName(line);
    if (!this.peek() || this.peek().value !== 'is') {
      throw new ParseError('Expected: when left arrow is pressed', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'pressed') {
      throw new ParseError('Expected "pressed". Example: when space is pressed', line);
    }
    this.advance();
    this.restOfLine(line);
    var body = this.parseBlock('when', line, false);
    return { type: 'on_key_down', key: key, body: body, line: line };
  };

  Parser.prototype.parseWhileKeyHeld = function (line) {
    this.advance();
    var key = this.parseKeyName(line);
    if (!this.peek() || this.peek().value !== 'is') {
      throw new ParseError('Expected: while right arrow is held', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'held') {
      throw new ParseError('Expected "held". Example: while left key is held', line);
    }
    this.advance();
    this.restOfLine(line);
    var body = this.parseBlock('while', line, false);
    return { type: 'on_key_held', key: key, body: body, line: line };
  };

  Parser.prototype.parseEveryFrame = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'frame') {
      throw new ParseError('Expected: every frame', line);
    }
    this.advance();
    this.restOfLine(line);
    var body = this.parseBlock('every frame', line, false);
    return { type: 'every_frame', body: body, line: line };
  };

  Parser.prototype.parseGameMove = function (line) {
    this.advance();
    var actorTok = this.advance();
    if (!actorTok || actorTok.type !== TT.IDENTIFIER) {
      throw new ParseError('Expected: move Rafi left by 4', line);
    }
    var dirTok = this.advance();
    if (!dirTok) throw new ParseError('Expected direction: left, right, up, or down', line);
    var dir = dirTok.value;
    if (dir !== 'left' && dir !== 'right' && dir !== 'up' && dir !== 'down') {
      throw new ParseError('Direction must be left, right, up, or down', line);
    }
    if (!this.peek() || this.peek().value !== 'by') {
      throw new ParseError('Expected "by" after direction. Example: move Rafi left by 4', line);
    }
    this.advance();
    var amountExpr = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    return { type: 'game_move', actor: actorTok.value, direction: dir, amountExpr: amountExpr, line: line };
  };

  Parser.prototype.parseIfTouch = function (line, actor) {
    if (!this.peek() || this.peek().value !== 'touches') {
      return null;
    }
    this.advance();
    var targetTok = this.advance();
    var target = targetTok ? targetTok.value : 'wall';
    this.restOfLine(line);
    var trueBranch = this.parseBlock('if', line, true);
    var falseBranch = this.parseElseBranch(line);
    return {
      type: 'if_touch',
      actor: actor,
      target: target.toLowerCase(),
      trueBranch: trueBranch,
      falseBranch: falseBranch,
      line: line,
    };
  };

  Parser.prototype.parseSpawn = function (line) {
    this.advance();
    var first = this.advance();
    if (!first) throw new ParseError('Expected: spawn coin at x 200 y 150  OR  spawn Lion as enemy at x 400 y 250', line);

    if (first.value === 'hazard') {
      return this._parseSpawnHazard(line);
    }
    if (first.value === 'coin') {
      return this._parseSpawnAt(line, 'spawn_coin');
    }
    if (first.value === 'enemy' && this.peek() && this.peek().type === TT.IDENTIFIER) {
      var enemyName = this.advance().value;
      return this._parseSpawnEnemyAt(line, enemyName);
    }
    if (first.type === TT.IDENTIFIER) {
      if (this.peek() && this.peek().value === 'as') {
        this.advance();
        if (!this.peek() || this.peek().value !== 'enemy') {
          throw new ParseError('Expected: spawn Lion as enemy at x 400 y 250', line);
        }
        this.advance();
        return this._parseSpawnEnemyAt(line, first.value);
      }
      throw new ParseError('Expected: spawn coin … or spawn Lion as enemy at …', line);
    }
    throw new ParseError('Expected: spawn coin at x 200 y 150', line);
  };

  Parser.prototype._parseSpawnHazard = function (line) {
    var nameTok = this.advance();
    var hazardName = nameTok ? nameTok.value : 'lava';
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: spawn hazard lava at x 100 y 150 width 80 height 30', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'x') {
      throw new ParseError('Expected x after at', line);
    }
    this.advance();
    var xExpr = this.parseCoordNumber(line);
    if (!this.peek() || this.peek().value !== 'y') {
      throw new ParseError('Expected y after x', line);
    }
    this.advance();
    var yExpr = this.parseCoordNumber(line);
    if (!this.peek() || this.peek().value !== 'width') {
      throw new ParseError('Expected width after y', line);
    }
    this.advance();
    var wExpr = this.parseCoordNumber(line);
    if (!this.peek() || this.peek().value !== 'height') {
      throw new ParseError('Expected height after width', line);
    }
    this.advance();
    var hExpr = this.parseCoordNumber(line);
    this.restOfLine(line);
    return {
      type: 'spawn_hazard',
      name: hazardName,
      xExpr: xExpr,
      yExpr: yExpr,
      wExpr: wExpr,
      hExpr: hExpr,
      line: line,
    };
  };

  Parser.prototype._parseSpawnAt = function (line, nodeType) {
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected "at" after spawn. Example: spawn coin at x 200 y 150', line);
    }
    this.advance();
    var coords = this._parseAtXY(line);
    this.restOfLine(line);
    var node = { type: nodeType, xExpr: coords.xExpr, yExpr: coords.yExpr, line: line };
    return node;
  };

  Parser.prototype._parseSpawnEnemyAt = function (line, name) {
    var coords = this._parseSpawnEnemyCoords(line);
    this.restOfLine(line);
    return {
      type: 'spawn_enemy',
      name: name,
      xExpr: coords.xExpr,
      yExpr: coords.yExpr,
      line: line,
    };
  };

  Parser.prototype._parseSpawnEnemyCoords = function (line) {
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected "at" after enemy. Example: spawn Lion as enemy at x 400 y 250', line);
    }
    this.advance();
    return this._parseAtXY(line, true);
  };

  Parser.prototype._parseAtXY = function (line, allowGround) {
    if (!this.peek() || this.peek().value !== 'x') {
      throw new ParseError('Expected x after at. Example: at x 200 y 150', line);
    }
    this.advance();
    var xExpr = this.parseCoordNumber(line);
    if (!this.peek() || this.peek().value !== 'y') {
      throw new ParseError('Expected y after x. Example: at x 200 y 150', line);
    }
    this.advance();
    var yExpr;
    if (allowGround && this.peek() && this.peek().value === 'ground') {
      this.advance();
      yExpr = { type: 'literal', value: 'ground', valueType: 'ground' };
    } else {
      yExpr = this.parseCoordNumber(line);
    }
    return { xExpr: xExpr, yExpr: yExpr };
  };

  Parser.prototype.parseLives = function (line) {
    this.advance();
    if (!this.peek() || (this.peek().value !== 'start' && this.peek().value !== 'starts')) {
      throw new ParseError('Expected: lives start at 3', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: lives start at 3', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected: lives start at 3', line);
    this.restOfLine(line);
    return { type: 'lives_set', value: n.value, line: line };
  };

  Parser.prototype.parseTimer = function (line) {
    this.advance();
    if (!this.peek() || (this.peek().value !== 'start' && this.peek().value !== 'starts')) {
      throw new ParseError('Expected: timer starts at 60', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: timer starts at 60', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected: timer starts at 60', line);
    this.restOfLine(line);
    return { type: 'timer_set', value: n.value, line: line };
  };

  Parser.prototype.parseGoal = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'is') {
      throw new ParseError('Expected: goal is collect 5 coins', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'collect') {
      throw new ParseError('Expected: goal is collect 5 coins', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected a number in goal is collect N coins', line);
    if (!this.peek() || this.peek().value !== 'coins') {
      throw new ParseError('Expected "coins" after number. Example: goal is collect 5 coins', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'goal_coins', value: n.value, line: line };
  };

  Parser.prototype.parseHealth = function (line) {
    this.advance();
    if (!this.peek() || (this.peek().value !== 'start' && this.peek().value !== 'starts')) {
      throw new ParseError('Expected: health starts at 100', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: health starts at 100', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected: health starts at 100', line);
    this.restOfLine(line);
    return { type: 'health_set', value: n.value, line: line };
  };

  Parser.prototype.parseDamage = function (line) {
    this.advance();
    var actorTok = this.advance();
    if (!actorTok || actorTok.type !== TT.IDENTIFIER) {
      throw new ParseError('Expected: damage Rafi by 10', line);
    }
    if (!this.peek() || this.peek().value !== 'by') {
      throw new ParseError('Expected: damage Rafi by 10', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected a number after by', line);
    this.restOfLine(line);
    return { type: 'damage_player', actor: actorTok.value, amount: n.value, line: line };
  };

  Parser.prototype.parseGive = function (line) {
    this.advance();
    var actorTok = this.advance();
    if (!actorTok || actorTok.type !== TT.IDENTIFIER) {
      throw new ParseError('Expected: give Rafi key', line);
    }
    var itemTok = this.advance();
    var item = itemTok ? itemTok.value : 'key';
    this.restOfLine(line);
    return { type: 'give_item', actor: actorTok.value, item: item, line: line };
  };

  Parser.prototype.parseShoot = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'bullet') {
      throw new ParseError('Expected: shoot bullet from Rafi toward right speed 6', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'from') {
      throw new ParseError('Expected from after bullet', line);
    }
    this.advance();
    var actorTok = this.advance();
    if (!actorTok || actorTok.type !== TT.IDENTIFIER) {
      throw new ParseError('Expected actor name after from', line);
    }
    if (!this.peek() || this.peek().value !== 'toward') {
      throw new ParseError('Expected toward after actor', line);
    }
    this.advance();
    var dirTok = this.advance();
    var dir = dirTok ? dirTok.value : 'right';
    var speed = 6;
    if (this.peek() && this.peek().value === 'speed') {
      this.advance();
      var sp = this.advance();
      if (sp && sp.type === TT.NUMBER) speed = sp.value;
    }
    this.restOfLine(line);
    return {
      type: 'shoot_bullet',
      actor: actorTok.value,
      direction: dir,
      speed: speed,
      line: line,
    };
  };

  Parser.prototype.parseLevel = function (line) {
    this.advance();
    if (!this.peek() || (this.peek().value !== 'start' && this.peek().value !== 'starts')) {
      throw new ParseError('Expected: level starts at 1', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: level starts at 1', line);
    }
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected: level starts at 1', line);
    this.restOfLine(line);
    return { type: 'level_set', value: n.value, line: line };
  };

  Parser.prototype.parseNextLevel = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'level') {
      throw new ParseError('Expected: next level', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'next_level', line: line };
  };

  Parser.prototype.parsePauseGame = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'game') {
      throw new ParseError('Expected: pause game', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'pause_game', line: line };
  };

  Parser.prototype.parseResumeGame = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'game') {
      throw new ParseError('Expected: resume game', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'resume_game', line: line };
  };

  Parser.prototype.parseRestart = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'game') {
      throw new ParseError('Expected: restart game', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'restart_game', line: line };
  };

  Parser.prototype.parseLoseLife = function (line) {
    this.advance();
    var n = this.advance();
    if (!n || n.type !== TT.NUMBER) throw new ParseError('Expected: lose 1 life', line);
    if (!this.peek() || (this.peek().value !== 'life' && this.peek().value !== 'lives')) {
      throw new ParseError('Expected: lose 1 life', line);
    }
    this.advance();
    this.restOfLine(line);
    return { type: 'lose_life', amount: n.value, line: line };
  };

  Parser.prototype.parseCameraFollow = function (line) {
    this.advance();
    if (!this.peek() || this.peek().value !== 'follows' && this.peek().value !== 'follow') {
      throw new ParseError('Expected: camera follows Rafi', line);
    }
    this.advance();
    var nameTok = this.advance();
    if (!nameTok || nameTok.type !== TT.IDENTIFIER) {
      throw new ParseError('Expected: camera follows Rafi', line);
    }
    this.restOfLine(line);
    return { type: 'camera_follow', actor: nameTok.value, line: line };
  };

  Parser.prototype.parseAddObstacle = function (line) {
    var tagTok = this.advance();
    var tag = tagTok ? tagTok.value : 'wall';
    if (tag === 'coin') {
      throw new ParseError('Use spawn coin at x 200 y 150 to place a collectible coin (not add coin).', line);
    }
    if (!this.peek() || this.peek().value !== 'at') {
      throw new ParseError('Expected: add wall at x 200 y 300 width 80 height 40', line);
    }
    this.advance();
    if (!this.peek() || this.peek().value !== 'x') throw new ParseError('Expected x after at', line);
    this.advance();
    var xExpr = this.parseCoordNumber(line);
    if (!this.peek() || this.peek().value !== 'y') throw new ParseError('Expected y', line);
    this.advance();
    var yExpr = this.parseCoordNumber(line);
    var w = 40, h = 40;
    if (this.peek() && this.peek().value === 'width') {
      this.advance();
      var wExpr = this.parseCoordNumber(line);
      if (this.peek() && this.peek().value === 'height') {
        this.advance();
        var hExpr = this.parseCoordNumber(line);
        h = hExpr;
      }
      w = wExpr;
    }
    this.restOfLine(line);
    return { type: 'add_obstacle', tag: tag, xExpr: xExpr, yExpr: yExpr, wExpr: w, hExpr: h, line: line };
  };

  Parser.prototype.parseNarrator = function (line) {
    this.advance(); // narrator
    var says = this.advance();
    if (!says || says.value !== 'says') throw new ParseError('Expected "says" after "narrator"', line);
    var nextTok = this.peek();
    if (nextTok && nextTok.type === TT.STRING) {
      var text = this.expectString(line, 'narrator says "Once upon a time..."');
      this.restOfLine(line);
      return { type: 'say', actor: 'narrator', text: text, line: line };
    }
    var textExpr = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    return { type: 'say_expr', actor: 'narrator', expr: textExpr, line: line };
  };

  Parser.prototype.parseShow = function (line) {
    this.advance(); // show
    var next = this.peek();
    if (next && next.type === TT.KEYWORD && next.value === 'type') {
      this.advance(); // type
      if (!this.peek() || this.peek().value !== 'of') {
        throw new ParseError('Expected: show type of variableName', line);
      }
      this.advance(); // of
      var typeVar = this.readVarName(line, 'Expected: show type of points');
      this.restOfLine(line);
      return { type: 'show_type', name: typeVar, line: line };
    }
    if (next && next.type === TT.KEYWORD && next.value === 'value') {
      this.advance(); // value
      if (!this.peek() || this.peek().value !== 'of') {
        throw new ParseError('Expected: show value of variableName', line);
      }
      this.advance();
      var valVar = this.readVarName(line, 'Expected: show value of message');
      this.restOfLine(line);
      return { type: 'show_value', name: valVar, line: line };
    }
    if (next && next.type === TT.KEYWORD && next.value === 'score') {
      this.advance(); this.restOfLine(line);
      return { type: 'score_show', line: line };
    }
    if (next && next.type === TT.KEYWORD && next.value === 'message') {
      this.advance();
      var msg = this.expectString(line, 'show message "Level 2!"');
      this.restOfLine(line);
      return { type: 'show_message', text: msg, line: line };
    }
    if (next && next.type === TT.KEYWORD && next.value === 'word') {
      this.advance();
      var word    = this.expectString(line, 'show word "brave" means "সাহসী"');
      var means   = this.advance();
      if (!means || means.value !== 'means') throw new ParseError('Expected "means" after word string', line);
      var meaning = this.expectString(line, 'show word "brave" means "সাহসী"');
      this.restOfLine(line);
      return { type: 'vocab', word: word, meaning: meaning, line: line };
    }
    throw new ParseError('Unknown "show" command. Try: show message "You win!"', line);
  };

  Parser.prototype.parseWait = function (line) {
    this.advance();
    var numTok = this.advance();
    if (!numTok || numTok.type !== TT.NUMBER) throw new ParseError('Expected a number after "wait". Example: wait 1 second', line);
    this.restOfLine(line);
    return { type: 'wait', seconds: numTok.value, line: line };
  };

  Parser.prototype.parseAsk = function (line) {
    this.advance(); // ask
    if (this.peek() && this.peek().value === 'user') {
      this.advance();
      var q = this.expectString(line, 'ask user "What is your name?"');
      var storeAs = null;
      if (this.peek() && this.peek().value === 'as') {
        this.advance();
        storeAs = this.readVarName(line, 'Expected: ask user "?" as name');
      }
      this.restOfLine(line);
      return { type: 'ask_user_stmt', question: q, storeAs: storeAs, line: line };
    }
    var question = this.expectString(line, 'ask "What colour is the sky?"');
    this.restOfLine(line);
    this.hasQuiz = true;
    return { type: 'quiz_start', question: question, line: line };
  };

  Parser.prototype.parseChoice = function (line) {
    this.advance();
    var text = this.expectString(line, 'choice "Banana" correct');
    var resultTok = this.advance();
    if (!resultTok || (resultTok.value !== 'correct' && resultTok.value !== 'wrong')) {
      throw new ParseError('A choice must end with "correct" or "wrong"', line);
    }
    this.restOfLine(line);
    return { type: 'quiz_choice', text: text, result: resultTok.value, line: line };
  };

  Parser.prototype.parseRepeat = function (line) {
    this.advance();
    if (this.peek() && this.peek().value === 'while') {
      this.advance();
      var cond = this.parseExpressionFromHere(line);
      this.restOfLine(line);
      var wbody = this.parseBlock('repeat while', line, false);
      return { type: 'repeat_while', condition: cond, body: wbody, line: line };
    }
    var numTok = this.advance();
    if (!numTok || numTok.type !== TT.NUMBER) throw new ParseError('Expected a number after "repeat". Example: repeat 3 times', line);
    var count  = Math.round(numTok.value);
    if (count < 1 || count > 100) throw new ParseError('Repeat count must be between 1 and 100', line);
    var timesTok = this.advance();
    if (!timesTok || timesTok.value !== 'times') throw new ParseError('Expected "times" after repeat number. Example: repeat 3 times', line);
    this.restOfLine(line);
    var body = this.parseBlock('repeat', line, false);
    return { type: 'repeat', count: count, body: body, line: line };
  };

  Parser.prototype.parseIf = function (line) {
    this.advance(); // if
    /* Game helper: if <key> [arrow] [key] is held */
    if (this.peek() && (this.peek().type === TT.KEYWORD || this.peek().type === TT.IDENTIFIER)) {
      var savePosKeyHeld = this.pos;
      var maybeKey = this.parseKeyName(line);
      if (this.peek() && this.peek().value === 'is') {
        this.advance();
        if (this.peek() && this.peek().value === 'held') {
          this.advance();
          this.restOfLine(line);
          var heldBody0 = this.parseBlock('if', line, true);
          var heldElse0 = this.parseElseBranch(line);
          return { type: 'if_key_held', key: maybeKey, trueBranch: heldBody0, falseBranch: heldElse0, line: line };
        }
      }
      this.pos = savePosKeyHeld;
    }

    if (this.peek() && this.peek().type === TT.IDENTIFIER) {
      var actorTok = this.peek();
      var actor = actorTok.value;
      var savedPos = this.pos;
      this.advance();
      var touchNode = this.parseIfTouch(line, actor);
      if (touchNode) return touchNode;
      this.pos = savedPos;
    }
    if (this.peek() && this.peek().value === 'answer') {
      this.advance(); // answer
      this.advance(); // is
      var c = this.advance(); // correct or wrong
      if (!c) throw new ParseError('Expected: if answer is correct', line);
      this.restOfLine(line);
      var trueBranch  = this.parseBlock('if', line, true);
      var falseBranch = this.parseElseBranch(line);
      return { type: 'if_answer', condition: c.value, trueBranch: trueBranch, falseBranch: falseBranch, line: line };
    }
    if (this.peek() && this.peek().type === TT.IDENTIFIER) {
      var saveHas = this.pos;
      var actTok = this.advance();
      var actName = actTok.value;
      if (this.peek() && this.peek().value === 'has') {
        this.advance();
        var itTok = this.advance();
        var itemName = itTok ? (itTok.type === TT.STRING ? itTok.value : itTok.value) : 'key';
        this.restOfLine(line);
        var tHas = this.parseBlock('if', line, true);
        var fHas = this.parseElseBranch(line);
        return {
          type: 'if_has_item',
          actor: actName,
          item: itemName,
          trueBranch: tHas,
          falseBranch: fHas,
          line: line,
        };
      }
      this.pos = saveHas;
    }
    var cond = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    var tBranch = this.parseBlock('if', line, true);
    var fBranch = this.parseElseBranch(line);
    return { type: 'if_cond', condition: cond, trueBranch: tBranch, falseBranch: fBranch, line: line };
  };

  Parser.prototype.parseElseBranch = function (ifLine) {
    this.skipNonContent();
    var tok = this.peek();
    if (tok && tok.type === TT.KEYWORD && tok.value === 'else') {
      this.advance();
      this.restOfLine(tok.line);
      return this.parseBlock('else', tok.line, false);
    }
    return [];
  };

  Parser.prototype.parseScore = function (line) {
    this.advance(); // score
    this.advance(); // starts
    this.advance(); // at
    var numTok = this.advance();
    if (!numTok || numTok.type !== TT.NUMBER) throw new ParseError('Expected: score starts at 0', line);
    this.restOfLine(line);
    return { type: 'score_set', value: numTok.value, line: line };
  };

  Parser.prototype.parseAdd = function (line) {
    this.advance(); // add
    var next = this.peek();
    if (next && (next.type === TT.IDENTIFIER ||
        (next.type === TT.KEYWORD && ['wall', 'coin', 'platform'].indexOf(next.value) >= 0))) {
      return this.parseAddObstacle(line);
    }
    if (next && next.type === TT.NUMBER) {
      var numTok = this.advance();
      if (this.peek() && this.peek().value === 'points') {
        this.advance();
        this.restOfLine(line);
        return { type: 'score_add', value: numTok.value, line: line };
      }
      this.pos--;
    }
    var exprResult = window.KiddyExpr.parseExpressionUntil(this.tokens, this.pos, line, 'to');
    this.pos = exprResult.pos;
    var expr = exprResult.expr;
    if (!this.peek() || this.peek().value !== 'to') {
      throw new ParseError('Expected: add "item" to myList  OR  add 10 points', line);
    }
    this.advance(); // to
    var listName = this.readVarName(line, 'Expected: add "banana" to fruits');
    this.restOfLine(line);
    return { type: 'add_to_list', expr: expr, listName: listName, line: line };
  };

  Parser.prototype.parseRemoveFromList = function (line) {
    this.advance(); // remove
    if (!this.peek() || this.peek().value !== 'item') {
      var targetTok = this.advance();
      var target = targetTok ? targetTok.value : 'coin';
      this.restOfLine(line);
      return { type: 'remove_entity', target: target, line: line };
    }
    this.advance(); // item
    var numTok = this.advance();
    if (!numTok || numTok.type !== TT.NUMBER) {
      throw new ParseError('Expected: remove item 2 from myList (position starts at 1)', line);
    }
    if (!this.peek() || this.peek().value !== 'from') {
      throw new ParseError('Expected "from" after position. Example: remove item 2 from fruits', line);
    }
    this.advance();
    var listName = this.readVarName(line, 'Expected list name after from');
    this.restOfLine(line);
    return { type: 'remove_from_list', index: Math.round(numTok.value), listName: listName, line: line };
  };

  Parser.prototype.parsePlaySound = function (line) {
    this.advance(); // play
    this.advance(); // sound
    var name = this.expectString(line, 'play sound "success"');
    this.restOfLine(line);
    return { type: 'play_sound', name: name, line: line };
  };

  Parser.prototype.parseCharacterLine = function (line) {
    var nameTok = this.advance();
    var actor   = nameTok.value;
    var verbTok = this.peek();

    if (!verbTok || verbTok.type === TT.EOL || verbTok.type === TT.EOF) {
      throw new ParseError('Expected an action after "' + actor + '"', line);
    }

    var verb = verbTok.value;

    if (verb === 'is') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'player') {
        throw new ParseError('Expected: ' + actor + ' is player', line);
      }
      this.advance();
      this.restOfLine(line);
      return { type: 'set_player', actor: actor, line: line };
    }
    if (verb === 'chases') {
      this.advance();
      var targetTok = this.advance();
      if (!targetTok || targetTok.type !== TT.IDENTIFIER) {
        throw new ParseError('Expected: Lion chases Rafi', line);
      }
      this.restOfLine(line);
      return { type: 'enemy_chase', actor: actor, target: targetTok.value, line: line };
    }
    if (verb === 'patrols') {
      this.advance();
      if (!this.peek() || this.peek().value !== 'between') {
        throw new ParseError('Expected: Lion patrols between x 100 and x 300', line);
      }
      this.advance();
      if (!this.peek() || this.peek().value !== 'x') {
        throw new ParseError('Expected x after between', line);
      }
      this.advance();
      var minExpr = this.parseCoordNumber(line);
      if (!this.peek() || this.peek().value !== 'and') {
        throw new ParseError('Expected "and x …" after first x value', line);
      }
      this.advance();
      if (!this.peek() || this.peek().value !== 'x') {
        throw new ParseError('Expected second x after and', line);
      }
      this.advance();
      var maxExpr = this.parseCoordNumber(line);
      this.restOfLine(line);
      return { type: 'enemy_patrol', actor: actor, minExpr: minExpr, maxExpr: maxExpr, line: line };
    }
    if (verb === 'jump') {
      this.advance();
      var power = 12;
      if (this.peek() && this.peek().value === 'with') {
        this.advance();
        if (this.peek() && this.peek().value === 'power') {
          this.advance();
          var pTok = this.advance();
          if (pTok && pTok.type === TT.NUMBER) power = pTok.value;
        }
      }
      this.restOfLine(line);
      return { type: 'game_jump', actor: actor, power: power, line: line };
    }
    if (verb === 'appears') { this.advance(); this.restOfLine(line); return { type: 'character_appears', actor: actor, line: line }; }
    if (verb === 'says') {
      this.advance();
      var nextTok = this.peek();
      if (nextTok && nextTok.type === TT.STRING) {
        var text = this.expectString(line, actor + ' says "Hello!"');
        this.restOfLine(line);
        return { type: 'say', actor: actor, text: text, line: line };
      }
      var textExpr = this.parseExpressionFromHere(line);
      this.restOfLine(line);
      return { type: 'say_expr', actor: actor, expr: textExpr, line: line };
    }
    if (verb === 'moves')   { this.advance(); var dirTok = this.advance(); var dir = dirTok ? dirTok.value : 'right'; this.restOfLine(line); return { type: 'action', actor: actor, action: 'moves_' + dir, line: line }; }

    var simpleActions = ['waves','smiles','jumps','flies','hides','shows','flaps','runs','dances','claps','bows','walks','handshakes','nods','cheers'];
    if (simpleActions.indexOf(verb) !== -1) {
      this.advance(); this.restOfLine(line);
      return { type: 'action', actor: actor, action: verb, line: line };
    }

    this.restOfLine(line);
    throw new ParseError('"' + verb + '" is not a known action. Try: waves, smiles, jumps, flies, dances, claps, runs, walks, hides, shows, bows, nods, cheers, handshakes, flaps, says', line);
  };

  /* ── Block parser ──────────────────────────────────────────────────── */
  Parser.prototype.parseBlock = function (blockType, startLine, stopAtElse) {
    var body = [];
    while (!this.isEOF()) {
      this.skipNonContent();
      var tok = this.peek();
      if (!tok || tok.type === TT.EOF) {
        throw new ParseError('Your "' + blockType + '" block needs an "end" command to close it.', startLine);
      }
      if (tok.type === TT.KEYWORD && tok.value === 'end') { this.advance(); this.restOfLine(tok.line); return body; }
      if (stopAtElse && tok.type === TT.KEYWORD && tok.value === 'else') return body;
      var node = this.parseStatement();
      if (node) body.push(node);
    }
    throw new ParseError('Your "' + blockType + '" block needs an "end" command to close it.', startLine);
  };

  /* ── Utility ───────────────────────────────────────────────────────── */
  Parser.prototype.expectString = function (line, example) {
    var tok = this.advance();
    if (!tok || tok.type !== TT.STRING) {
      throw new ParseError('Expected a quoted string. Example: ' + example, line);
    }
    return tok.value;
  };

  /* ── groupQuizNodes ────────────────────────────────────────────────── */
  function groupQuizNodes(nodes) {
    var result    = [];
    var activeQuiz = null;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.type === 'quiz_start') {
        if (activeQuiz) result.push(activeQuiz);
        activeQuiz = { type: 'quiz', question: node.question, choices: [], line: node.line };
        continue;
      }
      if (node.type === 'quiz_choice') {
        if (!activeQuiz) throw new ParseError('A "choice" needs a question first. Write an "ask" line before your choices.', node.line);
        activeQuiz.choices.push({ text: node.text, result: node.result });
        continue;
      }
      if (activeQuiz) { result.push(activeQuiz); activeQuiz = null; }
      if (node.type === 'repeat')       node.body = groupQuizNodes(node.body);
      if (node.type === 'repeat_while') node.body = groupQuizNodes(node.body);
      if (node.type === 'if_answer') {
        node.trueBranch = groupQuizNodes(node.trueBranch);
        node.falseBranch = groupQuizNodes(node.falseBranch);
      }
      if (node.type === 'if_cond') {
        node.trueBranch = groupQuizNodes(node.trueBranch);
        node.falseBranch = groupQuizNodes(node.falseBranch);
      }
      if (node.type === 'define_func') node.body = groupQuizNodes(node.body);
      if (node.type === 'for_each') node.body = groupQuizNodes(node.body);
      result.push(node);
    }
    if (activeQuiz) result.push(activeQuiz);
    return result;
  }

  var GAME_SETUP_INVALID = {
    if_key_held: 'Put "if … key is held" inside an every frame block (not at the top level).\n✅ Example:\nevery frame\n    if left key is held\n        move Rafi left by 4\n    end\nend',
    game_move: 'Put "move …" inside every frame or when/while blocks (not at the top level).\n✅ Use every frame … end for smooth movement.',
    game_jump: 'Put "Rafi jump …" inside when space is pressed … end, not alone at the top level.',
    if_cond: 'Story-style "if" conditions are not used in game mode yet. Use if answer is correct in story programs.',
    if_answer: 'Quiz "if answer" does not work in game mode. Use story mode for quizzes.',
  };

  function validateGameSetup(setup) {
    for (var i = 0; i < setup.length; i++) {
      var n = setup[i];
      var hint = GAME_SETUP_INVALID[n.type];
      if (hint) {
        throw new ParseError(hint, n.line || 1);
      }
    }
  }

  function buildGameProgram(nodes) {
    var program = {
      mode: 'game',
      title: 'Game',
      view: 'side',
      setup: [],
      onKeyDown: [],
      onKeyHeld: [],
      everyFrame: [],
      onTouch: [],
      onGameEvent: [],
      onInventory: [],
    };
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.type === 'game_start') {
        program.title = n.title || program.title;
        if (n.view) program.view = n.view;
        continue;
      }
      if (n.type === 'game_view') {
        program.view = n.view;
        continue;
      }
      if (n.type === 'on_key_down') {
        program.onKeyDown.push(n);
        continue;
      }
      if (n.type === 'on_key_held') {
        program.onKeyHeld.push(n);
        continue;
      }
      if (n.type === 'every_frame') {
        program.everyFrame.push(n);
        continue;
      }
      if (n.type === 'if_touch') {
        program.onTouch.push(n);
        continue;
      }
      if (n.type === 'if_has_item') {
        program.onInventory = program.onInventory || [];
        program.onInventory.push(n);
        continue;
      }
      if (n.type === 'on_game_event') {
        program.onGameEvent.push(n);
        continue;
      }
      program.setup.push(n);
    }
    validateGameSetup(program.setup);
    return program;
  }

  function isGameProgram(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var t = nodes[i].type;
      if (t === 'game_start' || t === 'game_view') return true;
      if (t === 'on_key_down' || t === 'on_key_held' || t === 'every_frame') return true;
      if (t === 'on_game_event' || t === 'lives_set' || t === 'timer_set' || t === 'goal_coins' || t === 'level_set' || t === 'health_set') return true;
      if (t === 'spawn_enemy' || t === 'camera_follow' || t === 'load_map') return true;
    }
    return false;
  }

  /* ── parseProgram: full pipeline ───────────────────────────────────── */
  function parseProgram(source) {
    var lexer  = window.SpeakLexer;
    if (!lexer) throw new Error('Lexer not loaded! Check that lexer.js is included before parser.js');
    var tokens   = lexer.tokenize(source);
    var parser   = new Parser(tokens);
    var rawNodes = parser.parseAll();
    var nodes = groupQuizNodes(rawNodes);
    if (isGameProgram(nodes)) {
      return buildGameProgram(nodes);
    }
    return { mode: 'story', nodes: nodes };
  }

  /* ── Export ────────────────────────────────────────────────────────── */
  window.SpeakParser = { parseProgram: parseProgram, ParseError: ParseError };
  console.log('[KiddyFun] Parser v2 ready');

})();
