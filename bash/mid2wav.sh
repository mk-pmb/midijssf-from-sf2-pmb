#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-

NOTE="${2%-}"
if [ -n "$NOTE" ]; then
  INSTR="pc$(printf %03d "${1:-0}")"
  NOTE="$(printf %03d "${2:-69}")"
  MIDIFN="../mid/inputs/$INSTR/n$NOTE.mid"
  DESTFN="${INSTR}n${NOTE}.wav"
else
  MIDIFN="$1"
  DESTFN="$(basename "$MIDIFN" .mid).wav"
fi
SFONT="${3:-/usr/share/sounds/sf2/TimGM6mb.sf2}"

exec 17>"$DESTFN" || exit $?
fluidsynth \
  --chorus 1 \
  --reverb 1 \
  --gain 1 \
  --disable-lash \
  --audio-file-type wav \
  --fast-render=/dev/fd/17 \
  "$SFONT" "$MIDIFN" \
  && play -- "$DESTFN"; exit $?
# ATTN: FluidSynth v1.1.6 exits with code 0 even on error!
