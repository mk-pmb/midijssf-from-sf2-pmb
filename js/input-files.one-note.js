/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX;  //, MidiWr = re//quire('midi-writer-js');


function hex2(n) {
  return ('0' + (+n // not parseInt: "+" accepts '0xFF' hex notation strings
    || 0).toString(16)).slice(-2);
}


EX = function makeMidiData(opts) {
  function byteSlot(m, v) { return (byteSlot[m && v] || ''); }
  var ins = (+opts.instrument || 0), midiChannel = 1;
  if (ins === -10) {
    ins = 1;
    midiChannel = 10;
  }
  if ((ins < 1) || (ins > 128)) {
    throw new RangeError('instrument ID out of supported range 1..128');
  }
  byteSlot.i = hex2(ins - 1);
  byteSlot.n = hex2(opts.midiNote);
  byteSlot.c = (midiChannel - 1).toString(16);
  return Buffer.from(EX.templateHex.replace(/#(\w)/g, byteSlot
    ).replace(/\s+/g, ''), 'hex');
};


EX.templateHex = '4d546864 00000006 00010001 01e04d54 726b0000 001400ff ' +
  '040000c0 #i009#c#n 5592608#c #n5500ff 2f00';


EX.runFromCLI = function () {
  var args = process.argv.slice(2);
  process.stdout.write(EX({ midiNote: args[0], instrument: args[1] }));
};







module.exports = EX;
if (require.main === module) { EX.runFromCLI(); }
