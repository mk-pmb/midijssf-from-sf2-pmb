/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';
var dfltCfg = require('../cfg.default.js'), ld = require('lodash'),
  gm1inst = require('midi-instrument-names-gm1-pmb').instruments;
module.exports = gm1inst.concat(dfltCfg.chn10Name).map(ld.snakeCase);
