/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, normPath = require('path').normalize,
  inputsDirBn = normPath(module.filename + '/../../mid/inputs/');


function zf(pad, x) { return (pad + x).slice(-pad.length); }
function truthyOrZero(x) { return (x || (x === 0)); }


function dn(patchId) {
  if (patchId < 0) { return [ 'ch', zf('00', patchId), 'c' ]; }
  return [ 'pc', zf('000', patchId), 'p' ];
}


EX = function (patchId, noteId) {
  var d = dn(patchId), p = inputsDirBn + d[0] + d[1] + '/';
  if (!truthyOrZero(noteId)) { return p; }
  return (p
    //+ d[2] + d[1]
    + 'n' + zf('000', noteId) + '.mid');
};










module.exports = EX;
