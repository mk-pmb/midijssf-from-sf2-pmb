/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
module.exports = {
  destDir: null,  // module object, or path as string
  sf2file: null,  // path as string
  sf2basename: null,
    // ^-- path template variable. if false-y, it's calculated from sf2file
  logProgress: 'log',   // function, or string for a console.* method

  instrumentIdFrom: 1,
  instrumentIdUpto: 128,
  instrumentNames:  'gm1',
  noteRangeFrom:    21,
  noteRangeUpto:    108,

  chn10NoteFrom:  35,
  chn10NoteUpto:  81,
  chn10Name:      'percussion',

  noteChorus: true,
  noteReverb: true,
  noteGain:   1.0,

  outFmt: 'flac',

  concurrency: -2,    // -n -> n * (number of CPUs)
  lazyFileSystemDelaySec: 0.5,
    // ^-- For tasks that rely on temporary files being written to disk:
    //     How long to idle (in seconds) before we assume all bytes are
    //     really written and we can safely read them.

  fmt_defaults: {
    add: false,         // whether to add this format
    inputFile: false,   // primary audio will be sent to stdin
    bundleFile_midijs:  '\vf-midijs/\vs.js',
    bundleFile_cjwt:    '\vf-cjwt/\vs.json',
    mimeType: 'audio/\vf',
    audioClipMaxBytes:  64e6,
  },

  fmt_oggLow: {
    quality: -1,  // (float) -1 = worst (smallest), 10 = best (biggest)
  },

  fmt_mp3Low: {
    mimeType: 'audio/mpeg',
  },

  addFmt_custom: [],














};
