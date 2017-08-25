#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-

SILENCE_OPT=(

  # start copying at the n-th non-silence:
  1

  # minimum length of a block of silence in samples (integer)
  # or time (hh:mm:ss.nnn with nnn = milliseconds):
  1

  # tolerance = maximum volume considered silence:
  0.1%    # turns out 0.1% this is so very silent that we can probably
          # safely ignore it and save lots of bytes.

  )
SOX_ARG=(

  # read audio from stdin (so that in node.js, we can send a stream):
  -

  # save result as…
  --type wav
  # … to stdout (so that in node.js, we get a stream):
  -

  remix -   # downmix to stereo

  # trim silence from start of audio:
  # silence "${SILENCE_OPT[@]}"
  # On 2nd thought, don't: the MIDI note in the input file begins immediately,
  # so if there's any initial silence, that's part of the instrument and it's
  # not this package's job to restrict how strange your instruments are
  # allowed to work.

  # trim silence from end of audio:
  reverse
  silence "${SILENCE_OPT[@]}"
  reverse
  # Trimming from the end is safe since it won't change playback timings.

  )
DEST_FN="$(basename "$1" .wav).trimmed.wav"
<"$1" >"$DEST_FN" sox "${SOX_ARG[@]}" \
  && soxi -- "$DEST_FN" | grep -Pie 'duration|size'; exit $?
