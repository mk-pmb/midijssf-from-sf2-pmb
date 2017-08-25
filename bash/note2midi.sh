#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
nodejs -p "require('midi-notefreq-pmb').uk(process.argv.slice(1))" "$@"
