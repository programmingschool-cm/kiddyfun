'use strict';
/**
 * Builds the colorful Bangla KiddyFun language guide (HTML).
 * Run: node docs/build-bangla-guide.js
 */
var fs = require('fs');
var path = require('path');

var KEYS = 'scene appears says waves smiles jumps flies moves right left hides shows show word means narrator wait second seconds ask choice correct wrong repeat times while if answer is else end score starts at add points play sound flaps clap success dances bows runs walks handshakes nods cheers set to true false define call return with and or not plus minus times divided by joined greater than less equal equals length of list item in type value empty const for each break continue user as random from remainder remove number game player when pressed held arrow key keys space every frame stop move jump power touches touch width height view top side wall coin platform spawn lives life timer goal collect collected message restart enemy patrols between camera follows follow lose ground pause resume level next load map choose health damage hurt chases chase shoot bullet toward hazard give has'.split(' ');
var KEY = {};
KEYS.forEach(function (k) { KEY[k] = 1; });

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlight(src) {
  var out = '';
  var i = 0;
  var s = String(src);
  while (i < s.length) {
    var ch = s[i];
    if (ch === '#') {
      out += '<span class="c">' + esc(s.slice(i)) + '</span>';
      break;
    }
    if (ch === '"') {
      var j = i + 1;
      while (j < s.length && s[j] !== '"') j++;
      if (j < s.length) j++;
      out += '<span class="s">' + esc(s.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      var n = i + 1;
      while (n < s.length && /[0-9.]/.test(s[n])) n++;
      out += '<span class="n">' + esc(s.slice(i, n)) + '</span>';
      i = n;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      var w = i + 1;
      while (w < s.length && /[A-Za-z0-9_]/.test(s[w])) w++;
      var word = s.slice(i, w);
      if (KEY[word.toLowerCase()]) out += '<span class="k">' + esc(word) + '</span>';
      else out += '<span class="id">' + esc(word) + '</span>';
      i = w;
      continue;
    }
    out += esc(ch);
    i++;
  }
  return out;
}

function code(s) {
  return '<pre class="code">' + String(s).split('\n').map(highlight).join('\n') + '</pre>';
}

var html = [];
function add(s) { html.push(s); }

add('<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8">');
add('<title>KiddyFun কোড — সম্পূর্ণ গাইড</title>');
add('<style>');
add([
  '@page { size: A4; margin: 14mm 13mm 16mm; }',
  '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  'html, body { margin: 0; padding: 0; }',
  'body { font-family: "Nirmala UI", "Segoe UI", sans-serif; color: #1e293b; font-size: 11.5pt; line-height: 1.55; background: #fff; }',
  'h1, h2, h3, h4 { line-height: 1.25; margin: 0 0 8px; }',
  'p { margin: 0 0 8px; }',
  'h2 { font-size: 18pt; color: #fff; background: #4c1d95; padding: 8px 12px; border-radius: 10px; margin: 18px 0 10px; break-after: avoid; }',
  'h2.story { background: #6d28d9; }',
  'h2.logic { background: #c2410c; }',
  'h2.game { background: #047857; }',
  'h2.rule { background: #b45309; }',
  'h2.ref { background: #1d4ed8; }',
  'h3 { font-size: 13.5pt; color: #312e81; margin: 14px 0 6px; break-after: avoid; }',
  'h4 { font-size: 12pt; color: #0f766e; margin: 10px 0 4px; break-after: avoid; }',
  '.cover { min-height: 250mm; background: linear-gradient(160deg, #4c1d95 0%, #6d28d9 42%, #047857 100%); color: #fff; padding: 28mm 16mm; border-radius: 0; }',
  '.cover h1 { font-size: 36pt; margin: 0 0 8px; }',
  '.cover .sub { font-size: 16pt; color: #fde68a; margin: 0 0 18px; }',
  '.cover p { font-size: 13pt; max-width: 150mm; }',
  '.cover .chips span { display: inline-block; margin: 4px 6px 0 0; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.18); font-size: 11pt; }',
  '.legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }',
  '.legend span { border-radius: 8px; padding: 4px 8px; font-family: Consolas, "Cascadia Mono", "Nirmala UI", monospace; font-weight: 700; }',
  '.lk { background: #ede9fe; color: #5b21b6; }',
  '.ls { background: #dcfce7; color: #166534; }',
  '.ln { background: #ffedd5; color: #9a3412; }',
  '.lid { background: #e0f2fe; color: #075985; }',
  '.lc { background: #f1f5f9; color: #64748b; }',
  'pre.code { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 12px; font-family: Consolas, "Cascadia Mono", "Nirmala UI", monospace; font-size: 10.5pt; line-height: 1.45; white-space: pre-wrap; margin: 6px 0 10px; break-inside: avoid; }',
  'pre.code .k { color: #c4b5fd; font-weight: 700; }',
  'pre.code .s { color: #86efac; }',
  'pre.code .n { color: #fdba74; }',
  'pre.code .id { color: #7dd3fc; }',
  'pre.code .c { color: #94a3b8; font-style: italic; }',
  '.shape { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 6px solid #2563eb; border-radius: 8px; padding: 8px 10px; margin: 6px 0 8px; break-inside: avoid; }',
  '.shape b { color: #1d4ed8; }',
  '.note { background: #ecfeff; border-left: 6px solid #0891b2; border-radius: 8px; padding: 8px 10px; margin: 8px 0; break-inside: avoid; }',
  '.warn { background: #fff7ed; border-left: 6px solid #ea580c; border-radius: 8px; padding: 8px 10px; margin: 8px 0; break-inside: avoid; }',
  '.ok { background: #f0fdf4; border-left: 6px solid #16a34a; border-radius: 8px; padding: 8px 10px; margin: 8px 0; break-inside: avoid; }',
  'table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 10.5pt; break-inside: auto; }',
  'th, td { border: 1px solid #cbd5e1; padding: 5px 7px; vertical-align: top; text-align: left; }',
  'th { background: #312e81; color: #fff; }',
  'tr { break-inside: avoid; }',
  'tr:nth-child(even) td { background: #f8fafc; }',
  'code.inline, .inline { font-family: Consolas, "Cascadia Mono", "Nirmala UI", monospace; background: #ede9fe; color: #5b21b6; padding: 0 4px; border-radius: 4px; font-size: .95em; }',
  'ul, ol { margin: 4px 0 10px; padding-left: 1.2em; }',
  'li { margin: 2px 0; }',
  '.toc a { color: #1e1b4b; text-decoration: none; }',
  '.toc li { margin: 3px 0; }',
  '.small { color: #475569; font-size: 10.5pt; }'
].join('\n'));
add('</style></head><body>');

add('<section class="cover">');
add('<p class="small" style="color:#fde68a">KiddyFun Code · ভাষা গাইড</p>');
add('<h1>KiddyFun কোড</h1>');
add('<p class="sub">সম্পূর্ণ গাইড — সব চিহ্ন, সব কমান্ড, সব নিয়ম</p>');
add('<p>এই বই পড়ে আপনি এই ভাষায় গল্প, কুইজ, অঙ্ক, তালিকা, ফাংশন এবং গেমের সব কোড লিখতে পারবেন। এখানে কোনো কমান্ড বাদ নেই। প্রতিটি লাইনের আকার, উদাহরণ এবং নিয়ম আলাদা করে দেখানো হয়েছে।</p>');
add('<div class="chips"><span>গল্প</span><span>কুইজ</span><span>অঙ্ক</span><span>তালিকা</span><span>ফাংশন</span><span>গেম</span></div>');
add('<p style="margin-top:28px">কোডের ভাষা ইংরেজি শব্দে লেখা হয়। ব্যাখ্যা বাংলায়। কম্পিউটার যে শব্দ বোঝে, সেই শব্দই এখানে রঙিন করে দেখানো হয়েছে।</p>');
add('</section>');

add('<h2 class="rule">এই বই কীভাবে পড়বেন</h2>');
add('<p>প্রতিটি কমান্ড তিনভাবে দেখানো হয়েছে।</p>');
add('<div class="shape"><b>আকার</b> — লাইনটা কোন শব্দে সাজাতে হবে। নীল বাক্সে থাকে। <b>নাম</b>, <b>মান</b>, <b>সংখ্যা</b> এর জায়গায় আপনার নিজের শব্দ বসবে।</div>');
add('<p>কালো বাক্সের কোড হুবহু চালানো যায়। রঙের মানে:</p>');
add('<div class="legend"><span class="lk">কমান্ড শব্দ</span><span class="ls">"টেক্সট"</span><span class="ln">সংখ্যা</span><span class="lid">আপনার দেওয়া নাম</span><span class="lc"># মন্তব্য</span></div>');
add(code('set age to 10\nRafi says "Hello!"\n# এই লাইন কম্পিউটার পড়ে না'));
add('<div class="note"><b>মনে রাখুন:</b> কমান্ডের বানান ইংরেজিতে, হুবহু। <span class="inline">set</span> এর বদলে সেট লিখলে চলবে না। বাংলা শুধু উদ্ধৃতির ভিতরের কথায় এবং এই বইয়ের ব্যাখ্যায়।</div>');

add('<h2 class="rule">১. এই ভাষা কী, কোথায় চলে</h2>');
add('<p>KiddyFun Code বাচ্চাদের জন্য বানানো একটি ইংরেজি-সদৃশ ভাষা। এক লাইনে এক কাজ। ব্লক দিয়েও একই লাইন লেখা যায়। আসল প্রোগ্রাম হলো এই লেখা। ব্লক সেই লেখারই আরেক চেহারা।</p>');
add('<p>একটি ফাইল দুই রকমের একটা হতে পারে।</p>');
add('<table><tr><th>ধরন</th><th>কী দিয়ে শুরু</th><th>কী হয়</th></tr>');
add('<tr><td>গল্প</td><td><span class="inline">scene</span></td><td>চরিত্র আসে, কথা বলে, কুইজ হয়, অপেক্ষা করে। কীবোর্ড দিয়ে চরিত্র নাড়ানো যায় না।</td></tr>');
add('<tr><td>গেম</td><td><span class="inline">game "নাম"</span></td><td>তীরের চাবি বা WASD দিয়ে খেলোয়াড় চলে। কয়েন, শত্রু, জীবন, সময়।</td></tr></table>');
add('<div class="warn"><b>এক ফাইলে একটাই বেছে নিন।</b> গেম ফাইলে <span class="inline">appears</span>, <span class="inline">says</span>, <span class="inline">narrator</span>, <span class="inline">choose</span>, কুইজ বা <span class="inline">wait</span> চলে না। গল্পের ফাইলে <span class="inline">move</span>, <span class="inline">every frame</span>, জাম্প চলে না।</div>');
add('<h3>চালানোর ধাপ</h3>');
add('<ol><li>Code ট্যাবে লেখা খুলুন।</li><li>Text মোডে লাইন লিখুন, অথবা Blocks মোডে কার্ড সাজান। দুটোই একই প্রোগ্রাম।</li><li>RUN চাপুন।</li><li>Output-এ মঞ্চ, কথা, কুইজের বোতাম, অথবা গেম দেখা যাবে।</li><li>গেম হলে আগে মঞ্চে একবার ক্লিক করুন, তারপর চাবি চাপুন। ফোনে মঞ্চের টাচ প্যাড ব্যবহার করুন।</li></ol>');
add('<p>তীরের চাবি অথবা W A S D চরিত্র নাড়ায়। স্পেসবার জাম্প (পাশ থেকে দেখা গেমে)। কোডে চাবির নাম ইংরেজিতে লিখতে হয়: <span class="inline">left</span>, <span class="inline">right</span>, <span class="inline">up</span>, <span class="inline">down</span>, <span class="inline">space</span>।</p>');

add('<h2 class="rule">২. লেখার নিয়ম</h2>');
add('<h3>এক লাইনে এক কমান্ড</h3>');
add('<p>প্রতিটি কাজ নতুন লাইনে। লাইনের শেষে সেমিকোলন লাগে না।</p>');
add(code('Rafi appears\nRafi says "Hi"'));
add('<h3>টেক্সট শুধু ডবল কোটেশনে</h3>');
add('<p>কথার দুপাশে সোজা ডবল কোট <span class="inline">"</span>। সিঙ্গেল কোট <span class="inline">\'</span> টেক্সটের চিহ্ন নয়।</p>');
add(code('set name to "Mina"\nRafi says "Hello, Mina!"'));
add('<div class="warn">কোট বন্ধ না করলে প্রোগ্রাম থেমে যাবে: Unclosed string। শুরুর <span class="inline">"</span> এবং শেষের <span class="inline">"</span> দুটোই লাগবে।</div>');
add('<h3>ব্লকের ভিতরে চার স্পেস</h3>');
add('<p><span class="inline">if</span>, <span class="inline">else</span>, <span class="inline">repeat</span>, <span class="inline">for each</span>, <span class="inline">define</span>, <span class="inline">every frame</span>, <span class="inline">when</span>, <span class="inline">while</span> এর ভিতরের লাইন চার স্পেস এগিয়ে লিখুন। এক ট্যাবও চলে, ট্যাব চার স্পেসের সমান।</p>');
add(code('if score is greater than 10\n    narrator says "Great score!"\nend'));
add('<h3>প্রতিটি ব্লক end দিয়ে বন্ধ</h3>');
add('<p>যে ব্লক খোলে, তার শেষ লাইন <span class="inline">end</span>। <span class="inline">else</span> আলাদা ব্লক নয়। <span class="inline">else</span> তার <span class="inline">if</span>-এরই অংশ। তাই <span class="inline">if</span> আর <span class="inline">else</span> মিলিয়ে <b>একটাই</b> <span class="inline">end</span>।</p>');
add(code('if score is greater than 10\n    narrator says "High"\nelse\n    narrator says "Keep going"\nend'));
add('<div class="ok"><b>else if নেই।</b> অন্য শর্ত লাগলে <span class="inline">else</span>-এর ভিতরে আরেকটি <span class="inline">if</span> বসান। ভিতরের <span class="inline">if</span>-এর নিজের <span class="inline">end</span> থাকবে, বাইরেরটারও।</div>');
add(code('if score is greater than 10\n    narrator says "High"\nelse\n    if score equals 10\n        narrator says "Exact"\n    end\n    narrator says "Checked"\nend'));
add('<h3>উপর থেকে নিচে</h3>');
add('<p>কম্পিউটার প্রথম লাইন থেকে শেষ লাইনের দিকে চলে। লুপ, <span class="inline">if</span>, আর ফাংশন এই ধারাকে বদলায়।</p>');
add('<h3>বড় হাতের অক্ষর</h3>');
add('<p>চরিত্রের ছবির নাম বড়-ছোট হাতের অক্ষরে একই: <span class="inline">Rafi</span> আর <span class="inline">rafi</span> একই ছবি। তবু নাম প্রতিবার একইভাবে লিখুন। ভেরিয়েবল ও ফাংশনের নাম হুবহু মিলতে হবে। <span class="inline">score</span> আর <span class="inline">Score</span> এক নয়, আর <span class="inline">Score</span> লেখাও যাবে না কারণ কমান্ড শব্দ নাম হতে পারে না।</p>');

add('<h2 class="ref">৩. যে চিহ্ন কোডে ব্যবহৃত হয়</h2>');
add('<p>এই ভাষায় <span class="inline">+</span> <span class="inline">-</span> <span class="inline">*</span> <span class="inline">/</span> <span class="inline">=</span> <span class="inline">( )</span> <span class="inline">{ }</span> <span class="inline">[ ]</span> <span class="inline">;</span> নেই। যোগ মানে <span class="inline">plus</span>, সমান বসানো মানে <span class="inline">to</span>। অজানা চিহ্ন কম্পিউটার বাদ দিয়ে দেয়, তাই <span class="inline">1 + 2</span> লিখলে যোগ হয় না।</p>');
add('<table><tr><th>চিহ্ন</th><th>নাম</th><th>কাজ</th><th>উদাহরণ</th></tr>');
var symbols = [
  ['" "', 'ডবল কোট', 'টেক্সটের শুরু ও শেষ', 'says "Hi"'],
  ['#', 'হ্যাশ', 'লাইন বা লাইনের বাকি অংশ মন্তব্য', '# note'],
  ['স্পেস', 'ফাঁকা', 'শব্দ আলাদা করে', 'set age to 10'],
  ['নতুন লাইন', 'এন্টার', 'এক কমান্ড শেষ', 'Rafi appears'],
  ['চার স্পেস', 'ইন্ডেন্ট', 'ব্লকের ভিতর', '    narrator says "Hi"'],
  ['ট্যাব', 'ট্যাব', 'চার স্পেসের সমান', 'ব্লকের ভিতরে'],
  ['0-9 ও .', 'সংখ্যা', 'পূর্ণ বা দশমিক', '10   3.5'],
  ['_', 'আন্ডারস্কোর', 'নামের ভিতরে', 'player_name']
];
symbols.forEach(function (row) {
  add('<tr><td><b>' + esc(row[0]) + '</b></td><td>' + esc(row[1]) + '</td><td>' + esc(row[2]) + '</td><td><span class="inline">' + esc(row[3]) + '</span></td></tr>');
});
add('</table>');
add('<h3>যে শব্দগুলো চিহ্নের কাজ করে</h3>');
add('<p>এই শব্দগুলো নিজে কমান্ড নয়। এরা দুই অংশকে জোড়ে। এগুলো নাম হিসেবে ব্যবহার করা যাবে না।</p>');
add('<table><tr><th>শব্দ</th><th>মানে</th><th>কোথায় বসে</th></tr>');
var glue = [
  ['to', 'এর মান', 'set age to 10'],
  ['with', 'সাথে', 'define greet with name'],
  ['and', 'এবং', 'a and b   অথবা   শর্ত and শর্ত'],
  ['or', 'অথবা', 'choose "A" or "B"   অথবা   শর্ত or শর্ত'],
  ['not', 'না', 'not ready'],
  ['plus', 'যোগ', '5 plus 3'],
  ['minus', 'বিয়োগ', '10 minus 4'],
  ['times', 'গুণ', '4 times 2'],
  ['divided by', 'ভাগ', '8 divided by 2'],
  ['joined with', 'টেক্সট জোড়া', '"Hi" joined with "!"'],
  ['remainder', 'ভাগশেষ', '11 remainder 2'],
  ['is', 'হয়', 'score is greater than 10'],
  ['equals', 'সমান', 'choice equals "Go left"'],
  ['from', 'থেকে', 'random number from 1 to 6'],
  ['by', 'পরিমাণ', 'move Rafi left by 4'],
  ['at', 'অবস্থান বা মান', 'lives start at 3'],
  ['of', 'এর', 'length of name'],
  ['in', 'এর ভিতরে', 'item 1 in fruits'],
  ['as', 'হিসেবে রাখো', 'ask user "?" as name'],
  ['means', 'মানে', 'show word "brave" means "সাহসী"'],
  ['end', 'ব্লক শেষ', 'if ... end']
];
glue.forEach(function (row) {
  add('<tr><td><span class="inline">' + esc(row[0]) + '</span></td><td>' + esc(row[1]) + '</td><td><span class="inline">' + esc(row[2]) + '</span></td></tr>');
});
add('</table>');

add('<h2 class="rule">৪. মন্তব্য</h2>');
add('<div class="shape"><b>আকার:</b> # এর পর যা খুশি, লাইনের শেষ পর্যন্ত</div>');
add('<p><span class="inline">#</span> থেকে লাইনের শেষ পর্যন্ত কম্পিউটার পড়ে না। উদ্ধৃতির ভিতরের <span class="inline">#</span> মন্তব্য নয়, সেটা টেক্সটের অংশ।</p>');
add(code('# আমার প্রথম প্রোগ্রাম\nscene "school"\nRafi says "Score #1"\nRafi waves   # হাত নাড়ে'));

add('<h2 class="ref">৫. নাম এবং নিষিদ্ধ শব্দ</h2>');
add('<p>ভেরিয়েবল, ফাংশন, আর প্যারামিটারের নাম: প্রথমে অক্ষর বা <span class="inline">_</span>, তারপর অক্ষর, সংখ্যা, <span class="inline">_</span>। ফাঁকা, হাইফেন, বাংলা অক্ষর নামে চলবে না।</p>');
add(code('set playerName to "Rafi"\nset lives_left to 3\nset a1 to 10'));
add('<div class="warn">নিচের সব শব্দ কমান্ড। এগুলো ভেরিয়েবল বা ফাংশনের নাম হতে পারবে না। <span class="inline">list</span>, <span class="inline">end</span>, <span class="inline">to</span>, <span class="inline">if</span>, <span class="inline">game</span> — এগুলোও নাম নয়।</div>');
add('<p>' + KEYS.map(function (k) { return '<span class="inline">' + k + '</span>'; }).join(' ') + '</p>');
add('<p class="small"><span class="inline">export</span> শব্দটিও নাম হিসেবে বন্ধ। এটি দিয়ে কোনো কমান্ড লেখা হয় না।</p>');

add('<h2 class="logic">৬. উপাত্তের ধরন</h2>');
add('<table><tr><th>ধরন</th><th>কীভাবে লিখবেন</th><th>উদাহরণ</th></tr>');
add('<tr><td>টেক্সট</td><td>ডবল কোটের ভিতর</td><td><span class="inline">"Hello"</span> <span class="inline">"সাহসী"</span></td></tr>');
add('<tr><td>সংখ্যা</td><td>কোট ছাড়া</td><td><span class="inline">10</span> <span class="inline">3.5</span> <span class="inline">0</span></td></tr>');
add('<tr><td>সত্য / মিথ্যা</td><td>শব্দ</td><td><span class="inline">true</span> <span class="inline">false</span></td></tr>');
add('<tr><td>তালিকা</td><td>list ... and ...</td><td><span class="inline">list "a" and "b"</span></td></tr></table>');
add('<p>কোট দিলে সেটা টেক্সট। কোট না দিলে সংখ্যা, সত্য-মিথ্যা, অথবা একটি নাম (ভেরিয়েবল)।</p>');
add(code('set title to "10"\nset count to 10\nshow type of title\nshow type of count'));
add('<p>প্রথমটার ধরন টেক্সট। দ্বিতীয়টার ধরন সংখ্যা। <span class="inline">show type of</span> আউটপুটের লগে ধরন ছাপে।</p>');

add('<h2 class="logic">৭. ভেরিয়েবল এবং const</h2>');
add('<h3>set — রাখা বা বদলানো</h3>');
add('<div class="shape"><b>আকার:</b> set নাম to মান</div>');
add('<p><span class="inline">set</span> নতুন ভেরিয়েবল বানায়, অথবা পুরনোটার মান বদলায়। ডান পাশে সংখ্যা, টেক্সট, সত্য-মিথ্যা, তালিকা, অঙ্ক, আরেক ভেরিয়েবল — যা খুশি।</p>');
add(code('set name to "Rafi"\nset age to 10\nset happy to true\nset score to 0\nset score to score plus 10\nRafi says name'));
add('<div class="note">কথায় ভেরিয়েবল বসাতে কোট দেবেন না। <span class="inline">Rafi says name</span> নামের ভিতরের কথা বলে। <span class="inline">Rafi says "name"</span> হুবহু name শব্দটি বলে।</div>');
add('<h3>const — একবার, আর বদল নয়</h3>');
add('<div class="shape"><b>আকার:</b> const নাম to মান</div>');
add(code('const maxLives to 3\nconst gameName to "KiddyFun"'));
add('<div class="warn">পরে <span class="inline">set maxLives to 5</span> লিখলে ভুল হবে। যে মান বদলাবে, সেটা <span class="inline">set</span>। যে মান স্থির, সেটা <span class="inline">const</span>।</div>');
add('<h3>আগে থেকে থাকা নাম</h3>');
add('<table><tr><th>নাম</th><th>কখন ভরে</th><th>ভিতরে কী</th></tr>');
add('<tr><td><span class="inline">answer</span></td><td>কুইজের পর</td><td>টেক্সট <span class="inline">"correct"</span> অথবা <span class="inline">"wrong"</span></td></tr>');
add('<tr><td><span class="inline">answer</span></td><td>ask user এর পর, যদি as না থাকে</td><td>খেলোয়াড় যা টাইপ করেছে</td></tr>');
add('<tr><td><span class="inline">choice</span></td><td>choose এর পর</td><td>যে বোতামের লেখা চাপা হয়েছে, হুবহু</td></tr></table>');

add('<h2 class="logic">৮. অঙ্ক এবং মান</h2>');
add('<p>অঙ্ক বসে <span class="inline">set</span>, <span class="inline">const</span>, <span class="inline">if</span>, <span class="inline">return</span>, <span class="inline">repeat while</span>, আর <span class="inline">says</span>-এর ডান পাশে। আলাদা লাইনে শুধু <span class="inline">5 plus 3</span> লিখলে কমান্ড হয় না।</p>');
add('<table><tr><th>কাজ</th><th>আকার</th><th>উদাহরণ</th><th>ফল</th></tr>');
var mathRows = [
  ['যোগ', 'ক plus খ', '5 plus 3', '8'],
  ['বিয়োগ', 'ক minus খ', '10 minus 4', '6'],
  ['গুণ', 'ক times খ', '4 times 2', '8'],
  ['ভাগ', 'ক divided by খ', '8 divided by 2', '4'],
  ['ভাগশেষ', 'ক remainder খ', '11 remainder 2', '1'],
  ['টেক্সট জোড়া', 'ক joined with খ', '"Hi" joined with "!"', 'Hi!'],
  ['দৈব সংখ্যা', 'random number from ক to খ', 'random number from 1 to 6', '1 থেকে 6, দুটোই ধরা'],
  ['দৈর্ঘ্য', 'length of নাম', 'length of name', 'টেক্সটের অক্ষর বা তালিকার সংখ্যা'],
  ['তালিকার ঘর', 'item সংখ্যা in তালিকা', 'item 1 in fruits', 'প্রথম ঘর'],
  ['ফাংশন', 'call নাম with মান', 'call add with 5 and 3', 'ফাংশন যা return করে'],
  ['জিজ্ঞাসা', 'ask user "প্রশ্ন"', 'ask user "Name?"', 'টাইপ করা টেক্সট']
];
mathRows.forEach(function (r) {
  add('<tr><td>' + esc(r[0]) + '</td><td><span class="inline">' + esc(r[1]) + '</span></td><td><span class="inline">' + esc(r[2]) + '</span></td><td>' + esc(r[3]) + '</td></tr>');
});
add('</table>');
add(code('set total to 10 plus 5\nset half to 8 divided by 2\nset msg to "Hi" joined with " there"\nset dice to random number from 1 to 6\nset n to length of name\nRafi says total'));
add('<h3>কোন অঙ্ক আগে হয়</h3>');
add('<p>গুণ, ভাগ, ভাগশেষ আগে। তারপর যোগ, বিয়োগ, টেক্সট জোড়া। <span class="inline">not</span> আর <span class="inline">length of</span> সবচেয়ে কাছে বাঁধে।</p>');
add(code('set total to 5 plus 3 times 2'));
add('<p>এটা 5 + (3 × 2) = 11। (5 + 3) × 2 নয়। বন্ধনী নেই, তাই এই ক্রমই নিয়ম। দুই ধাপে লিখলে পরিষ্কার:</p>');
add(code('set part to 3 times 2\nset total to 5 plus part'));
add('<div class="warn">শূন্য দিয়ে ভাগ বা শূন্য দিয়ে ভাগশেষ করলে প্রোগ্রাম থামবে। <span class="inline">divided by 0</span> লিখবেন না।</div>');

add('<h2 class="logic">৯. তুলনা এবং যুক্তি</h2>');
add('<p>তুলনা <span class="inline">if</span> আর <span class="inline">repeat while</span>-এর শর্তে বসে। ফল হয় সত্য বা মিথ্যা।</p>');
add('<table><tr><th>মানে</th><th>আকার</th></tr>');
var cmp = [
  ['সমান', 'নাম equals মান'],
  ['সমান, অন্য রূপ', 'নাম is equal to মান'],
  ['সমান নয়', 'নাম is not equal to মান'],
  ['বড়', 'নাম is greater than মান'],
  ['ছোট', 'নাম is less than মান'],
  ['বড় বা সমান', 'নাম is greater than or equal to মান'],
  ['ছোট বা সমান', 'নাম is less than or equal to মান'],
  ['তালিকা খালি', 'তালিকা is empty'],
  ['তালিকায় আছে', 'মান is in তালিকা']
];
cmp.forEach(function (r) {
  add('<tr><td>' + esc(r[0]) + '</td><td><span class="inline">' + esc(r[1]) + '</span></td></tr>');
});
add('</table>');
add(code('if score is greater than 10\n    narrator says "High"\nend\n\nif name equals "Rafi"\n    narrator says "Hello Rafi"\nend\n\nif fruits is empty\n    narrator says "Nothing here"\nend\n\nif "apple" is in fruits\n    narrator says "Found apple"\nend'));
add('<h3>and, or, not</h3>');
add('<div class="shape"><b>আকার:</b> শর্ত and শর্ত<br><b>আকার:</b> শর্ত or শর্ত<br><b>আকার:</b> not মান</div>');
add('<p><span class="inline">and</span> দুটোই সত্য হলে সত্য। <span class="inline">or</span> একটা সত্য হলেই সত্য। <span class="inline">not</span> সত্যকে মিথ্যা, মিথ্যাকে সত্য করে। <span class="inline">or</span> সবচেয়ে ঢিলে। তারপর <span class="inline">and</span>। তারপর তুলনা।</p>');
add(code('if score is greater than 10 and happy equals true\n    narrator says "Both"\nend\n\nif age is less than 8 or age is greater than 12\n    narrator says "Outside the range"\nend\n\nif not ready\n    narrator says "Wait"\nend'));

add('<h2 class="logic">১০. if এবং else</h2>');
add('<div class="shape"><b>আকার:</b><br>if শর্ত<br>&nbsp;&nbsp;&nbsp;&nbsp;কাজ<br>end</div>');
add('<div class="shape"><b>আকার:</b><br>if শর্ত<br>&nbsp;&nbsp;&nbsp;&nbsp;কাজ<br>else<br>&nbsp;&nbsp;&nbsp;&nbsp;অন্য কাজ<br>end</div>');
add('<p>শর্ত সত্য হলে প্রথম অংশ। মিথ্যা হলে <span class="inline">else</span>। <span class="inline">else</span> না থাকলে মিথ্যা হলে কিছু হয় না। এক জোড়ার একটাই <span class="inline">end</span>।</p>');
add(code('set score to 12\nif score is greater than 10\n    narrator says "High score!"\nelse\n    narrator says "Keep trying!"\nend'));
add('<h3>বিশেষ if — এগুলো সাধারণ তুলনা নয়</h3>');
add('<p>এই রূপগুলো আলাদা কমান্ড। শব্দ হুবহু থাকতে হবে।</p>');
add('<table><tr><th>আকার</th><th>কখন সত্য</th></tr>');
add('<tr><td><span class="inline">if answer is correct</span></td><td>শেষ কুইজের উত্তর ঠিক</td></tr>');
add('<tr><td><span class="inline">if answer is wrong</span></td><td>শেষ কুইজের উত্তর ভুল</td></tr>');
add('<tr><td><span class="inline">if choice equals "লেখা"</span></td><td>choose-এর বোতামের লেখা হুবহু মিলেছে</td></tr>');
add('<tr><td><span class="inline">if left key is held</span></td><td>বাম চাবি চেপে ধরা আছে (গেম)</td></tr>');
add('<tr><td><span class="inline">if Rafi touches coin</span></td><td>Rafi কয়েন ছুঁয়েছে (গেম)</td></tr>');
add('<tr><td><span class="inline">if Rafi has key</span></td><td>Rafi-র কাছে key আছে (গেম)</td></tr></table>');
add('<p>চাবির নাম: <span class="inline">left</span>, <span class="inline">right</span>, <span class="inline">up</span>, <span class="inline">down</span>, <span class="inline">space</span>। <span class="inline">left key is held</span> আর <span class="inline">left arrow is held</span> একই। ছোঁয়ার লক্ষ্য: <span class="inline">coin</span>, <span class="inline">enemy</span>, <span class="inline">wall</span>।</p>');

add('<h2 class="logic">১১. লুপ</h2>');
add('<h3>repeat — গোনা সংখ্যা</h3>');
add('<div class="shape"><b>আকার:</b> repeat সংখ্যা times ... end</div>');
add('<p>সংখ্যা ১ থেকে ১০০। তার নিচে বা উপরে হলে প্রোগ্রাম ভুল ধরবে। <span class="inline">times</span> শব্দটি লাগবেই।</p>');
add(code('repeat 3 times\n    Bird flies\n    wait 1 second\nend'));
add('<h3>repeat while — যতক্ষণ শর্ত সত্য</h3>');
add('<div class="shape"><b>আকার:</b> repeat while শর্ত ... end</div>');
add('<p>শর্ত মিথ্যা হলে থামে। ভিতরে এমন কাজ রাখুন যাতে শর্ত একসময় মিথ্যা হয়, নইলে লুপ শেষ হবে না।</p>');
add(code('set n to 1\nrepeat while n is less than 4\n    narrator says n\n    set n to n plus 1\nend'));
add('<h3>for each — তালিকার প্রতিটি ঘর</h3>');
add('<div class="shape"><b>আকার:</b> for each ঘরের_নাম in তালিকার_নাম ... end</div>');
add(code('set fruits to list "apple" and "banana"\nfor each fruit in fruits\n    narrator says fruit\nend'));
add('<p>এখানে <span class="inline">fruit</span> একে একে apple, তারপর banana হয়। <span class="inline">fruits</span> আগে থেকে তালিকা হতে হবে।</p>');
add('<h3>break এবং continue</h3>');
add('<p>শুধু লুপের ভিতরে। <span class="inline">break</span> লুপ ছেড়ে বেরিয়ে যায়। <span class="inline">continue</span> এই পাকের বাকি কাজ বাদ দিয়ে পরের পাকে যায়।</p>');
add(code('set n to 0\nrepeat 10 times\n    set n to n plus 1\n    if n equals 3\n        continue\n    end\n    if n equals 6\n        break\n    end\n    narrator says n\nend'));

add('<h2 class="logic">১২. তালিকা</h2>');
add('<p>তালিকার ঘর ১ থেকে গোনা হয়। ০ নয়। প্রথম ঘর <span class="inline">item 1</span>।</p>');
add('<div class="shape"><b>আকার:</b> set নাম to list মান and মান and মান</div>');
add(code('set fruits to list "apple" and "banana" and "mango"\nset nums to list 1 and 2 and 3\nset first to item 1 in fruits\nadd "pear" to fruits\nremove item 2 from fruits\nset count to length of fruits'));
add('<table><tr><th>কাজ</th><th>আকার</th></tr>');
add('<tr><td>বানানো</td><td><span class="inline">set নাম to list ক and খ</span></td></tr>');
add('<tr><td>পড়া</td><td><span class="inline">item সংখ্যা in তালিকা</span></td></tr>');
add('<tr><td>শেষে যোগ</td><td><span class="inline">add মান to তালিকা</span></td></tr>');
add('<tr><td>ঘর মুছা</td><td><span class="inline">remove item সংখ্যা from তালিকা</span></td></tr>');
add('<tr><td>খালি কি</td><td><span class="inline">তালিকা is empty</span></td></tr>');
add('<tr><td>আছে কি</td><td><span class="inline">মান is in তালিকা</span></td></tr>');
add('<tr><td>কতগুলো</td><td><span class="inline">length of তালিকা</span></td></tr></table>');
add('<div class="note"><span class="inline">add "pear" to fruits</span> তালিকায় যোগ করে। <span class="inline">add 10 points</span> স্কোর বাড়ায়। <span class="inline">to</span> থাকলে তালিকা, <span class="inline">points</span> থাকলে স্কোর।</div>');
add(code('if fruits is empty\n    narrator says "No fruit"\nend\nif "apple" is in fruits\n    narrator says "Found apple"\nend'));

add('<h2 class="logic">১৩. ফাংশন</h2>');
add('<p>ফাংশন একগুচ্ছ কাজের নাম। আগে <span class="inline">define</span>, পরে <span class="inline">call</span>। নাম কমান্ড শব্দ হতে পারবে না।</p>');
add('<h3>প্যারামিটার ছাড়া</h3>');
add('<div class="shape"><b>আকার:</b> define নাম ... end<br>call নাম</div>');
add(code('define waveHello\n    Rafi waves\n    Rafi says "Hello!"\nend\ncall waveHello'));
add('<h3>প্যারামিটারসহ</h3>');
add('<div class="shape"><b>আকার:</b> define নাম with ক and খ ... end<br>call নাম with মান and মান</div>');
add(code('define greet with name\n    narrator says name\nend\ncall greet with "Rafi"\ncall greet with "Mina"'));
add('<h3>মান ফেরত</h3>');
add('<div class="shape"><b>আকার:</b> return মান<br>অথবা শুধু return</div>');
add(code('define addNumbers with a and b\n    return a plus b\nend\nset total to call addNumbers with 5 and 10\nnarrator says total'));
add('<p><span class="inline">return</span> ফাংশন থামিয়ে মান দেয়। <span class="inline">set</span>-এর ডান পাশে <span class="inline">call</span> বসালে সেই মান ভেরিয়েবলে যায়। শুধু <span class="inline">return</span> লিখলে মান ছাড়াই ফাংশন শেষ হয়।</p>');

add('<h2 class="logic">১৪. ব্যবহারকারীকে জিজ্ঞাসা</h2>');
add('<p>Output-এ একটা ঘর আসে। খেলোয়াড় টাইপ করে। তিন রূপ:</p>');
add('<div class="shape"><b>আকার:</b> ask user "প্রশ্ন" as নাম</div>');
add('<div class="shape"><b>আকার:</b> ask user "প্রশ্ন"</div>');
add('<div class="shape"><b>আকার:</b> set নাম to ask user "প্রশ্ন"</div>');
add(code('ask user "What is your name?" as playerName\nnarrator says playerName\n\nask user "How old are you?"\nnarrator says answer\n\nset colour to ask user "Favourite colour?"\nnarrator says colour'));
add('<p><span class="inline">as</span> থাকলে লেখা সেই নামে জমা হয়। <span class="inline">as</span> না থাকলে জমা হয় <span class="inline">answer</span>-এ। তৃতীয় রূপটা এক লাইনেই ভেরিয়েবলে রাখে।</p>');
add('<div class="warn">এটা কুইজের <span class="inline">ask</span> নয়। কুইজে <span class="inline">user</span> শব্দ থাকে না, আর পরে <span class="inline">choice</span> লাইন থাকে।</div>');

add('<h2 class="story">১৫. গল্পের মঞ্চ</h2>');
add('<h3>দৃশ্য</h3>');
add('<div class="shape"><b>আকার:</b> scene "নাম"<br><b>গেমের আকার:</b> scene "নাম" with walls</div>');
add('<p>নাম ছোট হাতের অক্ষরে নেওয়া হয়। ফাঁকা ও চিহ্ন বাদ পড়ে। তৈরি দৃশ্য:</p>');
add('<p><span class="inline">school</span> <span class="inline">classroom</span> <span class="inline">jungle</span> <span class="inline">restaurant</span> <span class="inline">home</span> <span class="inline">playground</span> <span class="inline">space</span> <span class="inline">default</span></p>');
add(code('scene "classroom"\nscene "playground" with walls'));
add('<p><span class="inline">with walls</span> গেমে সেই দৃশ্যের তৈরি দেয়াল ও কয়েন আনে। গল্পে দরকার হয় না।</p>');
add('<h3>চরিত্র আসা</h3>');
add('<div class="shape"><b>আকার:</b> নাম appears</div>');
add('<p>ছবি আছে এদের: Rafi, Mina, Teacher, Lion, Bird, Monkey, Robot, Cat, Dog, Seller, Buyer, Mostak, Sagor, Rabiul। অন্য নামও চলে, ছবি সাধারণ হতে পারে।</p>');
add(code('Rafi appears\nMina appears\nCow appears'));
add('<h3>কথা বলা</h3>');
add('<div class="shape"><b>আকার:</b> নাম says "টেক্সট"<br><b>আকার:</b> নাম says ভেরিয়েবল_বা_অঙ্ক</div>');
add(code('Rafi says "Hello, Mina!"\nset name to "Rafi"\nRafi says name\nset age to 10\nRafi says age'));
add('<h3>বর্ণনাকারী</h3>');
add('<div class="shape"><b>আকার:</b> narrator says "টেক্সট"<br><b>আকার:</b> narrator says ভেরিয়েবল</div>');
add('<p><span class="inline">narrator</span> কোনো চরিত্রের নাম নয়। এটি কমান্ড। বড় হাতের N দিয়ে শুরু করবেন না।</p>');
add(code('narrator says "Once upon a time..."\nnarrator says name'));
add('<h3>চরিত্রের কাজ</h3>');
add('<div class="shape"><b>আকার:</b> নাম কাজ</div>');
add('<p>কাজের পুরো তালিকা। প্রতিটি আলাদা লাইন। শেষে s আছে, কারণ এগুলো গল্পের ক্রিয়া।</p>');
add('<p><span class="inline">waves</span> <span class="inline">smiles</span> <span class="inline">jumps</span> <span class="inline">flies</span> <span class="inline">runs</span> <span class="inline">walks</span> <span class="inline">dances</span> <span class="inline">claps</span> <span class="inline">hides</span> <span class="inline">shows</span> <span class="inline">bows</span> <span class="inline">nods</span> <span class="inline">cheers</span> <span class="inline">handshakes</span> <span class="inline">flaps</span></p>');
add('<div class="shape"><b>আকার:</b> নাম moves left<br><b>আকার:</b> নাম moves right</div>');
add(code('Rafi waves\nMina dances\nBird flaps\nCat hides\nCat shows\nRafi moves right\nRafi moves left'));
add('<div class="warn"><b>jumps আর jump আলাদা।</b> গল্পে <span class="inline">Rafi jumps</span> (s সহ) একটা অভিনয়। গেমে <span class="inline">Rafi jump</span> (s ছাড়া) সত্যিকারের লাফ। একটাকে অন্যটার ভুল বানান ভাববেন না।</div>');
add('<h3>অপেক্ষা</h3>');
add('<div class="shape"><b>আকার:</b> wait সংখ্যা<br><b>আকার:</b> wait সংখ্যা second<br><b>আকার:</b> wait সংখ্যা seconds</div>');
add('<p>গল্পে সংখ্যা ১ থেকে ৮ সেকেন্ড। <span class="inline">second</span> বা <span class="inline">seconds</span> লিখলেও কম্পিউটার শুধু সংখ্যাটা নেয়।</p>');
add(code('wait 1 second\nwait 2 seconds'));
add('<h3>শব্দার্থ কার্ড</h3>');
add('<div class="shape"><b>আকার:</b> show word "ইংরেজি" means "মানে"</div>');
add(code('show word "brave" means "সাহসী"\nshow word "friend" means "বন্ধু"'));
add('<h3>শব্দ</h3>');
add('<div class="shape"><b>আকার:</b> play sound "নাম"</div>');
add('<p>তৈরি শব্দ: <span class="inline">success</span> <span class="inline">clap</span> <span class="inline">win</span> <span class="inline">cheer</span> <span class="inline">pop</span> <span class="inline">appear</span> <span class="inline">wrong</span> <span class="inline">gameover</span> <span class="inline">correct</span> <span class="inline">scene</span></p>');
add(code('play sound "success"\nplay sound "wrong"'));
add('<h3>স্কোর — গল্প ও গেম দুটোতেই</h3>');
add('<div class="shape"><b>আকার:</b> score starts at সংখ্যা<br><b>আকার:</b> add সংখ্যা points<br><b>আকার:</b> show score</div>');
add(code('score starts at 0\nadd 10 points\nshow score'));

add('<h2 class="story">১৬. পথ বেছে নেওয়া</h2>');
add('<div class="shape"><b>আকার:</b> choose "পথ" or "পথ" or "পথ"</div>');
add('<p>মঞ্চে বোতাম আসে। যে বোতাম চাপা হবে, তার পুরো লেখা <span class="inline">choice</span>-এ জমা হয়। <span class="inline">or</span> দিয়ে দুই বা তার বেশি পথ।</p>');
add(code('choose "Go left" or "Go right" or "Stay"\nif choice equals "Go left"\n    narrator says "You went left!"\nelse\n    if choice equals "Go right"\n        narrator says "You went right!"\n    end\nend'));
add('<div class="warn"><span class="inline">equals</span>-এর পরের টেক্সট বোতামের লেখার সাথে হুবহু মিলতে হবে। বড় হাতের অক্ষর, ফাঁকা, সব। <span class="inline">"Go left"</span> আর <span class="inline">"go left"</span> এক নয়।</div>');

add('<h2 class="story">১৭. কুইজ</h2>');
add('<div class="shape"><b>আকার:</b><br>ask "প্রশ্ন"<br>choice "উত্তর" wrong<br>choice "উত্তর" correct</div>');
add('<p><span class="inline">ask</span>-এর ঠিক পরের লাইনগুলো <span class="inline">choice</span>। প্রতিটি <span class="inline">choice</span> শেষ হয় <span class="inline">correct</span> অথবা <span class="inline">wrong</span> দিয়ে। মাঝখানে অন্য কমান্ড বসালে কুইজ ভেঙে যায়। একটা উত্তর <span class="inline">correct</span> রাখুন।</p>');
add(code('ask "What colour is the sky?"\nchoice "Green" wrong\nchoice "Blue" correct\nchoice "Red" wrong\n\nif answer is correct\n    narrator says "Yes!"\n    add 10 points\n    play sound "success"\nelse\n    narrator says "Not quite."\n    play sound "wrong"\nend'));
add('<p>কুইজের পর <span class="inline">answer</span> হয় <span class="inline">"correct"</span> অথবা <span class="inline">"wrong"</span>। তাই শর্ত <span class="inline">if answer is correct</span>। <span class="inline">if answer equals "Blue"</span> নয়।</p>');
add('<div class="warn">একা <span class="inline">choice</span> চলবে না। আগে <span class="inline">ask</span> লাগবে। <span class="inline">ask</span>-এর পর অন্তত একটা <span class="inline">choice</span> লাগবে।</div>');

add('<h2 class="logic">১৮. দেখে নেওয়া</h2>');
add('<div class="shape"><b>আকার:</b> show type of নাম<br><b>আকার:</b> show value of নাম</div>');
add('<p>লগ প্যানেলে ধরন বা মান ছাপে। মঞ্চে বড় করে দেখায় না। ভুল খুঁজতে কাজে লাগে।</p>');
add(code('set age to 10\nset name to "Mina"\nshow type of age\nshow value of name'));

add('<h2 class="game">১৯. গেম শুরু, দৃশ্য, খেলোয়াড়</h2>');
add('<div class="warn">গেম ফাইলের প্রথম অর্থপূর্ণ লাইন <span class="inline">game "শিরোনাম"</span>। এর আগে শুধু মন্তব্য থাকতে পারে।</div>');
add('<div class="shape"><b>আকার:</b> game "শিরোনাম"<br><b>আকার:</b> game view top<br><b>আকার:</b> game view side<br><b>আকার:</b> game "শিরোনাম" view top</div>');
add('<p><span class="inline">side</span> পাশ থেকে দেখা: মাধ্যাকর্ষণ আছে, স্পেসে লাফ। এটাই সাধারণ। <span class="inline">top</span> উপর থেকে দেখা: চার দিক, লাফ নেই।</p>');
add(code('game "My Platform Game"\nscene "playground" with walls\nscore starts at 0\nRafi is player\nset Rafi speed to 5'));
add('<div class="shape"><b>আকার:</b> নাম is player<br><b>আকার:</b> set নাম speed to সংখ্যা</div>');
add('<p><span class="inline">speed</span> না লিখলেও গেম চলে। সংখ্যা যত বড়, চলা তত দ্রুত।</p>');
add('<h3>তৈরি ম্যাপ</h3>');
add('<div class="shape"><b>আকার:</b> load map "নাম"</div>');
add('<p>নাম: <span class="inline">school_maze</span> <span class="inline">playground_extended</span> <span class="inline">jungle_run</span> <span class="inline">arena_coins</span>। নতুন ম্যাপ আগের দেয়াল ও কয়েন সরিয়ে নিজেরটা বসায়।</p>');
add(code('scene "school"\nload map "school_maze"'));

add('<h2 class="game">২০. নাড়ানো এবং লাফ</h2>');
add('<h3>every frame</h3>');
add('<div class="shape"><b>আকার:</b> every frame ... end</div>');
add('<p>ভিতরের কাজ প্রতি ফ্রেমে হয়। চাবি চেপে ধরে চলা এখানে বসে।</p>');
add(code('every frame\n    if left key is held\n        move Rafi left by 4\n    end\n    if right key is held\n        move Rafi right by 4\n    end\nend'));
add('<p>উপর থেকে দেখা গেমে <span class="inline">up</span> ও <span class="inline">down</span>ও যোগ করুন।</p>');
add(code('every frame\n    if up key is held\n        move Mina up by 4\n    end\n    if down key is held\n        move Mina down by 4\n    end\nend'));
add('<h3>move</h3>');
add('<div class="shape"><b>আকার:</b> move নাম দিক by সংখ্যা</div>');
add('<p>দিক শুধু <span class="inline">left</span>, <span class="inline">right</span>, <span class="inline">up</span>, <span class="inline">down</span>। <span class="inline">by</span>-এর পর সংখ্যা বা অঙ্ক।</p>');
add('<div class="warn"><span class="inline">move</span> একা ফাইলের গোড়ায় বসবে না। এটা <span class="inline">every frame</span>-এর ভিতরে, অথবা <span class="inline">while ... key is held</span>-এর ভিতরে।</div>');
add('<h3>while চাবি চেপে ধরা</h3>');
add('<div class="shape"><b>আকার:</b> while দিক key is held ... end</div>');
add('<p>এটা <span class="inline">every frame</span>-এর ভিতরের <span class="inline">if</span>-এর বিকল্প। নিজেই ব্লক, তাই <span class="inline">every frame</span>-এর বাইরে বসে।</p>');
add(code('while right key is held\n    move Rafi right by 4\nend'));
add('<h3>লাফ — শুধু পাশ থেকে দেখা গেম</h3>');
add('<div class="shape"><b>আকার:</b> when space is pressed ... end<br>ভিতরে: নাম jump<br>অথবা: নাম jump with power সংখ্যা</div>');
add('<p><span class="inline">power</span> না লিখলে শক্তি ১২। একবার চাপলে একবার লাফ, তাই এটা <span class="inline">when ... is pressed</span>-এর ভিতরে। <span class="inline">every frame</span>-এ রাখলে চেপে থাকলে বারবার লাফের চেষ্টা হবে।</p>');
add(code('when space is pressed\n    Rafi jump with power 12\nend'));
add('<div class="warn">এখানে ক্রিয়া <span class="inline">jump</span>। গল্পের <span class="inline">jumps</span> নয়।</div>');

add('<h2 class="game">২১. কয়েন, দেয়াল, ছোঁয়া</h2>');
add('<div class="shape"><b>আকার:</b> spawn coin at x সংখ্যা y সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> add wall at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> add platform at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা</div>');
add(code('spawn coin at x 200 y 150\nspawn coin at x 400 y 280\nadd wall at x 200 y 250 width 80 height 40'));
add('<div class="warn"><span class="inline">add coin</span> লিখবেন না। কয়েন বসাতে <span class="inline">spawn coin</span>।</div>');
add('<p>x বামে-ডানে, y উপরে-নিচে, পিক্সেলে। <span class="inline">width</span> চওড়া, <span class="inline">height</span> উঁচু।</p>');
add('<h3>ছোঁয়া</h3>');
add('<div class="shape"><b>আকার:</b> if নাম touches coin ... end<br><b>আকার:</b> if নাম touches enemy ... end<br><b>আকার:</b> if নাম touches wall ... end</div>');
add('<p>একবার ছুঁলে একবার চলে। তাই এটা <span class="inline">every frame</span>-এর <b>বাইরে</b>, ফাইলের উপরের স্তরে। <span class="inline">else</span> ঐচ্ছিক: না ছুঁয়ে থাকলে <span class="inline">else</span> চলে।</p>');
add(code('if Rafi touches coin\n    add 10 points\n    play sound "success"\n    remove coin\nend\n\nif Rafi touches enemy\n    lose 1 life\n    play sound "wrong"\nend'));
add('<div class="shape"><b>আকার:</b> remove coin<br><b>আকার:</b> remove enemy</div>');
add('<p><span class="inline">remove coin</span> ছোঁয়া কয়েন সরায়। <span class="inline">remove item</span> তালিকার ঘর সরায়। দুটো আলাদা।</p>');

add('<h2 class="game">২২. জীবন, সময়, জয়, বার্তা</h2>');
add('<div class="shape"><b>আকার:</b> lives start at সংখ্যা<br><b>আকার:</b> lives starts at সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> timer start at সংখ্যা<br><b>আকার:</b> timer starts at সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> goal is collect সংখ্যা coins</div>');
add('<div class="shape"><b>আকার:</b> lose সংখ্যা life<br><b>আকার:</b> lose সংখ্যা lives</div>');
add('<div class="shape"><b>আকার:</b> show message "টেক্সট"</div>');
add('<p><span class="inline">start</span> ও <span class="inline">starts</span> দুটোই চলে। <span class="inline">life</span> ও <span class="inline">lives</span> দুটোই চলে। যেমন লিখেছেন তেমনই রাখুন। স্ক্রিনে হৃদয়, গণনা, আর কয়েনের লক্ষ্য দেখায়। লক্ষ্য পূরণ হলে জয়ের পর্দা আসে।</p>');
add(code('lives start at 3\ntimer starts at 60\ngoal is collect 5 coins\nshow message "Level 2!"\nlose 1 life'));
add('<h3>গেমের ঘটনা</h3>');
add('<p>এগুলো উপরের স্তরের ব্লক। ভিতরে যা হবে, ঘটনা ঘটলে একবার চলে।</p>');
add('<div class="shape"><b>আকার:</b> when time is 0 ... end<br><b>আকার:</b> when lives is 0 ... end<br><b>আকার:</b> when health is 0 ... end<br><b>আকার:</b> when all coins collected ... end<br><b>আকার:</b> when space is pressed ... end<br><b>আকার:</b> when left arrow is pressed ... end</div>');
add('<p>চাবির <span class="inline">when</span> একবার চাপলে একবার চলে। সময়, জীবন, স্বাস্থ্য শুধু <span class="inline">is 0</span>। অন্য সংখ্যা লিখলে ভুল।</p>');
add(code('when time is 0\n    show message "Time up!"\n    play sound "gameover"\nend\n\nwhen lives is 0\n    show message "Game over!"\nend\n\nwhen all coins collected\n    show message "Nice!"\n    play sound "win"\nend'));

add('<h2 class="game">২৩. শত্রু, ক্যামেরা, লড়াই</h2>');
add('<div class="shape"><b>আকার:</b> spawn নাম as enemy at x সংখ্যা y সংখ্যা<br><b>আকার:</b> spawn নাম as enemy at x সংখ্যা y ground<br><b>আকার:</b> spawn enemy নাম at x সংখ্যা y সংখ্যা</div>');
add('<p><span class="inline">y ground</span> পাশের গেমে শত্রুকে মেঝেতে বসায়। সংখ্যা দিলে সেই উচ্চতায়।</p>');
add('<div class="shape"><b>আকার:</b> নাম is enemy</div>');
add('<div class="shape"><b>আকার:</b> নাম patrols between x সংখ্যা and x সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> নাম chases নাম</div>');
add('<div class="shape"><b>আকার:</b> camera follows নাম<br><b>আকার:</b> camera follow নাম</div>');
add(code('spawn Lion as enemy at x 350 y ground\nLion patrols between x 200 and x 500\nLion chases Rafi\ncamera follows Rafi'));
add('<p><span class="inline">chases</span> লিখতে হবে, <span class="inline">chase</span> নয়। <span class="inline">follows</span> ও <span class="inline">follow</span> দুটোই চলে।</p>');
add('<h3>স্বাস্থ্য, আঘাত, বিপদ, গুলি, জিনিস</h3>');
add('<div class="shape"><b>আকার:</b> health starts at সংখ্যা<br><b>আকার:</b> health start at সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> damage নাম by সংখ্যা<br><b>আকার:</b> hurt নাম by সংখ্যা</div>');
add('<p><span class="inline">damage</span> ও <span class="inline">hurt</span> একই কাজ। যে শব্দ লিখবেন সেটাই থাকবে।</p>');
add('<div class="shape"><b>আকার:</b> spawn hazard নাম at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা</div>');
add('<div class="shape"><b>আকার:</b> shoot bullet from নাম toward দিক<br><b>আকার:</b> shoot bullet from নাম toward দিক speed সংখ্যা</div>');
add('<p>দিক: <span class="inline">left</span> <span class="inline">right</span> <span class="inline">up</span> <span class="inline">down</span>। <span class="inline">speed</span> না লিখলে গতি ৬।</p>');
add('<div class="shape"><b>আকার:</b> give নাম জিনিস<br><b>আকার:</b> if নাম has জিনিস ... end</div>');
add(code('health starts at 100\ndamage Rafi by 10\nhurt Mina by 5\nspawn hazard lava at x 100 y 150 width 60 height 30\nshoot bullet from Rafi toward right speed 8\ngive Rafi key\nif Rafi has key\n    show message "Win!"\nend\nwhen health is 0\n    pause game\nend'));

add('<h2 class="game">২৪. গেম থামানো, চালু, লেভেল</h2>');
add('<div class="shape"><b>আকার:</b> pause game<br><b>আকার:</b> resume game<br><b>আকার:</b> stop game<br><b>আকার:</b> restart game</div>');
add('<p><span class="inline">pause</span> খেলা জমিয়ে রাখে। <span class="inline">resume</span> আবার চালায়। <span class="inline">stop</span> লুপ বন্ধ করে। <span class="inline">restart</span> গেম আবার লোড করে।</p>');
add('<div class="shape"><b>আকার:</b> level starts at সংখ্যা<br><b>আকার:</b> level start at সংখ্যা<br><b>আকার:</b> next level</div>');
add(code('level starts at 1\nwhen all coins collected\n    next level\n    show message "Level up!"\nend\n\npause game\nresume game\nstop game\nrestart game'));

add('<h2 class="rule">২৫. কোন কমান্ড কোথায় বসবে</h2>');
add('<table><tr><th>কমান্ড</th><th>কোথায়</th><th>না বসালে কী হয়</th></tr>');
add('<tr><td>move</td><td>every frame এর ভিতর, অথবা while key is held এর ভিতর</td><td>চরিত্র নিজে থেকে চলে না</td></tr>');
add('<tr><td>if চাবি key is held</td><td>every frame এর ভিতর</td><td>চেপে ধরা কাজ করে না</td></tr>');
add('<tr><td>while চাবি key is held</td><td>every frame এর বাইরে, নিজের end সহ</td><td>এটাই every frame এর বিকল্প</td></tr>');
add('<tr><td>নাম jump</td><td>when space is pressed এর ভিতর</td><td>লাফ একবারের বদলে গোলমাল হয়</td></tr>');
add('<tr><td>if touches</td><td>every frame এর বাইরে</td><td>এক ছোঁয়ায় বারবার পয়েন্ট বা জীবন কাটে</td></tr>');
add('<tr><td>when time/lives/health/coins</td><td>ফাইলের উপরের স্তর</td><td>ঘটনা ধরা পড়ে না</td></tr>');
add('<tr><td>appears, says, narrator, choose, ask+choice, wait</td><td>শুধু গল্পের ফাইল</td><td>গেম ফাইলে এগুলো চলে না</td></tr>');
add('<tr><td>repeat</td><td>১ থেকে ১০০</td><td>এর বাইরে ভুল</td></tr>');
add('<tr><td>wait</td><td>গল্পে ১ থেকে ৮ সেকেন্ড</td><td>এর বাইরে গল্পে থেমে থাকে না ঠিকমতো</td></tr></table>');

add('<h2 class="story">২৬. পুরো গল্প — লাইন ধরে লাইন</h2>');
add('<p>এই প্রোগ্রাম একা RUN করলে চলে। প্রতিটি লাইনের মানে নিচে।</p>');
add(code('# স্কুলের কুইজ গল্প\nscene "school"\nscore starts at 0\nTeacher appears\nRafi appears\nTeacher says "Hello class!"\nRafi waves\nwait 1 second\nshow word "brave" means "সাহসী"\n\nask "Which fruit is yellow?"\nchoice "Apple" wrong\nchoice "Banana" correct\n\nif answer is correct\n    add 10 points\n    play sound "success"\n    Teacher says "Yes, a banana!"\nelse\n    play sound "wrong"\n    Teacher says "Try the yellow one."\nend\n\nchoose "Clap" or "Dance"\nif choice equals "Clap"\n    Rafi claps\nelse\n    Rafi dances\nend\nshow score'));
add('<ol>');
add('<li><span class="inline">#</span> মন্তব্য, চলে না।</li>');
add('<li><span class="inline">scene</span> স্কুলের পট।</li>');
add('<li>স্কোর ০ থেকে শুরু।</li>');
add('<li>Teacher ও Rafi মঞ্চে আসে।</li>');
add('<li>Teacher কথা বলে, Rafi হাত নাড়ে, ১ সেকেন্ড অপেক্ষা।</li>');
add('<li>শব্দার্থ কার্ড: brave = সাহসী।</li>');
add('<li>প্রশ্ন, তারপর দুই উত্তর। Banana সঠিক।</li>');
add('<li>ঠিক হলে ১০ পয়েন্ট, সফল শব্দ, কথা। ভুল হলে অন্য শব্দ ও কথা। একটাই <span class="inline">end</span>।</li>');
add('<li>দুই বোতাম। লেখা হুবহু মিলিয়ে হাততালি বা নাচ।</li>');
add('<li><span class="inline">show score</span> স্কোর দেখায়।</li>');
add('</ol>');

add('<h2 class="game">২৭. পুরো গেম — লাইন ধরে লাইন</h2>');
add('<p>পাশ থেকে দেখা ছোট গেম। RUN করে মঞ্চে ক্লিক করুন। তীর বা A/D দিয়ে চলুন, স্পেসে লাফ দিন।</p>');
add(code('game "Coin Jump"\nscene "playground" with walls\nscore starts at 0\nlives start at 3\ngoal is collect 3 coins\nRafi is player\ncamera follows Rafi\n\nspawn coin at x 260 y 180\nspawn Lion as enemy at x 420 y ground\nLion patrols between x 300 and x 520\n\nwhen space is pressed\n    Rafi jump with power 12\nend\n\nevery frame\n    if left key is held\n        move Rafi left by 4\n    end\n    if right key is held\n        move Rafi right by 4\n    end\nend\n\nif Rafi touches coin\n    add 10 points\n    play sound "success"\n    remove coin\nend\n\nif Rafi touches enemy\n    lose 1 life\n    play sound "wrong"\nend\n\nwhen all coins collected\n    show message "You win!"\n    play sound "win"\nend\n\nwhen lives is 0\n    show message "Game over"\n    stop game\nend'));
add('<ol>');
add('<li><span class="inline">game</span> গেম মোড খোলে। দৃশ্য দেয়ালসহ। স্কোর, ৩ জীবন, ৩ কয়েনের লক্ষ্য।</li>');
add('<li>Rafi খেলোয়াড়। ক্যামেরা তাকে অনুসরণ করে।</li>');
add('<li>এক কয়েন ও এক শত্রু। শত্রু x 300 থেকে 520 পর্যন্ত পাহারা দেয়। <span class="inline">y ground</span> মেঝে।</li>');
add('<li>স্পেস চাপলে একবার লাফ, শক্তি ১২।</li>');
add('<li>প্রতি ফ্রেমে বাম বা ডান চেপে ধরলে ৪ পিক্সেল চলে।</li>');
add('<li>কয়েন ছুঁলে পয়েন্ট, শব্দ, কয়েন সরে। এটা ফ্রেমের বাইরে, তাই একবারই।</li>');
add('<li>শত্রু ছুঁলে এক জীবন কমে।</li>');
add('<li>সব কয়েন হলে জয়ের বার্তা। জীবন ০ হলে বার্তা ও <span class="inline">stop game</span>।</li>');
add('</ol>');
add('<h3>উপর থেকে দেখা গেমের পার্থক্য</h3>');
add('<p>শুরুতে <span class="inline">game view top</span> যোগ করুন। লাফের <span class="inline">when space</span> বাদ দিন। <span class="inline">every frame</span>-এ উপরে ও নিচের চাবি যোগ করুন। শত্রুর <span class="inline">y</span> সংখ্যা দিন, <span class="inline">ground</span> নয়।</p>');
add(code('game "Top Coins"\ngame view top\nscene "school"\nMina is player\nevery frame\n    if left key is held\n        move Mina left by 4\n    end\n    if right key is held\n        move Mina right by 4\n    end\n    if up key is held\n        move Mina up by 4\n    end\n    if down key is held\n        move Mina down by 4\n    end\nend'));

add('<h2 class="rule">২৮. যে ভুলগুলো বারবার হয়</h2>');
add('<table><tr><th>ভুল</th><th>ঠিক</th></tr>');
var mistakes = [
  ['এক লাইনে দুই কমান্ড', 'প্রতি কমান্ড নতুন লাইন'],
  ['টেক্সটে সিঙ্গেল কোট', 'ডবল কোট "Hello"'],
  ['else এর পর আলাদা ভেবে end বাদ, অথবা else এর জন্য অতিরিক্ত end', 'if ও else মিলিয়ে একটি end'],
  ['else if', 'else এর ভিতরে নতুন if, তার নিজের end'],
  ['Rafi says "name" যখন ভেরিয়েবল বোঝাতে চান', 'Rafi says name'],
  ['গল্পে Rafi jump', 'গল্পে Rafi jumps, গেমে Rafi jump'],
  ['গেম ফাইলে Rafi says', 'গেম ফাইলে show message'],
  ['move ফাইলের গোড়ায়', 'move every frame এর ভিতরে'],
  ['if touches every frame এর ভিতরে', 'if touches বাইরে'],
  ['add coin', 'spawn coin at x ... y ...'],
  ['item 0 in fruits', 'item 1 in fruits'],
  ['repeat 200 times', 'repeat ১ থেকে ১০০'],
  ['choice এর আগে ask নেই', 'আগে ask "প্রশ্ন"'],
  ['choice শেষে correct/wrong নেই', 'choice "Blue" correct'],
  ['if answer equals "Blue"', 'if answer is correct'],
  ['choose এর লেখা হুবহু না মিলে', 'equals এ বোতামের লেখা অবিকল'],
  ['কমান্ড শব্দকে নাম বানানো, যেমন set list to 1', 'অন্য নাম, যেমন set items to list "a" and "b"'],
  ['1 + 2', '1 plus 2'],
  ['const পরে set', 'বদলাতে হলে শুরু থেকেই set'],
  ['Lion chase Rafi', 'Lion chases Rafi']
];
mistakes.forEach(function (r) {
  add('<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>');
});
add('</table>');

add('<h2 class="ref">২৯. সব আকার এক নজরে</h2>');
add('<p>এই তালিকা পুরো ভাষা। বাঁ দিকের আকারে নিজের নাম ও সংখ্যা বসালেই কমান্ড।</p>');
add('<table><tr><th>আকার</th><th>কাজ</th></tr>');
var index = [
  ['# লেখা', 'মন্তব্য'],
  ['scene "নাম"', 'দৃশ্য'],
  ['scene "নাম" with walls', 'দৃশ্য ও তৈরি দেয়াল'],
  ['নাম appears', 'চরিত্র আসে'],
  ['নাম says "টেক্সট"', 'কথা'],
  ['নাম says মান', 'ভেরিয়েবল বা অঙ্ক বলে'],
  ['narrator says "টেক্সট"', 'বর্ণনা'],
  ['নাম waves / smiles / jumps / flies / runs / walks / dances / claps / hides / shows / bows / nods / cheers / handshakes / flaps', 'গল্পের অভিনয়'],
  ['নাম moves left', 'গল্পে বামে'],
  ['নাম moves right', 'গল্পে ডানে'],
  ['wait সংখ্যা', 'অপেক্ষা, ১–৮ সেকেন্ড'],
  ['show word "শব্দ" means "মানে"', 'শব্দার্থ'],
  ['play sound "নাম"', 'শব্দ বাজানো'],
  ['score starts at সংখ্যা', 'স্কোর শুরু'],
  ['add সংখ্যা points', 'পয়েন্ট যোগ'],
  ['show score', 'স্কোর দেখা'],
  ['choose "ক" or "খ"', 'পথের বোতাম'],
  ['if choice equals "লেখা"', 'কোন পথ'],
  ['ask "প্রশ্ন"', 'কুইজের প্রশ্ন'],
  ['choice "উত্তর" correct', 'সঠিক উত্তর'],
  ['choice "উত্তর" wrong', 'ভুল উত্তর'],
  ['if answer is correct', 'কুইজ ঠিক'],
  ['if answer is wrong', 'কুইজ ভুল'],
  ['ask user "প্রশ্ন" as নাম', 'টাইপ করে নামে রাখা'],
  ['ask user "প্রশ্ন"', 'টাইপ করে answer এ রাখা'],
  ['set নাম to মান', 'ভেরিয়েবল'],
  ['const নাম to মান', 'অবদল মান'],
  ['ক plus / minus / times খ', 'যোগ, বিয়োগ, গুণ'],
  ['ক divided by খ', 'ভাগ'],
  ['ক remainder খ', 'ভাগশেষ'],
  ['ক joined with খ', 'টেক্সট জোড়া'],
  ['random number from ক to খ', 'দৈব পূর্ণসংখ্যা'],
  ['length of নাম', 'দৈর্ঘ্য'],
  ['not মান', 'উল্টো সত্য'],
  ['শর্ত and শর্ত', 'দুটোই'],
  ['শর্ত or শর্ত', 'যেকোনো একটা'],
  ['নাম equals মান', 'সমান'],
  ['নাম is equal to মান', 'সমান'],
  ['নাম is not equal to মান', 'সমান নয়'],
  ['নাম is greater than মান', 'বড়'],
  ['নাম is less than মান', 'ছোট'],
  ['নাম is greater than or equal to মান', 'বড় বা সমান'],
  ['নাম is less than or equal to মান', 'ছোট বা সমান'],
  ['তালিকা is empty', 'খালি'],
  ['মান is in তালিকা', 'তালিকায় আছে'],
  ['if শর্ত ... else ... end', 'শর্ত, একটি end'],
  ['repeat সংখ্যা times ... end', '১–১০০ বার'],
  ['repeat while শর্ত ... end', 'যতক্ষণ সত্য'],
  ['for each ঘর in তালিকা ... end', 'প্রতিটি ঘর'],
  ['break', 'লুপ ছাড়া'],
  ['continue', 'এই পাক বাদ'],
  ['set নাম to list ক and খ', 'তালিকা'],
  ['item সংখ্যা in তালিকা', 'ঘর পড়া, ১ থেকে'],
  ['add মান to তালিকা', 'তালিকায় যোগ'],
  ['remove item সংখ্যা from তালিকা', 'ঘর মুছা'],
  ['define নাম ... end', 'ফাংশন'],
  ['define নাম with ক and খ ... end', 'প্যারামিটার'],
  ['call নাম', 'ডাক'],
  ['call নাম with মান and মান', 'মান দিয়ে ডাক'],
  ['return মান', 'মান ফেরত'],
  ['return', 'ফাংশন শেষ'],
  ['show type of নাম', 'ধরন'],
  ['show value of নাম', 'মান'],
  ['game "শিরোনাম"', 'গেম শুরু'],
  ['game view top', 'উপর থেকে'],
  ['game view side', 'পাশ থেকে'],
  ['নাম is player', 'খেলোয়াড়'],
  ['set নাম speed to সংখ্যা', 'গতি'],
  ['load map "নাম"', 'তৈরি ম্যাপ'],
  ['every frame ... end', 'প্রতি ফ্রেম'],
  ['if দিক key is held ... end', 'চাবি চেপে ধরা'],
  ['while দিক key is held ... end', 'যতক্ষণ চাবি'],
  ['move নাম দিক by সংখ্যা', 'নাড়ানো'],
  ['when space is pressed ... end', 'একবার চাপ'],
  ['নাম jump', 'লাফ, শক্তি ১২'],
  ['নাম jump with power সংখ্যা', 'নির্দিষ্ট শক্তির লাফ'],
  ['spawn coin at x সংখ্যা y সংখ্যা', 'কয়েন'],
  ['add wall at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা', 'দেয়াল'],
  ['add platform at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা', 'মাচা'],
  ['if নাম touches coin / enemy / wall ... end', 'ছোঁয়া'],
  ['remove coin', 'কয়েন সরানো'],
  ['remove enemy', 'শত্রু সরানো'],
  ['lives start at সংখ্যা', 'জীবন'],
  ['timer starts at সংখ্যা', 'সময়'],
  ['goal is collect সংখ্যা coins', 'জয়ের লক্ষ্য'],
  ['lose সংখ্যা life', 'জীবন কমানো'],
  ['show message "টেক্সট"', 'গেমের বার্তা'],
  ['when time is 0 ... end', 'সময় শেষ'],
  ['when lives is 0 ... end', 'জীবন শেষ'],
  ['when health is 0 ... end', 'স্বাস্থ্য শেষ'],
  ['when all coins collected ... end', 'সব কয়েন'],
  ['spawn নাম as enemy at x সংখ্যা y ground', 'মেঝেতে শত্রু'],
  ['spawn enemy নাম at x সংখ্যা y সংখ্যা', 'শত্রু'],
  ['নাম is enemy', 'শত্রু ঘোষণা'],
  ['নাম patrols between x সংখ্যা and x সংখ্যা', 'পাহারা'],
  ['নাম chases নাম', 'ধাওয়া'],
  ['camera follows নাম', 'ক্যামেরা'],
  ['health starts at সংখ্যা', 'স্বাস্থ্য'],
  ['damage নাম by সংখ্যা', 'আঘাত'],
  ['hurt নাম by সংখ্যা', 'আঘাত, একই কাজ'],
  ['spawn hazard নাম at x সংখ্যা y সংখ্যা width সংখ্যা height সংখ্যা', 'বিপদ'],
  ['shoot bullet from নাম toward দিক speed সংখ্যা', 'গুলি'],
  ['give নাম জিনিস', 'জিনিস দেওয়া'],
  ['if নাম has জিনিস ... end', 'জিনিস আছে কি'],
  ['pause game', 'জমানো'],
  ['resume game', 'আবার চলা'],
  ['stop game', 'থামানো'],
  ['restart game', 'আবার শুরু'],
  ['level starts at সংখ্যা', 'লেভেল'],
  ['next level', 'পরের লেভেল']
];
index.forEach(function (r) {
  add('<tr><td><span class="inline">' + esc(r[0]) + '</span></td><td>' + esc(r[1]) + '</td></tr>');
});
add('</table>');

add('<h2 class="rule">৩০. এখন নিজে লিখুন</h2>');
add('<p>নতুন ফাইল খুলুন। গল্প হলে <span class="inline">scene</span> দিয়ে শুরু করুন। গেম হলে <span class="inline">game "আমার গেম"</span> দিয়ে শুরু করুন। এই বইয়ের আকারের নীল শব্দের জায়গায় নিজের নাম বসান। রঙিন কমান্ড শব্দ বদলাবেন না। RUN চাপুন। ভুল এলে লাল বার্তার লাইন নম্বর দেখে সেই লাইন এই বইয়ের আকারের সাথে মিলিয়ে নিন।</p>');
add('<div class="ok"><b>এক বাক্যে পুরো ভাষা:</b> এক লাইনে এক ইংরেজি কমান্ড, টেক্সট কোটের ভিতর, ব্লকের ভিতর চার স্পেস, ব্লকের শেষে end, if ও else মিলিয়ে একটি end, গল্প আর গেম আলাদা ফাইল।</div>');
add('<p class="small">এই গাইড KiddyFun Code-এর চলতি ভাষা অনুসারে লেখা। অ্যাপে Examples মেনুতে একই কমান্ডের তৈরি প্রোগ্রাম আছে। সেগুলো RUN করে এই বইয়ের লাইনের সাথে মিলিয়ে দেখতে পারেন।</p>');

add('</body></html>');

var out = path.join(__dirname, 'KiddyFun-Guide-Bangla.html');
fs.writeFileSync(out, html.join('\n'), 'utf8');
console.log('wrote', out, 'chars', html.join('\n').length);
