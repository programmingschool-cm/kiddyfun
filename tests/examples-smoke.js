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
(EXAMPLES || []).forEach(function (ex) {
  try {
    SpeakParser.parseProgram(ex.code);
    ok++;
  } catch (e) {
    fail++;
    console.error('FAIL', ex.id, e.message);
  }
});
console.log(ok + ' examples OK, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
