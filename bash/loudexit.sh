#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
RV="${1:-0}"
echo "H: gonna exit($RV)"
echo "E: gonna exit($RV)" >&2
for CHN in /proc/self/fd/42; do
  [ -w "$CHN" ] && ls -gov "$CHN" >&"${CHN##*/}"
done
exit "$RV"
