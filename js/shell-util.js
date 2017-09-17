/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {}, execFile = require('child_process').execFile;

function roundedFixed(x) { return x.toFixed(15).replace(/\.?0+$/, ''); }
function saveToProp(d, k, x, f) { d[k] = (f ? f(x) : x); }


EX.genFluidsynthCmd = function (cfg) {
  var cmd = [ 'fluidsynth' ];
  ['Chorus', 'Reverb', 'Gain'].forEach(function (o) {
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
  chOpt = { maxBuffer: (+opt.maxlen || 1), encoding: (opt.enc || null) };

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










module.exports = EX;
