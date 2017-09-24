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
    // ^-- false-y value = skip chn10

  noteChorus: true,
  noteReverb: true,
  noteGain:   1.0,

  fmt_defaults: {
    add: false,         // whether to encode and write this audio format
    bundleFile_midijs:  '\vf-midijs/\vs.js',
    bundleFile_cjwt:    '\vf-cjwt/\vs.json',
    mimeType: 'audio/\vf',
  },

  fmt_oggLow: {
    codec: 'oggenc',
    downmixMono: false,
    quality: -1,  // (float) -1 = worst (smallest), 10 = best (biggest)
  },

  fmt_mp3Low: {
    mimeType: 'audio/mpeg',
    codec: 'mp3lame',
    stereoMode: 'j',
      // ^-- "j" = joint stereo, "m" = mono
    bitrateMode: 'v',
      // ^-- bitrate mode: "c" (constant), "a" (average) or "v" (variable).
    bitrateKbps: [8, 32],
      // ^-- Integer; for VBR: array with two integers [min, max].
  },



  // Performance tweaks
  concurrency: -1,    // -n -> n * (number of CPUs)

  audioSampleMaxBytes: 16e6,
    // ^-- Conversion might be aborted if a sample grows too large.
  silenceVolumePercent: 0.1,
    // ^-- Turns out 0.1% this is so very silent that we can probably
    //     safely ignore it and save lots of bytes.
    //     Set to 0 or false to keep all silence.
  downmixMonoEarly: false,
    // ^-- Downmix early = in the silence trimming stage, if that's enabled.
    //     Experimental. It might make the conversion use less RAM.
    //     If enabled, output formats attempting to write stereo will
    //     become either mono or double-mono.
  lazyFileSystemDelaySec: 0.5,
    // ^-- For tasks that rely on temporary files being written to disk:
    //     How long to idle (in seconds) before we assume all bytes are
    //     really written and we can safely read them.
  stdinDelaySec: 0.1,
  convTimeoutSec: 60,   // timeout for each conversion of a single note


  debug: {
    wa170921_oom: true,
      // ^-- Render each instrument in a separate child_process.
      // Temporary workaround to avoid accumulating lots of external memory.
  },











};
