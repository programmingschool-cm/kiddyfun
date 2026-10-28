'use strict';
var fs = require('fs');
var path = require('path');
var root = __dirname;
global.window = global;
function load(file) { eval(fs.readFileSync(path.join(root, file), 'utf8')); }
load('assets/js/language-catalog.js');
load('assets/js/blocks-script.js');
load('assets/js/examples.js');
var S = window.KiddyBlocksScript;
var bad = 0;
window.SpeakExamples.forEach(function (ex) {
  var src = String(ex.code).replace(/\s+$/g, '');
  var out = S.serialize(S.parse(src)).replace(/\s+$/g, '');
  var a = src.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  var b = out.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  if (a.length !== b.length || a.some(function (line, i) { return line !== b[i]; })) {
    bad++;
    console.log('MISMATCH', ex.id);
    console.log(src);
    console.log('---');
    console.log(out);
  }
});
var tree = S.parse('damage Rafi by 10\nhurt Mina by 5');
console.log('kinds', tree.children.map(function (n) { return n.kind + ':' + n.fields.verb; }).join(' '));
console.log('EXAMPLES', window.SpeakExamples.length, 'MISMATCHES', bad);
