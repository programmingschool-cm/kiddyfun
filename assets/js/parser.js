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
    var varName = this.readVarName(line, 'Expected: set name to value. Example: set points to 10');
    if (!this.peek() || this.peek().value !== 'to') {
      throw new ParseError('Expected "to" after variable name. Example: set name to "Rafi"', line);
    }
    this.advance(); // to
    var expr = this.parseExpressionFromHere(line);
    this.restOfLine(line);
    return { type: 'set_var', name: varName, expr: expr, line: line };
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
  Parser.prototype.parseScene = function (line) {
    this.advance();
    var str = this.expectString(line, 'scene "school"');
    this.restOfLine(line);
    return { type: 'scene', value: str.toLowerCase(), line: line };
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
    if (next && next.type === TT.KEYWORD && next.value === 'word') {
      this.advance();
      var word    = this.expectString(line, 'show word "brave" means "সাহসী"');
      var means   = this.advance();
      if (!means || means.value !== 'means') throw new ParseError('Expected "means" after word string', line);
      var meaning = this.expectString(line, 'show word "brave" means "সাহসী"');
      this.restOfLine(line);
      return { type: 'vocab', word: word, meaning: meaning, line: line };
    }
    throw new ParseError('Unknown "show" command. Try: show word "hello" means "হ্যালো"', line);
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
      throw new ParseError('Expected: remove item 2 from myList', line);
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

    var simpleActions = ['waves','smiles','jumps','flies','hides','shows','flaps','runs','dances','bows','walks','handshakes','nods','cheers'];
    if (simpleActions.indexOf(verb) !== -1) {
      this.advance(); this.restOfLine(line);
      return { type: 'action', actor: actor, action: verb, line: line };
    }

    this.restOfLine(line);
    throw new ParseError('"' + verb + '" is not a known action. Try: waves, smiles, jumps, flies, says', line);
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

  /* ── parseProgram: full pipeline ───────────────────────────────────── */
  function parseProgram(source) {
    var lexer  = window.SpeakLexer;
    if (!lexer) throw new Error('Lexer not loaded! Check that lexer.js is included before parser.js');
    var tokens   = lexer.tokenize(source);
    var parser   = new Parser(tokens);
    var rawNodes = parser.parseAll();
    return groupQuizNodes(rawNodes);
  }

  /* ── Export ────────────────────────────────────────────────────────── */
  window.SpeakParser = { parseProgram: parseProgram, ParseError: ParseError };
  console.log('[KiddyFun] Parser v2 ready');

})();
