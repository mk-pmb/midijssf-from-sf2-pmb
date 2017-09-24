/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {}, isAry = Array.isArray,
  isErr = require('is-error'), err2dict = require('error-to-json'),
  ld = require('lodash');


function ifObj(x, d) { return ((x && typeof x) === 'object' ? x : d); }
function isStr(x, no) { return (((typeof x) === 'string') || no); }


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
    if (isErr(details)) {
      details = err2dict(details);
      delete details.stack;
    }
    var d = JSON.stringify(details, null, 1);
    if (d) { d = d.replace(/\s*\n\s*(?:"(\S+)"(:)|)/g, ' $1$2'); }
    logFunc.call(console, event, d);
  };
};


EX.insertVars = function insVars(v, x) {
  if (ifObj(x)) {
    if (isAry(x)) { return x.map(insVars.bind(null, v)); }
    return ld.mapValues(x, insVars.bind(null, v));
  }
  if (!isStr(x)) { return x; }
  return x.replace(/\v(\w)/g, function (m, n) { return String(v[m && n]); });
};


EX.wipeList = function (x, prop) {
  if (!x) { return; }
  var c = (prop ? x[prop] : x), i;
  if (!c) { return; }
  for (i = c.lenth - 1; i >= 0; i -= 1) { delete c[i]; }
  if (prop) { delete x[prop]; }
};






















module.exports = EX;
