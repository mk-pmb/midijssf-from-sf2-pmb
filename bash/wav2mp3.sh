#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
LAME_OPT=(
  -h    # try <h>arder to optimize quality within the bitrate constraints.
  -m j  # <j>oint stereo
  -b 8  # min <b>itrate [kbps]
  -v -B 32   # enable <v>ariable bitrate up to maximum <b>itrate [kbps]
  )

lame "${LAME_OPTS[@]}" "$@"; exit $?
