#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
[ -r /dev/fd/14 ] || exec 14<"$1" || exit $?
[ -w /dev/fd/15 ] || exec 15>"$(basename "$1" .flac).ogg" || exit $?
[ -n "$OGG_QUALITY" ] || OGG_QUALITY=-1  # WWW needs small files
SOX_OPTS=(
  /dev/fd/14    # read from stdin
  --type ogg    # output format
  --compression "$OGG_QUALITY"
  /dev/fd/15    # target stream
  remix -       # downmix to mono
  )
sox "${SOX_OPTS[@]}"; exit $?
