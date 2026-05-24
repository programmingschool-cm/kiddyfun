#!/usr/bin/env node
/**
 * Regenerate assets/js/tutorial-content.js from docs/TUTORIAL.md
 * Run after editing TUTORIAL.md: node scripts/build-tutorial-content.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mdPath = path.join(root, 'docs', 'TUTORIAL.md');
const outPath = path.join(root, 'assets', 'js', 'tutorial-content.js');

const md = fs.readFileSync(mdPath, 'utf8');
const out =
  '/* Auto-generated from docs/TUTORIAL.md — run: node scripts/build-tutorial-content.js */\n' +
  '(function () {\n  "use strict";\n  window.KIDDY_TUTORIAL_MD = ' +
  JSON.stringify(md) +
  ';\n})();\n';

fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath, '(' + Math.round(out.length / 1024) + ' KB)');
