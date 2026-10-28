'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

global.window = global;

function loadScript(file) {
  eval(fs.readFileSync(path.join(root, file), 'utf8'));
}

loadScript('assets/js/lexer.js');
loadScript('assets/js/expr.js');
loadScript('assets/js/parser.js');
eval(fs.readFileSync(path.join(root, 'assets/js/examples.js'), 'utf8'));

var EXAMPLES = global.SpeakExamples || global.EXAMPLES;
var ok = 0;
var fail = 0;
function walk(nodes, id) {
  (nodes || []).forEach(function (n) {
    if (n.type === 'quiz' && (!n.choices || !n.choices.length)) {
      throw new Error('quiz has no choices');
    }
    if (n.body) walk(n.body, id);
    if (n.trueBranch) walk(n.trueBranch, id);
    if (n.falseBranch) walk(n.falseBranch, id);
  });
}

(EXAMPLES || []).forEach(function (ex) {
  try {
    if (String(ex.code).indexOf('with answers') !== -1) {
      throw new Error('uses unsupported with answers syntax');
    }
    var ast = SpeakParser.parseProgram(ex.code);
    walk(ast.nodes, ex.id);
    ok++;
  } catch (e) {
    fail++;
    console.error('FAIL', ex.id, e.message);
  }
});
console.log(ok + ' examples OK, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
