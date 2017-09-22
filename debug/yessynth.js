/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';
require('midijssf-from-sf2-pmb')({ destDir: module,

  sf2file:      '/dev/null/404/none',
  fmt_cat: { add: true, codec: 'custom', mimeType: 'text/plain', cmd: 'cat' },
  concurrency: 1,
  debug: { requestGarbageCollection: false },

  refineConfig: function (cfg) {
    var synth = [ 'bash', '-c',
      'yes "${1##*/mid/}" | head --bytes=80k | nl -ba',
      'yessynth' ];
    synth.inputArgSlot = synth.length;
    cfg.cmd_synthCapture = synth;
    cfg.cmd_synthCleanup = [ 'grep', '-Pe', '[1602]\\t\\S' ];
  },

  });
