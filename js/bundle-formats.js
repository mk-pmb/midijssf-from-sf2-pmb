/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = [], ld = require('lodash'), utf8bom = '\uFEFF',
  kisi = require('./kitchen-sink.js'),
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


regFmt({ id: 'cjwt', name: 'Compact JSON Wavetable', fext: '.json',
  render: function renderCjwt(pack) {
    var samples = pack.sampleDataUrls, data, tmp;
    data = { name: pack.insName,
      audioFmt: pack.fmtId,
      noteIdOffset: pack.notesRange[0] };

    calculateCommonSides(samples);
    tmp = samples.commonPrefix;
    if (tmp) {
      data.audioPrefix = tmp;
      samples = samples.map(kisi.makeSlicer(tmp.length));
    }
    data.noteAudio = samples;
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
      ''].join('\n') + pack.sampleDataUrls.map(wn).join(',\n') + '\n};\n');
  },
  });
















module.exports = EX;
