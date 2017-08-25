#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
lame -v -b 8 -B 32 "$@"; exit $?
