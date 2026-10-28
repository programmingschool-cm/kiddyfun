/**
 * Closed word lists for KiddyFun.
 * Text autocomplete and blocks both read this, so a scene, sound, or action
 * can only be suggested when the language actually knows it.
 */
(function () {
  'use strict';

  var scenes = [
    { id: 'school', label: 'School' },
    { id: 'classroom', label: 'Classroom' },
    { id: 'jungle', label: 'Jungle' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'home', label: 'Home' },
    { id: 'playground', label: 'Playground' },
    { id: 'space', label: 'Space' },
    { id: 'default', label: 'Default' }
  ];

  var storyActions = [
    'waves', 'smiles', 'jumps', 'flies', 'runs', 'walks', 'dances', 'claps',
    'hides', 'shows', 'bows', 'nods', 'cheers', 'handshakes', 'flaps',
    'moves left', 'moves right'
  ];

  var characters = [
    'Rafi', 'Mina', 'Teacher', 'Lion', 'Bird', 'Monkey', 'Robot', 'Cat', 'Dog',
    'Seller', 'Buyer', 'Mostak', 'Sagor', 'Rabiul'
  ];

  var sounds = [
    'success', 'clap', 'win', 'cheer', 'pop', 'appear', 'wrong', 'gameover', 'correct', 'scene'
  ];

  var maps = [
    { id: 'school_maze', label: 'School maze' },
    { id: 'playground_extended', label: 'Playground' },
    { id: 'jungle_run', label: 'Jungle run' },
    { id: 'arena_coins', label: 'Arena coins' }
  ];

  var whenClauses = [
    'space is pressed',
    'left arrow is pressed',
    'right arrow is pressed',
    'up arrow is pressed',
    'down arrow is pressed',
    'time is 0',
    'lives is 0',
    'health is 0',
    'all coins collected'
  ];

  var compareOps = [
    'is greater than or equal to',
    'is less than or equal to',
    'is not equal to',
    'is greater than',
    'is less than',
    'is equal to',
    'equals'
  ];

  function ids(rows) {
    var out = [];
    for (var i = 0; i < rows.length; i++) out.push(rows[i].id);
    return out;
  }

  function normalize(raw) {
    return String(raw == null ? '' : raw).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function distance(a, b) {
    var rows = [];
    var i, j;
    for (i = 0; i <= b.length; i++) rows[i] = [i];
    for (j = 0; j <= a.length; j++) rows[0][j] = j;
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        rows[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? rows[i - 1][j - 1]
          : Math.min(rows[i - 1][j - 1] + 1, rows[i][j - 1] + 1, rows[i - 1][j] + 1);
      }
    }
    return rows[b.length][a.length];
  }

  /**
   * Closest built-in id for a typo. Exact matches and distant words return null.
   * options are plain ids. "default" is never offered as a guess.
   */
  function suggest(options, raw) {
    var q = normalize(raw);
    if (!q) return null;
    var i;
    for (i = 0; i < options.length; i++) {
      if (normalize(options[i]) === q) return null;
    }
    var best = null;
    var bestD = 3;
    for (i = 0; i < options.length; i++) {
      if (options[i] === 'default') continue;
      var d = distance(q, normalize(options[i]));
      if (d < bestD) {
        bestD = d;
        best = options[i];
      }
    }
    return best;
  }

  var sceneIds = ids(scenes);
  var mapIds = ids(maps);

  window.KiddyCatalog = {
    scenes: scenes,
    sceneIds: sceneIds,
    characters: characters,
    storyActions: storyActions,
    editorActions: ['appears', 'says ""'].concat(storyActions),
    sounds: sounds,
    maps: maps,
    mapIds: mapIds,
    whenClauses: whenClauses,
    heldKeys: ['left', 'right', 'up', 'down', 'space'],
    touchTargets: ['coin', 'enemy', 'wall'],
    compareOps: compareOps,
    mathOps: ['plus', 'minus', 'times', 'divided by', 'remainder', 'joined with'],
    suggest: suggest,
    suggestScene: function (raw) { return suggest(sceneIds, raw); },
    suggestSound: function (raw) { return suggest(sounds, raw); },
    suggestMap: function (raw) { return suggest(mapIds, raw); }
  };
})();
