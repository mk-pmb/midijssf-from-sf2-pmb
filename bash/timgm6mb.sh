#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function timgm6mb () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH"/.. || return $?

  jsl || return $?
  cd ../midijssf-timgm6mb-pmb || return $?
  jsl -e convert.js || return $?

  return 0
}










[ "$1" == --lib ] && return 0; timgm6mb "$@"; exit $?
