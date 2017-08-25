#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
[ -r /dev/fd/14 ] || exec 14<"$1" || exit $?
[ -w /dev/fd/15 ] || exec 15>"$(basename "$1" .wav).ogg" || exit $?
[ -n "$OGG_QUALITY" ] || OGG_QUALITY=-1  # WWW needs small files
OGG_OPTS=(
  --quiet
  --downmix     # to mono
  --quality="$OGG_QUALITY"
  --discard-comments
  --output=/dev/fd/15
  /dev/fd/14    # input file
  )
oggenc "${OGG_OPTS[@]}"; exit $?
