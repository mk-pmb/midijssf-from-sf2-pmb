/*jslint indent: 2, maxlen: 80, node: true */
module.exports = {
  noteRangeFrom:    21,
  noteRangeUpto:    108,
  instrumentNames:  'gm1',

  chn10RangeFrom: 35,
  chn10RangeUpto: 81,
  chn10Name:      'percussion',

  noteChorus: true,
  noteReverb: true,
  noteGain:   1.0,

  outFmt:       'flac',
  addFmt_mp3:   false,
  addFmt_ogg:   false,

  concurrency: -2,    // -n -> n * (number of CPUs)
};
