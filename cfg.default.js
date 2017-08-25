/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
module.exports = {
  instrumentIdFrom: 1,
  instrumentIdUpto: 128,
  instrumentNames:  'gm1',
  noteRangeFrom:    0,  // 21,
  noteRangeUpto:    14, // 108,

  chn10NoteFrom:  35,
  chn10NoteUpto:  81,
  chn10Name:      'percussion',

  noteChorus: true,
  noteReverb: true,
  noteGain:   1.0,

  outFmt: 'flac',
  addFmt_mp3Low: false,
  addFmt_oggLow: false,

  concurrency: -2,    // -n -> n * (number of CPUs)
  lazyFileSystemDelaySec: 0.5,
    // ^-- For tasks that rely on temporary files being written to disk:
    //     How long to idle (in seconds) before we assume all bytes are
    //     really written and we can safely read them.

  fmtOgg_quality: -1,  // (float) -1 = worst (smallest), 10 = best (biggest)

  fmt_defaults: {
    // \vd = directory, \vb = basename, \bf = format ID
    inputFile: false,   // primary audio will be sent to stdin
    resultFile: '\vd/\vb.\vf.js',
    mimeType: 'audio/\vf',
  },

  fmt_flac: {
    mimeType: 'audio/flac',
  },

  fmt_mp3Low: {
    mimeType: 'audio/mpeg',
    inputFile: false,   // primary audio will be sent to stdin
    resultFile: '\vd/\vb.mp3.js',  // \vd = directory, \vb = basename
  },

  addFmt_custom: [],














};
