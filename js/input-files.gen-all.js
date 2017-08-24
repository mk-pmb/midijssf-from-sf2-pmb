/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var fs = require('fs'), async = require('async'), ranges,
  mapRange = require('./map-range.js'),
  makeInputFn = require('./input-files.paths.js'),
  makeNote = require('./input-files.one-note.js'),
  concurrency = 8;


ranges = {
  // Usually you'll want the ranges very wide, because it's better to have
  // unused input files than to have a convert job failing because one is
  // missing. Input files that your convert job doesn't use won't add
  // to your outputs' file size.
  instrumentIdFrom: 1,
  instrumentIdUpto: 128,
  noteIdFrom: 0,
  noteIdUpto: 127,
};


function eachConc(inputs, iter, deliver) {
  async.eachLimit(inputs, concurrency, iter, deliver);
}


function mkdirIfMissing(path, then) {
  fs.mkdir(path, function (err) {
    if (err && (err.code === 'EEXIST')) { return then(null); }
    then(err);
  });
}


function genMidiFileJobs(instrumentId) {
  return mapRange(ranges, 'noteId', function (noteId) {
    return { instrument: instrumentId, midiNote: noteId,
      destFn: makeInputFn(instrumentId, noteId) };
  });
}


function makeMidiFile(job, then) {
  fs.writeFile(job.destFn, makeNote(job), then);
}


function logProgress(msg) {
  process.stdout.write('\r... ' + msg + ' ...     ');
}


function andTheDrumsToo(iter) {
  var r = mapRange(ranges, 'instrumentId', iter);
  r.push(iter(-10));
  return r;
}


async.series([
  function makeDirs(next) {
    logProgress('gen. instrument directories');
    var dirNames = andTheDrumsToo(makeInputFn);
    eachConc(dirNames, mkdirIfMissing, next);
  }
].concat(andTheDrumsToo(function (insId) {
  var names = { '-10': 'percussion' };
  return function (next) {
    logProgress('gen. MIDI files for ' + (names[insId]
      || ('instrument #' + insId)));
    eachConc(genMidiFileJobs(insId), makeMidiFile, next);
  };
})), function (err) {
  if (err) {
    console.dir(err);
    throw err;
  }
  console.log('\n+OK generated all files in range.');
});





























/*scroll*/
