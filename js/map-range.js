/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function mapRange(a, b, f, d) {
  // from, upto, func, dest
  if (a && b && b.substr) {
    return mapRange(+a[b + 'From'], +a[b + 'Upto'], f, d);
  }
  if (!f) { f = Number; }
  if (!d) { d = []; }
  for (null; a <= b; a += 1) { d[d.length] = f(a); }
  return d;
}


mapRange.instrumentsAndPercussion = function (r, f, d) {
  d = mapRange(r, 'instrumentId', f, d);
  d.push(f(-10));
  return d;
};



module.exports = mapRange;
