/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, ld = require('lodash'), arSlc = Array.prototype.slice,
  requestGarbageCollection = require('memwatch-next').gc;


EX = function memoryReport(pack) {
  var mr = { unit: 'MiB', pid: process.pid };
  if (pack) { mr.insId = pack.insId; }
  Object.assign(mr, ld.mapValues(process.memoryUsage(), EX.bytes2mibi));
  return mr;
};


EX.bytes2mibi = function (n) { return Math.round(n / 10485.76) / 100; };


EX.afterPackCb = function makeMemoryReportCb(doStuff) {
  return function (pack) {
    var inputs = arSlc.call(arguments), next = inputs.pop();
    doStuff.apply(null, inputs.concat(function () {
      pack.log('memoryUsage', EX(pack));
      if (pack.cfg.debug.requestGarbageCollection) {
        requestGarbageCollection();
        pack.log('garbageCollected', EX(pack));
      }
      next.apply(null, arguments);
    }));
  };
};

























module.exports = EX;
