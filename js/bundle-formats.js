/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = [], ld = require('lodash'), utf8bom = '\uFEFF',
  commonPrefix = require('common-prefix'),
  midijsNoteNames = require('./midijs-note-names.json').slice();


function regFmt(fmt) {
  //fmt.render.fmt = fmt;
  EX.push(fmt);
}


function calculateCommonSides(list) {
  if (list.commonPrefix === undefined) {
    list.commonPrefix = commonPrefix(list);
  }
  return list;
}


function makeSlicer(a, b) {
  if (b < 0) { return function (x) { return x.slice(a, b); }; }
  if (b > 0) { return function (x) { return x.slice(a, a + b); }; }
  return function (x) { return x.slice(a); };
}


regFmt({ id: 'cjwt', name: 'Compact JSON Wavetable', fext: '.json',
  render: function renderCjwt(pack) {
    var audio = pack.audio, data, tmp;
    data = { name: pack.insName, noteIdOffset: pack.notesRange[0] };

    calculateCommonSides(audio);
    tmp = audio.commonPrefix;
    if (tmp) {
      data.audioPrefix = tmp;
      audio = audio.map(makeSlicer(tmp.length));
    }
    data.noteAudio = audio;
    return (utf8bom + '{ "fmt": "cjwt", "fmtVer": 1,'
      + JSON.stringify(data, null, 2).slice(1) + '\n');
  },
  });


regFmt({ id: 'midijs', name: 'MIDI.js', fext: '.midi.js',
  render: function (pack) {
    //midijsNoteNames
    var nn = midijsNoteNames, ow = nn.length, cn = pack.notesRange[0],
      co = Math.floor(cn / ow) - 1;
    cn %= ow;
    function wn(au) {
      while (cn >= ow) {
        cn -= ow;
        co += 1;
      }
      var k = 'o' + (co < 0 ? '_' + (-co) : co) + nn[cn];
      cn += 1;
      return (k + ':' + '   '.substr(0, 4 - k.length) + '"' + au + '"');
    }
    return (['',
      "if (typeof MIDI === 'undefined') var MIDI = {};",
      "if (typeof MIDI.Soundfont === 'undefined') MIDI.Soundfont = {};",
      ("MIDI.Soundfont." + pack.fmtVars.s + " = {"),
      ''].join('\n') + pack.audio.map(wn).join(',\n') + '\n};\n');
  },
  });
















module.exports = EX;
