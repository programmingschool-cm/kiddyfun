/**
 * SpeakScript Lexer v0.1
 * Converts raw SpeakScript source code into a stream of tokens.
 */
(function () {
  'use strict';

  const KEYWORDS = new Set([
    'scene','appears','says','waves','smiles','jumps','flies','moves',
    'right','left','hides','shows','show','word','means','narrator',
    'wait','second','seconds','ask','choice','correct','wrong',
    'repeat','times','if','answer','is','else','end','score','starts',
    'at','add','points','play','sound','flaps','clap','success','dances','bows','runs',
    'walks','handshakes','nods','cheers'
  ]);

  const TOKEN_TYPES = {
    KEYWORD   : 'KEYWORD',
    STRING    : 'STRING',
    NUMBER    : 'NUMBER',
    IDENTIFIER: 'IDENTIFIER',
    INDENT    : 'INDENT',
    EOL       : 'EOL',
    EOF       : 'EOF',
  };

  function LexerError(message, line) {
    this.message = message;
    this.line    = line;
    this.name    = 'LexerError';
  }
  LexerError.prototype = Object.create(Error.prototype);

  function Token(type, value, line) {
    this.type  = type;
    this.value = value;
    this.line  = line;
  }

  /* ── tokenize ─────────────────────────────────────────────────────── */
  function tokenize(source) {
    var lines  = source.split('\n');
    var tokens = [];

    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      var lineNum = lineIdx + 1;
      var rawLine = lines[lineIdx];

      rawLine = stripComment(rawLine);

      var indentLevel = measureIndent(rawLine);
      var trimmed     = rawLine.replace(/^\s+/, '');

      if (trimmed === '') continue;

      if (indentLevel > 0) {
        tokens.push(new Token(TOKEN_TYPES.INDENT, indentLevel, lineNum));
      }

      var lineTokens = tokenizeLine(trimmed, lineNum);
      for (var t = 0; t < lineTokens.length; t++) tokens.push(lineTokens[t]);
      tokens.push(new Token(TOKEN_TYPES.EOL, '\n', lineNum));
    }

    tokens.push(new Token(TOKEN_TYPES.EOF, null, lines.length));
    return tokens;
  }

  function stripComment(line) {
    var inString  = false;
    var quoteChar = '';
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inString) {
        if (ch === quoteChar) inString = false;
      } else {
        if (ch === '"' || ch === "'") { inString = true; quoteChar = ch; }
        else if (ch === '#') return line.slice(0, i);
      }
    }
    return line;
  }

  function measureIndent(line) {
    var spaces = 0;
    for (var i = 0; i < line.length; i++) {
      if (line[i] === ' ')       spaces++;
      else if (line[i] === '\t') spaces += 4;
      else break;
    }
    return Math.floor(spaces / 2);
  }

  function tokenizeLine(line, lineNum) {
    var tokens = [];
    var i = 0;

    while (i < line.length) {
      var ch = line[i];

      if (ch === ' ' || ch === '\t') { i++; continue; }

      // Quoted string — also handle curly quotes
      if (ch === '"' || ch === '\u201C' || ch === '\u201D') {
        var result = readString(line, i, lineNum);
        tokens.push(new Token(TOKEN_TYPES.STRING, result.str, lineNum));
        i = result.end;
        continue;
      }

      if (/[0-9]/.test(ch)) {
        var nr = readNumber(line, i);
        tokens.push(new Token(TOKEN_TYPES.NUMBER, nr.num, lineNum));
        i = nr.end;
        continue;
      }

      if (/[a-zA-Z_]/.test(ch)) {
        var wr = readWord(line, i);
        var lw = wr.word.toLowerCase();
        if (KEYWORDS.has(lw)) {
          tokens.push(new Token(TOKEN_TYPES.KEYWORD, lw, lineNum));
        } else {
          tokens.push(new Token(TOKEN_TYPES.IDENTIFIER, wr.word, lineNum));
        }
        i = wr.end;
        continue;
      }

      i++; // skip unknown chars (punctuation etc.)
    }

    return tokens;
  }

  function readString(line, start, lineNum) {
    var CLOSE = new Set(['"', '\u201D', '\u2019']);
    var i   = start + 1;
    var str = '';
    while (i < line.length) {
      var c = line[i];
      if (c === '"' || CLOSE.has(c)) return { str: str, end: i + 1 };
      str += c;
      i++;
    }
    throw new LexerError('Unclosed string starting at column ' + (start + 1), lineNum);
  }

  function readNumber(line, start) {
    var i = start, s = '';
    while (i < line.length && /[0-9.]/.test(line[i])) { s += line[i]; i++; }
    return { num: parseFloat(s), end: i };
  }

  function readWord(line, start) {
    var i = start, w = '';
    while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) { w += line[i]; i++; }
    return { word: w, end: i };
  }

  /* ── Export ───────────────────────────────────────────────────────── */
  window.SpeakLexer = { tokenize: tokenize, TOKEN_TYPES: TOKEN_TYPES, LexerError: LexerError };
  console.log('[SpeakScript] Lexer ready');

})();
