/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {}, isAry = Array.isArray, arSlc = Array.prototype.slice,
  ipcProxy = require('ipc-proxy0-pmb'),
  convModAbs = require.resolve('./convert'),
  jsonizeLoudfail = require('jsonize-loudfail'),
  memoryReport = require('./memory-report.js'),
  kisi = require('./kitchen-sink.js');


function applyIf(f, c, a) { return (f && f.apply(c, a)); }


EX.convertOneInstrument_wa170921_oom = function (origPack, nextInst) {
  var cfg = Object.assign({}, origPack.cfg), pack, child, logMeta;
  pack = Object.assign({}, origPack);
  pack.notesRange = origPack.notesRange;
  pack.cfg = cfg;
  applyIf(cfg.prepareJsonizeConfig, null, [cfg]);
  delete cfg.instrumentNames;
  delete cfg.refineConfig;
  delete cfg.whichInstruments;
  delete pack.log;

  try {
    jsonizeLoudfail(pack);
  } catch (unJSONable) {
    return setImmediate(nextInst, unJSONable);
  }

  child = ipcProxy.spawn([module.filename, convModAbs], function (err) {
    var endTime = Date.now();
    logMeta.rtcElapsedSec = (endTime - child.startTime) / 1e3;
    logMeta.err = (err || false);
    origPack.log('ipcProxyDone', logMeta);
    nextInst(err);
  });
  logMeta = { pid: child.pid, insId: pack.insId,
    //insName: pack.insName,
    };
  origPack.log('ipcProxySpawn', logMeta);
  child.startTime = Date.now();
  child.on('msg:log', origPack.log);
  child.on('error', origPack.log.bind(null, 'ipcProxyErr'));
  child.send({ mtd: 'ipcSub', arg: pack, cb: true });
};


EX.ipcSub = function (pack) {
  var job = this, conv1 = job.libs[1].convertOneInstrument;
  pack.log = ipcProxy.makeMsgCb('log');
  conv1 = memoryReport.afterPackCb(conv1);
  conv1(pack, function (err) {
    if (err) { throw err; }
    process.disconnect();
  });
};
























module.exports = EX;
