#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function yessynth_log_build () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?

  local TIMECAT=( timecat -f '@%@ %, +%+ %, ' )
  </dev/null "${TIMECAT[@]}" &>/dev/null || TIMECAT=cat

  local MEMLIM_KB=160
  local LOGS_DIR='logs.yessynth'
  local LOGFN="$LOGS_DIR/$(date +'%y%m%d-%H%M%S').${MEMLIM_KB}k.log"
  mkdir -p "$LOGS_DIR" || return $?
  memlimit_loud "$MEMLIM_KB" nodejs yessynth.js |& "${TIMECAT[@]}" \
    | tee -- "$LOGFN"
  local RV="${PIPESTATUS[*]}"
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
