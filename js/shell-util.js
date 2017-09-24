/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {}, execFile = require('child_process').execFile;

function roundedFixed(x) { return x.toFixed(15).replace(/\.?0+$/, ''); }
function saveToProp(d, k, x, f) { d[k] = (f ? f(x) : x); }
function len(x) { return (+((x || false).length) || 0); }
function empty(x) { return (len(x) <= 0); }


EX.pipe42 = [ 'bash', '-c',
  'LANG=C "$@" 42>&1 1>&2 | cat; exit ${PIPESTATUS[0]}',
  // ^-- The pipe through cat forces bash to provide the appended command
  //  with a real pipe instead of just forwarding the socket established by
  //  node's child_process module.
  //  Some programs, notably FluidSynth 1.1.6 on Ubuntu trusty, fail to
  //  write to node's socket, but can write to pipes.
  'fd42_pipe_helper' ];


EX.genCmd_synthCapture = function (cfg) {
  var cmd = [ 'fluidsynth' ];
  cmd = EX.pipe42.concat(cmd);
  ['Chorus', 'Reverb', 'Gain'].forEach(function (o) {
    var v = cfg['note' + o];
    if (v === false) { v = '0'; }
    if (v === true) { v = '1'; }
    if (v === +v) { v = roundedFixed(v); }
    cmd.push('--' + o.toLowerCase(), v);
  });
  cmd.push('--disable-lash',
    '--audio-file-type=flac',
    '--fast-render=/proc/self/fd/42',
    cfg.sf2file, { fx: 'input' });
  return cmd;
};


EX.genCmd_synthCleanup = function (cfg) {
  var cmd = [ 'sox',

    // read audio in this format:
    '--type', 'flac',
    // … from stdin:
    '-',

    // save result as…
    '--type', 'wav',
    // … to stdout (so that in node.js, we get a stream):
    '-',
    ];
  if (cfg.downmixMonoEarly) { cmd.push('remix', '-'); }

  (function () {
    var minVol = cfg.silenceVolumePercent, silenceOpt;
    if (!minVol) { return; }
    silenceOpt = EX.genSoxSilenceCmdPercent(minVol);

    // trim silence from start of audio:
    //cmd = cmd.concat('silence', silenceOpt);
    // On 2nd thought, don't: the MIDI note in the input file begins
    // immediately, so if there's any initial silence, that's part of
    // the instrument and it's not this package's job to restrict how
    // strange your instruments are allowed to work.

    // trim silence from end of audio:
    cmd = cmd.concat('reverse',
      'silence', silenceOpt,
      'reverse');
    // Trimming from the end is safe since it won't change playback timings.
  }());

  return cmd;
};


EX.genSoxSilenceCmdPercent = function (minVol) {
  return [
    // start copying at the n-th non-silence:
    1,

    // minimum length of a block of silence in samples (integer)
    // or time (hh:mm:ss.nnn with nnn = milliseconds):
    1,

    // tolerance = maximum volume considered silence:
    roundedFixed(minVol) + '%',
  ];
};


EX.stdioConvert = function (cfg, opt, inputData, whenConverted) {
  var cmd = opt.cmd, args = cmd.slice(1), child;

  if (opt.inputPrep) { inputData = opt.inputPrep(inputData, opt); }
  if ((args.slice(-1)[0] || false).fx === 'input') {
    args[args.length - 1] = inputData;
    inputData = null;
  }

  function childDone(chErr, stdout, stderr) {
    function hint(h) { chErr.message += '; ' + h; }
    if (opt.storeObj) { opt.storeObj[opt.storeProp] = stdout; }
    if ((!chErr) && empty(stdout) && (!opt.acceptEmpty)) {
      chErr = new Error('Command produced no output: ' + cmd.join(' '));
      if (!empty(stderr)) { hint('stderr: ' + String(stderr)); }
    }
    if (chErr) {
      if (!empty(inputData)) { hint('stdin length: ' + inputData.length); }
      //console.error(String(stderr));
    } else {
      if (opt.destObj) {
        saveToProp(opt.destObj, opt.destKey, stdout, opt.destFilter);
      }
    }
    return whenConverted(chErr, stdout);
  }

  function feedStdin() {
    if (inputData) { child.stdin.write(inputData); }
    try { child.stdin.end(); } catch (ignore) {}
  }

  child = execFile(cmd[0], args, { maxBuffer: (+cfg.audioSampleMaxBytes || 1),
    encoding: null, timeout: (+cfg.convTimeoutSec || 0) * 1e3 }, childDone);
  setTimeout(feedStdin, Math.max((cmd.stdinDelaySec || cfg.stdinDelaySec
    ) * 1e3, 10));
};


EX.genCmd_oggenc = function (fmtOpt) {
  var cmd = [ 'oggenc', '--quiet', '--discard-comments' ];
  if (fmtOpt.downmixMono) { cmd.push('--downmix'); }
  cmd.push('--quality=' + roundedFixed(fmtOpt.quality),
    '-');
  return cmd;
};


EX.genCmd_mp3lame = function (fmtOpt) {
  var cmd = [ 'lame',
    '-h', // try <h>arder to optimize quality within the bitrate constraints.
    '-m', fmtOpt.stereoMode,  // <j>oint stereo
    ];

  (function selectBitrate(mode, kbps) {
    if (mode === 'v') { return cmd.push('-b', kbps[0], '-v', '-B', kbps[1]); }
    throw new Error('Unsupported bitrateMode: ' + mode);
  }(fmtOpt.bitrateMode, fmtOpt.bitrateKbps));

  cmd.push('-', '-');   // infile = stdin, outfile = stdout
  return cmd;
};


EX.genCmd_custom = function (fmtOpt) {
  var cmd = fmtOpt.cmd, argSlot = fmtOpt.argSlot;
  cmd = (cmd.split ? cmd.split(/ /) : cmd.slice());
  if (argSlot < 0) { argSlot += cmd.length; }
  cmd.inputArgSlot = argSlot;
  return cmd;
};



















module.exports = EX;
