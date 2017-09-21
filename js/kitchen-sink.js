/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {};


EX.makeDataUrlifier = function (mimeType) {
  var enc = 'base64', p = 'data:' + mimeType + ';' + enc + ',';
  return function toDataUrl(buf) { return p + buf.toString(enc); };
};


EX.makeSlicer = function (a, b) {
  if (b < 0) { return function (x) { return x.slice(a, b); }; }
  if (b > 0) { return function (x) { return x.slice(a, a + b); }; }
  return function (x) { return x.slice(a); };
};


EX.makeLogger = function (chn) {
  var logFunc = console[chn || 'log'];
  return function (event, details) {
    logFunc.call(console, event, JSON.stringify(details, null, 1
      ).replace(/\s*\n\s*(?:"(\S+)"(:)|)/g, ' $1$2'));
  };
};


















module.exports = EX;
