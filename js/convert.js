/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, defaultConfig = require('../cfg.default.js'),
  async = require('async'),
  splitCb = require('splitcb'),
  fs = require('fs'), pathLib = require('path'), mkdirp = require('mkdirp'),
  mergeOpts = require('merge-options'),
  gm1InstNames = require('midi-instrument-names-gm1-pmb').instruments,
  mapRange = require('./map-range.js'),
  makeInputFn = require('./input-files.paths.js'),
  shellUtil = require('./shell-util.js'),
  bundleFormats = require('./bundle-formats.js'),
  ld = require('lodash'),
  isAry = Array.isArray,
  kisi = require('./kitchen-sink.js'),
  requestGarbageCollection = require('memwatch-next').gc,
  numCPUs = require('os').cpus().length;


function identity(x) { return x; }
function thr0w(err) { throw err; }
function fail(why, cb) { (cb || thr0w)(new Error(why)); }
function missOpt(opt, cb) { fail('Missing required option: ' + opt, cb); }
function ifObj(x, d) { return ((x && typeof x) === 'object' ? x : d); }
function isStr(x, no) { return (((typeof x) === 'string') || no); }
function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
function filterIfOr(x, f) { return ((f && f(x)) || x); }
function asyncNoop(cb) { cb(); }
function bytes2mibi(n) { return Math.round(n / 10485.76) / 100; }


function adjProp(obj, prop, adj) {
  adj = adj(obj[prop], obj);
  if (adj !== undefined) { obj[prop] = adj; }
}

function asyncStorer(dest, prop, then) {
  return function (err, data) {
    dest[prop] = data;
    return then(err, data);
  };
}


EX = function convert(cfg) {
  cfg = EX.prepareConfig(cfg);
  var insPacks = [], baseVars, noteRanges, logger;

  logger = (cfg.logProgress || identity);
  if (isStr(logger)) { logger = kisi.makeLogger(logger); }

  baseVars = { d: cfg.destDir,
    B: cfg.sf2basename, b: cfg.sf2basename.toLowerCase(),
    };

  noteRanges = ld.mapValues({ inst: 'noteRange', drum: 'chn10Note'
    }, function (o) { return mapRange(cfg, o); });

  function addPack(insId) {
    var notesRange = noteRanges.inst, insName = cfg.instrumentNames[insId - 1];
    if (insId === -10) {
      notesRange = noteRanges.drum;
      insName = cfg.chn10Name;
      if (insName === false) { return; }
    }
    insPacks.push({ insId: insId, insName: insName, notesRange: notesRange,
      cfg: cfg, log: logger, baseVars: baseVars });
  }
  mapRange.instrumentsAndPercussion(cfg, addPack);
  insPacks = filterIfOr(insPacks, cfg.whichInstruments);

  if (!insPacks) { logger('emptyTodo_instruments'); }

  async.eachSeries(insPacks, EX.convertOneInstrument,
    (cfg.whenAllConverted || splitCb(logger.bind(null, '+OK done.'))));
};


EX.prepareConfig = function (cfg) {
  cfg = mergeOpts(defaultConfig, cfg);
  adjProp(cfg, 'concurrency', function (c) {
    c = (+c || 0);
    if (c < 0) { c *= -numCPUs; }
    return Math.max(Math.round(c), 1);
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
  cfg.cmd_synthCapture = shellUtil.genCmd_synthCapture(cfg);
  cfg.cmd_synthCleanup = shellUtil.genCmd_synthCleanup(cfg);
  if (cfg.refineConfig) { cfg.refineConfig(cfg); }
  return cfg;
};


EX.convertOneInstrument = function (pack, nextInst) {
  var cfg = pack.cfg, insId = pack.insId, insName = pack.insName,
    convJobs = [];
  if (!pack.notesRange.length) {
    pack.log('emptyTodo_notesRange', { insId: insId, insName: pack.insName });
    return nextInst();
  }

  Object.keys(cfg).forEach(function (k) {
    var p = 'fmt_', l = p.length;
    if (k.length <= l) { return; }
    if (k.slice(0, l) !== p) { return; }
    if (!cfg[k]) { return; }
    if (!cfg[k].add) { return; }
    convJobs.push({ fmt: k.slice(l) });
  });

  if (!convJobs.length) {
    pack.log('emptyTodo_audioFmt', { insId: insId, insName: insName });
    return nextInst();
  }

  pack.fmtVars = Object.assign({
    i: ('000' + insId).slice(-3),
    I: pack.insName,
    s: ld.snakeCase(ld.deburr(pack.insName)),
  }, pack.baseVars);

  function runJob(job, nextJob) {
    var fmt = job.fmt, func = (job.func || 'makeAudioBundle'),
      logDetails = { insId: insId, insName: insName };
    if (fmt) { logDetails.fmt = fmt; }
    pack.log(func + '_begin', logDetails);
    function jobDone(err) {
      logDetails.error = (err || false);
      pack.log(func + '_done', logDetails);
      setImmediate(nextJob, err);
    }
    EX[func].apply(null, (fmt ? [fmt] : []).concat([pack, jobDone]));
  }

  async.eachSeries([ { func: 'synthCapture' },
    { func: 'synthCleanup' },
    ].concat(convJobs), runJob, nextInst);
};


EX.massConvert = function (pack, listProp, convOpt, then) {
  async.mapLimit(pack[listProp], pack.cfg.concurrency,
    shellUtil.stdioConvert.bind(null, pack.cfg, convOpt), then);
};


EX.synthCapture = function (pack, whenCaptured) {
  EX.massConvert(pack, 'notesRange', { cmd: pack.cfg.cmd_synthCapture,
    inputPrep: makeInputFn.bind(null, pack.insId) },
    asyncStorer(pack, 'primaryAudio', whenCaptured));
};


EX.synthCleanup = function (pack, whenCleaned) {
  EX.massConvert(pack, 'primaryAudio', { cmd: pack.cfg.cmd_synthCleanup },
    asyncStorer(pack, 'primaryAudio', whenCleaned));
};


EX.makeAudioBundle = function (fmtId, origPack, nextBundle) {
  var pack = Object.assign({}, origPack), cfg = pack.cfg, fmtOpt, cmdGen;
  origPack = null;
  pack.fmtId = fmtId;
  Object.assign(pack.fmtVars, { F: fmtId, f: fmtId.toLowerCase() });
  fmtOpt = EX.insertVars(pack.fmtVars,
    mergeOpts(cfg.fmt_defaults, cfg['fmt_' + fmtId]));
  pack.fmtOpt = fmtOpt;

  cmdGen = shellUtil['genCmd_' + fmtOpt.codec];
  if (!cmdGen) { return fail('Unknown codec: ' + fmtOpt.codec, nextBundle); }

  async.waterfall([
    EX.massConvert.bind(null, pack, 'primaryAudio',
      { cmd: cmdGen(fmtOpt, pack) }),
    function urlify(samples, then) {
      pack.log('urlifySamples', { fmt: pack.fmtId, n: samples.length, });
      pack.sampleDataUrls = samples.map(kisi.makeDataUrlifier(fmtOpt.mimeType));
      //samples = kisi.wipeList(samples);
      then();
    },
    EX.saveWavetable.bind(null, pack),
  ], function (err) {
    //kisi.wipeList(pack, 'sampleDataUrls');
    pack.log('memoryUsage', EX.memoryReport());
    requestGarbageCollection();
    pack.log('garbageCollected', EX.memoryReport());
    return nextBundle(err);
  });
};


EX.memoryReport = function (pack) {
  var mr = ld.mapValues(process.memoryUsage(), bytes2mibi);
  mr.unit = 'MiB';
  if (pack) { mr = Object.assign({ insId: pack.insId,
    insName: pack.insName,
    }, mr); }
  return mr;
};


EX.insertVars = function insVars(v, x) {
  if (ifObj(x)) {
    if (isAry(x)) { return x.map(insVars.bind(null, v)); }
    return ld.mapValues(x, insVars.bind(null, v));
  }
  if (!isStr(x)) { return x; }
  return x.replace(/\v(\w)/g, function (m, n) { return String(v[m && n]); });
};


EX.saveWavetable = function (pack, whenAllSaved) {
  function saveOneBundleFmt(bun, nextBundle) {
    if (!bun.render) { return nextBundle(); }
    var fileData, destFileOpt = 'bundleFile_' + bun.id,
      destFile = pack.fmtOpt[destFileOpt], destAbs;
    if (!destFile) { return missOpt(destFileOpt, nextBundle); }
    fileData = (bun.render(pack) || '');
    destAbs = pathLib.join(pack.cfg.destDir, destFile);
    async.series([
      mkdirp.bind(null, pathLib.dirname(destAbs)),
      function (next) {
        pack.log('gonnaWriteBundle', { filename: destFile,
          dataContainer: fileData.constructor.name,
          size: fileData.length });
        fs.writeFile(destAbs, fileData, next);
      }
    ], function written(err) {
      pack.log('wroteBundle', { filename: destFile, len: fileData.length,
        error: (err || false) });
      nextBundle(err);
    });
  }
  async.eachSeries(bundleFormats, saveOneBundleFmt, whenAllSaved);
};






























module.exports = EX;
