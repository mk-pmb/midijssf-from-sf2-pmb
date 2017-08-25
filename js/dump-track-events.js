/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, fs = require('fs'), MidiFile = require('midifile');


EX = function dumpMidiFileData(blob, cons) {
  if (cons) {
    if (typeof cons === 'function') { cons = { log: cons }; }
  } else {
    cons = console;
  }
  var midi = new MidiFile(blob);
  midi.getTrackEvents(0).forEach(function (evt) {
    if (evt.channel === +evt.channel) { evt.channel += 1; }
    if (evt.type === 8) { EX.maybeNote(evt); }
    cons.log(JSON.stringify(evt, 0, 1
      ).replace(/^\{\s*|\s*\}$|"/g, ''
      ).replace(/\n\s*/g, '\t'
      ));
  });
};


EX.runFromCLI = function () {
  var midiFn = process.argv[2];
  fs.readFile(midiFn, { encoding: null }, function (err, data) {
    if (err) { throw err; }
    return EX(data);
  });
  return;
};


EX.maybeNote = function (evt) {
  var what;
  if (evt.subtype === 9) { what = 'noteOn'; }
  if (evt.subtype === 8) { what = 'noteOff'; }
  if (!what) { return; }
  evt.type = what;
  delete evt.subtype;
  evt.note = evt.param1;
  delete evt.param1;
  evt.velocity = evt.param2;
  delete evt.param2;
};




















module.exports = EX;
if (require.main === module) { EX.runFromCLI(); }
