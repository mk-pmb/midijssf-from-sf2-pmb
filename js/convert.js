/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, async = require('async'), fs = require('fs'),
  pathLib = require('path'),
  defaultConfig = require('../cfg.default.js'),
  gm1InstrumentNames = require('midi-instrument-names-gm1-pmb'),
  mapRange = require('./map-range.js'),
  makeInputFn = require('./input-files.paths.js'),
  execFile = require('child_process').execFile,
  noteNames = require('./midijssf-note-names.json').slice(),
  numCPUs = require('os').cpus().length;



noteNames.fromMidi = (function (n, l) {
  return function (i) { return (Math.floor(i / l) - 1) + (n[i % l]); };
}(noteNames, noteNames.length));



function adjProp(obj, prop, adj) {
  adj = adj(obj[prop], obj);
  if (adj !== undefined) { obj[prop] = adj; }
}


function roundedFixed(x) { return x.toFixed(15).replace(/\.?0+$/, ''); }
function saveToProp(d, k, x, f) { d[k] = (f ? f(x) : x); }


EX = function convert(cfg) {
  cfg = Object.assign({}, defaultConfig, cfg);
  adjProp(cfg, 'concurrency', function (c) {
    if (c < 0) { c *= numCPUs; }
    return Math.max(c, 1);
  });
  adjProp(cfg, 'instrumentNames', function (n) {
    if (!n) { n = 'gm1'; }
    if (n.substr) {
      if (n === 'gm1') { return gm1InstrumentNames.instruments; }
      throw new Error('Unsupported instrument names list name');
    }
  });
  cfg.primaryConvCmd = EX.genFluidsynthCmd(cfg);
  async.series(mapRange.instrumentsAndPercussion(cfg, function (insId) {
    return EX.convertOneInstrument.bind(null, cfg, insId);
  }).slice(0, 1), cfg.whenAllConverted);
};


EX.genFluidsynthCmd = function (cfg) {
  var cmd = [ 'fluidsynth' ];
  [ 'Chorus', 'Reverb', 'Gain' ].forEach(function (o) {
    var v = cfg['note' + o];
    if (v === false) { v = '0'; }
    if (v === true) { v = '1'; }
    if (v === +v) { v = roundedFixed(v); }
    cmd.push('--' + o.toLowerCase(), v);
  });
  cmd.push('--disable-lash',
    '--audio-file-type', cfg.outFmt,
    '--fast-render=-',
    cfg.sf2file);
  return cmd;
};


EX.stdioConvert = function (cmd, opt, whenConverted) {
  opt = (opt || false);
  var inputBuf = opt.inputBuf, child, chOpt;
  chOpt = { maxBuffer: (+opt.maxlen || 64e6), encoding: (opt.enc || null) };

  function childDone(chErr, stdout, stderr) {
    if (chErr) {
      console.error(String(stderr));
    } else {
      if (opt.destObj) {
        saveToProp(opt.destObj, opt.destKey, stdout, opt.destFilter);
      }
    }
    return whenConverted(chErr, stdout);
  }

  function feedStdin() {
    child.stdin.write(inputBuf);
    child.stdin.end();
  }

  child = execFile(cmd[0], cmd.slice(1), chOpt, childDone);
  if (inputBuf) { setTimeout(feedStdin, 100); }
};


EX.convertOneInstrument = function (cfg, insId, nextInst) {
  var noteRange = [], cmd1 = cfg.primaryConvCmd,
    insName = cfg.instrumentNames[insId - 1];
  noteRange.name = 'noteRange';
  if (insId === -10) {
    noteRange.name = 'chn10Note';
    insName = cfg.chn10Name;
  }
  mapRange(cfg, noteRange.name, null, noteRange);
  if (!noteRange.length) { return nextInst(); }
  console.log('convert instrument #' + insId + ': ' + insName);

  function renderNote(noteId, nextNote) {
    var midiFn = makeInputFn(insId, noteId);
    EX.stdioConvert(cmd1.concat(midiFn), { enc: 'base64' }, nextNote);
    //destObj: audios, destKey: 'o' + noteNames.fromMidi(noteId),
  }

  function postProcessNotes(err, audios) {
    if (err) { return nextInst(err); }
    setImmediate(EX.saveAudios, cfg, { audios: audios, prefix: true,
      firstNote: noteRange[0], insName: insName }, nextInst);
  }

  async.mapSeries(noteRange, renderNote, postProcessNotes);
};




























module.exports = EX;
