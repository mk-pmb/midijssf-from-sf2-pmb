/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var fs = require('fs'), MidiFile = require('midifile'),
  midiFn = (process.argv[2] || 'foo.mid');

fs.readFile(midiFn, { encoding: null }, function (err, blob) {
  if (err) { throw err; }
  var midi = new MidiFile(blob);
  midi.getTrackEvents(0).forEach(function (evt) {
    console.log(JSON.stringify(evt, 0, 1
      ).replace(/^\{\s*|\s*\}$|"/g, ''
      ).replace(/\n\s*/g, '\t'
      ));
  });
});




