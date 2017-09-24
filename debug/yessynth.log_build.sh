#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function yessynth_log_build () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?

  local TIMECAT=( timecat -f '@%@ %, +%+ %, ' )
  </dev/null "${TIMECAT[@]}" &>/dev/null || TIMECAT=cat

  local MEMLIMS_KB=(
    190
    200
    210
    220
    )

  local LOGS_DIR='logs.yessynth'
  mkdir -p "$LOGS_DIR" || return $?
  local LOG_BFN="$LOGS_DIR/$(date +'%y%m%d-%H%M%S')"
  local RV=
  local MEMLIM=
  for MEMLIM in "${MEMLIMS_KB[@]}"; do
    memlimit_loud "$MEMLIM" nodejs yessynth.js |& "${TIMECAT[@]}" \
      | tee -- "$LOG_BFN.${MEMLIM}k.log"
    pipe_rv "${PIPESTATUS[*]}"; RV=$?
    [ "$RV" == 0 ] && break
    # [ "$RV" == 0 ] || break
  done

  return "$RV"
}


function pipe_rv () {
  local RV="$*"
  let RV="${RV// /+}"
  return $RV
}


function memlimit_loud () {
  local KB="$1"; shift
  echo -n "ulimit -v ${KB}k: "
  ulimit -v $(( $KB * 1024 )) || return $?
  ulimit -v
  nodever
  "$@"; return $?
}









[ "$1" == --lib ] && return 0; yessynth_log_build "$@"; exit $?
