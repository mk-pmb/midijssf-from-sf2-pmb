/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, defaultConfig = require('../cfg.default.js'),
  async = require('async'),
  fs = require('fs'), pathLib = require('path'),
  mergeOpts = require('merge-options'),
  gm1InstNames = require('midi-instrument-names-gm1-pmb').instruments,
  mapRange = require('./map-range.js'),
  makeInputFn = require('./input-files.paths.js'),
  shellUtil = require('./shell-util.js'),
  bundleFormats = require('./bundle-formats.js'),
  ld = require('lodash'),
  numCPUs = require('os').cpus().length;


function identity(x) { return x; }
function thr0w(err) { throw err; }
function fail(why, cb) { (cb || thr0w)(new Error(why)); }
function missOpt(opt, cb) { fail('Missing required option: ' + opt, cb); }
function ifObj(x, d) { return ((x && typeof x) === 'object' ? x : d); }
function isStr(x, no) { return (((typeof x) === 'string') || no); }
function filterIfOr(x, f) { return ((f && f(x)) || x); }

function adjProp(obj, prop, adj) {
  adj = adj(obj[prop], obj);
  if (adj !== undefined) { obj[prop] = adj; }
}


EX = function convert(cfg) {
  cfg = EX.prepareConfig(cfg);
  var insPacks, baseVars, primFmtId = cfg.outFmt, noteRanges, logger,
    primFmtOpt = mergeOpts(cfg.fmt_defaults, cfg['fmt_' + primFmtId]);

  logger = (cfg.logProgress || identity);
  if (isStr(logger)) { logger = console[logger].bind(console); }

  baseVars = { d: cfg.destDir, f: primFmtId,
    B: cfg.sf2basename, b: cfg.sf2basename.toLowerCase(),
    };

  noteRanges = ld.mapValues({ inst: 'noteRange', drum: 'chn10Note'
    }, function (o) { return mapRange(cfg, o); });

  function packPack(insId) {
    var notesRange = noteRanges.inst, insName = cfg.instrumentNames[insId - 1];
    if (insId === -10) {
      notesRange = noteRanges.drum;
      insName = cfg.chn10Name;
    }
    return { insId: insId, insName: insName, notesRange: notesRange,
      cfg: cfg, log: logger, fmtId: primFmtId, fmtOpt: primFmtOpt,
      baseVars: baseVars };
  }

  insPacks = filterIfOr(mapRange.instrumentsAndPercussion(cfg, packPack),
    cfg.whichInstruments);
  async.eachLimit(insPacks, cfg.concurrency,
    EX.convertOneInstrument,
    (cfg.whenAllConverted || EX.reportDone));
};


EX.reportDone = function (err) {
  if (err) { throw err; }
  console.log('+OK done.');
};


EX.prepareConfig = function (cfg) {
  cfg = mergeOpts(defaultConfig, cfg);
  adjProp(cfg, 'concurrency', function (c) {
    c = (+c || 0);
    if (c < 0) { c *= -numCPUs; }
    return Math.max(c, 1);
  });
  adjProp(cfg, 'instrumentNames', function (n) {
    if (n && n.substr) {
      if (n === 'gm1') { return gm1InstNames; }
      throw new Error('Unsupported instrument names list name');
    }
  });
  adjProp(cfg, 'destDir', function (d) {
    if (!d) { missOpt('destDir'); }
    if (d.filename) { return pathLib.dirname(d.filename); }
  });
  if (!cfg.sf2file) { missOpt('sf2file'); }
  if (!cfg.sf2basename) {
    cfg.sf2basename = pathLib.basename(cfg.sf2file).replace(/\.sf2$/i, '');
  }
  cfg.primaryConvCmd = shellUtil.genFluidsynthCmd(cfg);
  return cfg;
};


EX.convertOneInstrument = function (pack, nextInst) {
  var insId = pack.insId, cmd1 = pack.cfg.primaryConvCmd,
    shellOpts = { enc: 'base64', maxlen: pack.fmtOpt.audioClipMaxBytes };
  if (!pack.notesRange.length) { return nextInst(); }
  pack.log('primaryConvertBegin', { insId: insId, insName: pack.insName });

  pack.fmtVars = Object.assign({
    i: ('000' + insId).slice(-3),
    I: pack.insName,
    s: ld.snakeCase(ld.deburr(pack.insName)),
  }, pack.baseVars);
  pack.fmtOpt = EX.insertVars(pack.fmtVars, pack.fmtOpt);

  function renderNote(noteId, nextNote) {
    var midiFn = makeInputFn(insId, noteId);
    shellUtil.stdioConvert(cmd1.concat(midiFn), shellOpts, nextNote);
  }

  function postProcessNotes(err, audio) {
    pack.log('primaryConvertDone', { insId: insId, insName: pack.insName,
      error: (err || false) });
    if (err) { return nextInst(err); }

    function toDataUrl(s) { return toDataUrl.p + s; }
    toDataUrl.p = 'data:' + pack.fmtOpt.mimeType + ';base64,';
    pack.audio = audio.map(toDataUrl);

    function save() { return EX.saveWavetable(pack, nextInst); }
    setImmediate(save);
  }

  async.mapSeries(pack.notesRange, renderNote, postProcessNotes);
};


EX.insertVars = function insVars(v, x) {
  if (ifObj(x)) { return ld.mapValues(x, insVars.bind(null, v)); }
  if (!isStr(x)) { return x; }
  return x.replace(/\v(\w)/g, function (m, n) { return String(v[m && n]); });
};


EX.saveWavetable = function (pack, whenAllSaved) {
  function saveOneBundleFmt(bun, nextBundle) {
    if (!bun.render) { return nextBundle(); }
    var fileData, destFileOpt = 'bundleFile_' + bun.id,
      destFile = pack.fmtOpt[destFileOpt];
    if (!destFile) { return missOpt(destFileOpt, nextBundle); }
    fileData = (bun.render(pack) || '');
    pack.log('gonnaWriteBundle', { filename: destFile, len: fileData.length });
    function written(err) {
      pack.log('wroteBundle', { filename: destFile, len: fileData.length,
        error: (err || false) });
      nextBundle(err);
    }
    fs.writeFile(pathLib.join(pack.cfg.destDir, destFile), fileData, written);
  }
  async.eachSeries(bundleFormats, saveOneBundleFmt, whenAllSaved);
};






























module.exports = EX;
